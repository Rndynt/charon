'use client';
import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  TrendingUp, TrendingDown, Activity, Shield, Zap,
  RefreshCw, BarChart2, Target, AlertTriangle, CheckCircle2, XCircle,
} from 'lucide-react';
import { formatSol, formatPct, formatAge, shortMint, solscanUrl } from '@/lib/utils';

function StatCard({ label, value, sub, icon: Icon, color = 'violet', loading }) {
  const colors = {
    violet: { bg: 'rgba(139,92,246,0.1)', icon: '#a78bfa' },
    green:  { bg: 'rgba(34,197,94,0.1)',  icon: '#4ade80' },
    red:    { bg: 'rgba(239,68,68,0.1)',  icon: '#f87171' },
    blue:   { bg: 'rgba(59,130,246,0.1)', icon: '#60a5fa' },
  };
  const c = colors[color] ?? colors.violet;
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs mb-1.5" style={{color:'#71717a'}}>{label}</p>
            {loading
              ? <Skeleton className="h-7 w-20 mb-1" />
              : <p className="text-2xl font-bold font-mono truncate" style={{color:'#f4f4f8', letterSpacing:'-0.02em'}}>{value}</p>
            }
            {sub && !loading && <p className="text-xs mt-1" style={{color:'#52525b'}}>{sub}</p>}
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{background:c.bg}}>
            <Icon size={18} color={c.icon} />
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
  const map = { buy:'success', open:'success', pass:'muted', skip:'muted', watch:'warning', risk_guard:'danger', max_positions:'danger' };
  return <Badge variant={map[action] ?? 'muted'}>{action}</Badge>;
}

