export type RiskFailureCode =
  | "APPROVAL_LIMIT"
  | "ASSET_CONCENTRATION_LIMIT"
  | "DAILY_LOSS_LIMIT"
  | "FUTURE_MARKET_DATA"
  | "INVALID_INPUT"
  | "KILL_SWITCH"
  | "LIQUIDITY_LIMIT"
  | "MISSING_IDEMPOTENCY_KEY"
  | "ORDER_NOTIONAL_LIMIT"
  | "STALE_MARKET_DATA"
  | "UNLICENSED_MARKET_DATA";

export interface RiskPolicy {
  killSwitch: boolean;
  maxApprovalMinor: number;
  maxAssetExposureBps: number;
  maxDailyLossMinor: number;
  maxDataAgeMs: number;
  maxFutureSkewMs: number;
  maxOrderNotionalMinor: number;
  minLiquidityReserveMinor: number;
}

export interface OrderRiskInput {
  approvalMinor: number;
  asset: string;
  assetExposureMinor: number;
  availableLiquidityMinor: number;
  dailyLossMinor: number;
  idempotencyKey: string;
  marketSource: string;
  marketSourceLicense: string;
  maxLossMinor: number;
  now: number;
  portfolioValueMinor: number;
  quantityUnits: number;
  sourceTimestamp: number;
  unitPriceMinor: number;
}

export interface RiskDecision {
  approved: boolean;
  notionalMinor: number;
  reasons: RiskFailureCode[];
}

function isNonNegativeSafeInteger(value: number): boolean {
  return Number.isSafeInteger(value) && value >= 0;
}

function validInputs(input: OrderRiskInput, policy: RiskPolicy): boolean {
  const values = [
    input.approvalMinor,
    input.assetExposureMinor,
    input.availableLiquidityMinor,
    input.dailyLossMinor,
    input.maxLossMinor,
    input.now,
    input.portfolioValueMinor,
    input.quantityUnits,
    input.sourceTimestamp,
    input.unitPriceMinor,
    policy.maxApprovalMinor,
    policy.maxAssetExposureBps,
    policy.maxDailyLossMinor,
    policy.maxDataAgeMs,
    policy.maxFutureSkewMs,
    policy.maxOrderNotionalMinor,
    policy.minLiquidityReserveMinor,
  ];

  return (
    values.every(isNonNegativeSafeInteger) &&
    policy.maxAssetExposureBps <= 10_000 &&
    input.asset.trim().length > 0 &&
    input.marketSource.trim().length > 0
  );
}

export function evaluateRisk(input: OrderRiskInput, policy: RiskPolicy): RiskDecision {
  const reasons: RiskFailureCode[] = [];

  if (!validInputs(input, policy)) {
    return { approved: false, notionalMinor: 0, reasons: ["INVALID_INPUT"] };
  }

  const notional = BigInt(input.quantityUnits) * BigInt(input.unitPriceMinor);
  if (notional > BigInt(Number.MAX_SAFE_INTEGER)) {
    return { approved: false, notionalMinor: 0, reasons: ["INVALID_INPUT"] };
  }
  const notionalMinor = Number(notional);

  if (policy.killSwitch) reasons.push("KILL_SWITCH");
  if (!input.idempotencyKey.trim()) reasons.push("MISSING_IDEMPOTENCY_KEY");
  if (!input.marketSourceLicense.trim()) reasons.push("UNLICENSED_MARKET_DATA");
  if (input.sourceTimestamp > input.now + policy.maxFutureSkewMs) reasons.push("FUTURE_MARKET_DATA");
  if (input.now - input.sourceTimestamp > policy.maxDataAgeMs) reasons.push("STALE_MARKET_DATA");
  if (notionalMinor > policy.maxOrderNotionalMinor) reasons.push("ORDER_NOTIONAL_LIMIT");
  if (input.approvalMinor > policy.maxApprovalMinor) reasons.push("APPROVAL_LIMIT");
  if (BigInt(input.dailyLossMinor) + BigInt(input.maxLossMinor) > BigInt(policy.maxDailyLossMinor)) {
    reasons.push("DAILY_LOSS_LIMIT");
  }
  if (notional + BigInt(policy.minLiquidityReserveMinor) > BigInt(input.availableLiquidityMinor)) {
    reasons.push("LIQUIDITY_LIMIT");
  }

  const projectedExposure = BigInt(input.assetExposureMinor) + notional;
  const concentrationLimit =
    (BigInt(input.portfolioValueMinor) * BigInt(policy.maxAssetExposureBps)) / BigInt(10_000);
  if (projectedExposure > concentrationLimit) reasons.push("ASSET_CONCENTRATION_LIMIT");

  return { approved: reasons.length === 0, notionalMinor, reasons };
}
