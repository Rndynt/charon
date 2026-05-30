import { NextResponse } from 'next/server';
import { getDb, safeJson } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get('limit') ?? 50), 200);
    const status = searchParams.get('status');

    let query = 'SELECT * FROM candidates';
    const params = [];
    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }
    query += ' ORDER BY id DESC LIMIT ?';
    params.push(limit);

    const rows = db.prepare(query).all(...params);
    const candidates = rows.map(row => {
      const c = safeJson(row.candidate_json, {});
      const filters = safeJson(row.filter_result_json, {});
      return {
        id: row.id,
        mint: row.mint,
        status: row.status,
        createdAtMs: row.created_at_ms,
        updatedAtMs: row.updated_at_ms,
        signalKey: row.signal_key,
        token: c.token ?? null,
        metrics: c.metrics ?? null,
        signals: c.signals ?? null,
        feeClaim: c.feeClaim ?? null,
        holders: c.holders ? {
          count: c.holders.count,
          top20Percent: c.holders.top20Percent,
        } : null,
        filters: {
          passed: filters.passed ?? false,
          reasons: filters.reasons ?? [],
          strategy: filters.strategy ?? null,
        },
      };
    });

    const breakdown = db.prepare(`
      SELECT status, COUNT(*) AS count FROM candidates
      WHERE created_at_ms >= ?
      GROUP BY status
    `).all(Date.now() - 24 * 60 * 60 * 1000);

    return NextResponse.json({ candidates, breakdown });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
