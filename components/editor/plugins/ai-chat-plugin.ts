'use client';

import { AIChatPlugin } from '@platejs/ai/react';

export const aiChatPlugin = AIChatPlugin.extend({
  options: {
    selectingContext: false,
    contextHighlightBlockIds: [] as string[],
    chatOptions: {
      api: '/api/ai/command',
      body: {},
    },
  },
});
