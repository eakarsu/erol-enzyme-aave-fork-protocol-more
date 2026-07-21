# Provenance, licensing, and ownership

## Repository identity

- Retained repository: <https://github.com/eakarsu/erol-enzyme-aave-fork-protocol-more>
- Historical branch: `main`
- Original retained baseline: `7f39132a3a2f4e8b0c663149e20d7340650f8eef` (2022-01-31)
- Commit history author/declared package author: Omambia M. Dauglous
- Current repository and quarantine owner: `eakarsu`
- Historical package identity: `@devngeni/protocol@1.0.16`

The history starts in this repository at commit `d8ab6b6` on 2021-11-12; it does not record a source-code fork parent. The historical package declared `@enzymefinance/protocol@^3.0.1`, `@enzymefinance/ethers@^1.0.10`, and `@aave/protocol-js@^4.3.0`. That original dependency record remains available in Git history.

The supported build deliberately compiles and exports only `src/paper`, `src/safety`, and runtime configuration validation. It has no production dependencies. Historical live-integration sources remain available for inspection but are excluded from the package entry point and TypeScript build in addition to their runtime quarantine guards.

## ABI artifacts

The original `src/abis` directory mixed contract addresses and ABIs with bytecode, receipts, transaction hashes, compiler inputs, full metadata, and a raw signed pending transaction. The working tree now keeps only the address and ABI needed by the historical TypeScript interfaces.

[`src/abis/provenance-manifest.json`](src/abis/provenance-manifest.json) records the SHA-256 hash of every original Enzyme deployment artifact, the hash of its sanitized form, the embedded compiler/compilation target, and its embedded SPDX source-license identifiers. Thirty-nine retained Enzyme artifacts identify GPL-3.0 source inputs and OpenZeppelin MIT inputs. The six ABI-only files under `src/abis/aave` contain no embedded origin or license metadata; their exact upstream revision is unresolved.

The deleted compiler input and transaction files remain recoverable from Git history. Their presence in history is evidence, not authorization to redistribute or deploy them.

## License decision

The historical README and package metadata claimed MIT for the wrapper but did not include a standalone license file or explain the GPL-3.0 Enzyme-derived artifacts. It would be misleading to assert a clean repository-wide MIT grant. This package is now `private` and `UNLICENSED`, and publishing fails closed.

Before extraction or redistribution, a qualified owner must identify the copyright holder and license for the wrapper source, trace the six Aave ABIs to an exact upstream revision, comply with the Enzyme GPL-3.0 obligations, preserve applicable notices, and record the resulting license expression. This file documents the uncertainty; it is not legal advice.

## Secret and custody response

The original baseline committed:

- a private key in `src/config/index.ts`;
- a credential-bearing Infura Kovan URL; and
- a raw signed transaction in `src/abis/.pendingTransactions`.

They have been removed from the working tree and generated output. Git history still contains them, so their owners must treat them as compromised and revoke/rotate them. Rewriting shared history is an external coordination decision and was not performed. No current key, custody system, or live account is supported here.

## Maintenance and security responsibility

The repository owner (`eakarsu`) owns the quarantine controls, dependency alerts, access control, and any decision to archive the snapshot. There is no supported release or security-patch SLA. The classification should be reviewed annually and before any reuse; upstream changes are assessed manually and are not merged automatically.

Any future product must be extracted into a new repository with an assigned product and security owner. It must select licensed market/data providers, establish idempotent reconciliation and audit retention, isolate keys through an approved custody boundary, set deterministic risk limits outside any model, and complete independent security review before a live pilot.
