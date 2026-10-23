"use strict";

const assert = require("assert");
const { PaperTradingEngine, eventsToCsv, listFillTasks, searchEvents, summarizeLedger } = require("../build/paper");

const now = 1_700_000_000_000;
const policy = {
  killSwitch: false, maxApprovalMinor: 50_000, maxAssetExposureBps: 2_500, maxDailyLossMinor: 5_000,
  maxDataAgeMs: 60_000, maxFutureSkewMs: 1_000, maxOrderNotionalMinor: 25_000, minLiquidityReserveMinor: 10_000,
};
const snapshot = { asset: "TEST", ingestedAt: now, ingestionId: "price-1", priceMinor: 1_000, source: "licensed-fixture", sourceLicense: "internal-test-data", sourceTimestamp: now };
const intent = { approvalMinor: 10_000, asset: "TEST", idempotencyKey: "submit-1", maxLossMinor: 1_000, orderId: "order-1", quantityUnits: 10 };
const state = { assetExposureMinor: 0, availableLiquidityMinor: 100_000, dailyLossMinor: 0, portfolioValueMinor: 100_000 };

async function main() {
  const engine = new PaperTradingEngine();
  engine.submit(intent, snapshot, state, policy, now);
  engine.recordFill("order-1", "fill-1", 4, 1_000, now + 1, now);
  const events = engine.ledger.all();
  assert.strictEqual(searchEvents(events, "order_accepted").length, 1);
  assert.strictEqual(searchEvents(events, "", "FILL_RECORDED").length, 1);
  assert.deepStrictEqual(listFillTasks(events), [{ kind: "fill", orderId: "order-1", asset: "TEST", remainingUnits: 6 }]);
  assert.match(eventsToCsv(events), /ORDER_ACCEPTED/);
  const fallback = await summarizeLedger(events, { apiKey: "" });
  assert.strictEqual(fallback.provider, "deterministic-fallback");
  assert.match(fallback.text, /Paper ledger/);
  let seenUrl = "";
  const provided = await summarizeLedger(events, {
    apiKey: "test-key",
    fetcher: async (url) => { seenUrl = url; return { ok: true, status: 200, json: async () => ({ choices: [{ message: { content: "Provider summary." } }] }) }; },
  });
  assert.strictEqual(provided.provider, "openai-compatible");
  assert.strictEqual(provided.text, "Provider summary.");
  assert.match(seenUrl, /\/chat\/completions$/);
  console.log("Paper insights tests passed.");
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
