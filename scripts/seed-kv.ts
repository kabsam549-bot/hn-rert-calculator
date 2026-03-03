/**
 * Seed Vercel KV with default editable content.
 *
 * Usage:
 * 1) Ensure KV env vars are set (KV_REST_API_URL, KV_REST_API_TOKEN).
 * 2) Run: npx tsx scripts/seed-kv.ts
 */

import { kv } from '@vercel/kv';
import { defaultContent } from '@/lib/editableContent';

const CONTENT_KEY = 'hn-rert:content';
const AUDIT_KEY = 'hn-rert:audit';

const isKVConfigured = () => Boolean(
  process.env.KV_REST_API_URL &&
  process.env.KV_REST_API_TOKEN
);

const run = async () => {
  if (!isKVConfigured()) {
    throw new Error('KV is not configured. Set KV_REST_API_URL and KV_REST_API_TOKEN.');
  }

  await kv.set(CONTENT_KEY, defaultContent);
  await kv.set(AUDIT_KEY, []);

  // eslint-disable-next-line no-console
  console.log('KV seeded with default content.');
};

run().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});
