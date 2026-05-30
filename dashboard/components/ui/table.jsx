import { cn } from '@/lib/utils';

export function Table({ className, ...props }) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={cn('w-full caption-bottom text-sm', className)} {...props} />
    </div>
  );
}

export function TableHeader({ className, ...props }) {
  return <thead className={className} {...props} />;
}

export function TableBody({ className, ...props }) {
  return <tbody className={className} {...props} />;
}

export function TableRow({ className, style, ...props }) {
  return (
    <tr
      className={cn('transition-colors border-b cursor-default', className)}
      style={{ borderColor: '#2a2a38', ...style }}
      onMouseEnter={e => { if (!e.currentTarget.dataset.noHover) e.currentTarget.style.background = '#1a1a23'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
      {...props}
    />
  );
}

export function TableHead({ className, ...props }) {
  return (
    <th
      className={cn('h-9 px-3 text-left align-middle font-semibold text-xs uppercase tracking-wider whitespace-nowrap', className)}
      style={{ color: '#4a4a6a', borderBottom: '1px solid #2a2a38' }}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }) {
  return (
    <td className={cn('px-3 py-2.5 align-middle', className)} style={{ color: '#c4c4d8' }} {...props} />
  );
}
