import { cn } from '@/lib/utils';

export function Input({ className, type, style, ...props }) {
  return (
    <input
      type={type}
      className={cn(
        'flex w-full rounded-lg px-3 py-1.5 text-sm transition-colors',
        'placeholder:text-zinc-600',
        'focus:outline-none',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      style={{
        height: 34,
        background: '#0f0f13',
        color: '#e4e4f0',
        border: '1px solid #3f3f46',
        ...style,
      }}
      onFocus={e => { e.target.style.borderColor = '#7c3aed'; e.target.style.boxShadow = '0 0 0 2px rgba(124,58,237,0.15)'; }}
      onBlur={e => { e.target.style.borderColor = '#3f3f46'; e.target.style.boxShadow = 'none'; }}
      {...props}
    />
  );
}
