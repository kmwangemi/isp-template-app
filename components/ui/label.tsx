'use client'

import * as React from 'react'
import * as LabelPrimitive from '@radix-ui/react-label'

import { cn } from '@/lib/utils'

function formatLabelChildren(children: React.ReactNode): React.ReactNode {
  if (typeof children === 'string' && children.includes('*')) {
    const parts = children.split('*');
    return (
      <>
        {parts.map((part, index) => (
          <React.Fragment key={index}>
            {part}
            {index < parts.length - 1 && (
              <span className="text-destructive font-bold ml-0.5">*</span>
            )}
          </React.Fragment>
        ))}
      </>
    );
  }
  return children;
}

function Label({
  className,
  children,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        'flex items-center gap-1 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
        className,
      )}
      {...props}
    >
      {formatLabelChildren(children)}
    </LabelPrimitive.Root>
  )
}

export { Label }
