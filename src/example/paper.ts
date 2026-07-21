import { PaperTradingEngine } from "../paper/engine";
import { RiskPolicy } from "../safety/risk";

const now = 1_700_000_000_000;
const policy: RiskPolicy = {
  killSwitch: false,
  maxApprovalMinor: 50_000,
  maxAssetExposureBps: 2_500,
  maxDailyLossMinor: 5_000,
  maxDataAgeMs: 60_000,
  maxFutureSkewMs: 1_000,
  maxOrderNotionalMinor: 25_000,
  minLiquidityReserveMinor: 10_000,
};

const engine = new PaperTradingEngine();
const result = engine.submit(
  {
    approvalMinor: 20_000,
    asset: "DEMO",
    idempotencyKey: "demo-order-1",
    maxLossMinor: 1_000,
    orderId: "paper-1",
    quantityUnits: 10,
  },
  {
    asset: "DEMO",
    ingestedAt: now,
    ingestionId: "demo-price-1",
    priceMinor: 1_000,
    source: "fixture",
    sourceLicense: "internal-test-data",
    sourceTimestamp: now,
  },
  {
    assetExposureMinor: 0,
    availableLiquidityMinor: 100_000,
    dailyLossMinor: 0,
    portfolioValueMinor: 100_000,
  },
  policy,
  now
);

console.log(JSON.stringify({ decision: result.decision, ledger: engine.ledger.all() }, null, 2));
