import { NextResponse } from 'next/server';
import { getDb, safeJson } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const db = getDb();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') ?? 'all';
    const limit = Math.min(Number(searchParams.get('limit') ?? 100), 500);

    let query = 'SELECT * FROM dry_run_positions';
    const params = [];
    if (status === 'open') { query += " WHERE status = 'open'"; }
    else if (status === 'closed') { query += " WHERE status = 'closed'"; }
    query += ' ORDER BY id DESC LIMIT ?';
    params.push(limit);

    const rows = db.prepare(query).all(...params);
    const positions = rows.map(row => ({
      id: row.id,
      mint: row.mint,
      symbol: row.symbol,
      status: row.status,
      openedAtMs: row.opened_at_ms,
      closedAtMs: row.closed_at_ms,
      sizeSol: row.size_sol,
      entryPrice: row.entry_price,
      entryMcap: row.entry_mcap,
      exitPrice: row.exit_price,
      exitMcap: row.exit_mcap,
      exitReason: row.exit_reason,
      pnlPercent: row.pnl_percent,
      pnlSol: row.pnl_sol,
      tpPercent: row.tp_percent,
      slPercent: row.sl_percent,
      trailingEnabled: Boolean(row.trailing_enabled),
      trailingPercent: row.trailing_percent,
      trailingArmed: Boolean(row.trailing_armed),
      highWaterPrice: row.high_water_price,
      highWaterMcap: row.high_water_mcap,
      executionMode: row.execution_mode ?? 'dry_run',
      entrySignature: row.entry_signature,
      exitSignature: row.exit_signature,
      strategyId: row.strategy_id ?? 'sniper',
    }));

    return NextResponse.json(positions);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
