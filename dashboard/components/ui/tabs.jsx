'use client';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '@/lib/utils';

export const Tabs = TabsPrimitive.Root;

export function TabsList({ className, ...props }) {
  return (
    <TabsPrimitive.List
      className={cn('inline-flex items-center gap-1 rounded-xl p-1', className)}
      style={{ background: '#17171d', border: '1px solid #2a2a38' }}
      {...props}
    />
  );
}

export function TabsTrigger({ className, children, ...props }) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        'inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-xs font-medium transition-all cursor-pointer select-none',
        'focus-visible:outline-none',
        'data-[state=active]:bg-violet-600/20 data-[state=active]:text-violet-300',
        'data-[state=inactive]:text-zinc-500 data-[state=inactive]:hover:text-zinc-300',
        className,
      )}
      {...props}
    >
      {children}
    </TabsPrimitive.Trigger>
  );
}

export function TabsContent({ className, ...props }) {
  return <TabsPrimitive.Content className={cn('mt-3', className)} {...props} />;
}
