'use client';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';

const variantStyles = {
  default:     { background:'#7c3aed', color:'#fff', border:'1px solid #7c3aed' },
  destructive: { background:'rgba(239,68,68,0.1)', color:'#f87171', border:'1px solid rgba(239,68,68,0.25)' },
  outline:     { background:'transparent', color:'#a1a1aa', border:'1px solid #3f3f46' },
  ghost:       { background:'transparent', color:'#71717a', border:'1px solid transparent' },
  success:     { background:'rgba(34,197,94,0.1)', color:'#4ade80', border:'1px solid rgba(34,197,94,0.25)' },
  secondary:   { background:'#1e1e27', color:'#a1a1aa', border:'1px solid #2a2a38' },
};

const sizeStyles = {
  default: { height:32, padding:'0 12px', fontSize:13, gap:6 },
  sm:      { height:28, padding:'0 10px', fontSize:12, gap:5 },
  lg:      { height:40, padding:'0 20px', fontSize:14, gap:8 },
  icon:    { height:32, width:32, padding:0, fontSize:13 },
};

export function Button({ className, variant = 'default', size = 'default', asChild = false, style, ...props }) {
  const Comp = asChild ? Slot : 'button';
  const vs = variantStyles[variant] ?? variantStyles.default;
  const ss = sizeStyles[size] ?? sizeStyles.default;
  return (
    <Comp
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition-all cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50',
        'disabled:pointer-events-none disabled:opacity-40',
        'hover:brightness-110 active:scale-[0.98]',
        className,
      )}
      style={{ ...vs, ...ss, ...style }}
      {...props}
    />
  );
}
