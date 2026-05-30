import { NextResponse } from 'next/server';
import { getDb, safeJson } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getDb();
    const now = Date.now();
    const since24h = now - 24 * 60 * 60 * 1000;

    const openPositions = db.prepare("SELECT COUNT(*) AS c FROM dry_run_positions WHERE status = 'open'").get()?.c ?? 0;

    const closedStats = db.prepare(`
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN pnl_sol > 0 THEN 1 ELSE 0 END) AS wins,
        SUM(pnl_sol) AS total_pnl_sol,
        SUM(CASE WHEN pnl_percent IS NOT NULL THEN pnl_percent ELSE 0 END) AS total_pnl_pct
      FROM dry_run_positions WHERE status = 'closed'
    `).get() ?? {};

    const pnl24h = db.prepare(`
      SELECT SUM(pnl_sol) AS pnl FROM dry_run_positions
      WHERE status = 'closed' AND closed_at_ms >= ?
    `).get(since24h)?.pnl ?? 0;

    const candidates24h = db.prepare('SELECT COUNT(*) AS c FROM candidates WHERE created_at_ms >= ?').get(since24h)?.c ?? 0;
    const candidatesPassed24h = db.prepare("SELECT COUNT(*) AS c FROM candidates WHERE created_at_ms >= ? AND status NOT IN ('filtered')").get(since24h)?.c ?? 0;

    const tradingMode = db.prepare("SELECT value FROM settings WHERE key = 'trading_mode'").get()?.value ?? 'dry_run';
    const agentEnabled = db.prepare("SELECT value FROM settings WHERE key = 'agent_enabled'").get()?.value ?? 'true';
    const activeStratRow = db.prepare("SELECT id, name FROM strategies WHERE enabled = 1 LIMIT 1").get();

    const riskRows = db.prepare(`
      SELECT pnl_sol FROM dry_run_positions
      WHERE status = 'closed' AND closed_at_ms >= ?
      ORDER BY closed_at_ms DESC
    `).all(now - 24 * 60 * 60 * 1000);
    const dailyPnl = riskRows.reduce((a, r) => a + Number(r.pnl_sol || 0), 0);
    let consecutiveLosses = 0;
    for (const r of riskRows) {
      if (Number(r.pnl_sol || 0) < 0) consecutiveLosses++;
      else break;
    }
    const maxDailyLoss = Number(db.prepare("SELECT value FROM settings WHERE key = 'risk_guard_max_daily_loss_sol'").get()?.value ?? 0);
    const maxConsec = Number(db.prepare("SELECT value FROM settings WHERE key = 'risk_guard_max_consecutive_losses'").get()?.value ?? 0);
    const riskEnabled = (db.prepare("SELECT value FROM settings WHERE key = 'risk_guard_enabled'").get()?.value ?? 'true') === 'true';
    let riskAllowed = true;
    let riskReason = null;
    if (riskEnabled) {
      if (maxDailyLoss > 0 && dailyPnl <= -Math.abs(maxDailyLoss)) {
        riskAllowed = false;
        riskReason = `Daily loss limit (${dailyPnl.toFixed(4)} SOL)`;
      } else if (maxConsec > 0 && consecutiveLosses >= maxConsec) {
        riskAllowed = false;
        riskReason = `Consecutive losses (${consecutiveLosses})`;
      }
    }

    const total = Number(closedStats.total ?? 0);
    const wins = Number(closedStats.wins ?? 0);
    const winRate = total > 0 ? wins / total : null;

    return NextResponse.json({
      openPositions: Number(openPositions),
      totalPnlSol: Number(closedStats.total_pnl_sol ?? 0),
      pnl24hSol: Number(pnl24h ?? 0),
      winRate,
      wins,
      losses: total - wins,
      totalTrades: total,
      candidates24h: Number(candidates24h),
      candidatesPassed24h: Number(candidatesPassed24h),
      tradingMode,
      agentEnabled: agentEnabled === 'true',
      activeStrategy: activeStratRow ? { id: activeStratRow.id, name: activeStratRow.name } : null,
      riskGuard: { allowed: riskAllowed, reason: riskReason, dailyPnl, consecutiveLosses, enabled: riskEnabled },
    });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
