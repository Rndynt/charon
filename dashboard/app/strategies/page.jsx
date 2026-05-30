'use client';
import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Zap, CheckCircle2, Edit2, Save, X } from 'lucide-react';

const STRATEGY_FIELDS = [
  { key: 'position_size_sol', label: 'Position Size (SOL)', type: 'number', step: 0.01 },
  { key: 'max_open_positions', label: 'Max Open Positions', type: 'number', step: 1 },
  { key: 'tp_percent', label: 'Take Profit %', type: 'number', step: 1 },
  { key: 'sl_percent', label: 'Stop Loss %', type: 'number', step: 1 },
  { key: 'trailing_enabled', label: 'Trailing Stop', type: 'bool' },
  { key: 'trailing_percent', label: 'Trailing %', type: 'number', step: 1 },
  { key: 'min_mcap_usd', label: 'Min Market Cap (USD)', type: 'number', step: 100 },
  { key: 'max_mcap_usd', label: 'Max Market Cap (USD)', type: 'number', step: 1000 },
  { key: 'token_age_max_ms', label: 'Max Token Age (ms)', type: 'number', step: 60000 },
  { key: 'min_holders', label: 'Min Holders', type: 'number', step: 10 },
  { key: 'min_fee_claim_sol', label: 'Min Fee Claim (SOL)', type: 'number', step: 0.1 },
  { key: 'min_gmgn_total_fee_sol', label: 'Min GMGN Total Fee', type: 'number', step: 1 },
  { key: 'use_llm', label: 'Use LLM', type: 'bool' },
  { key: 'llm_min_confidence', label: 'LLM Min Confidence %', type: 'number', step: 5 },
  { key: 'require_fee_claim', label: 'Require Fee Claim', type: 'bool' },
  { key: 'min_source_count', label: 'Min Signal Sources', type: 'number', step: 1 },
  { key: 'partial_tp', label: 'Partial Take Profit', type: 'bool' },
  { key: 'partial_tp_at_percent', label: 'Partial TP At %', type: 'number', step: 5 },
  { key: 'partial_tp_sell_percent', label: 'Partial TP Sell %', type: 'number', step: 5 },
];

function StrategyCard({ strategy, onActivate, onSave, activating }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({});
  const [saving, setSaving] = useState(false);

  function startEdit() {
    const d = {};
    for (const f of STRATEGY_FIELDS) d[f.key] = strategy[f.key];
    setDraft(d);
    setEditing(true);
  }

  function cancelEdit() { setEditing(false); setDraft({}); }

  async function save() {
    setSaving(true);
    try {
      await fetch('/api/strategies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update', id: strategy.id, config: draft }),
      });
      onSave();
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className={strategy.enabled ? 'border-violet-600/40 bg-violet-600/5' : ''}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className={`h-4 w-4 ${strategy.enabled ? 'text-violet-400' : 'text-slate-600'}`} />
            <CardTitle className={strategy.enabled ? 'text-violet-300' : ''}>{strategy.name}</CardTitle>
            {strategy.enabled && (
              <Badge variant="live" className="text-xs">
                <CheckCircle2 className="h-2.5 w-2.5 mr-1" />Active
              </Badge>
            )}
          </div>
          <div className="flex gap-1.5">
            {!editing && (
              <Button variant="ghost" size="sm" onClick={startEdit}>
                <Edit2 className="h-3 w-3" />
              </Button>
            )}
            {editing && (
              <>
                <Button variant="success" size="sm" onClick={save} disabled={saving}>
                  <Save className="h-3 w-3" />{saving ? 'Saving…' : 'Save'}
                </Button>
                <Button variant="ghost" size="sm" onClick={cancelEdit}>
                  <X className="h-3 w-3" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {!editing ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {[
              ['Position Size', `${strategy.position_size_sol} SOL`],
              ['TP / SL', `+${strategy.tp_percent}% / ${strategy.sl_percent}%`],
              ['Trailing', strategy.trailing_enabled ? `${strategy.trailing_percent}%` : 'Off'],
              ['Max Positions', strategy.max_open_positions],
              ['MCap Range', `${strategy.min_mcap_usd > 0 ? `$${(strategy.min_mcap_usd/1000).toFixed(0)}K` : '—'} – ${strategy.max_mcap_usd > 0 ? `$${(strategy.max_mcap_usd/1000).toFixed(0)}K` : '∞'}`],
              ['LLM', strategy.use_llm ? `Min ${strategy.llm_min_confidence}%` : 'Off'],
              ['Sources', `Min ${strategy.min_source_count}`],
              ['Entry Mode', strategy.entry_mode ?? '—'],
            ].map(([label, val]) => (
              <div key={label}>
                <p className="text-xs text-slate-600">{label}</p>
                <p className="text-xs font-mono text-slate-300 mt-0.5">{val}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {STRATEGY_FIELDS.map(f => (
              <div key={f.key} className="flex flex-col gap-1">
                <Label htmlFor={`${strategy.id}-${f.key}`}>{f.label}</Label>
                {f.type === 'bool' ? (
                  <div className="flex items-center gap-2 h-8">
                    <Switch
                      id={`${strategy.id}-${f.key}`}
                      checked={Boolean(draft[f.key])}
                      onCheckedChange={v => setDraft(d => ({ ...d, [f.key]: v }))}
                    />
                    <span className="text-xs text-slate-500">{draft[f.key] ? 'On' : 'Off'}</span>
                  </div>
                ) : (
                  <Input
                    id={`${strategy.id}-${f.key}`}
                    type="number"
                    step={f.step}
                    value={draft[f.key] ?? ''}
                    onChange={e => setDraft(d => ({ ...d, [f.key]: Number(e.target.value) }))}
                    className="h-7 text-xs font-mono"
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {!strategy.enabled && !editing && (
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-2"
            onClick={() => onActivate(strategy.id)}
            disabled={activating}
          >
            {activating ? 'Activating…' : 'Set as Active Strategy'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default function StrategiesPage() {
  const [strategies, setStrategies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const data = await fetch('/api/strategies').then(r => r.json());
      setStrategies(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function activate(id) {
    setActivating(id);
    try {
      await fetch('/api/strategies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'activate', id }),
      });
      await fetchData();
    } finally {
      setActivating(null);
    }
  }

  return (
    <div className="p-6 space-y-5 max-w-6xl">
      <div>
        <h1 className="text-lg font-semibold text-slate-100">Strategies</h1>
        <p className="text-xs text-slate-600 mt-0.5">
          {strategies.find(s => s.enabled)
            ? `Active: ${strategies.find(s => s.enabled)?.name}`
            : 'No active strategy'}
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-64 w-full" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {strategies.map(s => (
            <StrategyCard
              key={s.id}
              strategy={s}
              onActivate={activate}
              onSave={fetchData}
              activating={activating === s.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
