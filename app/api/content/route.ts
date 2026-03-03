import { NextResponse } from 'next/server';
import Redis from 'ioredis';
import { defaultContent, type EditableContent } from '@/lib/editableContent';

const CONTENT_KEY = 'hn-rert:content';
const AUDIT_KEY = 'hn-rert:audit';

// Initialize Redis if URL is available
const redis = process.env.REDIS_URL ? new Redis(process.env.REDIS_URL) : null;

interface AuditEntry {
  timestamp: string;
  author: string;
  field: string;
  oldValue: unknown;
  newValue: unknown;
}

const getAdminPassword = () => process.env.ADMIN_PASSWORD ?? 'phan2026admin';

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const valuesEqual = (a: unknown, b: unknown) => {
  if (Number.isNaN(a) && Number.isNaN(b)) {
    return true;
  }
  return Object.is(a, b);
};

const diffObjects = (
  oldValue: unknown,
  newValue: unknown,
  path: string,
  entries: AuditEntry[],
  author: string
) => {
  if (valuesEqual(oldValue, newValue)) {
    return;
  }

  if (Array.isArray(oldValue) && Array.isArray(newValue)) {
    if (oldValue.length !== newValue.length) {
      entries.push({
        timestamp: new Date().toISOString(),
        author,
        field: path,
        oldValue,
        newValue,
      });
      return;
    }

    for (let i = 0; i < oldValue.length; i += 1) {
      diffObjects(oldValue[i], newValue[i], `${path}[${i}]`, entries, author);
    }
    return;
  }

  if (isPlainObject(oldValue) && isPlainObject(newValue)) {
    const keys = new Set([...Object.keys(oldValue), ...Object.keys(newValue)]);
    keys.forEach((key) => {
      if (key === 'lastUpdated' || key === 'updatedBy') {
        return;
      }
      const nextPath = path ? `${path}.${key}` : key;
      diffObjects(oldValue[key], newValue[key], nextPath, entries, author);
    });
    return;
  }

  entries.push({
    timestamp: new Date().toISOString(),
    author,
    field: path,
    oldValue,
    newValue,
  });
};

export async function GET() {
  try {
    if (!redis) {
      return NextResponse.json(defaultContent, { status: 200 });
    }

    const raw = await redis.get(CONTENT_KEY);
    const stored = raw ? JSON.parse(raw) : null;
    return NextResponse.json(stored ?? defaultContent, { status: 200 });
  } catch (error) {
    console.error('Failed to load content:', error);
    return NextResponse.json(
      { error: 'Failed to load content' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    if (!redis) {
      return NextResponse.json(
        { error: 'Redis not configured' },
        { status: 503 }
      );
    }

    const authHeader = request.headers.get('authorization') ?? '';
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.replace('Bearer ', '')
      : '';

    if (!token || token !== getAdminPassword()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const author = request.headers.get('x-admin-author') || 'Admin';

    const incoming = (await request.json()) as EditableContent;
    
    const rawCurrent = await redis.get(CONTENT_KEY);
    const currentContent = rawCurrent ? JSON.parse(rawCurrent) : defaultContent;

    const updatedContent: EditableContent = {
      ...incoming,
      lastUpdated: new Date().toISOString(),
      updatedBy: author,
    };

    const auditEntries: AuditEntry[] = [];
    diffObjects(currentContent, updatedContent, '', auditEntries, author);

    if (auditEntries.length > 0) {
      const rawAudit = await redis.get(AUDIT_KEY);
      const existingAudit = rawAudit ? JSON.parse(rawAudit) : [];
      await redis.set(AUDIT_KEY, JSON.stringify([...existingAudit, ...auditEntries]));
    }

    await redis.set(CONTENT_KEY, JSON.stringify(updatedContent));

    return NextResponse.json(updatedContent, { status: 200 });
  } catch (error) {
    console.error('Failed to save content:', error);
    return NextResponse.json(
      { error: 'Failed to save content' },
      { status: 500 }
    );
  }
}
