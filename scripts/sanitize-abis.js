#!/usr/bin/env node
"use strict";

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const abiDirectory = path.join(root, "src/abis");
const manifestPath = path.join(abiDirectory, "provenance-manifest.json");
const previousManifest = fs.existsSync(manifestPath)
  ? JSON.parse(fs.readFileSync(manifestPath, "utf8"))
  : { artifacts: [] };
const previousByPath = new Map(previousManifest.artifacts.map((item) => [item.path, item]));

function sha256(contents) {
  return crypto.createHash("sha256").update(contents).digest("hex");
}

const artifacts = [];
for (const filename of fs.readdirSync(abiDirectory).filter((item) => item.endsWith(".json")).sort()) {
  if (filename === "provenance-manifest.json") continue;
  const relative = `src/abis/${filename}`;
  const file = path.join(abiDirectory, filename);
  const original = fs.readFileSync(file, "utf8");
  const parsed = JSON.parse(original);
  if (!parsed.address || !Array.isArray(parsed.abi)) continue;

  let compiler = null;
  let compilationTarget = null;
  let sourceLicenses = [];
  if (parsed.metadata) {
    const metadata = typeof parsed.metadata === "string" ? JSON.parse(parsed.metadata) : parsed.metadata;
    compiler = metadata.compiler && metadata.compiler.version;
    compilationTarget = metadata.settings && metadata.settings.compilationTarget;
    sourceLicenses = [...new Set(Object.values(metadata.sources || {}).map((source) => source.license).filter(Boolean))].sort();
  }

  const sanitized = `${JSON.stringify({ address: parsed.address, abi: parsed.abi }, null, 2)}\n`;
  fs.writeFileSync(file, sanitized);
  const previous = previousByPath.get(relative);
  artifacts.push({
    path: relative,
    address: parsed.address,
    compiler: compiler || (previous && previous.compiler) || null,
    compilationTarget: compilationTarget || (previous && previous.compilationTarget) || null,
    originalSha256: (previous && previous.originalSha256) || sha256(original),
    sanitizedSha256: sha256(sanitized),
    sourceLicenses: sourceLicenses.length ? sourceLicenses : (previous && previous.sourceLicenses) || [],
  });
}

for (const filename of fs.readdirSync(path.join(abiDirectory, "aave")).filter((item) => item.endsWith(".json")).sort()) {
  const relative = `src/abis/aave/${filename}`;
  const contents = fs.readFileSync(path.join(root, relative), "utf8");
  artifacts.push({
    path: relative,
    address: null,
    compiler: null,
    compilationTarget: null,
    originalSha256: sha256(contents),
    sanitizedSha256: sha256(contents),
    sourceLicenses: [],
  });
}

fs.writeFileSync(
  manifestPath,
  `${JSON.stringify(
    {
      schemaVersion: 1,
      retainedBaselineCommit: "7f39132a3a2f4e8b0c663149e20d7340650f8eef",
      note: "Enzyme deployment artifacts were reduced to address and ABI; original hashes and embedded metadata provenance are retained below. Exact Aave ABI origins were not recorded by the historical project.",
      artifacts,
    },
    null,
    2
  )}\n`
);

console.log(`Sanitized ${artifacts.length} ABI files and wrote provenance manifest.`);
