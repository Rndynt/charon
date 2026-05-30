import { cn } from '@/lib/utils';

const variants = {
  default:  { bg: 'rgba(139,92,246,0.15)',  color: '#c4b5fd', border: 'rgba(139,92,246,0.3)' },
  success:  { bg: 'rgba(34,197,94,0.12)',   color: '#4ade80', border: 'rgba(34,197,94,0.25)' },
  warning:  { bg: 'rgba(245,158,11,0.12)',  color: '#fbbf24', border: 'rgba(245,158,11,0.25)' },
  danger:   { bg: 'rgba(239,68,68,0.12)',   color: '#f87171', border: 'rgba(239,68,68,0.25)' },
  muted:    { bg: '#1e1e27',                color: '#71717a', border: '#2a2a38' },
  outline:  { bg: 'transparent',            color: '#a1a1aa', border: '#3f3f46' },
  blue:     { bg: 'rgba(59,130,246,0.12)',  color: '#60a5fa', border: 'rgba(59,130,246,0.25)' },
  live:     { bg: 'rgba(34,197,94,0.12)',   color: '#4ade80', border: 'rgba(34,197,94,0.25)' },
};

export function Badge({ className, variant = 'default', style, ...props }) {
  const v = variants[variant] ?? variants.default;
  return (
    <span
      className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', className)}
      style={{ background: v.bg, color: v.color, border: `1px solid ${v.border}`, ...style }}
      {...props}
    />
  );
}
