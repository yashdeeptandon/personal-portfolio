/**
 * Resend Domain Status Checker
 *
 * Lists domains registered on the Resend account and their DNS record
 * verification status, so you don't have to babysit the dashboard while
 * waiting for DNS propagation.
 *
 * Usage: node scripts/check-resend-domain.mjs
 */

import { config } from "dotenv";

config({ path: ".env.local" });

const apiKey = process.env.RESEND_API_KEY;

if (!apiKey) {
  console.error("RESEND_API_KEY not set. Check .env.local.");
  process.exit(1);
}

const response = await fetch("https://api.resend.com/domains", {
  headers: { Authorization: `Bearer ${apiKey}` },
});

if (!response.ok) {
  console.error("Failed to fetch domains:", response.status, response.statusText);
  process.exit(1);
}

const { data: domains } = await response.json();

if (!domains?.length) {
  console.log("No domains registered on this Resend account yet.");
  process.exit(0);
}

for (const domain of domains) {
  console.log(`\n${domain.name} — status: ${domain.status}`);

  const detailResponse = await fetch(`https://api.resend.com/domains/${domain.id}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  const detail = await detailResponse.json();

  for (const record of detail.records || []) {
    const marker = record.status === "verified" ? "✓" : "✗";
    console.log(`  ${marker} ${record.record} (${record.type}) — ${record.status}`);
  }
}
