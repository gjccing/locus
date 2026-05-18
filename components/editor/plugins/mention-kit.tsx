'use client';

import { MentionInputPlugin, MentionPlugin } from '@platejs/mention/react';

import {
  MentionElement,
  MentionInputElement,
} from '@/components/ui/mention-node';
import type { AIProvider } from '@/stores/app-store';

export const MentionKit = [
  MentionPlugin.configure({
    options: {
      triggerPreviousCharPattern: /^$|^[\s"']$/,
    },
  })
    .extendEditorTransforms(({ editor, type }) => ({
      insert: {
        mention: ({
          key,
          value,
          provider,
          apiKey,
          assistantId,
          instructions,
        }: {
          search?: string;
          key?: string;
          value: string;
          provider?: AIProvider;
          apiKey?: string;
          assistantId?: string;
          instructions?: string;
        }) => {
          editor.tf.insertNodes({
            apiKey,
            assistantId,
            children: [{ text: '' }],
            instructions,
            key: key ?? value,
            provider,
            type,
            value,
          });
        },
      },
    }))
    .withComponent(MentionElement),
  MentionInputPlugin.withComponent(MentionInputElement),
];
