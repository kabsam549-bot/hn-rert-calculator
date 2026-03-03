import { NextResponse } from 'next/server';
import Redis from 'ioredis';

export const dynamic = 'force-dynamic';

const getRedis = () => {
  const url = process.env.REDIS_URL;
  if (!url) return null;
  return new Redis(url);
};

const getAdminPassword = () => 'phan2026admin';

// GET: Load a page's HTML content
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pageId = searchParams.get('id');
    if (!pageId) {
      return NextResponse.json({ error: 'Missing page id' }, { status: 400 });
    }

    const redis = getRedis();
    if (!redis) {
      return NextResponse.json({ error: 'Redis not configured' }, { status: 503 });
    }

    const html = await redis.get(`page:${pageId}`);
    await redis.quit();

    return NextResponse.json({ id: pageId, html: html || null });
  } catch {
    return NextResponse.json({ error: 'Failed to load page' }, { status: 500 });
  }
}

// PUT: Save a page's HTML content
export async function PUT(request: Request) {
  try {
    const authHeader = request.headers.get('authorization') ?? '';
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.replace('Bearer ', '')
      : '';

    if (!token || token !== getAdminPassword()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await request.json()) as { id: string; html: string };
    if (!body.id || typeof body.html !== 'string') {
      return NextResponse.json({ error: 'Missing id or html' }, { status: 400 });
    }

    const redis = getRedis();
    if (!redis) {
      return NextResponse.json({ error: 'Redis not configured' }, { status: 503 });
    }

    await redis.set(`page:${body.id}`, body.html);
    await redis.quit();

    return NextResponse.json({ id: body.id, saved: true });
  } catch {
    return NextResponse.json({ error: 'Failed to save page' }, { status: 500 });
  }
}
