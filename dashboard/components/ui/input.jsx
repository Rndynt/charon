import { cn } from '@/lib/utils';

export function Input({ className, type, ...props }) {
  return (
    <input
      type={type}
      className={cn(
        'flex h-8 w-full rounded-md border border-surface-border bg-surface-DEFAULT px-3 py-1',
        'text-sm text-slate-200 placeholder:text-slate-600',
        'focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    />
  );
}
