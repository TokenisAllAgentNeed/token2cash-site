#!/usr/bin/env node

/**
 * Validate gates.json for PR checks.
 *
 * Checks performed:
 *   1. JSON is valid and parseable
 *   2. Top-level structure has a "gates" array
 *   3. Each gate entry has all required fields with correct types
 *   4. Gate URL is reachable (GET /health returns 200)
 *   5. Mint URL is reachable (GET /v1/info returns 200)
 *
 * Exit code 0 = all checks passed, 1 = one or more failures.
 */

import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const REQUIRED_FIELDS = {
  name: "string",
  url: "string",
  mint: "string",
  providers: "array",
  models: "array",
  markup: "string",
  description: "string",
};

const FETCH_TIMEOUT_MS = 15_000;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function fail(msg) {
  console.error(`FAIL: ${msg}`);
  return false;
}

function pass(msg) {
  console.log(`OK:   ${msg}`);
  return true;
}

async function fetchOk(url, label) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (res.ok) {
      return pass(`${label} => ${res.status}`);
    }
    return fail(`${label} => HTTP ${res.status}`);
  } catch (err) {
    return fail(`${label} => ${err.message}`);
  } finally {
    clearTimeout(timer);
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const filePath = resolve(
    process.argv[2] || "gates.json"
  );
  console.log(`Validating ${filePath}\n`);

  // 1. Read & parse JSON ------------------------------------------------
  let raw;
  try {
    raw = await readFile(filePath, "utf-8");
  } catch (err) {
    fail(`Cannot read file: ${err.message}`);
    process.exit(1);
  }

  let data;
  try {
    data = JSON.parse(raw);
  } catch (err) {
    fail(`Invalid JSON: ${err.message}`);
    process.exit(1);
  }
  pass("JSON is valid");

  // 2. Top-level structure ----------------------------------------------
  if (!data.gates || !Array.isArray(data.gates)) {
    fail('Missing or invalid top-level "gates" array');
    process.exit(1);
  }
  pass(`Found ${data.gates.length} gate(s)`);

  if (data.gates.length === 0) {
    fail("gates array is empty");
    process.exit(1);
  }

  // 3–5. Per-gate checks ------------------------------------------------
  let allPassed = true;

  for (let i = 0; i < data.gates.length; i++) {
    const gate = data.gates[i];
    const prefix = `gates[${i}]`;
    console.log(`\n--- ${prefix}: ${gate.name || "(no name)"} ---`);

    // 3. Required fields & types
    for (const [field, type] of Object.entries(REQUIRED_FIELDS)) {
      if (!(field in gate)) {
        allPassed = fail(`${prefix} missing required field "${field}"`);
        continue;
      }
      if (type === "array") {
        if (!Array.isArray(gate[field])) {
          allPassed = fail(`${prefix}.${field} must be an array`);
        } else if (gate[field].length === 0) {
          allPassed = fail(`${prefix}.${field} must not be empty`);
        } else {
          pass(`${prefix}.${field} is a non-empty array`);
        }
      } else if (typeof gate[field] !== type) {
        allPassed = fail(
          `${prefix}.${field} must be a ${type}, got ${typeof gate[field]}`
        );
      } else if (gate[field].trim() === "") {
        allPassed = fail(`${prefix}.${field} must not be empty`);
      } else {
        pass(`${prefix}.${field} = "${gate[field]}"`);
      }
    }

    // URL format quick-check
    for (const urlField of ["url", "mint"]) {
      if (typeof gate[urlField] === "string") {
        try {
          new URL(gate[urlField]);
        } catch {
          allPassed = fail(
            `${prefix}.${urlField} is not a valid URL: "${gate[urlField]}"`
          );
        }
      }
    }

    // 4. Gate health check
    if (typeof gate.url === "string" && gate.url.startsWith("http")) {
      const healthUrl = gate.url.replace(/\/+$/, "") + "/health";
      const ok = await fetchOk(healthUrl, `${prefix} GET ${healthUrl}`);
      if (!ok) allPassed = false;
    }

    // 5. Mint info check
    if (typeof gate.mint === "string" && gate.mint.startsWith("http")) {
      const infoUrl = gate.mint.replace(/\/+$/, "") + "/v1/info";
      const ok = await fetchOk(infoUrl, `${prefix} GET ${infoUrl}`);
      if (!ok) allPassed = false;
    }
  }

  // Summary
  console.log("\n" + "=".repeat(50));
  if (allPassed) {
    console.log("All checks passed.");
    process.exit(0);
  } else {
    console.error("Some checks failed. See details above.");
    process.exit(1);
  }
}

main();
