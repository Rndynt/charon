import { cn } from '@/lib/utils';

export function Label({ className, ...props }) {
  return (
    <label
      className={cn('text-sm font-medium leading-none', className)}
      style={{ color: '#a1a1aa' }}
      {...props}
    />
  );
}
