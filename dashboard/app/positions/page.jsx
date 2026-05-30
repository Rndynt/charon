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

function PnlCell({ pct, sol }) {
  if (pct == null && sol == null) return <span style={{color:'#52525b', fontFamily:'monospace'}}>—</span>;
  const n = Number(pct ?? sol);
  const color = n >= 0 ? '#4ade80' : '#f87171';
  return (
    <div>
      {pct != null && <div className="font-mono font-semibold text-sm" style={{color}}>{formatPct(pct)}</div>}
      {sol != null && <div className="font-mono text-xs" style={{color:'#71717a'}}>{formatSol(sol)}</div>}
    </div>
  );
}

function ExitBadge({ reason }) {
  if (!reason) return <span style={{color:'#52525b', fontSize:12}}>—</span>;
  const map = { tp:'success', take_profit:'success', trailing_tp:'success', partial_tp:'success', sl:'danger', stop_loss:'danger', manual:'warning', forced:'warning', max_hold:'muted' };
  return <Badge variant={map[reason] ?? 'muted'} className="text-xs">{reason.replace(/_/g, ' ')}</Badge>;
}

function ModeTag({ mode }) {
  if (mode === 'live') return <Badge variant="danger" className="text-xs">LIVE</Badge>;
  if (mode === 'confirm') return <Badge variant="warning" className="text-xs">CFM</Badge>;
  return <Badge variant="muted" className="text-xs">DRY</Badge>;
}

function PositionsTable({ positions, loading, showPnl = true }) {
  if (loading) return (
    <div className="space-y-2 p-4">
      {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-11 w-full" />)}
    </div>
  );
  if (!positions.length) return (
    <div className="py-12 text-center text-sm" style={{color:'#52525b'}}>No positions found</div>
  );
  return (
    <Table>
      <TableHeader>
        <TableRow data-no-hover="true">
          <TableHead>Token</TableHead>
          <TableHead>Mode</TableHead>
          <TableHead>Size</TableHead>
          <TableHead className="hidden sm:table-cell">Entry Price</TableHead>
          <TableHead className="hidden md:table-cell">Entry MCap</TableHead>
          {showPnl && <TableHead>P&L</TableHead>}
          <TableHead className="hidden sm:table-cell">TP / SL</TableHead>
          <TableHead>Age</TableHead>
          {showPnl && <TableHead className="hidden md:table-cell">Exit</TableHead>}
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {positions.map(p => (
          <TableRow key={p.id}>
            <TableCell>
              <div>
                <div className="font-mono font-semibold text-sm" style={{color:'#e4e4f0'}}>{p.symbol || shortMint(p.mint)}</div>
                <div className="font-mono text-xs" style={{color:'#52525b'}}>{shortMint(p.mint)}</div>
              </div>
            </TableCell>
            <TableCell><ModeTag mode={p.executionMode} /></TableCell>
            <TableCell><span className="font-mono text-xs">{formatSol(p.sizeSol)}</span></TableCell>
            <TableCell className="hidden sm:table-cell">
              <span className="font-mono text-xs" style={{color:'#a1a1aa'}}>{p.entryPrice ? `$${Number(p.entryPrice).toExponential(2)}` : '—'}</span>
            </TableCell>
            <TableCell className="hidden md:table-cell">
              <span className="font-mono text-xs" style={{color:'#a1a1aa'}}>{formatUsd(p.entryMcap)}</span>
            </TableCell>
            {showPnl && <TableCell><PnlCell pct={p.pnlPercent} sol={p.pnlSol} /></TableCell>}
            <TableCell className="hidden sm:table-cell">
              <div className="text-xs font-mono">
                <span style={{color:'#4ade80'}}>+{p.tpPercent}%</span>
                <span style={{color:'#3f3f46', margin:'0 3px'}}>/</span>
                <span style={{color:'#f87171'}}>{p.slPercent}%</span>
              </div>
              {p.trailingEnabled && <div className="text-xs" style={{color:'#52525b'}}>trail {p.trailingPercent}%{p.trailingArmed ? ' ✓' : ''}</div>}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1 text-xs" style={{color:'#71717a'}}>
                <Clock size={11} />
                {formatAge(p.openedAtMs)}
              </div>
            </TableCell>
            {showPnl && <TableCell className="hidden md:table-cell"><ExitBadge reason={p.exitReason} /></TableCell>}
            <TableCell>
              <a href={solscanUrl(p.mint)} target="_blank" rel="noreferrer">
                <Button variant="ghost" size="icon" style={{width:28,height:28}}>
                  <ExternalLink size={12} color="#52525b" />
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
    if (!quiet) setLoading(true); else setRefreshing(true);
    try {
      const data = await fetch('/api/positions?limit=200').then(r => r.json());
      setAllPositions(Array.isArray(data) ? data : []);
    } finally { setLoading(false); setRefreshing(false); }
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
    <div className="p-4 sm:p-6 space-y-5 max-w-7xl mx-auto">
      <div className="flex items-center justify-between pt-8 lg:pt-0">
        <div>
          <h1 className="text-base font-semibold" style={{color:'#f4f4f8'}}>Positions</h1>
          <p className="text-xs mt-0.5" style={{color:'#52525b'}}>
            {open.length} open · {closed.length} closed · {formatSol(totalPnl)} total P&L
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => fetchData(true)} disabled={refreshing}>
          <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
      </div>

      {/* Summary strip */}
      {!loading && closed.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {[
            { icon: TrendingUp, label: 'Total P&L', value: formatSol(totalPnl), color: totalPnl >= 0 ? '#4ade80' : '#f87171' },
            { icon: TrendingDown, label: 'Win Rate', value: closed.length > 0 ? formatPct((wins / closed.length) * 100, false) : '—', color: '#c4c4d8' },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="flex items-center gap-2.5 rounded-xl px-4 py-2.5" style={{background:'#17171d', border:'1px solid #2a2a38'}}>
              <Icon size={14} color={color} />
              <div>
                <p className="text-xs" style={{color:'#52525b'}}>{label}</p>
                <p className="text-sm font-mono font-semibold" style={{color}}>{value}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <Tabs defaultValue="open">
        <TabsList>
          <TabsTrigger value="open" data-state={undefined}>Open ({open.length})</TabsTrigger>
          <TabsTrigger value="closed">Closed ({closed.length})</TabsTrigger>
          <TabsTrigger value="all">All ({allPositions.length})</TabsTrigger>
        </TabsList>
        {[
          { value: 'open', positions: open, showPnl: false },
          { value: 'closed', positions: closed, showPnl: true },
          { value: 'all', positions: allPositions, showPnl: true },
        ].map(({ value, positions, showPnl }) => (
          <TabsContent key={value} value={value}>
            <Card><CardContent className="p-0"><PositionsTable positions={positions} loading={loading} showPnl={showPnl} /></CardContent></Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
