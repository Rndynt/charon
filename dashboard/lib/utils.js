import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatSol(value, decimals = 4) {
  if (value == null || isNaN(value)) return '—';
  return `${Number(value).toFixed(decimals)} SOL`;
}

export function formatUsd(value) {
  if (value == null || isNaN(value)) return '—';
  const n = Number(value);
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(2)}`;
}

export function formatPct(value, showSign = true) {
  if (value == null || isNaN(value)) return '—';
  const n = Number(value);
  const sign = showSign && n > 0 ? '+' : '';
  return `${sign}${n.toFixed(2)}%`;
}

export function formatAge(ms) {
  if (!ms) return '—';
  const diff = Date.now() - Number(ms);
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ${m % 60}m`;
  return `${Math.floor(h / 24)}d`;
}

export function formatDuration(startMs, endMs) {
  const end = endMs ? Number(endMs) : Date.now();
  return formatAge(Number(startMs) + (Date.now() - end));
}

export function shortMint(mint) {
  if (!mint) return '—';
  return `${mint.slice(0, 4)}…${mint.slice(-4)}`;
}

export function solscanUrl(mint) {
  return `https://solscan.io/token/${mint}`;
}
