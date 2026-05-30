'use client';
import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Save, RefreshCw, Check } from 'lucide-react';

const SETTING_GROUPS = [
  {
    title: 'Trading', icon: '⚡',
    settings: [
      { key: 'trading_mode',            label: 'Trading Mode',            type: 'select', options: ['dry_run', 'confirm', 'live'] },
      { key: 'agent_enabled',           label: 'Agent Enabled',           type: 'bool' },
      { key: 'dry_run_buy_sol',         label: 'Position Size (SOL)',      type: 'number', step: 0.01 },
      { key: 'max_open_positions',      label: 'Max Open Positions',       type: 'number', step: 1 },
      { key: 'min_fee_claim_sol',       label: 'Min Fee Claim (SOL)',      type: 'number', step: 0.1 },
      { key: 'min_mcap_usd',            label: 'Min Market Cap (USD)',     type: 'number', step: 100 },
      { key: 'max_mcap_usd',            label: 'Max Market Cap (USD)',     type: 'number', step: 1000 },
      { key: 'min_gmgn_total_fee_sol',  label: 'Min GMGN Total Fee SOL',  type: 'number', step: 1 },
    ],
  },
  {
    title: 'Take Profit / Stop Loss', icon: '🎯',
    settings: [
      { key: 'default_tp_percent',        label: 'Take Profit %',   type: 'number', step: 5 },
      { key: 'default_sl_percent',        label: 'Stop Loss %',     type: 'number', step: 5 },
      { key: 'default_trailing_enabled',  label: 'Trailing Stop',   type: 'bool' },
      { key: 'default_trailing_percent',  label: 'Trailing %',      type: 'number', step: 5 },
    ],
  },
  {
    title: 'LLM', icon: '🤖',
    settings: [
      { key: 'llm_min_confidence',        label: 'Min Confidence %',     type: 'number', step: 5 },
      { key: 'llm_candidate_pick_count',  label: 'Candidate Pick Count', type: 'number', step: 1 },
      { key: 'llm_candidate_max_age_ms',  label: 'Max Candidate Age (ms)', type: 'number', step: 60000 },
    ],
  },
  {
    title: 'Risk Guard', icon: '🛡️',
    settings: [
      { key: 'risk_guard_enabled',                  label: 'Risk Guard Enabled',         type: 'bool' },
      { key: 'risk_guard_max_daily_loss_sol',        label: 'Max Daily Loss SOL (0=off)', type: 'number', step: 0.01 },
      { key: 'risk_guard_max_consecutive_losses',    label: 'Max Consecutive Losses',     type: 'number', step: 1 },
      { key: 'risk_guard_lookback_ms',               label: 'Lookback Window (ms)',       type: 'number', step: 3600000 },
    ],
  },
  {
    title: 'Trending', icon: '🔥',
    settings: [
      { key: 'trending_enabled',       label: 'Enabled',       type: 'bool' },
      { key: 'trending_source',        label: 'Source',        type: 'select', options: ['jupiter', 'gmgn'] },
      { key: 'trending_interval',      label: 'Interval',      type: 'select', options: ['1m', '5m', '15m', '1h'] },
      { key: 'trending_order_by',      label: 'Order By',      type: 'select', options: ['volume', 'swaps', 'price_change'] },
      { key: 'trending_limit',         label: 'Limit',         type: 'number', step: 10 },
      { key: 'trending_allow_degen',   label: 'Allow Degen',   type: 'bool' },
      { key: 'trending_min_volume_usd',label: 'Min Volume USD', type: 'number', step: 100 },
      { key: 'trending_min_swaps',     label: 'Min Swaps',     type: 'number', step: 10 },
      { key: 'trending_max_rug_ratio', label: 'Max Rug Ratio', type: 'number', step: 0.05 },
    ],
  },
  {
    title: 'Regime Auto-Tune', icon: '📈',
    settings: [
      { key: 'regime_auto_tune_enabled',       label: 'Auto-Tune Enabled', type: 'bool' },
      { key: 'regime_lookback_ms',             label: 'Lookback (ms)',     type: 'number', step: 3600000 },
      { key: 'regime_min_closed_positions',    label: 'Min Closed Trades', type: 'number', step: 1 },
    ],
  },
  {
    title: 'GMGN', icon: '📊',
    settings: [
      { key: 'gmgn_request_delay_ms', label: 'Request Delay (ms)', type: 'number', step: 250 },
      { key: 'gmgn_max_retries',      label: 'Max Retries',        type: 'number', step: 1 },
    ],
  },
];

