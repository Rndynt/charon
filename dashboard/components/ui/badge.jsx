import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-violet-600/20 text-violet-300 border border-violet-600/30',
        success: 'bg-emerald-600/20 text-emerald-300 border border-emerald-600/30',
        warning: 'bg-amber-600/20 text-amber-300 border border-amber-600/30',
        danger: 'bg-red-600/20 text-red-400 border border-red-600/30',
        muted: 'bg-slate-800 text-slate-400 border border-slate-700',
        outline: 'border border-surface-border text-slate-400',
        blue: 'bg-blue-600/20 text-blue-300 border border-blue-600/30',
        live: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

export function Badge({ className, variant, ...props }) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
