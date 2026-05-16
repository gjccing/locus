'use client';

import {
  createSlatePlugin,
  defineInputRule,
  PathApi,
  type Path,
  type SlateEditor,
} from 'platejs';

import {
  findLastMentionInBlock,
  getMentionAIContext,
  type MentionAIContext,
} from '@/lib/mention-ai-context';
import { triggerMentionContinueWriting } from '@/lib/mention-continue-writing';
import type { PlateEditor } from 'platejs/react';

function willCreateBlockBelow(editor: SlateEditor, blockPath: Path) {
  if (!editor.selection || !editor.api.isCollapsed()) return false;

  if (editor.api.isEnd(editor.selection.focus, blockPath)) return true;

  return (
    !editor.api.isAt({ start: true }) && !editor.api.isAt({ end: true })
  );
}

/**
 * When Enter creates a new block under a block with @mention, stream continue
 * writing into the new block using the mention's model and API key.
 */
export const MentionBelowContinueWritingPlugin = createSlatePlugin({
  key: 'mentionBelowContinueWriting',
  inputRules: [
    defineInputRule({
      priority: 1,
      target: 'insertBreak',
      enabled: (ctx) => ctx.isCollapsed,
      resolve: (ctx) => {
        const { editor, getBlockEntry } = ctx;
        if (!editor.selection) return;

        const blockEntry = getBlockEntry();
        if (!blockEntry) return;
        const [, blockPath] = blockEntry;

        if (!willCreateBlockBelow(editor, blockPath)) return;

        const mention = findLastMentionInBlock(editor, blockPath);
        if (!mention) return;

        return getMentionAIContext(mention);
      },
      apply: (ctx, match) => {
        if (!match || typeof match !== 'object' || !('model-name' in match)) {
          return false;
        }

        const context = match as MentionAIContext;

        queueMicrotask(() => {
          const block = ctx.editor.api.block();
          if (!block) return;

          const [, newPath] = block;
          const prevPath = PathApi.previous(newPath);
          if (!prevPath) return;

          if (!findLastMentionInBlock(ctx.editor, prevPath)) return;

          triggerMentionContinueWriting(ctx.editor as PlateEditor, context);
        });

        return false;
      },
    }),
  ],
});
