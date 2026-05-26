'use client';

import * as React from 'react';

import { DndPlugin } from '@platejs/dnd';
import { useBlockSelected } from '@platejs/selection/react';
import { cva } from 'class-variance-authority';
import { type PlateElementProps, usePluginOption } from 'platejs/react';

import { aiChatPlugin } from '@/components/editor/plugins/ai-chat-plugin';

export const blockSelectionVariants = cva(
  'pointer-events-none absolute inset-0 z-1 bg-brand/[.13] transition-opacity',
  {
    defaultVariants: {
      active: true,
    },
    variants: {
      active: {
        false: 'opacity-0',
        true: 'opacity-100',
      },
    },
  }
);

export function BlockSelection(props: PlateElementProps) {
  const isBlockSelected = useBlockSelected();
  const isDragging = usePluginOption(DndPlugin, 'isDragging');

  if (
    !isBlockSelected ||
    props.plugin.key === 'tr' ||
    props.plugin.key === 'table'
  )
    return null;

  return (
    <div
      className={blockSelectionVariants({
        active: isBlockSelected && !isDragging,
      })}
      data-slot="block-selection"
    />
  );
}

export const contextBlockHighlightVariants = cva(
  'pointer-events-none absolute inset-0 z-1 ring-1 ring-inset transition-opacity',
  {
    defaultVariants: {
      active: true,
      variant: 'fixed',
    },
    variants: {
      active: {
        false: 'opacity-0',
        true: 'opacity-100',
      },
      variant: {
        fixed: 'bg-brand/15 ring-brand/30',
        keyword: 'bg-highlight/20 ring-highlight/35',
      },
    },
  }
);

export function ContextBlockHighlight(props: PlateElementProps) {
  const fixedBlockIds = usePluginOption(
    aiChatPlugin,
    'contextFixedHighlightBlockIds'
  );
  const keywordBlockIds = usePluginOption(
    aiChatPlugin,
    'contextKeywordHighlightBlockIds'
  );
  const isDragging = usePluginOption(DndPlugin, 'isDragging');
  const blockId = props.element.id as string | undefined;

  if (
    !blockId ||
    props.plugin.key === 'tr' ||
    props.plugin.key === 'table'
  ) {
    return null;
  }

  const variant = fixedBlockIds.includes(blockId)
    ? 'fixed'
    : keywordBlockIds.includes(blockId)
      ? 'keyword'
      : null;

  if (!variant) {
    return null;
  }

  return (
    <div
      className={contextBlockHighlightVariants({
        active: !isDragging,
        variant,
      })}
      data-slot="context-block-highlight"
      data-context-highlight={variant}
    />
  );
}
