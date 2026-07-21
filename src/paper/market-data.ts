export interface MarketSnapshot {
  asset: string;
  ingestedAt: number;
  ingestionId: string;
  priceMinor: number;
  source: string;
  sourceLicense: string;
  sourceTimestamp: number;
}

export type IngestionStatus = "accepted" | "duplicate";

function canonicalSnapshot(snapshot: MarketSnapshot): string {
  return JSON.stringify({
    asset: snapshot.asset,
    ingestedAt: snapshot.ingestedAt,
    ingestionId: snapshot.ingestionId,
    priceMinor: snapshot.priceMinor,
    source: snapshot.source,
    sourceLicense: snapshot.sourceLicense,
    sourceTimestamp: snapshot.sourceTimestamp,
  });
}

function validateSnapshot(snapshot: MarketSnapshot): void {
  if (
    !snapshot.asset.trim() ||
    !snapshot.ingestionId.trim() ||
    !snapshot.source.trim() ||
    !snapshot.sourceLicense.trim()
  ) {
    throw new Error("Market data requires asset, ingestion id, licensed source, and source license");
  }
  for (const value of [snapshot.ingestedAt, snapshot.priceMinor, snapshot.sourceTimestamp]) {
    if (!Number.isSafeInteger(value) || value < 0) {
      throw new Error("Market data numeric fields must be non-negative safe integers");
    }
  }
  if (snapshot.priceMinor === 0) throw new Error("Market price must be positive");
}

export class MarketDataRegistry {
  private readonly byId = new Map<string, MarketSnapshot>();
  private readonly latestByAsset = new Map<string, MarketSnapshot>();

  ingest(snapshot: MarketSnapshot): IngestionStatus {
    validateSnapshot(snapshot);
    const existing = this.byId.get(snapshot.ingestionId);
    if (existing) {
      if (canonicalSnapshot(existing) !== canonicalSnapshot(snapshot)) {
        throw new Error(`Conflicting duplicate ingestion id: ${snapshot.ingestionId}`);
      }
      return "duplicate";
    }

    const immutable = Object.freeze({ ...snapshot });
    this.byId.set(snapshot.ingestionId, immutable);
    const current = this.latestByAsset.get(snapshot.asset);
    if (!current || snapshot.sourceTimestamp >= current.sourceTimestamp) {
      this.latestByAsset.set(snapshot.asset, immutable);
    }
    return "accepted";
  }

  latest(asset: string): MarketSnapshot | undefined {
    const snapshot = this.latestByAsset.get(asset);
    return snapshot ? { ...snapshot } : undefined;
  }

  reconcile(leftIngestionId: string, rightIngestionId: string, toleranceMinor: number) {
    if (!Number.isSafeInteger(toleranceMinor) || toleranceMinor < 0) {
      throw new Error("Reconciliation tolerance must be a non-negative safe integer");
    }
    const left = this.byId.get(leftIngestionId);
    const right = this.byId.get(rightIngestionId);
    if (!left || !right) throw new Error("Both ingestion records are required for reconciliation");
    if (left.asset !== right.asset) throw new Error("Cannot reconcile different assets");

    const differenceMinor = Math.abs(left.priceMinor - right.priceMinor);
    return {
      asset: left.asset,
      differenceMinor,
      matched: differenceMinor <= toleranceMinor,
      sourceTimestamps: [left.sourceTimestamp, right.sourceTimestamp],
    };
  }
}
