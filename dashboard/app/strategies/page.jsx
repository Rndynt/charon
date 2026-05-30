'use client';
import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Zap, CheckCircle2, Edit2, Save, X } from 'lucide-react';

const STRATEGY_FIELDS = [
  { key: 'position_size_sol',    label: 'Position Size (SOL)', type: 'number', step: 0.01 },
  { key: 'max_open_positions',   label: 'Max Positions',       type: 'number', step: 1 },
  { key: 'tp_percent',           label: 'Take Profit %',       type: 'number', step: 1 },
  { key: 'sl_percent',           label: 'Stop Loss %',         type: 'number', step: 1 },
  { key: 'trailing_enabled',     label: 'Trailing Stop',       type: 'bool' },
  { key: 'trailing_percent',     label: 'Trailing %',          type: 'number', step: 1 },
  { key: 'min_mcap_usd',         label: 'Min MCap (USD)',      type: 'number', step: 100 },
  { key: 'max_mcap_usd',         label: 'Max MCap (USD)',      type: 'number', step: 1000 },
  { key: 'token_age_max_ms',     label: 'Max Age (ms)',        type: 'number', step: 60000 },
  { key: 'min_holders',          label: 'Min Holders',         type: 'number', step: 10 },
  { key: 'min_fee_claim_sol',    label: 'Min Fee Claim (SOL)', type: 'number', step: 0.1 },
  { key: 'min_gmgn_total_fee_sol',label:'Min GMGN Fee',        type: 'number', step: 1 },
  { key: 'use_llm',              label: 'Use LLM',             type: 'bool' },
  { key: 'llm_min_confidence',   label: 'LLM Min Conf %',      type: 'number', step: 5 },
  { key: 'require_fee_claim',    label: 'Require Fee Claim',   type: 'bool' },
  { key: 'min_source_count',     label: 'Min Signal Sources',  type: 'number', step: 1 },
  { key: 'partial_tp',           label: 'Partial TP',          type: 'bool' },
  { key: 'partial_tp_at_percent',label: 'Partial TP At %',     type: 'number', step: 5 },
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
    } finally { setSaving(false); }
  }

  const isActive = strategy.enabled;
  const fmtMcap = v => v > 0 ? `$${(v/1000).toFixed(0)}K` : '—';

  return (
    <Card style={isActive ? { border: '1px solid rgba(139,92,246,0.35)', background: 'rgba(139,92,246,0.04)' } : {}}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Zap size={14} color={isActive ? '#a78bfa' : '#52525b'} />
            <CardTitle style={{color: isActive ? '#c4b5fd' : '#e4e4f0'}}>{strategy.name}</CardTitle>
            {isActive && <Badge variant="live"><CheckCircle2 size={9} style={{marginRight:3}} />Active</Badge>}
          </div>
          <div className="flex gap-1 shrink-0">
            {!editing && (
              <Button variant="ghost" size="sm" onClick={startEdit} style={{height:28, padding:'0 8px'}}>
                <Edit2 size={12} />
              </Button>
            )}
            {editing && (
              <>
                <Button variant="success" size="sm" onClick={save} disabled={saving} style={{height:28, padding:'0 10px'}}>
                  <Save size={12} />{saving ? 'Saving…' : 'Save'}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => { setEditing(false); setDraft({}); }} style={{height:28, width:28, padding:0}}>
                  <X size={12} />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {!editing ? (
          <>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 mb-4">
              {[
                ['Position Size', `${strategy.position_size_sol} SOL`],
                ['TP / SL', `+${strategy.tp_percent}% / ${strategy.sl_percent}%`],
                ['Trailing', strategy.trailing_enabled ? `${strategy.trailing_percent}%` : 'Off'],
                ['Max Positions', strategy.max_open_positions],
                ['MCap Range', `${fmtMcap(strategy.min_mcap_usd)} — ${fmtMcap(strategy.max_mcap_usd)}`],
                ['LLM', strategy.use_llm ? `Min ${strategy.llm_min_confidence}%` : 'Off'],
                ['Sources', `Min ${strategy.min_source_count}`],
                ['Entry Mode', strategy.entry_mode ?? '—'],
              ].map(([label, val]) => (
                <div key={label}>
                  <p className="text-xs mb-0.5" style={{color:'#52525b'}}>{label}</p>
                  <p className="text-xs font-mono font-medium" style={{color:'#d4d4e8'}}>{val}</p>
                </div>
              ))}
            </div>
            {!isActive && (
              <Button variant="outline" className="w-full" style={{height:34}} onClick={() => onActivate(strategy.id)} disabled={activating}>
                {activating ? 'Activating…' : 'Set as Active Strategy'}
              </Button>
            )}
          </>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {STRATEGY_FIELDS.map(f => (
              <div key={f.key}>
                <Label className="text-xs mb-1.5 block" style={{color:'#71717a'}}>{f.label}</Label>
                {f.type === 'bool' ? (
                  <div className="flex items-center gap-2">
                    <Switch checked={Boolean(draft[f.key])} onCheckedChange={v => setDraft(d => ({ ...d, [f.key]: v }))} />
                    <span className="text-xs" style={{color:'#71717a'}}>{draft[f.key] ? 'On' : 'Off'}</span>
                  </div>
                ) : (
                  <Input
                    type="number"
                    step={f.step}
                    value={draft[f.key] ?? ''}
                    onChange={e => setDraft(d => ({ ...d, [f.key]: Number(e.target.value) }))}
                    className="text-xs font-mono"
                    style={{height:32}}
                  />
                )}
              </div>
            ))}
          </div>
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
    } finally { setLoading(false); }
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
    } finally { setActivating(null); }
  }

  const active = strategies.find(s => s.enabled);

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-6xl mx-auto">
      <div className="pt-8 lg:pt-0">
        <h1 className="text-base font-semibold" style={{color:'#f4f4f8'}}>Strategies</h1>
        <p className="text-xs mt-0.5" style={{color:'#52525b'}}>
          {active ? `Active: ${active.name}` : 'No active strategy'}
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-64 w-full" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {strategies.map(s => (
            <StrategyCard key={s.id} strategy={s} onActivate={activate} onSave={fetchData} activating={activating === s.id} />
          ))}
        </div>
      )}
    </div>
  );
}
