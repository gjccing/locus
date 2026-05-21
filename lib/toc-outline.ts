import type { Heading } from '@platejs/toc';
import { isHeading } from '@platejs/toc';
import {
  ElementApi,
  NodeApi,
  PathApi,
  type Path,
  type SlateEditor,
} from 'platejs';

import {
  findLastMentionInBlock,
  getMentionAIContext,
  type TMentionElementWithAI,
} from '@/lib/mention-ai-context';

/** Max mini-bar count in the right rail. */
export const TOC_MAX_BARS = 24;

/** Truncation length for block preview in the hover panel. */
export const TOC_PREVIEW_MAX_LEN = 48;

export type TocOutlineKind = 'heading' | 'mention';

export type TocOutlineItem = Heading & {
  kind: TocOutlineKind;
  preview: string;
};

const headingDepth: Record<string, number> = {
  h1: 1,
  h2: 2,
  h3: 3,
  h4: 4,
  h5: 5,
  h6: 6,
};

/** Mention blocks use a fixed visual depth between h3 and h4. */
const MENTION_BAR_DEPTH = 4;

export function tocPathToId(path: Path): string {
  return `toc-${path.join('-')}`;
}

function resolveItemId(node: unknown, path: Path): string {
  const id =
    node &&
    typeof node === 'object' &&
    'id' in node &&
    typeof (node as { id?: unknown }).id === 'string'
      ? (node as { id: string }).id
      : undefined;
  return id ?? tocPathToId(path);
}

function truncatePreview(text: string, max = TOC_PREVIEW_MAX_LEN): string {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (normalized.length <= max) return normalized;
  return `${normalized.slice(0, max)}…`;
}

function hasModelMention(mention: TMentionElementWithAI): boolean {
  if (mention.provider) return true;
  const key = String(mention.key ?? '');
  if (key && key !== 'mention') return true;
  const value = String(mention.value ?? '');
  return value.includes('/') || value.includes('.');
}

function isModelMentionBlock(editor: SlateEditor, path: Path): boolean {
  const mention = findLastMentionInBlock(editor, path);
  if (!mention) return false;
  return hasModelMention(mention);
}

function getBlockPreview(editor: SlateEditor, path: Path): string {
  const entry = editor.api.node(path);
  if (!entry) return '';
  return truncatePreview(NodeApi.string(entry[0]));
}

export function isTocModelMentionBlock(
  editor: SlateEditor,
  path: Path
): boolean {
  return isModelMentionBlock(editor, path);
}

export function queryTocOutline(editor: SlateEditor): TocOutlineItem[] {
  const items: TocOutlineItem[] = [];

  const blocks = editor.api.nodes({
    at: [],
    match: (n) => ElementApi.isElement(n) && editor.api.isBlock(n),
  });

  if (!blocks) return items;

  for (const [node, path] of blocks) {
    if (isHeading(node)) {
      const title = NodeApi.string(node).trim();
      if (!title) continue;

      items.push({
        depth: headingDepth[node.type as string] ?? 1,
        id: resolveItemId(node, path),
        kind: 'heading',
        path,
        preview: truncatePreview(title),
        title,
        type: node.type as string,
      });
      continue;
    }

    if (!isModelMentionBlock(editor, path)) continue;

    const mention = findLastMentionInBlock(editor, path)!;
    const modelName = getMentionAIContext(mention)['model-name'];
    const preview = getBlockPreview(editor, path);

    items.push({
      depth: MENTION_BAR_DEPTH,
      id: resolveItemId(node, path),
      kind: 'mention',
      path,
      preview: preview || modelName,
      title: modelName,
      type: 'mention-block',
    });
  }

  return items.sort((a, b) => PathApi.compare(a.path, b.path));
}

export type TocBarSample<T> = {
  item: T;
  /** Index in the full outline list. */
  index: number;
};

/** Evenly sample outline items for the mini-bar rail. */
export function sampleTocBars<T>(items: T[], max: number): TocBarSample<T>[] {
  if (items.length === 0) return [];
  if (items.length <= max) {
    return items.map((item, index) => ({ item, index }));
  }

  const samples: TocBarSample<T>[] = [];
  const last = items.length - 1;

  for (let i = 0; i < max; i++) {
    const index = Math.round((i / (max - 1)) * last);
    samples.push({ item: items[index]!, index });
  }

  return samples;
}

/** Bar width (px) from heading depth or mention kind. */
export function tocBarWidthPx(item: Pick<TocOutlineItem, 'depth' | 'kind'>): number {
  if (item.kind === 'mention') return 14;
  const widths: Record<number, number> = {
    1: 28,
    2: 22,
    3: 18,
    4: 14,
    5: 11,
    6: 9,
  };
  return widths[item.depth] ?? 12;
}
