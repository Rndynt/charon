'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RefreshCw, ExternalLink, Filter, Search, TrendingUp, CheckCircle2, XCircle } from 'lucide-react';
import { formatUsd, formatAge, shortMint, solscanUrl } from '@/lib/utils';

function StatusBadge({ status }) {
  const map = { candidate:'default', filtered:'muted', buy:'success', pass:'danger', watch:'warning', open:'success', closed:'muted' };
  return <Badge variant={map[status] ?? 'muted'}>{status}</Badge>;
}

function FilterResult({ filters }) {
  if (!filters) return <span style={{color:'#52525b', fontSize:12}}>—</span>;
  return (
    <div className="flex items-center gap-1">
      {filters.passed
        ? <CheckCircle2 size={13} color="#4ade80" />
        : <XCircle size={13} color="#f87171" />}
      {filters.reasons?.length > 0 && (
        <span className="text-xs truncate max-w-[180px]" style={{color:'#71717a'}}>
          {filters.reasons[0]}{filters.reasons.length > 1 ? ` +${filters.reasons.length - 1}` : ''}
        </span>
      )}
    </div>
  );
}

function RouteBadge({ route }) {
  if (!route) return null;
  const map = { fee_claim:'default', fee:'default', graduated:'success', trending:'warning', signal:'blue' };
  const parts = (route || '').split(' ');
  return (
    <div className="flex flex-wrap gap-1">
      {parts.map((p, i) => <Badge key={i} variant={map[p] ?? 'muted'} className="text-xs">{p.replace(/_/g,' ')}</Badge>)}
    </div>
  );
}

const STAT_ITEMS = [
  { label:'Total Screened', key:null,         icon:Search,       color:'rgba(139,92,246,0.1)',  iconColor:'#a78bfa' },
  { label:'Passed Filters', key:'candidate',  icon:CheckCircle2, color:'rgba(34,197,94,0.1)',   iconColor:'#4ade80' },
  { label:'Filtered Out',   key:'filtered',   icon:XCircle,      color:'rgba(239,68,68,0.1)',   iconColor:'#f87171' },
  { label:'Bought',         key:'buy',        icon:TrendingUp,   color:'rgba(59,130,246,0.1)',  iconColor:'#60a5fa' },
];

export default function ScreeningPage() {
  const [data, setData] = useState({ candidates: [], breakdown: [] });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expanded, setExpanded] = useState(null);

  const fetchData = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true); else setRefreshing(true);
    try {
      const res = await fetch('/api/candidates?limit=80').then(r => r.json());
      setData({ candidates: res.candidates ?? [], breakdown: res.breakdown ?? [] });
    } finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => {
    fetchData();
    const id = setInterval(() => fetchData(true), 20000);
    return () => clearInterval(id);
  }, [fetchData]);

  const { candidates, breakdown } = data;
  const breakdownMap = {};
  for (const b of breakdown) breakdownMap[b.status] = Number(b.count);
  const total24h = Object.values(breakdownMap).reduce((a, b) => a + b, 0);

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-7xl mx-auto">
      <div className="flex items-center justify-between pt-8 lg:pt-0">
        <div>
          <h1 className="text-base font-semibold" style={{color:'#f4f4f8'}}>Screening</h1>
          <p className="text-xs mt-0.5" style={{color:'#52525b'}}>Token pipeline — last 24h</p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => fetchData(true)} disabled={refreshing}>
          <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {STAT_ITEMS.map(({ label, key, icon: Icon, color, iconColor }) => (
          <div key={label} className="rounded-xl p-3 flex items-center gap-3" style={{background:'#17171d', border:'1px solid #2a2a38'}}>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{background:color}}>
              <Icon size={15} color={iconColor} />
            </div>
            <div>
              <p className="text-xs" style={{color:'#71717a'}}>{label}</p>
              {loading
                ? <Skeleton className="h-5 w-10 mt-0.5" />
                : <p className="text-xl font-bold font-mono" style={{color:'#f4f4f8'}}>{key === null ? total24h : (breakdownMap[key] ?? 0)}</p>
              }
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter size={13} color="#a78bfa" />
            Recent Candidates
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-2">{[...Array(7)].map((_, i) => <Skeleton key={i} className="h-11 w-full" />)}</div>
          ) : candidates.length === 0 ? (
            <div className="py-12 text-center text-sm" style={{color:'#52525b'}}>No candidates yet</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow data-no-hover="true">
                  <TableHead>Token</TableHead>
                  <TableHead className="hidden sm:table-cell">Route</TableHead>
                  <TableHead>MCap</TableHead>
                  <TableHead className="hidden md:table-cell">Holders</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Filters</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {candidates.map(c => (
                  <React.Fragment key={c.id}>
                    <TableRow
                      className="cursor-pointer"
                      onClick={() => setExpanded(expanded === c.id ? null : c.id)}
                    >
                      <TableCell>
                        <div>
                          <div className="font-mono font-semibold text-sm" style={{color:'#e4e4f0'}}>{c.token?.symbol || shortMint(c.mint)}</div>
                          <div className="font-mono text-xs" style={{color:'#52525b'}}>{shortMint(c.mint)}</div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <RouteBadge route={c.signals?.route} />
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs" style={{color:'#a1a1aa'}}>
                          {formatUsd(c.metrics?.marketCapUsd || c.metrics?.graduatedMarketCapUsd)}
                        </span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="font-mono text-xs" style={{color:'#a1a1aa'}}>{c.holders?.count ?? '—'}</span>
                      </TableCell>
                      <TableCell><StatusBadge status={c.status} /></TableCell>
                      <TableCell className="hidden lg:table-cell"><FilterResult filters={c.filters} /></TableCell>
                      <TableCell>
                        <span className="text-xs" style={{color:'#71717a'}}>{formatAge(c.createdAtMs)}</span>
                      </TableCell>
                      <TableCell>
                        <a href={solscanUrl(c.mint)} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" style={{width:28,height:28}}>
                            <ExternalLink size={11} color="#52525b" />
                          </Button>
                        </a>
                      </TableCell>
                    </TableRow>
                    {expanded === c.id && c.filters?.reasons?.length > 0 && (
                      <TableRow>
                        <TableCell colSpan={8} style={{background:'rgba(30,30,39,0.8)'}}>
                          <div className="py-1">
                            <p className="text-xs font-medium mb-1.5" style={{color:'#71717a'}}>Filter results:</p>
                            <div className="flex flex-wrap gap-1.5">
                              {c.filters.reasons.map((r, i) => (
                                <span key={i} className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs" style={{background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', color:'#fca5a5'}}>
                                  <XCircle size={10} />{r}
                                </span>
                              ))}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
