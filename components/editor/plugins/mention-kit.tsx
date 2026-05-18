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
        }: {
          search?: string;
          key?: string;
          value: string;
          provider?: AIProvider;
          apiKey?: string;
        }) => {
          editor.tf.insertNodes({
            apiKey,
            children: [{ text: '' }],
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
