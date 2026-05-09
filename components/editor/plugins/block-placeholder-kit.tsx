'use client';

import { KEYS } from 'platejs';
import { BlockPlaceholderPlugin } from 'platejs/react';

/**
 * Slate `PlateContent` placeholder when the document is a single empty block.
 * {@link BlockPlaceholderPlugin} only decorates empty blocks once the doc has more than one block.
 */
export const CONTEXT_EDITOR_PLACEHOLDER =
  "Write, or type '/' for blocks, '@' to mention…";

export const BlockPlaceholderKit = [
  BlockPlaceholderPlugin.configure({
    options: {
      className:
        'before:absolute before:cursor-text before:text-muted-foreground/80 before:content-[attr(placeholder)]',
      placeholders: {
        [KEYS.p]: CONTEXT_EDITOR_PLACEHOLDER,
      },
      query: ({ path }) => path.length === 1,
    },
  }),
];
