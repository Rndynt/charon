'use client';
import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  TrendingUp, TrendingDown, Activity, Shield, Zap,
  RefreshCw, BarChart2, Target, AlertTriangle, CheckCircle2, XCircle
} from 'lucide-react';
import { formatSol, formatPct, formatAge, shortMint, solscanUrl } from '@/lib/utils';

function StatCard({ label, value, sub, icon: Icon, trend, loading }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-500 mb-1">{label}</p>
            {loading ? (
              <Skeleton className="h-7 w-24 mb-1" />
            ) : (
              <p className="text-2xl font-semibold text-slate-100 font-mono truncate">{value}</p>
            )}
            {sub && !loading && <p className="text-xs text-slate-600 mt-0.5">{sub}</p>}
          </div>
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${trend === 'up' ? 'bg-emerald-600/10' : trend === 'down' ? 'bg-red-600/10' : 'bg-violet-600/10'}`}>
            <Icon className={`h-5 w-5 ${trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-violet-400'}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function VerdictBadge({ verdict }) {
  if (!verdict) return <Badge variant="muted">—</Badge>;
  const v = verdict.toUpperCase();
  if (v === 'BUY') return <Badge variant="success">BUY</Badge>;
  if (v === 'WATCH') return <Badge variant="warning">WATCH</Badge>;
  if (v === 'PASS') return <Badge variant="danger">PASS</Badge>;
  return <Badge variant="muted">{v}</Badge>;
}

function ActionBadge({ action }) {
  if (!action) return null;
  const map = {
    buy: 'success', open: 'success',
    pass: 'muted', skip: 'muted', watch: 'warning',
    risk_guard: 'danger', max_positions: 'danger',
  };
  return <Badge variant={map[action] ?? 'muted'}>{action}</Badge>;
}

export default function OverviewPage() {
  const [stats, setStats] = useState(null);
  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    else setRefreshing(true);
    try {
      const [s, d] = await Promise.all([
        fetch('/api/stats').then(r => r.json()),
        fetch('/api/decisions?limit=12').then(r => r.json()),
      ]);
      setStats(s);
      setDecisions(Array.isArray(d) ? d : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const id = setInterval(() => fetchData(true), 15000);
    return () => clearInterval(id);
  }, [fetchData]);

  const pnl = stats?.totalPnlSol ?? 0;
  const pnl24h = stats?.pnl24hSol ?? 0;
  const winRate = stats?.winRate;

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-100">Overview</h1>
          <p className="text-xs text-slate-600 mt-0.5">Real-time bot status and performance</p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => fetchData(true)} disabled={refreshing}>
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Open Positions"
          value={loading ? '—' : stats?.openPositions ?? 0}
          sub={`Max: ${stats ? '—' : '—'}`}
          icon={Activity}
          trend="neutral"
          loading={loading}
        />
        <StatCard
          label="All-Time P&L"
          value={loading ? '—' : formatSol(pnl)}
          sub={`24h: ${formatSol(pnl24h)}`}
          icon={pnl >= 0 ? TrendingUp : TrendingDown}
          trend={pnl >= 0 ? 'up' : 'down'}
          loading={loading}
        />
        <StatCard
          label="Win Rate"
          value={loading ? '—' : winRate != null ? formatPct(winRate * 100, false) : 'N/A'}
          sub={`${stats?.wins ?? 0}W / ${stats?.losses ?? 0}L`}
          icon={Target}
          trend={winRate != null ? (winRate >= 0.5 ? 'up' : 'down') : 'neutral'}
          loading={loading}
        />
        <StatCard
          label="Screened 24h"
          value={loading ? '—' : stats?.candidates24h ?? 0}
          sub={`${stats?.candidatesPassed24h ?? 0} passed filters`}
          icon={BarChart2}
          trend="neutral"
          loading={loading}
        />
      </div>

      {/* Status Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bot Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-violet-400" />
              Bot Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <div className="space-y-2"><Skeleton className="h-5 w-full" /><Skeleton className="h-5 w-3/4" /></div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Agent</span>
                  {stats?.agentEnabled
                    ? <Badge variant="live"><span className="mr-1">●</span>Running</Badge>
                    : <Badge variant="danger">Paused</Badge>}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Trading Mode</span>
                  <Badge variant={
                    stats?.tradingMode === 'live' ? 'danger' :
                    stats?.tradingMode === 'confirm' ? 'warning' : 'muted'
                  }>
                    {stats?.tradingMode ?? '—'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Active Strategy</span>
                  <Badge variant="default">
                    {stats?.activeStrategy?.name ?? 'None'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Total Trades</span>
                  <span className="text-sm font-mono text-slate-300">{stats?.totalTrades ?? 0}</span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Risk Guard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-violet-400" />
              Risk Guard
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <div className="space-y-2"><Skeleton className="h-5 w-full" /><Skeleton className="h-5 w-3/4" /></div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Status</span>
                  {!stats?.riskGuard?.enabled ? (
                    <Badge variant="muted">Disabled</Badge>
                  ) : stats?.riskGuard?.allowed ? (
                    <Badge variant="success"><CheckCircle2 className="h-3 w-3 mr-1" />Trading Allowed</Badge>
                  ) : (
                    <Badge variant="danger"><XCircle className="h-3 w-3 mr-1" />BLOCKED</Badge>
                  )}
                </div>
                {stats?.riskGuard?.reason && (
                  <div className="flex items-start gap-2 rounded-md bg-red-600/10 border border-red-600/20 px-3 py-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-red-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-red-300">{stats.riskGuard.reason}</p>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">24h P&L</span>
                  <span className={`text-sm font-mono ${(stats?.riskGuard?.dailyPnl ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {formatSol(stats?.riskGuard?.dailyPnl ?? 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Consecutive Losses</span>
                  <span className={`text-sm font-mono ${(stats?.riskGuard?.consecutiveLosses ?? 0) > 2 ? 'text-amber-400' : 'text-slate-300'}`}>
                    {stats?.riskGuard?.consecutiveLosses ?? 0}
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Decisions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-violet-400" />
            Recent Decisions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-2">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
            </div>
          ) : decisions.length === 0 ? (
            <div className="px-4 py-8 text-center text-slate-600 text-sm">No decisions yet</div>
          ) : (
            <div className="divide-y divide-surface-border">
              {decisions.map(d => (
                <div key={d.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-surface-hover/30 transition-colors">
                  <span className="text-xs text-slate-600 font-mono w-12 shrink-0">{formatAge(d.atMs)}</span>
                  <ActionBadge action={d.action} />
                  <VerdictBadge verdict={d.verdict} />
                  {d.confidence != null && (
                    <span className="text-xs text-slate-500 font-mono">{Math.round(d.confidence)}%</span>
                  )}
                  {d.token?.symbol && (
                    <a
                      href={solscanUrl(d.selectedMint)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-mono text-violet-400 hover:text-violet-300 hover:underline ml-auto"
                    >
                      {d.token.symbol || shortMint(d.selectedMint)}
                    </a>
                  )}
                  {d.reason && (
                    <p className="text-xs text-slate-600 truncate max-w-xs ml-auto hidden lg:block">{d.reason}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
