import { cn } from '@/lib/utils';

export function Card({ className, ...props }) {
  return (
    <div
      className={cn('rounded-xl border', className)}
      style={{ background: '#17171d', borderColor: '#2a2a38' }}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }) {
  return <div className={cn('flex flex-col gap-1 p-4 pb-3', className)} {...props} />;
}

export function CardTitle({ className, ...props }) {
  return (
    <h3
      className={cn('text-sm font-semibold leading-none', className)}
      style={{ color: '#e4e4f0' }}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }) {
  return <p className={cn('text-xs', className)} style={{ color: '#71717a' }} {...props} />;
}

export function CardContent({ className, ...props }) {
  return <div className={cn('p-4 pt-0', className)} {...props} />;
}

export function CardFooter({ className, ...props }) {
  return <div className={cn('flex items-center p-4 pt-0', className)} {...props} />;
}
