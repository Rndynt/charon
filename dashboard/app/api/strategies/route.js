import { NextResponse } from 'next/server';
import { getDb, safeJson } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getDb();
    const rows = db.prepare('SELECT * FROM strategies ORDER BY id').all();
    const strategies = rows.map(row => ({
      id: row.id,
      name: row.name,
      enabled: Boolean(row.enabled),
      ...safeJson(row.config_json, {}),
    }));
    return NextResponse.json(strategies);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const db = getDb();
    const body = await request.json();
    const { action, id, config } = body;

    if (action === 'activate') {
      db.prepare('UPDATE strategies SET enabled = 0').run();
      db.prepare('UPDATE strategies SET enabled = 1 WHERE id = ?').run(id);
      return NextResponse.json({ ok: true });
    }

    if (action === 'update' && id && config) {
      const existing = db.prepare('SELECT config_json FROM strategies WHERE id = ?').get(id);
      if (!existing) return NextResponse.json({ error: 'Strategy not found' }, { status: 404 });
      const merged = { ...safeJson(existing.config_json, {}), ...config };
      db.prepare('UPDATE strategies SET config_json = ? WHERE id = ?').run(JSON.stringify(merged), id);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
