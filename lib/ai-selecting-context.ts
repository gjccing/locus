import { AIChatPlugin } from '@platejs/ai/react';
import { BlockSelectionPlugin } from '@platejs/selection/react';
import type { TRange } from 'platejs';
import type { PlateEditor } from 'platejs/react';

import { aiChatPlugin } from '@/components/editor/plugins/ai-chat-plugin';
import { clearContextHighlightBlockIds } from '@/lib/ai-context-block-highlight';

function clearMentionAnswerBlockSelection(editor: PlateEditor) {
  if (!editor.getOption(BlockSelectionPlugin, 'isSelectingSome')) return;

  editor.getApi(BlockSelectionPlugin).blockSelection.deselect();
  editor.tf.focus();
}

/** Restore the text cursor saved when a mention answer started. */
export function restoreMentionAnswerTextSelection(editor: PlateEditor) {
  clearMentionAnswerBlockSelection(editor);

  const mentionSelection = editor.getOption(
    aiChatPlugin,
    'mentionAnswerSelection'
  ) as TRange | null;
  const chatSelection = editor.getOption(AIChatPlugin, 'chatSelection') as
    | TRange
    | null;

  const selection = mentionSelection ?? chatSelection;
  if (selection) {
    editor.tf.select(selection);
  }

  editor.tf.focus();
}

function clearAnalyzingMentionKeywords(editor: PlateEditor) {
  editor.setOption(aiChatPlugin, 'analyzingMentionKeywords', false);
}

export function setAnalyzingMentionKeywords(editor: PlateEditor, value: boolean) {
  editor.setOption(aiChatPlugin, 'analyzingMentionKeywords', value);
}

export function clearSelectingContext(editor: PlateEditor) {
  editor.setOption(aiChatPlugin, 'selectingContext', false);
  clearAnalyzingMentionKeywords(editor);
}

export function setSelectingContext(editor: PlateEditor, value: boolean) {
  editor.setOption(aiChatPlugin, 'selectingContext', value);
}

export function isSelectingContext(editor: PlateEditor) {
  return editor.getOption(aiChatPlugin, 'selectingContext');
}

export function abortMentionAnswerSelection(editor: PlateEditor) {
  editor.getOption(aiChatPlugin, 'mentionAnswerAbortController')?.abort();
  editor.setOption(aiChatPlugin, 'mentionAnswerAbortController', null);
}

export function stopInsertOrSelectingContext(
  editor: PlateEditor,
  stop: () => void
) {
  if (isSelectingContext(editor)) {
    abortMentionAnswerSelection(editor);
    clearSelectingContext(editor);
    clearContextHighlightBlockIds(editor);
    editor.setOption(aiChatPlugin, 'open', false);
    restoreMentionAnswerTextSelection(editor);
    return;
  }

  clearContextHighlightBlockIds(editor);

  if (editor.getOption(AIChatPlugin, 'mode') === 'insert') {
    const chat = editor.getOption(AIChatPlugin, 'chat') as
      | { status?: string }
      | undefined;
    const status = chat?.status;
    if (status === 'streaming' || status === 'submitted') {
      editor.setOption(aiChatPlugin, 'insertStreamCancelled', true);
    }
  }

  stop();
  clearMentionAnswerBlockSelection(editor);
}
