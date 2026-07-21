import { createHash } from "crypto";

export type LedgerEventType =
  | "CORRECTION"
  | "FILL_RECORDED"
  | "ORDER_ACCEPTED"
  | "ORDER_CANCELLED"
  | "ORDER_REJECTED";

export type LedgerData = Record<string, boolean | number | string>;

export interface LedgerEventInput {
  correctsEventId?: string;
  data: LedgerData;
  eventId: string;
  idempotencyKey: string;
  occurredAt: number;
  orderId: string;
  sourceTimestamp: number;
  type: LedgerEventType;
}

export interface LedgerEvent extends LedgerEventInput {
  hash: string;
  previousHash: string;
  sequence: number;
}

function canonicalInput(input: LedgerEventInput): string {
  return JSON.stringify({
    correctsEventId: input.correctsEventId || "",
    data: Object.keys(input.data)
      .sort()
      .reduce<LedgerData>((result, key) => {
        result[key] = input.data[key];
        return result;
      }, {}),
    eventId: input.eventId,
    idempotencyKey: input.idempotencyKey,
    occurredAt: input.occurredAt,
    orderId: input.orderId,
    sourceTimestamp: input.sourceTimestamp,
    type: input.type,
  });
}

function hashEvent(sequence: number, previousHash: string, input: LedgerEventInput): string {
  return createHash("sha256")
    .update(JSON.stringify({ input: canonicalInput(input), previousHash, sequence }))
    .digest("hex");
}

export class PaperLedger {
  private readonly events: LedgerEvent[] = [];
  private readonly idempotency = new Map<string, { canonical: string; event: LedgerEvent }>();

  append(input: LedgerEventInput): LedgerEvent {
    if (!input.eventId.trim() || !input.idempotencyKey.trim() || !input.orderId.trim()) {
      throw new Error("Ledger event id, idempotency key, and order id are required");
    }
    if (!Number.isSafeInteger(input.occurredAt) || !Number.isSafeInteger(input.sourceTimestamp)) {
      throw new Error("Ledger timestamps must be safe integers");
    }
    if (input.correctsEventId && !this.events.some((event) => event.eventId === input.correctsEventId)) {
      throw new Error(`Correction target does not exist: ${input.correctsEventId}`);
    }

    const canonical = canonicalInput(input);
    const existing = this.idempotency.get(input.idempotencyKey);
    if (existing) {
      if (existing.canonical !== canonical) {
        throw new Error(`Conflicting duplicate idempotency key: ${input.idempotencyKey}`);
      }
      return existing.event;
    }
    if (this.events.some((event) => event.eventId === input.eventId)) {
      throw new Error(`Duplicate event id: ${input.eventId}`);
    }

    const sequence = this.events.length + 1;
    const previousHash = this.events.length ? this.events[this.events.length - 1].hash : "GENESIS";
    const event = Object.freeze({
      ...input,
      data: Object.freeze({ ...input.data }),
      hash: hashEvent(sequence, previousHash, input),
      previousHash,
      sequence,
    });
    this.events.push(event);
    this.idempotency.set(input.idempotencyKey, { canonical, event });
    return event;
  }

  all(): LedgerEvent[] {
    return this.events.map((event) => ({ ...event, data: { ...event.data } }));
  }

  exportJsonLines(): string {
    return this.events.map((event) => JSON.stringify(event)).join("\n");
  }

  verifyHashChain(): boolean {
    return this.events.every((event, index) => {
      const previousHash = index === 0 ? "GENESIS" : this.events[index - 1].hash;
      const { hash: _hash, previousHash: _previousHash, sequence: _sequence, ...input } = event;
      return (
        event.sequence === index + 1 &&
        event.previousHash === previousHash &&
        event.hash === hashEvent(event.sequence, previousHash, input)
      );
    });
  }
}