export default function OverviewPage() {
  const [stats, setStats] = useState(null);
  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true); else setRefreshing(true);
    try {
      const [s, d] = await Promise.all([
        fetch('/api/stats').then(r => r.json()),
        fetch('/api/decisions?limit=15').then(r => r.json()),
      ]);
      setStats(s);
      setDecisions(Array.isArray(d) ? d : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
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
    <div className="p-4 sm:p-6 space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pt-8 lg:pt-0">
        <div>
          <h1 className="text-base font-semibold" style={{color:'#f4f4f8'}}>Overview</h1>
          <p className="text-xs mt-0.5" style={{color:'#52525b'}}>Real-time bot status and performance</p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => fetchData(true)} disabled={refreshing}>
          <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <StatCard label="Open Positions" value={loading ? '—' : stats?.openPositions ?? 0} sub="Active trades" icon={Activity} color="violet" loading={loading} />
        <StatCard label="All-Time P&L" value={loading ? '—' : formatSol(pnl)} sub={`24h: ${formatSol(pnl24h)}`} icon={pnl >= 0 ? TrendingUp : TrendingDown} color={pnl >= 0 ? 'green' : 'red'} loading={loading} />
        <StatCard label="Win Rate" value={loading ? '—' : winRate != null ? formatPct(winRate * 100, false) : 'N/A'} sub={`${stats?.wins ?? 0}W / ${stats?.losses ?? 0}L`} icon={Target} color={winRate != null ? (winRate >= 0.5 ? 'green' : 'red') : 'violet'} loading={loading} />
        <StatCard label="Screened 24h" value={loading ? '—' : stats?.candidates24h ?? 0} sub={`${stats?.candidatesPassed24h ?? 0} passed filters`} icon={BarChart2} color="blue" loading={loading} />
      </div>

      {/* Status Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bot Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity size={14} color="#a78bfa" />
              Bot Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3"><Skeleton className="h-5 w-full" /><Skeleton className="h-5 w-3/4" /></div>
            ) : (
              <div className="space-y-3">
                {[
                  ['Agent', stats?.agentEnabled
                    ? <Badge variant="live"><span style={{marginRight:4}}>●</span>Running</Badge>
                    : <Badge variant="danger">Paused</Badge>],
                  ['Trading Mode', <Badge variant={stats?.tradingMode === 'live' ? 'danger' : stats?.tradingMode === 'confirm' ? 'warning' : 'muted'}>{stats?.tradingMode ?? '—'}</Badge>],
                  ['Active Strategy', <Badge variant="default">{stats?.activeStrategy?.name ?? 'None'}</Badge>],
                  ['Total Trades', <span className="text-sm font-mono" style={{color:'#c4c4d8'}}>{stats?.totalTrades ?? 0}</span>],
                ].map(([label, val]) => (
                  <div key={label} className="flex items-center justify-between py-0.5">
                    <span className="text-xs" style={{color:'#71717a'}}>{label}</span>
                    {val}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Risk Guard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield size={14} color="#a78bfa" />
              Risk Guard
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3"><Skeleton className="h-5 w-full" /><Skeleton className="h-5 w-3/4" /></div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between py-0.5">
                  <span className="text-xs" style={{color:'#71717a'}}>Status</span>
                  {!stats?.riskGuard?.enabled
                    ? <Badge variant="muted">Disabled</Badge>
                    : stats?.riskGuard?.allowed
                      ? <Badge variant="success"><CheckCircle2 size={10} style={{marginRight:4}} />Trading Allowed</Badge>
                      : <Badge variant="danger"><XCircle size={10} style={{marginRight:4}} />BLOCKED</Badge>
                  }
                </div>
                {stats?.riskGuard?.reason && (
                  <div className="flex items-start gap-2 rounded-lg px-3 py-2" style={{background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)'}}>
                    <AlertTriangle size={13} color="#f87171" style={{marginTop:1, flexShrink:0}} />
                    <p className="text-xs" style={{color:'#fca5a5'}}>{stats.riskGuard.reason}</p>
                  </div>
                )}
                {[
                  ['24h P&L', <span className="text-sm font-mono" style={{color:(stats?.riskGuard?.dailyPnl ?? 0) >= 0 ? '#4ade80' : '#f87171'}}>{formatSol(stats?.riskGuard?.dailyPnl ?? 0)}</span>],
                  ['Consecutive Losses', <span className="text-sm font-mono" style={{color:(stats?.riskGuard?.consecutiveLosses ?? 0) > 2 ? '#fbbf24' : '#c4c4d8'}}>{stats?.riskGuard?.consecutiveLosses ?? 0}</span>],
                ].map(([label, val]) => (
                  <div key={label} className="flex items-center justify-between py-0.5">
                    <span className="text-xs" style={{color:'#71717a'}}>{label}</span>
                    {val}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Decisions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap size={14} color="#a78bfa" />
            Recent Decisions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-2">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-9 w-full" />)}
            </div>
          ) : decisions.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm" style={{color:'#52525b'}}>No decisions yet</div>
          ) : (
            <div>
              {decisions.map((d, i) => (
                <div
                  key={d.id}
                  className="flex items-center gap-2 sm:gap-3 px-4 py-2.5 transition-colors"
                  style={{borderBottom: i < decisions.length - 1 ? '1px solid #1e1e27' : 'none'}}
                  onMouseEnter={e => e.currentTarget.style.background = '#1a1a23'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span className="text-xs font-mono w-10 shrink-0" style={{color:'#52525b'}}>{formatAge(d.atMs)}</span>
                  <ActionBadge action={d.action} />
                  <VerdictBadge verdict={d.verdict} />
                  {d.confidence != null && (
                    <span className="text-xs font-mono" style={{color:'#71717a'}}>{Math.round(d.confidence)}%</span>
                  )}
                  {d.token?.symbol && (
                    <a href={solscanUrl(d.selectedMint)} target="_blank" rel="noreferrer"
                      className="text-xs font-mono ml-auto hover:underline" style={{color:'#a78bfa'}}>
                      {d.token.symbol}
                    </a>
                  )}
                  {d.reason && (
                    <p className="text-xs truncate max-w-xs hidden lg:block" style={{color:'#52525b', marginLeft: d.token?.symbol ? 0 : 'auto'}}>
                      {d.reason}
                    </p>
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
