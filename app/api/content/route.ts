import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { defaultContent, type EditableContent } from '@/lib/editableContent';

const CONTENT_KEY = 'hn-rert:content';
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

const getAdminPassword = () => process.env.ADMIN_PASSWORD ?? 'phan2025admin';

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
    for (const key of keys) {
      if (key === 'lastUpdated' || key === 'updatedBy') {
        continue;
      }
      const nextPath = path ? `${path}.${key}` : key;
      diffObjects(oldValue[key], newValue[key], nextPath, entries, author);
    }
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
    if (!isKVConfigured()) {
      return NextResponse.json(defaultContent, { status: 200 });
    }

    const stored = await kv.get<EditableContent>(CONTENT_KEY);
    return NextResponse.json(stored ?? defaultContent, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to load content' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    if (!isKVConfigured()) {
      return NextResponse.json(
        { error: 'KV not configured' },
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
    const currentContent =
      (await kv.get<EditableContent>(CONTENT_KEY)) ?? defaultContent;

    const updatedContent: EditableContent = {
      ...incoming,
      lastUpdated: new Date().toISOString(),
      updatedBy: author,
    };

    const auditEntries: AuditEntry[] = [];
    diffObjects(currentContent, updatedContent, '', auditEntries, author);

    if (auditEntries.length > 0) {
      const existingAudit = (await kv.get<AuditEntry[]>(AUDIT_KEY)) ?? [];
      await kv.set(AUDIT_KEY, [...existingAudit, ...auditEntries]);
    }

    await kv.set(CONTENT_KEY, updatedContent);

    return NextResponse.json(updatedContent, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to save content' },
      { status: 500 }
    );
  }
}
