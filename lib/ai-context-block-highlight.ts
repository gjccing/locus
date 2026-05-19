import type { PlateEditor } from 'platejs/react';

import { aiChatPlugin } from '@/components/editor/plugins/ai-chat-plugin';

export function setContextHighlightBlockIds(
  editor: PlateEditor,
  blockIds: string[]
) {
  editor.setOption(aiChatPlugin, 'contextHighlightBlockIds', blockIds);
}

export function clearContextHighlightBlockIds(editor: PlateEditor) {
  editor.setOption(aiChatPlugin, 'contextHighlightBlockIds', []);
}
