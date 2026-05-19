'use client';

import * as React from 'react';

import {
  AIChatPlugin,
  AIPlugin,
  useEditorChat,
} from '@platejs/ai/react';
import { BlockSelectionPlugin } from '@platejs/selection/react';
import { Command as CommandPrimitive } from 'cmdk';
import {
  Check,
  CornerUpLeft,
  Loader2Icon,
  PauseIcon,
  PenLine,
  X,
} from 'lucide-react';
import {
  type NodeEntry,
  isHotkey,
  NodeApi,
} from 'platejs';
import {
  useEditorPlugin,
  useFocusedLast,
  useHotkeys,
  usePluginOption,
} from 'platejs/react';
import { type PlateEditor, useEditorRef } from 'platejs/react';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { aiChatPlugin } from '@/components/editor/plugins/ai-chat-plugin';
import { stopInsertOrSelectingContext } from '@/lib/ai-selecting-context';

export function AIMenu() {
  const { api, editor } = useEditorPlugin(AIChatPlugin);
  const mode = usePluginOption(AIChatPlugin, 'mode');

  const streaming = usePluginOption(AIChatPlugin, 'streaming');
  const selectingContext = usePluginOption(aiChatPlugin, 'selectingContext');
  const contextHighlightBlockIds = usePluginOption(
    aiChatPlugin,
    'contextHighlightBlockIds'
  );
  const contextHighlighted = contextHighlightBlockIds.length > 0;
  const isFocusedLast = useFocusedLast();
  const open = usePluginOption(AIChatPlugin, 'open') && isFocusedLast;
  const [value, setValue] = React.useState('');

  const [input, setInput] = React.useState('');

  const chat = usePluginOption(AIChatPlugin, 'chat');

  const { status } = chat;
  const [anchorElement, setAnchorElement] = React.useState<HTMLElement | null>(
    null
  );

  React.useEffect(() => {
    if (!streaming) return;

    const anchorEntry = api.aiChat.node({ anchor: true });
    if (!anchorEntry) return;

    const anchorDom = editor.api.toDOMNode(anchorEntry[0])!;
    setAnchorElement(anchorDom);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streaming]);

  const setOpen = (open: boolean) => {
    if (open) {
      api.aiChat.show();
    } else {
      api.aiChat.hide();
    }
  };

  const show = (anchorElement: HTMLElement) => {
    setAnchorElement(anchorElement);
    setOpen(true);
  };

  useEditorChat({
    onOpenBlockSelection: (blocks: NodeEntry[]) => {
      show(editor.api.toDOMNode(blocks.at(-1)![0])!);
    },
    onOpenChange: (open) => {
      if (!open) {
        setAnchorElement(null);
        setInput('');
      }
    },
    onOpenCursor: () => {
      const [ancestor] = editor.api.block({ highest: true })!;

      if (!editor.api.isAt({ end: true }) && !editor.api.isEmpty(ancestor)) {
        editor
          .getApi(BlockSelectionPlugin)
          .blockSelection.set(ancestor.id as string);
      }

      show(editor.api.toDOMNode(ancestor)!);
    },
    onOpenSelection: () => {
      show(editor.api.toDOMNode(editor.api.blocks().at(-1)![0])!);
    },
  });

  useHotkeys('esc', () => {
    stopInsertOrSelectingContext(editor, () => api.aiChat.stop());
  });

  const isLoading = status === 'streaming' || status === 'submitted';

  if ((isLoading || selectingContext || contextHighlighted) && mode === 'insert')
    return null;

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverAnchor virtualRef={{ current: anchorElement! }} />

      <PopoverContent
        className="border-none bg-transparent p-0 shadow-none"
        style={{
          width: anchorElement?.offsetWidth,
        }}
        onEscapeKeyDown={(e) => {
          e.preventDefault();

          api.aiChat.hide();
        }}
        align="center"
        side="bottom"
      >
        <Command
          className="w-full rounded-lg border shadow-md"
          value={value}
          onValueChange={setValue}
        >
          {isLoading ? (
            <div className="flex grow select-none items-center gap-2 p-2 text-muted-foreground text-sm">
              <Loader2Icon className="size-4 animate-spin" />
              Writing...
            </div>
          ) : (
            <CommandPrimitive.Input
              className={cn(
                'flex h-9 w-full min-w-0 border-input bg-transparent px-3 py-1 text-base outline-none transition-[color,box-shadow] placeholder:text-muted-foreground md:text-sm dark:bg-input/30',
                'aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40',
                'border-b focus-visible:ring-transparent'
              )}
              value={input}
              onKeyDown={(e) => {
                if (isHotkey('backspace')(e) && input.length === 0) {
                  e.preventDefault();
                  api.aiChat.hide();
                }
                if (isHotkey('enter')(e) && !e.shiftKey && !value) {
                  e.preventDefault();
                  submitContinueWriting({ editor, input });
                  setInput('');
                }
              }}
              onValueChange={setInput}
              placeholder="Continue writing..."
              data-plate-focus
              autoFocus
            />
          )}

          {!isLoading && (
            <CommandList>
              <AIMenuItems
                input={input}
                setInput={setInput}
                setValue={setValue}
              />
            </CommandList>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}

type EditorChatState = 'cursorCommand' | 'cursorSuggestion';

function submitContinueWriting({
  editor,
  input,
}: {
  editor: PlateEditor;
  input: string;
}) {
  const ancestorNode = editor.api.block({ highest: true });

  if (!ancestorNode) return;

  const isEmpty = NodeApi.string(ancestorNode[0]).trim().length === 0;

  void editor.getApi(AIChatPlugin).aiChat.submit(input, {
    mode: 'insert',
    prompt: isEmpty
      ? `<Document>
{editor}
</Document>
Start writing a new paragraph AFTER <Document> ONLY ONE SENTENCE`
      : 'Continue writing AFTER <Block> ONLY ONE SENTENCE. DONT REPEAT THE TEXT.',
    toolName: 'generate',
  });
}

const aiChatItems = {
  accept: {
    icon: <Check />,
    label: 'Accept',
    value: 'accept',
    onSelect: ({ editor }) => {
      editor.getTransforms(AIChatPlugin).aiChat.accept();
      editor.tf.focus({ edge: 'end' });
    },
  },
  continueWrite: {
    icon: <PenLine />,
    label: 'Continue writing',
    value: 'continueWrite',
    onSelect: ({ editor, input }) => {
      submitContinueWriting({ editor, input });
    },
  },
  discard: {
    icon: <X />,
    label: 'Discard',
    shortcut: 'Escape',
    value: 'discard',
    onSelect: ({ editor }) => {
      editor.getTransforms(AIPlugin).ai.undo();
      editor.getApi(AIChatPlugin).aiChat.hide();
    },
  },
  tryAgain: {
    icon: <CornerUpLeft />,
    label: 'Try again',
    value: 'tryAgain',
    onSelect: ({ editor }) => {
      void editor.getApi(AIChatPlugin).aiChat.reload();
    },
  },
} satisfies Record<
  string,
  {
    icon: React.ReactNode;
    label: string;
    value: string;
    shortcut?: string;
    onSelect?: ({
      editor,
      input,
    }: {
      editor: PlateEditor;
      input: string;
    }) => void;
  }
>;

const menuStateItems: Record<
  EditorChatState,
  { items: (typeof aiChatItems)[keyof typeof aiChatItems][] }[]
> = {
  cursorCommand: [{ items: [aiChatItems.continueWrite] }],
  cursorSuggestion: [
    {
      items: [
        aiChatItems.accept,
        aiChatItems.discard,
        aiChatItems.tryAgain,
      ],
    },
  ],
};

export const AIMenuItems = ({
  input,
  setInput,
  setValue,
}: {
  input: string;
  setInput: (value: string) => void;
  setValue: (value: string) => void;
}) => {
  const editor = useEditorRef();
  const { messages } = usePluginOption(AIChatPlugin, 'chat');

  const menuState: EditorChatState =
    messages && messages.length > 0 ? 'cursorSuggestion' : 'cursorCommand';

  const menuGroups = menuStateItems[menuState];

  React.useEffect(() => {
    if (menuGroups.length > 0 && menuGroups[0].items.length > 0) {
      setValue(menuGroups[0].items[0].value);
    }
  }, [menuGroups, setValue]);

  return (
    <>
      {menuGroups.map((group, index) => (
        <CommandGroup key={index}>
          {group.items.map((menuItem) => (
            <CommandItem
              key={menuItem.value}
              className="[&_svg]:text-muted-foreground"
              value={menuItem.value}
              onSelect={() => {
                menuItem.onSelect?.({ editor, input });
                setInput('');
              }}
            >
              {menuItem.icon}
              <span>{menuItem.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      ))}
    </>
  );
};

export function AILoadingBar() {
  const { api, editor } = useEditorPlugin(AIChatPlugin);
  const chat = usePluginOption(AIChatPlugin, 'chat');
  const mode = usePluginOption(AIChatPlugin, 'mode');
  const selectingContext = usePluginOption(aiChatPlugin, 'selectingContext');
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

  useHotkeys('esc', stopInsert);

  if (
    mode === 'insert' &&
    (selectingContext || isLoading || contextHighlighted)
  ) {
    const label = selectingContext
      ? 'Analyzing context...'
      : status === 'submitted'
        ? 'Thinking...'
        : 'Writing...';

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
