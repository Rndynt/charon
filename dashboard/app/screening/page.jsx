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
  const map = {
    candidate: 'default',
    filtered: 'muted',
    buy: 'success',
    pass: 'danger',
    watch: 'warning',
    open: 'success',
    closed: 'muted',
  };
  return <Badge variant={map[status] ?? 'muted'}>{status}</Badge>;
}

function FilterResult({ filters }) {
  if (!filters) return <span className="text-slate-600 text-xs">—</span>;
  return (
    <div className="flex items-center gap-1">
      {filters.passed
        ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
        : <XCircle className="h-3.5 w-3.5 text-red-400" />}
      {filters.reasons?.length > 0 && (
        <span className="text-xs text-slate-600 truncate max-w-xs">
          {filters.reasons.slice(0, 2).join(', ')}
          {filters.reasons.length > 2 && ` +${filters.reasons.length - 2}`}
        </span>
      )}
    </div>
  );
}

function SignalRouteBadge({ route }) {
  if (!route) return null;
  const map = {
    fee_claim: 'default',
    graduated: 'success',
    trending: 'warning',
    signal: 'blue',
  };
  return <Badge variant={map[route] ?? 'muted'} className="text-xs">{route.replace(/_/g, ' ')}</Badge>;
}

export default function ScreeningPage() {
  const [data, setData] = useState({ candidates: [], breakdown: [] });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expanded, setExpanded] = useState(null);

  const fetchData = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await fetch('/api/candidates?limit=80').then(r => r.json());
      setData({ candidates: res.candidates ?? [], breakdown: res.breakdown ?? [] });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
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
    <div className="p-6 space-y-5 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-100">Screening</h1>
          <p className="text-xs text-slate-600 mt-0.5">Token pipeline — last 24h</p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => fetchData(true)} disabled={refreshing}>
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Breakdown stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Screened', key: null, icon: Search, color: 'text-violet-400 bg-violet-600/10' },
          { label: 'Passed Filters', key: 'candidate', icon: CheckCircle2, color: 'text-emerald-400 bg-emerald-600/10' },
          { label: 'Filtered Out', key: 'filtered', icon: XCircle, color: 'text-red-400 bg-red-600/10' },
          { label: 'Bought', key: 'buy', icon: TrendingUp, color: 'text-blue-400 bg-blue-600/10' },
        ].map(({ label, key, icon: Icon, color }) => (
          <div key={label} className="rounded-lg border border-surface-border bg-surface-card p-3 flex items-center gap-3">
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${color.split(' ')[1]}`}>
              <Icon className={`h-4 w-4 ${color.split(' ')[0]}`} />
            </div>
            <div>
              <p className="text-xs text-slate-600">{label}</p>
              {loading ? <Skeleton className="h-5 w-8 mt-0.5" /> : (
                <p className="text-lg font-semibold font-mono text-slate-100">
                  {key === null ? total24h : (breakdownMap[key] ?? 0)}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Candidates table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-violet-400" />
            Recent Candidates
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-2">
              {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : candidates.length === 0 ? (
            <div className="py-12 text-center text-slate-600 text-sm">No candidates yet</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Token</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Market Cap</TableHead>
                  <TableHead>Holders</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Filters</TableHead>
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
                        <div className="flex flex-col">
                          <span className="font-mono font-medium text-slate-200 text-sm">
                            {c.token?.symbol || shortMint(c.mint)}
                          </span>
                          <span className="font-mono text-xs text-slate-600">{shortMint(c.mint)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <SignalRouteBadge route={c.signals?.route} />
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs text-slate-400">
                          {formatUsd(c.metrics?.marketCapUsd || c.metrics?.graduatedMarketCapUsd)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs text-slate-400">
                          {c.holders?.count ?? '—'}
                        </span>
                      </TableCell>
                      <TableCell><StatusBadge status={c.status} /></TableCell>
                      <TableCell><FilterResult filters={c.filters} /></TableCell>
                      <TableCell>
                        <span className="text-xs text-slate-600">{formatAge(c.createdAtMs)}</span>
                      </TableCell>
                      <TableCell>
                        <a href={solscanUrl(c.mint)} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <ExternalLink className="h-3 w-3 text-slate-600" />
                          </Button>
                        </a>
                      </TableCell>
                    </TableRow>
                    {expanded === c.id && c.filters?.reasons?.length > 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="bg-surface-hover/30">
                          <div className="py-1 space-y-1">
                            <p className="text-xs font-medium text-slate-500 mb-1.5">Filter results:</p>
                            <div className="flex flex-wrap gap-1.5">
                              {c.filters.reasons.map((r, i) => (
                                <span key={i} className="inline-flex items-center gap-1 rounded px-2 py-0.5 bg-red-600/10 border border-red-600/20 text-xs text-red-300">
                                  <XCircle className="h-2.5 w-2.5" />{r}
                                </span>
                              ))}
                            </div>
                            {c.filters.strategy && (
                              <p className="text-xs text-slate-600 mt-1">Strategy: {c.filters.strategy}</p>
                            )}
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
