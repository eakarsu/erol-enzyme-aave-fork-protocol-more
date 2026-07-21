#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const root = path.resolve(__dirname, "..");
const failures = [];
const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));

if (packageJson.private !== true) failures.push("package must remain private");
if (packageJson.license !== "UNLICENSED") failures.push("license must remain quarantined");
if (packageJson.main !== "./build/paper/index.js") failures.push("package entry point must remain paper-only");
if (packageJson.dependencies && Object.keys(packageJson.dependencies).length) {
  failures.push("paper-only package entry must not install legacy live dependencies");
}
for (const script of ["getEth", "pub", "testAave"]) {
  if (!packageJson.scripts[script] || !packageJson.scripts[script].includes("deny-live-action")) {
    failures.push(`${script} must fail closed`);
  }
}
if (packageJson.repository.url !== "https://github.com/eakarsu/erol-enzyme-aave-fork-protocol-more.git") {
  failures.push("repository provenance URL changed");
}

const forbiddenPaths = ["src/abis/.pendingTransactions", "src/abis/solcInputs"];
for (const relative of forbiddenPaths) {
  if (fs.existsSync(path.join(root, relative))) failures.push(`credential-sensitive path exists: ${relative}`);
}

const guardedOperations = {
  "src/aave/AaveProvider.ts": ["Aave collateral deposit", "Aave asset borrow"],
  "src/funds/create-fund.ts": ["Enzyme fund creation"],
  "src/funds/withdrawal-deposits.ts": [
    "Enzyme investment approval",
    "Enzyme fund investment",
    "Enzyme share redemption",
  ],
};
for (const [relative, operations] of Object.entries(guardedOperations)) {
  const source = fs.readFileSync(path.join(root, relative), "utf8");
  for (const operation of operations) {
    if (!source.includes(`assertMutationQuarantined(\"${operation}\")`)) {
      failures.push(`missing live guard for ${operation}`);
    }
  }
}

const sourceFiles = [];
function collect(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) collect(fullPath);
    else if (/\.(md|ts|json)$/.test(entry.name)) sourceFiles.push(fullPath);
  }
}
collect(path.join(root, "src"));
sourceFiles.push(path.join(root, "README.md"), path.join(root, ".env.example"));

for (const file of sourceFiles) {
  if (file.includes(`${path.sep}abis${path.sep}`)) continue;
  const contents = fs.readFileSync(file, "utf8");
  if (/\b0x[a-fA-F0-9]{64}\b/.test(contents)) failures.push(`possible private key in ${path.relative(root, file)}`);
  if (/infura\.io\/v3\/[A-Za-z0-9_-]+/.test(contents)) {
    failures.push(`credential-bearing RPC URL in ${path.relative(root, file)}`);
  }
}

const manifestPath = path.join(root, "src/abis/provenance-manifest.json");
if (!fs.existsSync(manifestPath)) {
  failures.push("ABI provenance manifest is missing");
} else {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  if (manifest.retainedBaselineCommit !== "7f39132a3a2f4e8b0c663149e20d7340650f8eef") {
    failures.push("ABI manifest baseline changed");
  }
  if (!Array.isArray(manifest.artifacts) || manifest.artifacts.length !== 46) {
    failures.push("ABI manifest must cover all 46 retained artifacts");
  } else {
    for (const artifact of manifest.artifacts) {
      const artifactPath = path.join(root, artifact.path);
      if (!fs.existsSync(artifactPath)) {
        failures.push(`missing ABI artifact: ${artifact.path}`);
        continue;
      }
      const contents = fs.readFileSync(artifactPath, "utf8");
      const hash = crypto.createHash("sha256").update(contents).digest("hex");
      if (hash !== artifact.sanitizedSha256) failures.push(`ABI hash mismatch: ${artifact.path}`);
      if (!artifact.path.includes("/aave/")) {
        const keys = Object.keys(JSON.parse(contents)).sort();
        if (JSON.stringify(keys) !== JSON.stringify(["abi", "address"])) {
          failures.push(`deployment artifact is not address/ABI-only: ${artifact.path}`);
        }
      }
    }
  }
}
if (!fs.existsSync(path.join(root, "PROVENANCE.md"))) failures.push("PROVENANCE.md is missing");

const repositoryPolicy = JSON.parse(fs.readFileSync(path.join(root, "repository-policy.json"), "utf8"));
if (repositoryPolicy.decision !== "quarantine-as-paper-only-reference") {
  failures.push("repository decision must remain paper-only quarantine");
}
if (repositoryPolicy.licenseStatus !== "unresolved-do-not-publish-or-redistribute") {
  failures.push("unresolved license status must remain explicit");
}

if (failures.length) {
  console.error("Quarantine check failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log("Quarantine check passed. Live execution and publishing remain fail closed.");
}
