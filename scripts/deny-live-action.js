#!/usr/bin/env node
"use strict";

const action = process.argv.slice(2).join(" ") || "live action";
console.error(
  `Blocked ${action}: this historical fork is quarantined and supports paper simulation only.`
);
process.exitCode = 1;
