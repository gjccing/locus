import type { Path, SlateEditor, TMentionElement, TNode } from 'platejs';
import { ElementApi, KEYS } from 'platejs';

import type { AIProvider } from '@/stores/app-store';

export type TMentionElementWithAI = TMentionElement & {
  provider?: AIProvider;
  apiKey?: string;
};

export type MentionAIContext = {
  'model-name': string;
  provider: AIProvider | undefined;
  apikey: string | undefined;
};

export function getMentionAIContext(
  mention: TMentionElementWithAI
): MentionAIContext {
  return {
    'model-name': String(mention.value ?? mention.key ?? ''),
    provider: mention.provider,
    apikey: mention.apiKey,
  };
}

export function findFirstMentionInNode(
  editor: SlateEditor,
  _root: TNode,
  at: Path
): TMentionElementWithAI | undefined {
  const mentionType = editor.getType(KEYS.mention);

  for (const [node] of editor.api.nodes({
    at,
    match: (n) => ElementApi.isElement(n) && n.type === mentionType,
  })) {
    return node as TMentionElementWithAI;
  }

  return undefined;
}

export function findFirstMentionInBlock(
  editor: SlateEditor,
  blockPath: Path
): TMentionElementWithAI | undefined {
  const block = editor.api.node(blockPath);
  if (!block) return undefined;

  return findFirstMentionInNode(editor, block[0], blockPath);
}
