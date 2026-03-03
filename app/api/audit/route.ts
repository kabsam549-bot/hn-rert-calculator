import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

const AUDIT_KEY = 'hn-rert:audit';

interface AuditEntry {
  timestamp: string;
  author: string;
  field: string;
  oldValue: unknown;
  newValue: unknown;
}

const isKVConfigured = () => Boolean(
  process.env.KV_REST_API_URL &&
  process.env.KV_REST_API_TOKEN
);

export async function GET() {
  try {
    if (!isKVConfigured()) {
      return NextResponse.json([], { status: 200 });
    }

    const auditLog = (await kv.get<AuditEntry[]>(AUDIT_KEY)) ?? [];
    const sorted = [...auditLog].sort((a, b) => {
      const aTime = new Date(a.timestamp).getTime();
      const bTime = new Date(b.timestamp).getTime();
      return bTime - aTime;
    });

    return NextResponse.json(sorted, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to load audit log' },
      { status: 500 }
    );
  }
}
