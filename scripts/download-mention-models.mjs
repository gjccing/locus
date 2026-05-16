#!/usr/bin/env node
/**
 * Refresh local mention model catalogs.
 * Usage: npm run mention-models:download
 * Optional: GROQ_API_KEY=... for live Groq model list
 */
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '../lib/data');

const GATEWAY_URL = 'https://ai-gateway.vercel.sh/v1/models';
const GROQ_URL = 'https://api.groq.com/openai/v1/models';

async function downloadGatewayCatalog() {
  const res = await fetch(GATEWAY_URL);
  if (!res.ok) {
    throw new Error(`Gateway catalog failed (${res.status})`);
  }

  const json = await res.json();
  const data = (json.data ?? []).map((m) => ({
    id: m.id,
    name: m.name,
    owned_by: m.owned_by,
    type: m.type,
    released: m.released,
  }));

  const out = { fetchedAt: new Date().toISOString(), data };
  writeFileSync(
    join(dataDir, 'gateway-catalog.json'),
    `${JSON.stringify(out, null, 0)}\n`
  );

  console.log(`gateway-catalog.json: ${data.length} models`);
}

async function downloadGroqCatalog() {
  const apiKey = process.env.GROQ_API_KEY?.trim();

  if (!apiKey) {
    console.warn(
      'Skipping Groq refresh (set GROQ_API_KEY to update lib/data/groq-catalog.json)'
    );
    return;
  }

  const res = await fetch(GROQ_URL, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  if (!res.ok) {
    throw new Error(`Groq models failed (${res.status})`);
  }

  const json = await res.json();
  const data = (json.data ?? []).map((m) => ({
    id: m.id,
    created: m.created,
  }));

  const out = { fetchedAt: new Date().toISOString(), data };
  writeFileSync(
    join(dataDir, 'groq-catalog.json'),
    `${JSON.stringify(out, null, 0)}\n`
  );

  console.log(`groq-catalog.json: ${data.length} models`);
}

await downloadGatewayCatalog();
await downloadGroqCatalog();
