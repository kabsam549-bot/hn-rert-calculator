import { NextResponse } from 'next/server';

const NOTION_API_BASE = 'https://api.notion.com/v1';
const NOTION_VERSION = '2022-06-28';

const getAdminPassword = () => 'phan2026admin';

const requireNotionConfig = () => {
  const apiKey = process.env.NOTION_TICKET_API_KEY || process.env.NOTION_API_KEY;
  const databaseId = process.env.NOTION_TICKET_DB_ID;
  if (!apiKey || !databaseId) {
    return null;
  }
  return { apiKey, databaseId };
};

const getText = (property?: { rich_text?: { plain_text?: string }[] }) => {
  if (!property?.rich_text?.length) {
    return '';
  }
  return property.rich_text.map(item => item.plain_text ?? '').join('');
};

const getTitle = (property?: { title?: { plain_text?: string }[] }) => {
  if (!property?.title?.length) {
    return '';
  }
  return property.title.map(item => item.plain_text ?? '').join('');
};

const getSelect = (property?: { select?: { name?: string } | null }) => {
  return property?.select?.name ?? '';
};

const getStatus = (property?: { status?: { name?: string } | null }) => {
  return property?.status?.name ?? '';
};

const getDate = (property?: { date?: { start?: string } | null }) => {
  return property?.date?.start ?? null;
};

// Map admin UI status values to Notion status options
const mapStatusToNotion = (status: string): string => {
  const mapping: Record<string, string> = {
    'Submitted': 'Backlog',
    'In Progress': 'In Progress',
    'In Review': 'In Review',
    'Done': 'Done',
    'Verified': 'Done',
  };
  return mapping[status] ?? 'Backlog';
};

// Map Notion status back to admin UI values
const mapStatusFromNotion = (status: string): string => {
  const mapping: Record<string, string> = {
    'Backlog': 'Submitted',
    'In Progress': 'In Progress',
    'In Review': 'In Review',
    'Done': 'Done',
  };
  return mapping[status] ?? status;
};

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization') ?? '';
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.replace('Bearer ', '')
      : '';

    if (!token || token !== getAdminPassword()) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const config = requireNotionConfig();
    if (!config) {
      return NextResponse.json(
        { error: 'Notion not configured' },
        { status: 503 }
      );
    }

    const body = (await request.json()) as {
      title: string;
      description: string;
      priority: 'Low' | 'Medium' | 'High' | 'Critical';
      category: 'Clinical Parameters' | 'Dosimetry' | 'UI-UX' | 'Data' | 'Bug';
      status?: 'Submitted' | 'In Progress' | 'Done' | 'Verified';
      submittedBy: string;
      submittedAt?: string;
    };

    const submittedAt = body.submittedAt ?? new Date().toISOString();

    // Map priority: Notion DB has Low/Medium/High (no Critical), map Critical → High
    const notionPriority = body.priority === 'Critical' ? 'High' : body.priority;

    const response = await fetch(`${NOTION_API_BASE}/pages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Notion-Version': NOTION_VERSION,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        parent: { database_id: config.databaseId },
        properties: {
          Title: {
            title: [{ text: { content: body.title } }],
          },
          Description: {
            rich_text: [{ text: { content: body.description } }],
          },
          Priority: {
            select: { name: notionPriority },
          },
          Category: {
            select: { name: body.category },
          },
          Status: {
            status: { name: mapStatusToNotion(body.status ?? 'Submitted') },
          },
          'Submitted By': {
            rich_text: [{ text: { content: body.submittedBy } }],
          },
          'Submitted At': {
            date: { start: submittedAt },
          },
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: 'Failed to create ticket', details: errorText },
        { status: response.status }
      );
    }

    const created = await response.json();

    return NextResponse.json(
      { id: created.id },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: 'Failed to create ticket' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const config = requireNotionConfig();
    if (!config) {
      return NextResponse.json(
        { error: 'Notion not configured' },
        { status: 503 }
      );
    }

    const response = await fetch(`${NOTION_API_BASE}/databases/${config.databaseId}/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Notion-Version': NOTION_VERSION,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sorts: [{ timestamp: 'created_time', direction: 'descending' }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: 'Failed to load tickets', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tickets = (data.results ?? []).map((page: any) => {
      const props = page.properties ?? {};
      return {
        id: page.id,
        title: getTitle(props.Title),
        description: getText(props.Description),
        priority: getSelect(props.Priority),
        category: getSelect(props.Category),
        status: mapStatusFromNotion(getStatus(props.Status)),
        submittedBy: getText(props['Submitted By']),
        submittedAt: getDate(props['Submitted At']) ?? page.created_time ?? null,
        completedAt: getDate(props['Completed At']),
      };
    });

    return NextResponse.json(tickets, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: 'Failed to load tickets' },
      { status: 500 }
    );
  }
}
