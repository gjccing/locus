'use client';

import * as React from 'react';

import cloneDeep from 'lodash/cloneDeep.js';
import { BaseAIPlugin, withAIBatch } from '@platejs/ai';
import {
  AIChatPlugin,
  AIPlugin,
  applyAISuggestions,
  getInsertPreviewStart,
  streamInsertChunk,
  useChatChunk,
} from '@platejs/ai/react';
import { ElementApi, getPluginType, KEYS, PathApi, type Path } from 'platejs';
import { type PlateEditor, usePluginOption } from 'platejs/react';

import { AILoadingBar } from '@/components/ui/ai-loading-bar';
import { AIAnchorElement, AILeaf } from '@/components/ui/ai-node';
import { clearSelectingContext } from '@/lib/ai-selecting-context';
import { clearContextHighlightBlockIds } from '@/lib/ai-context-block-highlight';
import {
  blockMentionAnswerInputIfBusy,
  isMentionAnswerBusy,
  stopMentionAnswer,
} from '@/lib/mention-answer';

import { useChat } from '../use-chat';
import { aiChatPlugin } from './ai-chat-plugin';
import { CursorOverlayKit } from './cursor-overlay-kit';
import { MarkdownKit } from './markdown-kit';

const insertStreamStartPathByEditor = new WeakMap<PlateEditor, Path>();

function indentAIResponseBlocks(
  editor: PlateEditor,
  streamBlockPath: Path | null
) {
  const endIndex = streamBlockPath?.[0];
  if (endIndex === undefined || endIndex < 0) return;

  const startPath = insertStreamStartPathByEditor.get(editor);
  const startIndex = startPath?.[0] ?? endIndex;

  const mentionEntry = editor.api.node([Math.max(0, startIndex - 1)]);
  let targetIndent = 1;

  if (mentionEntry && ElementApi.isElement(mentionEntry[0])) {
    const mentionIndent =
      typeof mentionEntry[0].indent === 'number' ? mentionEntry[0].indent : 0;
    targetIndent = Math.min(mentionIndent + 1, 9);
  }

  const aiChatType = getPluginType(editor, KEYS.aiChat);

  editor.tf.withoutNormalizing(() => {
    for (let i = startIndex; i <= endIndex; i++) {
      const entry = editor.api.node([i]);
      if (!entry || !ElementApi.isElement(entry[0])) continue;
      if (entry[0].type === aiChatType) continue;

      editor.tf.setNodes({ indent: targetIndent }, { at: [i] });
    }
  });

  insertStreamStartPathByEditor.delete(editor);
}

function focusBlockBelowAIResponse(
  editor: PlateEditor,
  streamBlockPath: Path | null
) {
  const streamRootIndex = streamBlockPath?.[0];
  if (streamRootIndex === undefined || streamRootIndex < 0) return;

  const belowIndex = streamRootIndex + 1;
  const belowPath: Path = [belowIndex];

  if (!editor.api.node(belowPath)) {
    editor.tf.insertNodes(
      {
        children: [{ text: '' }],
        type: editor.getType(KEYS.p),
      },
      { at: belowPath }
    );
  }

  const start = editor.api.start(belowPath);
  if (!start) return;

  editor.tf.select({ anchor: start, focus: start });
  editor.tf.focus();
  editor.api.scrollIntoView(start, {
    block: 'center',
    behavior: 'smooth',
  });
}

/** Undo partial insert streaming when the AI request fails. */
export function rollbackInsertStreamOnError(editor: PlateEditor) {
  insertStreamStartPathByEditor.delete(editor);
  editor.setOption(AIChatPlugin, 'streaming', false);
  editor.setOption(AIChatPlugin, '_blockPath', null);
  editor.setOption(AIChatPlugin, '_blockChunks', '');

  const ai = editor.getTransforms(BaseAIPlugin).ai;

  if (ai.hasPreview()) {
    ai.cancelPreview();
  }

  ai.undo();
  editor.getTransforms(AIChatPlugin).aiChat.removeAnchor();

  const chatSelection = editor.getOption(AIChatPlugin, 'chatSelection') as
    | { anchor: { path: Path; offset: number }; focus: { path: Path; offset: number } }
    | null;
  if (chatSelection) {
    editor.tf.select(chatSelection);
    editor.tf.focus();
  }

  editor.setOption(AIChatPlugin, 'open', false);
  clearSelectingContext(editor);
  clearContextHighlightBlockIds(editor);
}

/** Commit streamed insert text to the document (do not undo on finish). */
function finalizeInsertStream(editor: PlateEditor) {
  const streamBlockPath = editor.getOption(AIChatPlugin, '_blockPath') as
    | Path
    | null;

  const ai = editor.getTransforms(BaseAIPlugin).ai;

  ai.acceptPreview();
  ai.removeMarks();
  editor.getTransforms(AIChatPlugin).aiChat.removeAnchor();
  editor.setOption(AIChatPlugin, 'open', false);
  clearContextHighlightBlockIds(editor);

  indentAIResponseBlocks(editor, streamBlockPath);
  focusBlockBelowAIResponse(editor, streamBlockPath);
}

