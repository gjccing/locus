import { AIChatPlugin } from '@platejs/ai/react';
import { serializeMd } from '@platejs/markdown';
import { PathApi, type Path } from 'platejs';
import type { PlateEditor } from 'platejs/react';

import {
  findLastMentionInBlock,
  type MentionAIContext,
} from '@/lib/mention-ai-context';

export function getBlocksAbovePathMarkdown(
  editor: PlateEditor,
  beforePath: Path
) {
  const endIndex = beforePath[0];
  if (endIndex < 0) return '';

  return serializeMd(editor, {
    value: editor.children.slice(0, endIndex + 1),
  });
}

export function triggerMentionContinueWriting(
  editor: PlateEditor,
  mentionContext: MentionAIContext
) {
  const { apikey, 'model-name': modelName } = mentionContext;
  if (!apikey?.trim() || !modelName.trim()) return;

  const block = editor.api.block();
  if (!block) return;

  const [, newPath] = block;
  const prevPath = PathApi.previous(newPath);
  if (!prevPath) return;

  if (!findLastMentionInBlock(editor, prevPath)) return;

  const contextMd = getBlocksAbovePathMarkdown(editor, prevPath);
  const prompt = contextMd.trim()
    ? `Continue writing after the content below. Write only the next part. Do not repeat existing text.

<Document>
${contextMd}
</Document>`
    : `Start writing a new paragraph. Write only the next part.

<Document>
</Document>`;

  // open must be true before submit so withAIChat does not strip ai marks on normalize.
  editor.setOption(AIChatPlugin, 'open', true);

  void editor.getApi(AIChatPlugin).aiChat.submit('', {
    mode: 'insert',
    toolName: 'generate',
    prompt,
    options: {
      body: {
        apiKey: apikey,
        model: modelName,
        provider: mentionContext.provider,
      },
    },
  });
}
