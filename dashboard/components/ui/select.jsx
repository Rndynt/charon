'use client';
import * as SelectPrimitive from '@radix-ui/react-select';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Select = SelectPrimitive.Root;
export const SelectGroup = SelectPrimitive.Group;
export const SelectValue = SelectPrimitive.Value;

export function SelectTrigger({ className, children, style, ...props }) {
  return (
    <SelectPrimitive.Trigger
      className={cn(
        'flex items-center justify-between rounded-lg px-3 text-sm gap-2',
        'focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
        'cursor-pointer',
        className,
      )}
      style={{
        height: 34,
        background: '#0f0f13',
        color: '#e4e4f0',
        border: '1px solid #3f3f46',
        minWidth: 120,
        ...style,
      }}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown size={14} color="#71717a" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

export function SelectContent({ className, children, position = 'popper', ...props }) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        className={cn(
          'relative z-[100] min-w-[8rem] overflow-hidden rounded-lg shadow-xl',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          className,
        )}
        style={{
          background: '#17171d',
          border: '1px solid #3f3f46',
          marginTop: 4,
        }}
        position={position}
        {...props}
      >
        <SelectPrimitive.Viewport className="p-1">{children}</SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

export function SelectItem({ className, children, ...props }) {
  return (
    <SelectPrimitive.Item
      className={cn(
        'relative flex w-full cursor-pointer select-none items-center rounded-md py-1.5 pl-8 pr-3 text-sm',
        'outline-none transition-colors',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        className,
      )}
      style={{ color: '#d4d4e8' }}
      onMouseEnter={e => { e.currentTarget.style.background = '#1e1e27'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check size={13} color="#a78bfa" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

export function SelectLabel({ className, ...props }) {
  return (
    <SelectPrimitive.Label
      className={cn('py-1.5 pl-8 pr-2 text-xs font-semibold', className)}
      style={{ color: '#52525b' }}
      {...props}
    />
  );
}
