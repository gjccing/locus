'use client';

import { AIChatPlugin } from '@platejs/ai/react';
import type { TRange } from 'platejs';

export const aiChatPlugin = AIChatPlugin.extend({
  options: {
    selectingContext: false,
    analyzingMentionKeywords: false,
    mentionAnswerAbortController: null as AbortController | null,
    mentionAnswerSelection: null as TRange | null,
    insertStreamCancelled: false,
    contextFixedHighlightBlockIds: [] as string[],
    contextKeywordHighlightBlockIds: [] as string[],
    chatOptions: {
      api: '/api/ai/command',
      body: {},
    },
  },
});