export const aiChatPluginWithHooks = aiChatPlugin.extend({
  handlers: {
    onBeforeInput: blockMentionAnswerInputIfBusy,
    onClick: blockMentionAnswerInputIfBusy,
    onCompositionStart: blockMentionAnswerInputIfBusy,
    onCut: blockMentionAnswerInputIfBusy,
    onDOMBeforeInput: blockMentionAnswerInputIfBusy,
    onDragStart: blockMentionAnswerInputIfBusy,
    onDrop: blockMentionAnswerInputIfBusy,
    onKeyDown: blockMentionAnswerInputIfBusy,
    onMouseDown: blockMentionAnswerInputIfBusy,
    onPaste: blockMentionAnswerInputIfBusy,
  },
  render: {
    afterContainer: AILoadingBar,
    node: AIAnchorElement,
  },
  useHooks: ({ editor, getOption }) => {
    useChat();

    React.useEffect(() => {
      const onKeyDownCapture = (event: KeyboardEvent) => {
        if (event.key !== 'Escape') return;
        if (!isMentionAnswerBusy(editor)) return;

        event.preventDefault();
        event.stopImmediatePropagation();
        stopMentionAnswer(editor);
      };

      document.addEventListener('keydown', onKeyDownCapture, true);
      return () =>
        document.removeEventListener('keydown', onKeyDownCapture, true);
    }, [editor]);

    const mode = usePluginOption(AIChatPlugin, 'mode');
    const toolName = usePluginOption(AIChatPlugin, 'toolName');
    useChatChunk({
      onChunk: ({ chunk, isFirst, nodes, text: content }) => {
        if (isFirst && mode === 'insert') {
          const { path, startBlock, startInEmptyParagraph } =
            getInsertPreviewStart(editor);

          insertStreamStartPathByEditor.set(editor, path);

          editor.getTransforms(BaseAIPlugin).ai.beginPreview({
            originalBlocks:
              startInEmptyParagraph &&
              startBlock &&
              ElementApi.isElement(startBlock)
                ? [cloneDeep(startBlock)]
                : [],
          });

          editor.tf.withoutSaving(() => {
            editor.tf.insertNodes(
              {
                children: [{ text: '' }],
                type: getPluginType(editor, KEYS.aiChat),
              },
              {
                at: PathApi.next(editor.selection!.focus.path.slice(0, 1)),
              }
            );
          });
          // Keep AI marks during insert streaming (withAIChat strips them when open is false).
          editor.setOption(AIChatPlugin, 'open', true);
          editor.setOption(AIChatPlugin, 'streaming', true);
        }

        if (mode === 'insert' && nodes.length > 0) {
          editor.tf.withoutSaving(() => {
            if (!getOption('streaming')) return;

            editor.tf.withScrolling(() => {
              streamInsertChunk(editor, chunk, {
                textProps: {
                  [getPluginType(editor, KEYS.ai)]: true,
                },
              });
            });
          });
        }

        if (toolName === 'edit' && mode === 'chat') {
          withAIBatch(
            editor,
            () => {
              applyAISuggestions(editor, content);
            },
            {
              split: isFirst,
            }
          );
        }
      },
      onFinish: () => {
        const chat = editor.getOption(AIChatPlugin, 'chat');
        const cancelled = editor.getOption(
          aiChatPlugin,
          'insertStreamCancelled'
        );

        if (cancelled) {
          editor.setOption(aiChatPlugin, 'insertStreamCancelled', false);
          rollbackInsertStreamOnError(editor);
          return;
        }

        const failed = chat?.status === 'error';

        if (failed) {
          if (editor.getOption(AIChatPlugin, 'mode') === 'insert') {
            rollbackInsertStreamOnError(editor);
          }
          editor.getApi(AIChatPlugin).aiChat.stop();
          return;
        }

        if (editor.getOption(AIChatPlugin, 'mode') === 'insert') {
          finalizeInsertStream(editor);
        }

        editor.getApi(AIChatPlugin).aiChat.stop();
      },
    });
  },
});

export const AIKit = [
  ...CursorOverlayKit,
  ...MarkdownKit,
  AIPlugin.withComponent(AILeaf),
  aiChatPluginWithHooks,
];

/** AI chat + streaming without duplicating MarkdownKit (for ContextEditorKit). */
export const ContextAIKit = [
  ...CursorOverlayKit,
  AIPlugin.withComponent(AILeaf),
  aiChatPluginWithHooks,
];

export { aiChatPlugin } from './ai-chat-plugin';
