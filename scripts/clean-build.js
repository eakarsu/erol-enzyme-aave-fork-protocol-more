#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const buildDirectory = path.join(root, "build");
if (path.dirname(buildDirectory) !== root || path.basename(buildDirectory) !== "build") {
  throw new Error("Refusing to clean an unexpected path");
}
fs.rmSync(buildDirectory, { force: true, recursive: true });
