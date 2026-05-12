import { db } from './connection.js';

export function setting(key, fallback = '') {
  return db.prepare('SELECT value FROM settings WHERE key = ?').get(key)?.value ?? fallback;
}

export function setSetting(key, value) {
  db.prepare(`
    INSERT INTO settings (key, value) VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `).run(key, String(value));
}

export function boolSetting(key, fallback = false) {
  const value = setting(key, fallback ? 'true' : 'false');
  return value === 'true' || value === '1' || value === 'yes';
}

export function numSetting(key, fallback = 0) {
  const value = Number(setting(key, String(fallback)));
  return Number.isFinite(value) ? value : fallback;
}

const strategyCache = { id: null, config: null, at: 0 };

export function activeStrategy() {
  if (strategyCache.config && Date.now() - strategyCache.at < 5000) return strategyCache.config;
  const row = db.prepare('SELECT * FROM strategies WHERE enabled = 1 LIMIT 1').get();
  if (!row) {
    const fallback = strategyById('sniper');
    if (fallback) return fallback;
    return defaultStrategy();
  }
  const baseConfig = { id: row.id, name: row.name, ...JSON.parse(row.config_json) };
  const config = applyRegimeTuning(baseConfig);
  strategyCache.id = row.id;
  strategyCache.config = config;
  strategyCache.at = Date.now();
  return config;
}

function applyRegimeTuning(strategy) {
  if (!boolSetting('regime_auto_tune_enabled', true)) return strategy;
  const lookbackMs = Math.max(60_000, numSetting('regime_lookback_ms', 6 * 60 * 60 * 1000));
  const cutoff = Date.now() - lookbackMs;
  const stats = db.prepare(`
    SELECT
      COUNT(*) AS total,
      SUM(CASE WHEN pnl_percent > 0 THEN 1 ELSE 0 END) AS wins,
      AVG(ABS(COALESCE(pnl_percent, 0))) AS avg_abs_pnl
    FROM dry_run_positions
    WHERE status = 'closed' AND closed_at_ms >= ?
  `).get(cutoff);
  const total = Number(stats?.total || 0);
  if (total < Math.max(3, numSetting('regime_min_closed_positions', 4))) return strategy;
  const winRate = total > 0 ? Number(stats?.wins || 0) / total : 0;
  const volatility = Number(stats?.avg_abs_pnl || 0);
  const next = { ...strategy };

  if (winRate < 0.35 || volatility >= 35) {
    next.tp_percent = Math.max(25, Number(strategy.tp_percent || 50) * 0.75);
    next.sl_percent = Math.min(-12, Number(strategy.sl_percent || -25) * 0.75);
    next.min_source_count = Math.max(1, Number(strategy.min_source_count || 2) - 1);
    next.llm_min_confidence = Math.max(45, Number(strategy.llm_min_confidence || 60) - 5);
    next.position_size_sol = Number(strategy.position_size_sol || 0.1) * 0.8;
  } else if (winRate > 0.6 && volatility <= 20) {
    next.tp_percent = Number(strategy.tp_percent || 50) * 1.1;
    next.sl_percent = Number(strategy.sl_percent || -25) * 0.95;
    next.llm_min_confidence = Math.min(90, Number(strategy.llm_min_confidence || 60) + 5);
  }
  return next;
}

export function strategyById(id) {
  const row = db.prepare('SELECT * FROM strategies WHERE id = ?').get(id);
  if (!row) return null;
  return { id: row.id, name: row.name, ...JSON.parse(row.config_json) };
}

export function allStrategies() {
  return db.prepare('SELECT * FROM strategies ORDER BY id').all().map(row => ({
    id: row.id,
    name: row.name,
    enabled: Boolean(row.enabled),
    ...JSON.parse(row.config_json),
  }));
}

export function setActiveStrategy(id) {
  db.prepare('UPDATE strategies SET enabled = 0').run();
  db.prepare('UPDATE strategies SET enabled = 1 WHERE id = ?').run(id);
  strategyCache.config = null;
  strategyCache.at = 0;
}

export function updateStrategyConfig(id, config) {
  db.prepare('UPDATE strategies SET config_json = ? WHERE id = ?').run(JSON.stringify(config), id);
  if (strategyCache.id === id) {
    strategyCache.config = null;
    strategyCache.at = 0;
  }
}

export function strategySetting(key, fallback) {
  const strat = activeStrategy();
  if (strat[key] !== undefined && strat[key] !== null) return strat[key];
  return numSetting(key, fallback);
}

function defaultStrategy() {
  return {
    id: 'sniper', name: 'Sniper',
    entry_mode: 'immediate', min_source_count: 2, require_fee_claim: true,
    token_age_max_ms: 3600000, min_mcap_usd: 7000, max_mcap_usd: 200000,
    min_fee_claim_sol: 0.5, min_gmgn_total_fee_sol: 10, min_holders: 0,
    max_top20_holder_percent: 100, min_saved_wallet_holders: 0, max_ath_distance_pct: 0,
    min_graduated_volume_usd: 0, trending_min_volume_usd: 0, trending_min_swaps: 0,
    trending_max_rug_ratio: 0.3, trending_max_bundler_rate: 0.5,
    position_size_sol: 0.1, max_open_positions: 3,
    tp_percent: 50, sl_percent: -25, trailing_enabled: true, trailing_percent: 20,
    partial_tp: false, partial_tp_at_percent: 0, partial_tp_sell_percent: 0,
    max_hold_ms: 0, use_llm: true, llm_min_confidence: 50,
  };
}
