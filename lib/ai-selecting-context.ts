import type { PlateEditor } from 'platejs/react';

import { aiChatPlugin } from '@/components/editor/plugins/ai-chat-plugin';
import { clearContextHighlightBlockIds } from '@/lib/ai-context-block-highlight';

export function clearSelectingContext(editor: PlateEditor) {
  editor.setOption(aiChatPlugin, 'selectingContext', false);
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
    return;
  }

  clearContextHighlightBlockIds(editor);
  stop();
}
