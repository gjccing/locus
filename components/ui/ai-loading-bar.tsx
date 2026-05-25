'use client';

import { AIChatPlugin } from '@platejs/ai/react';
import { PauseIcon } from 'lucide-react';
import { useEditorPlugin, usePluginOption } from 'platejs/react';

import { Button } from '@/components/ui/button';
import { aiChatPlugin } from '@/components/editor/plugins/ai-chat-plugin';
import { stopInsertOrSelectingContext } from '@/lib/ai-selecting-context';
import { cn } from '@/lib/utils';

export function AILoadingBar() {
  const { api, editor } = useEditorPlugin(AIChatPlugin);
  const chat = usePluginOption(AIChatPlugin, 'chat');
  const mode = usePluginOption(AIChatPlugin, 'mode');
  const selectingContext = usePluginOption(aiChatPlugin, 'selectingContext');
  const analyzingMentionKeywords = usePluginOption(
    aiChatPlugin,
    'analyzingMentionKeywords'
  );
  const contextHighlightBlockIds = usePluginOption(
    aiChatPlugin,
    'contextHighlightBlockIds'
  );
  const contextHighlighted = contextHighlightBlockIds.length > 0;

  const { status } = chat;

  const isLoading = status === 'streaming' || status === 'submitted';

  const stopInsert = () => {
    stopInsertOrSelectingContext(editor, () => api.aiChat.stop());
  };

  if (
    mode === 'insert' &&
    (selectingContext || isLoading || contextHighlighted)
  ) {
    const label = analyzingMentionKeywords
      ? 'Fetching keywords...'
      : selectingContext
        ? 'Selecting context...'
        : status === 'submitted'
          ? 'Thinking...'
          : 'Answering...';

    return (
      <div
        className={cn(
          '-translate-x-1/2 absolute bottom-4 left-1/2 z-20 flex items-center gap-3 rounded-md border border-border bg-muted px-3 py-1.5 text-muted-foreground text-sm shadow-md transition-all duration-300'
        )}
      >
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
        <span>{label}</span>
        <Button
          size="sm"
          variant="ghost"
          className="flex items-center gap-1 text-xs"
          onClick={stopInsert}
        >
          <PauseIcon className="h-4 w-4" />
          Stop
          <kbd className="ml-1 rounded bg-border px-1 font-mono text-[10px] text-muted-foreground shadow-sm">
            Esc
          </kbd>
        </Button>
      </div>
    );
  }

  return null;
}
