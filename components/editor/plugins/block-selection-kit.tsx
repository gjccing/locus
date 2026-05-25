'use client';

import { BlockSelectionPlugin } from '@platejs/selection/react';
import { getPluginTypes, KEYS } from 'platejs';

import {
  BlockSelection,
  ContextBlockHighlight,
} from '@/components/ui/block-selection';

import { MarkdownCopyPlugin } from '@/components/editor/plugins/markdown-copy-plugin';
import { BlockSelectionCopyFixPlugin } from '@/components/editor/plugins/block-selection-copy-fix';

export const hasSelectableClass = ({
  attributes,
  className,
}: {
  attributes: { className?: string };
  className?: string;
}) =>
  [className, attributes.className]
    .filter(Boolean)
    .join(' ')
    .includes('slate-selectable');

export const BlockSelectionKit = [
  BlockSelectionPlugin.configure(({ editor }) => ({
    options: {
      enableContextMenu: false,
      isSelectable: (element) =>
        !getPluginTypes(editor, [KEYS.column, KEYS.codeLine, KEYS.td]).includes(
          element.type
        ),
      onKeyDownSelecting: () => {},
    },
    render: {
      belowRootNodes: (props) => {
        if (!hasSelectableClass(props)) return null;

        return (
          <>
            <BlockSelection {...(props as any)} />
            <ContextBlockHighlight {...(props as any)} />
          </>
        );
      },
    },
  })),
  BlockSelectionCopyFixPlugin,
  MarkdownCopyPlugin,
];
