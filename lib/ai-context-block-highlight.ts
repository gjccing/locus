import type { PlateEditor } from 'platejs/react';

import { aiChatPlugin } from '@/components/editor/plugins/ai-chat-plugin';

export function setContextFixedHighlightBlockIds(
  editor: PlateEditor,
  blockIds: string[]
) {
  editor.setOption(aiChatPlugin, 'contextFixedHighlightBlockIds', blockIds);
}

export function setContextKeywordHighlightBlockIds(
  editor: PlateEditor,
  blockIds: string[]
) {
  editor.setOption(aiChatPlugin, 'contextKeywordHighlightBlockIds', blockIds);
}

export function clearContextHighlightBlockIds(editor: PlateEditor) {
  editor.setOption(aiChatPlugin, 'contextFixedHighlightBlockIds', []);
  editor.setOption(aiChatPlugin, 'contextKeywordHighlightBlockIds', []);
}

export function hasContextHighlight(editor: PlateEditor) {
  return (
    editor.getOption(aiChatPlugin, 'contextFixedHighlightBlockIds').length > 0 ||
    editor.getOption(aiChatPlugin, 'contextKeywordHighlightBlockIds').length > 0
  );
}