function SettingRow({ fieldDef, value, onChange }) {
  const { key, label, type, step, options } = fieldDef;

  return (
    <div className="flex items-center justify-between py-3" style={{borderBottom:'1px solid #1e1e27'}}>
      <Label style={{color:'#c4c4d8', fontSize:13}}>{label}</Label>
      <div className="ml-4 shrink-0">
        {type === 'bool' ? (
          <Switch
            id={key}
            checked={value === 'true' || value === '1' || value === 'yes'}
            onCheckedChange={v => onChange(key, v ? 'true' : 'false')}
          />
        ) : type === 'select' ? (
          <Select value={value ?? ''} onValueChange={v => onChange(key, v)}>
            <SelectTrigger style={{width:130, height:32}}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {options.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
            </SelectContent>
          </Select>
        ) : (
          <Input
            id={key}
            type="number"
            step={step}
            value={value ?? ''}
            onChange={e => onChange(key, e.target.value)}
            className="font-mono text-right"
            style={{width:120, height:32, fontSize:13}}
          />
        )}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [saved, setSaved] = useState({});
  const [pending, setPending] = useState({});

  const fetchData = useCallback(async () => {
    try {
      const data = await fetch('/api/settings').then(r => r.json());
      setSettings(data ?? {});
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  function handleChange(key, value) {
    setSettings(s => ({ ...s, [key]: value }));
    setPending(p => ({ ...p, [key]: value }));
  }

  async function saveGroup(group) {
    const id = group.title;
    setSaving(s => ({ ...s, [id]: true }));
    try {
      for (const f of group.settings) {
        if (pending[f.key] !== undefined) {
          await fetch('/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: f.key, value: pending[f.key] }),
          });
        }
      }
      setPending(p => {
        const next = { ...p };
        for (const f of group.settings) delete next[f.key];
        return next;
      });
      setSaved(s => ({ ...s, [id]: true }));
      setTimeout(() => setSaved(s => ({ ...s, [id]: false })), 2500);
    } finally { setSaving(s => ({ ...s, [id]: false })); }
  }

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-3xl mx-auto">
      <div className="flex items-center justify-between pt-8 lg:pt-0">
        <div>
          <h1 className="text-base font-semibold" style={{color:'#f4f4f8'}}>Settings</h1>
          <p className="text-xs mt-0.5" style={{color:'#52525b'}}>Global bot configuration</p>
        </div>
        <Button variant="ghost" size="sm" onClick={fetchData}>
          <RefreshCw size={13} />
          <span className="hidden sm:inline">Reload</span>
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-44 w-full" />)}</div>
      ) : (
        <div className="space-y-4">
          {SETTING_GROUPS.map(group => {
            const hasPending = group.settings.some(f => pending[f.key] !== undefined);
            const isSaved = saved[group.title];
            return (
              <div key={group.title}>
                <Card>
                  <CardHeader className="pb-0">
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <span>{group.icon}</span>
                        {group.title}
                      </span>
                      {isSaved && (
                        <Badge variant="success">
                          <Check size={10} style={{marginRight:4}} />Saved
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-1">
                    {group.settings.map(f => (
                      <SettingRow
                        key={f.key}
                        fieldDef={f}
                        value={settings[f.key] ?? ''}
                        onChange={handleChange}
                      />
                    ))}
                  </CardContent>
                </Card>
                {hasPending && (
                  <div className="flex justify-end mt-2">
                    <Button size="sm" onClick={() => saveGroup(group)} disabled={saving[group.title]}>
                      <Save size={12} />
                      {saving[group.title] ? 'Saving…' : `Save ${group.title}`}
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
