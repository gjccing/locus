import type { PlateEditor } from 'platejs/react';

import { aiChatPlugin } from '@/components/editor/plugins/ai-chat-plugin';

export function clearSelectingContext(editor: PlateEditor) {
  editor.setOption(aiChatPlugin, 'selectingContext', false);
}

export function setSelectingContext(editor: PlateEditor, value: boolean) {
  editor.setOption(aiChatPlugin, 'selectingContext', value);
}

export function isSelectingContext(editor: PlateEditor) {
  return editor.getOption(aiChatPlugin, 'selectingContext');
}

export function stopInsertOrSelectingContext(
  editor: PlateEditor,
  stop: () => void
) {
  if (isSelectingContext(editor)) {
    clearSelectingContext(editor);
    editor.setOption(aiChatPlugin, 'open', false);
    return;
  }

  stop();
}
