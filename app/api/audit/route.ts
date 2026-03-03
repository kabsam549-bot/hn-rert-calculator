import { NextResponse } from 'next/server';
import Redis from 'ioredis';

const AUDIT_KEY = 'hn-rert:audit';

// Initialize Redis if URL is available
const redis = process.env.REDIS_URL ? new Redis(process.env.REDIS_URL) : null;

export async function GET() {
  try {
    if (!redis) {
      return NextResponse.json([], { status: 200 });
    }

    const raw = await redis.get(AUDIT_KEY);
    const auditLog = raw ? JSON.parse(raw) : [];

    // Sort by timestamp desc
    const sorted = auditLog.sort((a: any, b: any) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    return NextResponse.json(sorted, { status: 200 });
  } catch (error) {
    console.error('Failed to load audit log:', error);
    return NextResponse.json(
      { error: 'Failed to load audit log' },
      { status: 500 }
    );
  }
}
