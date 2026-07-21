import { LedgerEvent, PaperLedger } from "./ledger";
import { MarketDataRegistry, MarketSnapshot } from "./market-data";
import { evaluateRisk, RiskDecision, RiskPolicy } from "../safety/risk";

export interface PaperOrderIntent {
  approvalMinor: number;
  asset: string;
  idempotencyKey: string;
  maxLossMinor: number;
  orderId: string;
  quantityUnits: number;
}

export interface PortfolioRiskState {
  assetExposureMinor: number;
  availableLiquidityMinor: number;
  dailyLossMinor: number;
  portfolioValueMinor: number;
}

interface OpenOrder {
  acceptedEvent: LedgerEvent;
  filledUnits: number;
  intent: PaperOrderIntent;
}

export class PaperTradingEngine {
  readonly ledger = new PaperLedger();
  readonly marketData = new MarketDataRegistry();
  private readonly fills = new Map<
    string,
    { event: LedgerEvent; orderId: string; priceMinor: number; quantityUnits: number }
  >();
  private readonly orders = new Map<string, OpenOrder>();

  submit(
    intent: PaperOrderIntent,
    snapshot: MarketSnapshot,
    state: PortfolioRiskState,
    policy: RiskPolicy,
    now: number
  ): { decision: RiskDecision; event: LedgerEvent } {
    this.marketData.ingest(snapshot);
    const existing = this.orders.get(intent.orderId);
    if (existing) {
      if (existing.intent.idempotencyKey === intent.idempotencyKey) {
        return {
          decision: {
            approved: true,
            notionalMinor: existing.acceptedEvent.data.notionalMinor as number,
            reasons: [],
          },
          event: existing.acceptedEvent,
        };
      }
      const event = this.ledger.append({
        data: { reason: "DUPLICATE_ORDER" },
        eventId: `reject:${intent.orderId}:${intent.idempotencyKey}`,
        idempotencyKey: `reject:${intent.idempotencyKey}`,
        occurredAt: now,
        orderId: intent.orderId,
        sourceTimestamp: snapshot.sourceTimestamp,
        type: "ORDER_REJECTED",
      });
      return {
        decision: { approved: false, notionalMinor: 0, reasons: ["INVALID_INPUT"] },
        event,
      };
    }

    const decision = evaluateRisk(
      {
        ...state,
        ...intent,
        marketSource: snapshot.source,
        marketSourceLicense: snapshot.sourceLicense,
        now,
        sourceTimestamp: snapshot.sourceTimestamp,
        unitPriceMinor: snapshot.priceMinor,
      },
      policy
    );
    const event = this.ledger.append({
      data: {
        asset: intent.asset,
        notionalMinor: decision.notionalMinor,
        quantityUnits: intent.quantityUnits,
        reasons: decision.reasons.join(","),
      },
      eventId: `order:${intent.orderId}`,
      idempotencyKey: intent.idempotencyKey,
      occurredAt: now,
      orderId: intent.orderId,
      sourceTimestamp: snapshot.sourceTimestamp,
      type: decision.approved ? "ORDER_ACCEPTED" : "ORDER_REJECTED",
    });

    if (decision.approved) {
      this.orders.set(intent.orderId, { acceptedEvent: event, filledUnits: 0, intent: { ...intent } });
    }
    return { decision, event };
  }

  recordFill(
    orderId: string,
    fillId: string,
    quantityUnits: number,
    priceMinor: number,
    occurredAt: number,
    sourceTimestamp: number
  ): LedgerEvent {
    const order = this.orders.get(orderId);
    if (!order) throw new Error(`Accepted paper order not found: ${orderId}`);
    const existingFill = this.fills.get(fillId);
    if (existingFill) {
      if (
        existingFill.orderId !== orderId ||
        existingFill.priceMinor !== priceMinor ||
        existingFill.quantityUnits !== quantityUnits
      ) {
        throw new Error(`Conflicting duplicate fill id: ${fillId}`);
      }
      return existingFill.event;
    }
    if (!Number.isSafeInteger(quantityUnits) || quantityUnits <= 0) {
      throw new Error("Fill quantity must be a positive safe integer");
    }
    if (!Number.isSafeInteger(priceMinor) || priceMinor <= 0) {
      throw new Error("Fill price must be a positive safe integer");
    }
    if (order.filledUnits + quantityUnits > order.intent.quantityUnits) {
      throw new Error(`Fill exceeds remaining quantity for order: ${orderId}`);
    }

    const event = this.ledger.append({
      data: {
        priceMinor,
        quantityUnits,
        status:
          order.filledUnits + quantityUnits === order.intent.quantityUnits ? "FILLED" : "PARTIALLY_FILLED",
      },
      eventId: `fill:${fillId}`,
      idempotencyKey: `fill:${fillId}`,
      occurredAt,
      orderId,
      sourceTimestamp,
      type: "FILL_RECORDED",
    });
    order.filledUnits += quantityUnits;
    this.fills.set(fillId, { event, orderId, priceMinor, quantityUnits });
    return event;
  }
}
