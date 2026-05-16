'use client';

import { AIChatPlugin } from '@platejs/ai/react';
import {
  type PlateElementProps,
  type PlateTextProps,
  PlateElement,
  PlateText,
  usePluginOption,
} from 'platejs/react';

import { cn } from '@/lib/utils';

export function AILeaf(props: PlateTextProps) {
  const streaming = usePluginOption(AIChatPlugin, 'streaming');
  const streamingLeaf = props.editor
    .getApi(AIChatPlugin)
    .aiChat.node({ streaming: true });

  const isLast = streamingLeaf?.[0] === props.text;

  return (
    <PlateText
      className={cn(
        'rounded-sm bg-purple-50/90 text-purple-950',
        'shadow-[inset_0_-2px_0_0] shadow-purple-200/80',
        'transition-[background-color,box-shadow] duration-200 ease-in-out',
        'dark:bg-purple-950/40 dark:text-purple-100 dark:shadow-purple-800/50',
        isLast &&
          streaming &&
          'after:ml-1.5 after:inline-block after:h-3 after:w-3 after:animate-pulse after:rounded-full after:bg-purple-500 after:align-middle after:content-[""] dark:after:bg-purple-400'
      )}
      {...props}
    />
  );
}

export function AIAnchorElement(props: PlateElementProps) {
  return (
    <PlateElement {...props}>
      <div className="h-[0.1px]" />
    </PlateElement>
  );
}
