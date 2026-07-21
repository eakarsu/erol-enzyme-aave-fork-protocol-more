"use strict";

const assert = require("assert");
const {
  assertMutationQuarantined,
  evaluateRisk,
  MarketDataRegistry,
  PaperTradingEngine,
} = require("../build/paper");
const { loadRuntimeConfig } = require("../build/config");

const now = 1_700_000_000_000;
const policy = {
  killSwitch: false,
  maxApprovalMinor: 50_000,
  maxAssetExposureBps: 2_500,
  maxDailyLossMinor: 5_000,
  maxDataAgeMs: 60_000,
  maxFutureSkewMs: 1_000,
  maxOrderNotionalMinor: 25_000,
  minLiquidityReserveMinor: 10_000,
};
const snapshot = {
  asset: "TEST",
  ingestedAt: now,
  ingestionId: "price-1",
  priceMinor: 1_000,
  source: "licensed-fixture",
  sourceLicense: "internal-test-data",
  sourceTimestamp: now,
};
const intent = {
  approvalMinor: 10_000,
  asset: "TEST",
  idempotencyKey: "submit-1",
  maxLossMinor: 1_000,
  orderId: "order-1",
  quantityUnits: 10,
};
const state = {
  assetExposureMinor: 0,
  availableLiquidityMinor: 100_000,
  dailyLossMinor: 0,
  portfolioValueMinor: 100_000,
};

assert.throws(() => assertMutationQuarantined("test transfer"), /paper-only/);
assert.throws(() => loadRuntimeConfig({}), /no credentials are bundled/);

const approved = evaluateRisk(
  {
    ...intent,
    ...state,
    marketSource: snapshot.source,
    marketSourceLicense: snapshot.sourceLicense,
    now,
    sourceTimestamp: now,
    unitPriceMinor: snapshot.priceMinor,
  },
  policy
);
assert.strictEqual(approved.approved, true);
assert.strictEqual(approved.notionalMinor, 10_000);

const stale = evaluateRisk(
  {
    ...intent,
    ...state,
    marketSource: snapshot.source,
    marketSourceLicense: snapshot.sourceLicense,
    now,
    sourceTimestamp: now - policy.maxDataAgeMs - 1,
    unitPriceMinor: snapshot.priceMinor,
  },
  policy
);
assert(stale.reasons.includes("STALE_MARKET_DATA"));
const stopped = evaluateRisk(
  {
    ...intent,
    ...state,
    marketSource: snapshot.source,
    marketSourceLicense: snapshot.sourceLicense,
    now,
    sourceTimestamp: now,
    unitPriceMinor: snapshot.priceMinor,
  },
  { ...policy, killSwitch: true }
);
assert(stopped.reasons.includes("KILL_SWITCH"));
const limited = evaluateRisk(
  {
    ...intent,
    ...state,
    assetExposureMinor: 20_000,
    availableLiquidityMinor: 19_999,
    dailyLossMinor: 4_500,
    marketSource: snapshot.source,
    marketSourceLicense: snapshot.sourceLicense,
    now,
    sourceTimestamp: now,
    unitPriceMinor: snapshot.priceMinor,
  },
  { ...policy, maxApprovalMinor: 9_999 }
);
assert(limited.reasons.includes("APPROVAL_LIMIT"));
assert(limited.reasons.includes("ASSET_CONCENTRATION_LIMIT"));
assert(limited.reasons.includes("DAILY_LOSS_LIMIT"));
assert(limited.reasons.includes("LIQUIDITY_LIMIT"));

const registry = new MarketDataRegistry();
assert.strictEqual(registry.ingest(snapshot), "accepted");
assert.strictEqual(registry.ingest(snapshot), "duplicate");
assert.throws(() => registry.ingest({ ...snapshot, priceMinor: 2_000 }), /Conflicting duplicate/);
const secondSnapshot = {
  ...snapshot,
  ingestionId: "price-2",
  priceMinor: 1_003,
  source: "licensed-fixture-2",
};
registry.ingest(secondSnapshot);
assert.deepStrictEqual(registry.reconcile("price-1", "price-2", 2).matched, false);
assert.deepStrictEqual(registry.reconcile("price-1", "price-2", 3).matched, true);

const engine = new PaperTradingEngine();
const submitted = engine.submit(intent, snapshot, state, policy, now);
assert.strictEqual(submitted.decision.approved, true);
const duplicate = engine.submit(intent, snapshot, state, policy, now);
assert.strictEqual(duplicate.event.hash, submitted.event.hash);
assert.strictEqual(engine.ledger.all().length, 1);
const rejectedDuplicate = engine.submit(
  { ...intent, idempotencyKey: "submit-conflict" },
  snapshot,
  state,
  policy,
  now
);
assert.strictEqual(rejectedDuplicate.event.data.reason, "DUPLICATE_ORDER");

const partial = engine.recordFill("order-1", "fill-1", 4, 1_000, now + 1, now);
assert.strictEqual(partial.data.status, "PARTIALLY_FILLED");
assert.strictEqual(engine.recordFill("order-1", "fill-1", 4, 1_000, now + 1, now).hash, partial.hash);
const completed = engine.recordFill("order-1", "fill-2", 6, 1_001, now + 2, now);
assert.strictEqual(completed.data.status, "FILLED");
assert.throws(() => engine.recordFill("order-1", "fill-3", 1, 1_001, now + 3, now), /exceeds/);

engine.ledger.append({
  correctsEventId: completed.eventId,
  data: { reason: "venue correction", replacementPriceMinor: 999 },
  eventId: "correction-1",
  idempotencyKey: "correction-1",
  occurredAt: now + 4,
  orderId: "order-1",
  sourceTimestamp: now + 4,
  type: "CORRECTION",
});
assert.strictEqual(engine.ledger.verifyHashChain(), true);
assert.strictEqual(engine.ledger.exportJsonLines().split("\n").length, 5);

console.log("Paper safety tests passed (25 assertions).");
