'use client';

import * as React from 'react';

import { useComboboxContext } from '@ariakit/react';
import type { TComboboxInputElement, TMentionElement } from 'platejs';
import type { PlateElementProps } from 'platejs/react';

import { getEditorPlugin } from 'platejs';
import { IS_APPLE, KEYS } from 'platejs';
import {
  PlateElement,
  useFocused,
  useReadOnly,
  useSelected,
} from 'platejs/react';

import {
  getMentionModelsForProvider,
  MENTION_MODELS_PER_PROVIDER,
} from '@/lib/mention-models';
import { cn } from '@/lib/utils';
import { useMounted } from '@/hooks/use-mounted';
import { inlineSuggestionVariants } from '@/lib/suggestion';
import type { AIProvider } from '@/stores/app-store';
import { useAppStore } from '@/stores/app-store';

import {
  InlineCombobox,
  InlineComboboxContent,
  InlineComboboxEmpty,
  InlineComboboxGroup,
  InlineComboboxGroupLabel,
  InlineComboboxInput,
  InlineComboboxItem,
} from './inline-combobox';

export function MentionElement(
  props: PlateElementProps<TMentionElement> & {
    prefix?: string;
  }
) {
  const { element } = props;
  const selected = useSelected();
  const focused = useFocused();
  const mounted = useMounted();
  const readOnly = useReadOnly();

  return (
    <PlateElement
      {...props}
      className={cn(
        'inline-block rounded-md bg-muted mx-0.5 px-1.5 py-0.5 align-baseline font-medium text-sm',
        inlineSuggestionVariants(),
        !readOnly && 'cursor-pointer',
        selected && focused && 'ring-2 ring-ring',
        element.children[0][KEYS.bold] === true && 'font-bold',
        element.children[0][KEYS.italic] === true && 'italic',
        element.children[0][KEYS.underline] === true && 'underline'
      )}
      attributes={{
        ...props.attributes,
        contentEditable: false,
        'data-slate-value': element.value,
        draggable: true,
      }}
    >
      {mounted && IS_APPLE ? (
        // Mac OS IME https://github.com/ianstormtaylor/slate/issues/3490
        <>
          {props.children}
          {props.prefix}
          {element.value}
        </>
      ) : (
        // Others like Android https://github.com/ianstormtaylor/slate/pull/5360
        <>
          {props.prefix}
          {element.value}
          {props.children}
        </>
      )}
    </PlateElement>
  );
}

function insertMentionWithAI(
  editor: PlateElementProps<TComboboxInputElement>['editor'],
  item: { key: string; text: string },
  search: string,
  provider: AIProvider,
  apiKey: string
) {
  const { getOptions, tf } = getEditorPlugin(editor, { key: KEYS.mention });
  const { insertSpaceAfterMention } = getOptions();

  tf.insert.mention({
    apiKey,
    key: item.key,
    provider,
    value: item.text,
  });
  editor.tf.move({ unit: 'offset' });

  const pathAbove = editor.api.block()?.[1];
  if (
    editor.selection &&
    pathAbove &&
    editor.api.isEnd(editor.selection.anchor, pathAbove) &&
    insertSpaceAfterMention
  ) {
    editor.tf.insertText(' ');
  }
}

const providerGroupLabel: Record<AIProvider, string> = {
  OpenAI: "OpenAI",
  Anthropic: "Anthropic",
  Gemini: "Google Gemini",
  Groq: "Groq",
};

type MentionModelGroup = {
  provider: AIProvider;
  models: { id: string; label: string }[];
};

function usePassedProviderKeys() {
  const apiKeys = useAppStore((s) => s.apiKeys);

  return React.useMemo(() => {
    const map = new Map<AIProvider, string>();

    for (const k of apiKeys) {
      if (k.status !== "passed" || !k.provider || !k.token?.trim()) continue;
      if (!map.has(k.provider)) {
        map.set(k.provider, k.token.trim());
      }
    }

    return map;
  }, [apiKeys]);
}

function MentionComboboxModels({
  editor,
  search,
}: {
  editor: PlateElementProps<TComboboxInputElement>["editor"];
  search: string;
}) {
  const store = useComboboxContext()!;
  const open = store.useState("open");
  const passedByProvider = usePassedProviderKeys();

  const groups = React.useMemo(() => {
    if (!open || passedByProvider.size === 0) return [];

    const nextGroups: MentionModelGroup[] = [];

    for (const provider of [...passedByProvider.keys()].sort((a, b) =>
      a.localeCompare(b)
    )) {
      const models = getMentionModelsForProvider(
        provider,
        MENTION_MODELS_PER_PROVIDER
      );

      if (models.length > 0) {
        nextGroups.push({ provider, models });
      }
    }

    return nextGroups;
  }, [open, passedByProvider]);

  if (passedByProvider.size === 0) {
    return (
      <>
        <InlineComboboxEmpty>
          Verify an API key (passed test) in settings to see models from{" "}
          <a
            className="underline underline-offset-2"
            href="https://vercel.com/ai-gateway/models"
            rel="noreferrer"
            target="_blank"
          >
            the AI Gateway catalog
          </a>
          .
        </InlineComboboxEmpty>
      </>
    );
  }

  return (
    <>
      <InlineComboboxEmpty>No matching models</InlineComboboxEmpty>

      {groups.map((g) => (
        <InlineComboboxGroup key={g.provider}>
          <InlineComboboxGroupLabel>
            {providerGroupLabel[g.provider]}
          </InlineComboboxGroupLabel>
          {g.models.map((m) => {
            const item = { key: m.id, text: m.id };
            return (
              <InlineComboboxItem
                key={m.id}
                group={providerGroupLabel[g.provider]}
                keywords={[m.id, g.provider]}
                label={m.label}
                value={m.label}
                onClick={() =>
                  insertMentionWithAI(
                    editor,
                    item,
                    search,
                    g.provider,
                    passedByProvider.get(g.provider)!
                  )
                }
              >
                <span className="truncate">{m.label}</span>
              </InlineComboboxItem>
            );
          })}
        </InlineComboboxGroup>
      ))}
    </>
  );
}

export function MentionInputElement(
  props: PlateElementProps<TComboboxInputElement>
) {
  const { editor, element } = props;
  const [search, setSearch] = React.useState('');

  return (
    <PlateElement {...props} as="span">
      <InlineCombobox
        value={search}
        element={element}
        setValue={setSearch}
        showTrigger={false}
        trigger="@"
      >
        <span className="inline-block rounded-md bg-muted px-1.5 py-0.5 align-baseline text-sm ring-ring focus-within:ring-2">
          <InlineComboboxInput />
        </span>

        <InlineComboboxContent className="my-1.5">
          <MentionComboboxModels editor={editor} search={search} />
        </InlineComboboxContent>
      </InlineCombobox>

      {props.children}
    </PlateElement>
  );
}
