# Enzyme/Aave integration reference (quarantined)

This is a historical 2021–2022 TypeScript integration fork. It is **not a launchable finance application, supported SDK, or deployment source**. The original Kovan contracts and data endpoints are obsolete, credential material was committed historically, ABI licensing is mixed or incomplete, and the original live paths had no project-owned tests.

The repository now fails closed: package publishing and account-funding commands are blocked, every fund/Aave mutation path throws before touching a signer or nonce, and executable examples are paper-only. See [Provenance and licensing](PROVENANCE.md) for the exact snapshot and unresolved reuse conditions.

## Supported workflow

Use Node.js 16 or newer and the npm lockfile:

```bash
npm ci
npm test
npm run paper:demo
```

`npm test` performs a clean TypeScript build, runs the deterministic paper-safety suite, and verifies quarantine controls. The tests cover licensed-source metadata, source timestamps, idempotent ingestion, price reconciliation, stale data, the kill switch, exposure/liquidity/loss/approval limits, duplicate orders and fills, partial fills, overfills, append-only corrections, and hash-chained audit export.

The paper engine uses integer minor units. It never creates a provider, signer, approval, or blockchain transaction.

## Runtime configuration

`.env.example` lists optional variable names without values. The library never bundles credentials. `loadRuntimeConfig()` fails when required values are missing, but supplying them does not unlock live execution.

The private key, credential-bearing RPC URL, and raw signed transaction that were present in the snapshot have been removed from the working tree. Because Git history still contains them, they must be considered permanently compromised and revoked by their owner.

## Safety boundary

The following remain unsupported:

- Aave deposits and borrows;
- Enzyme fund creation, approvals, investments, and redemptions;
- account funding, package publication, or public-network operation;
- use of the retired Kovan addresses or subgraph endpoints; and
- any claim that the historical ABI artifacts or local code are audited together.

Re-enabling a live operation requires a new, separately owned product boundary; resolved licensing and data-vendor contracts; current chain deployments; signer/custody isolation; independent smart-contract and application review; reconciliation and incident runbooks; and paper/backtest acceptance evidence. Do not remove the quarantine guard in this repository.

## Market-data contract

`MarketDataRegistry` requires a source name, source-license identifier, source timestamp, ingestion timestamp, asset, positive integer price, and idempotency ID. Duplicate payloads are idempotent; conflicting duplicates fail. It is an ingestion boundary—not a bundled market-data feed. A future product owner must contract with and integrate an appropriate licensed source.

## License

Publication and redistribution are blocked while provenance is incomplete. The historical wrapper claimed MIT in its README/package metadata, while embedded Enzyme compilation metadata identifies GPL-3.0 and MIT source inputs, and the exact origin/license of six Aave ABI files was not recorded. The package is therefore marked `UNLICENSED` until a qualified owner completes the review described in [PROVENANCE.md](PROVENANCE.md).
