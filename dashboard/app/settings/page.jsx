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
import { Settings, Save, RefreshCw, Check } from 'lucide-react';

const SETTING_GROUPS = [
  {
    title: 'Trading',
    icon: '⚡',
    settings: [
      { key: 'trading_mode', label: 'Trading Mode', type: 'select', options: ['dry_run', 'confirm', 'live'] },
      { key: 'agent_enabled', label: 'Agent Enabled', type: 'bool' },
      { key: 'dry_run_buy_sol', label: 'Position Size (SOL)', type: 'number', step: 0.01 },
      { key: 'max_open_positions', label: 'Max Open Positions', type: 'number', step: 1 },
      { key: 'min_fee_claim_sol', label: 'Min Fee Claim (SOL)', type: 'number', step: 0.1 },
      { key: 'min_mcap_usd', label: 'Min Market Cap (USD)', type: 'number', step: 100 },
      { key: 'max_mcap_usd', label: 'Max Market Cap (USD) (0=off)', type: 'number', step: 1000 },
      { key: 'min_gmgn_total_fee_sol', label: 'Min GMGN Total Fee SOL', type: 'number', step: 1 },
    ],
  },
  {
    title: 'Take Profit / Stop Loss',
    icon: '🎯',
    settings: [
      { key: 'default_tp_percent', label: 'Default Take Profit %', type: 'number', step: 5 },
      { key: 'default_sl_percent', label: 'Default Stop Loss %', type: 'number', step: 5 },
      { key: 'default_trailing_enabled', label: 'Trailing Stop Default', type: 'bool' },
      { key: 'default_trailing_percent', label: 'Default Trailing %', type: 'number', step: 5 },
    ],
  },
  {
    title: 'LLM',
    icon: '🤖',
    settings: [
      { key: 'enable_llm', label: 'Enable LLM', type: 'bool' },
      { key: 'llm_min_confidence', label: 'Min Confidence %', type: 'number', step: 5 },
      { key: 'llm_candidate_pick_count', label: 'Candidate Pick Count', type: 'number', step: 1 },
      { key: 'llm_candidate_max_age_ms', label: 'Max Candidate Age (ms)', type: 'number', step: 60000 },
    ],
  },
  {
    title: 'Risk Guard',
    icon: '🛡️',
    settings: [
      { key: 'risk_guard_enabled', label: 'Risk Guard Enabled', type: 'bool' },
      { key: 'risk_guard_max_daily_loss_sol', label: 'Max Daily Loss (SOL, 0=off)', type: 'number', step: 0.01 },
      { key: 'risk_guard_max_consecutive_losses', label: 'Max Consecutive Losses (0=off)', type: 'number', step: 1 },
      { key: 'risk_guard_lookback_ms', label: 'Lookback Window (ms)', type: 'number', step: 3600000 },
    ],
  },
  {
    title: 'Regime Auto-Tune',
    icon: '📈',
    settings: [
      { key: 'regime_auto_tune_enabled', label: 'Auto-Tune Enabled', type: 'bool' },
      { key: 'regime_lookback_ms', label: 'Regime Lookback (ms)', type: 'number', step: 3600000 },
      { key: 'regime_min_closed_positions', label: 'Min Closed Positions', type: 'number', step: 1 },
    ],
  },
  {
    title: 'Trending',
    icon: '🔥',
    settings: [
      { key: 'trending_enabled', label: 'Trending Enabled', type: 'bool' },
      { key: 'trending_source', label: 'Source', type: 'select', options: ['jupiter', 'gmgn'] },
      { key: 'trending_interval', label: 'Interval', type: 'select', options: ['1m', '5m', '15m', '1h'] },
      { key: 'trending_order_by', label: 'Order By', type: 'select', options: ['volume', 'swaps', 'price_change'] },
      { key: 'trending_limit', label: 'Limit', type: 'number', step: 10 },
      { key: 'trending_allow_degen', label: 'Allow Degen', type: 'bool' },
      { key: 'trending_min_volume_usd', label: 'Min Volume (USD)', type: 'number', step: 100 },
      { key: 'trending_min_swaps', label: 'Min Swaps', type: 'number', step: 10 },
      { key: 'trending_max_rug_ratio', label: 'Max Rug Ratio', type: 'number', step: 0.05 },
      { key: 'trending_max_bundler_rate', label: 'Max Bundler Rate', type: 'number', step: 0.05 },
    ],
  },
  {
    title: 'GMGN',
    icon: '📊',
    settings: [
      { key: 'gmgn_request_delay_ms', label: 'Request Delay (ms)', type: 'number', step: 250 },
      { key: 'gmgn_max_retries', label: 'Max Retries', type: 'number', step: 1 },
      { key: 'gmgn_cache_ttl_ms', label: 'Cache TTL (ms)', type: 'number', step: 30000 },
    ],
  },
];

