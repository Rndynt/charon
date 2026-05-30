'use client';
import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RefreshCw, ExternalLink, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { formatSol, formatPct, formatAge, formatUsd, shortMint, solscanUrl } from '@/lib/utils';

function PnlCell({ value }) {
  if (value == null) return <span className="text-slate-600 font-mono">—</span>;
  const n = Number(value);
  return (
    <span className={`font-mono font-medium ${n >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
      {formatPct(n)}
    </span>
  );
}

function PnlSolCell({ value }) {
  if (value == null) return <span className="text-slate-600 font-mono">—</span>;
  const n = Number(value);
  return (
    <span className={`font-mono text-xs ${n >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
      {formatSol(n)}
    </span>
  );
}

function ExitReasonBadge({ reason }) {
  if (!reason) return <span className="text-slate-600 text-xs">—</span>;
  const map = {
    tp: 'success', take_profit: 'success', trailing_tp: 'success', partial_tp: 'success',
    sl: 'danger', stop_loss: 'danger',
    manual: 'warning', forced: 'warning',
    max_hold: 'muted',
  };
  return <Badge variant={map[reason] ?? 'muted'} className="text-xs">{reason.replace(/_/g, ' ')}</Badge>;
}

function ModeTag({ mode }) {
  if (mode === 'live') return <Badge variant="danger" className="text-xs">LIVE</Badge>;
  if (mode === 'confirm') return <Badge variant="warning" className="text-xs">CONFIRM</Badge>;
  return <Badge variant="muted" className="text-xs">DRY</Badge>;
}

function PositionsTable({ positions, loading, showPnl = true }) {
  if (loading) {
    return (
      <div className="space-y-2 p-4">
        {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
      </div>
    );
  }
  if (!positions.length) {
    return (
      <div className="py-12 text-center text-slate-600 text-sm">No positions found</div>
    );
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Token</TableHead>
          <TableHead>Mode</TableHead>
          <TableHead>Size</TableHead>
          <TableHead>Entry Price</TableHead>
          <TableHead>Entry MCap</TableHead>
          {showPnl && <TableHead>P&L %</TableHead>}
          {showPnl && <TableHead>P&L SOL</TableHead>}
          <TableHead>TP / SL</TableHead>
          <TableHead>Age</TableHead>
          <TableHead>Exit</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {positions.map(p => (
          <TableRow key={p.id}>
            <TableCell>
              <div className="flex flex-col">
                <span className="font-mono font-medium text-slate-200 text-sm">
                  {p.symbol || shortMint(p.mint)}
                </span>
                <span className="font-mono text-xs text-slate-600">{shortMint(p.mint)}</span>
              </div>
            </TableCell>
            <TableCell><ModeTag mode={p.executionMode} /></TableCell>
            <TableCell>
              <span className="font-mono text-xs text-slate-300">{formatSol(p.sizeSol)}</span>
            </TableCell>
            <TableCell>
              <span className="font-mono text-xs text-slate-400">
                {p.entryPrice ? `$${Number(p.entryPrice).toExponential(3)}` : '—'}
              </span>
            </TableCell>
            <TableCell>
              <span className="font-mono text-xs text-slate-400">{formatUsd(p.entryMcap)}</span>
            </TableCell>
            {showPnl && <TableCell><PnlCell value={p.pnlPercent} /></TableCell>}
            {showPnl && <TableCell><PnlSolCell value={p.pnlSol} /></TableCell>}
            <TableCell>
              <div className="flex items-center gap-1">
                <span className="text-xs font-mono text-emerald-500">+{p.tpPercent}%</span>
                <span className="text-slate-700">/</span>
                <span className="text-xs font-mono text-red-500">{p.slPercent}%</span>
              </div>
              {p.trailingEnabled && (
                <div className="text-xs text-slate-600">
                  trail {p.trailingPercent}%{p.trailingArmed ? ' 🟢' : ''}
                </div>
              )}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Clock className="h-3 w-3" />
                {formatAge(p.openedAtMs)}
              </div>
            </TableCell>
            <TableCell><ExitReasonBadge reason={p.exitReason} /></TableCell>
            <TableCell>
              <a href={solscanUrl(p.mint)} target="_blank" rel="noreferrer">
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <ExternalLink className="h-3 w-3 text-slate-600" />
                </Button>
              </a>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default function PositionsPage() {
  const [allPositions, setAllPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    else setRefreshing(true);
    try {
      const data = await fetch('/api/positions?limit=200').then(r => r.json());
      setAllPositions(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const id = setInterval(() => fetchData(true), 10000);
    return () => clearInterval(id);
  }, [fetchData]);

  const open = allPositions.filter(p => p.status === 'open');
  const closed = allPositions.filter(p => p.status === 'closed');

  const totalPnl = closed.reduce((a, p) => a + (p.pnlSol ?? 0), 0);
  const wins = closed.filter(p => (p.pnlSol ?? 0) > 0).length;

  return (
    <div className="p-6 space-y-5 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-100">Positions</h1>
          <p className="text-xs text-slate-600 mt-0.5">
            {open.length} open · {closed.length} closed · {formatSol(totalPnl)} total P&L
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => fetchData(true)} disabled={refreshing}>
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Summary strip */}
      {!loading && closed.length > 0 && (
        <div className="flex gap-4">
          <div className="flex items-center gap-2 rounded-lg border border-surface-border bg-surface-card px-4 py-2">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            <div>
              <p className="text-xs text-slate-600">Total P&L</p>
              <p className={`text-sm font-mono font-semibold ${totalPnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {formatSol(totalPnl)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-surface-border bg-surface-card px-4 py-2">
            <TrendingDown className="h-4 w-4 text-slate-400" />
            <div>
              <p className="text-xs text-slate-600">Win Rate</p>
              <p className="text-sm font-mono font-semibold text-slate-200">
                {closed.length > 0 ? formatPct((wins / closed.length) * 100, false) : '—'}
              </p>
            </div>
          </div>
        </div>
      )}

      <Tabs defaultValue="open">
        <TabsList>
          <TabsTrigger value="open">Open ({open.length})</TabsTrigger>
          <TabsTrigger value="closed">Closed ({closed.length})</TabsTrigger>
          <TabsTrigger value="all">All ({allPositions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="open">
          <Card>
            <CardContent className="p-0">
              <PositionsTable positions={open} loading={loading} showPnl={false} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="closed">
          <Card>
            <CardContent className="p-0">
              <PositionsTable positions={closed} loading={loading} showPnl />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all">
          <Card>
            <CardContent className="p-0">
              <PositionsTable positions={allPositions} loading={loading} showPnl />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
