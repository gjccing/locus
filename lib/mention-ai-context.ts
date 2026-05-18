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

export function findLastMentionInNode(
  editor: SlateEditor,
  _root: TNode,
  at: Path
): TMentionElementWithAI | undefined {
  const mentionType = editor.getType(KEYS.mention);
  let last: TMentionElementWithAI | undefined;

  for (const [node] of editor.api.nodes({
    at,
    match: (n) => ElementApi.isElement(n) && n.type === mentionType,
  })) {
    last = node as TMentionElementWithAI;
  }

  return last;
}

export function findLastMentionInBlock(
  editor: SlateEditor,
  blockPath: Path
): TMentionElementWithAI | undefined {
  const block = editor.api.node(blockPath);
  if (!block) return undefined;

  return findLastMentionInNode(editor, block[0], blockPath);
}