function SettingField({ fieldDef, value, onChange }) {
  const { key, label, type, step, options } = fieldDef;

  if (type === 'bool') {
    const checked = value === 'true' || value === '1' || value === 'yes';
    return (
      <div className="flex items-center justify-between py-2.5 border-b border-surface-border/50 last:border-0">
        <Label htmlFor={key} className="cursor-pointer text-slate-300">{label}</Label>
        <Switch id={key} checked={checked} onCheckedChange={v => onChange(key, v ? 'true' : 'false')} />
      </div>
    );
  }

  if (type === 'select') {
    return (
      <div className="flex items-center justify-between py-2.5 border-b border-surface-border/50 last:border-0">
        <Label className="text-slate-300">{label}</Label>
        <Select value={value ?? ''} onValueChange={v => onChange(key, v)}>
          <SelectTrigger className="w-36 h-7 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between py-2.5 border-b border-surface-border/50 last:border-0">
      <Label htmlFor={key} className="text-slate-300 flex-1 mr-4">{label}</Label>
      <Input
        id={key}
        type="number"
        step={step}
        value={value ?? ''}
        onChange={e => onChange(key, e.target.value)}
        className="w-28 h-7 text-xs font-mono text-right"
      />
    </div>
  );
}

function SettingGroup({ group, settings, onChange, saving, saved }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <span>{group.icon}</span>
          {group.title}
          {saved && (
            <Badge variant="success" className="ml-auto">
              <Check className="h-2.5 w-2.5 mr-1" />Saved
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div>
          {group.settings.map(f => (
            <SettingField
              key={f.key}
              fieldDef={f}
              value={settings[f.key] ?? ''}
              onChange={onChange}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [saved, setSaved] = useState({});
  const [pendingChanges, setPendingChanges] = useState({});

  const fetchData = useCallback(async () => {
    try {
      const data = await fetch('/api/settings').then(r => r.json());
      setSettings(data ?? {});
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  function handleChange(key, value) {
    setSettings(s => ({ ...s, [key]: value }));
    setPendingChanges(p => ({ ...p, [key]: value }));
  }

  async function saveGroupSettings(group) {
    const keys = group.settings.map(f => f.key);
    const groupId = group.title;
    setSaving(s => ({ ...s, [groupId]: true }));
    try {
      for (const key of keys) {
        if (pendingChanges[key] !== undefined) {
          await fetch('/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key, value: pendingChanges[key] }),
          });
        }
      }
      setPendingChanges(p => {
        const next = { ...p };
        for (const key of keys) delete next[key];
        return next;
      });
      setSaved(s => ({ ...s, [groupId]: true }));
      setTimeout(() => setSaved(s => ({ ...s, [groupId]: false })), 2000);
    } finally {
      setSaving(s => ({ ...s, [groupId]: false }));
    }
  }

  const hasPendingForGroup = (group) =>
    group.settings.some(f => pendingChanges[f.key] !== undefined);

  return (
    <div className="p-6 space-y-5 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-100">Settings</h1>
          <p className="text-xs text-slate-600 mt-0.5">Global bot configuration</p>
        </div>
        <Button variant="ghost" size="sm" onClick={fetchData}>
          <RefreshCw className="h-3.5 w-3.5" />
          Reload
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-48 w-full" />)}
        </div>
      ) : (
        <div className="space-y-4">
          {SETTING_GROUPS.map(group => (
            <div key={group.title} className="space-y-2">
              <SettingGroup
                group={group}
                settings={settings}
                onChange={handleChange}
                saving={saving[group.title]}
                saved={saved[group.title]}
              />
              {hasPendingForGroup(group) && (
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    onClick={() => saveGroupSettings(group)}
                    disabled={saving[group.title]}
                  >
                    <Save className="h-3.5 w-3.5" />
                    {saving[group.title] ? 'Saving…' : `Save ${group.title}`}
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
