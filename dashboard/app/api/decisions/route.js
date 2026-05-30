import { NextResponse } from 'next/server';
import { getDb, safeJson } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get('limit') ?? 30), 200);

    const rows = db.prepare(`
      SELECT id, at_ms, mode, action, verdict, confidence, reason, selected_mint, strategy_id,
             token_json, guardrails_json
      FROM decision_logs
      ORDER BY id DESC LIMIT ?
    `).all(limit);

    const decisions = rows.map(row => ({
      id: row.id,
      atMs: row.at_ms,
      mode: row.mode,
      action: row.action,
      verdict: row.verdict,
      confidence: row.confidence,
      reason: row.reason,
      selectedMint: row.selected_mint,
      strategyId: row.strategy_id,
      token: safeJson(row.token_json, null),
      guardrails: safeJson(row.guardrails_json, {}),
    }));

    return NextResponse.json(decisions);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
