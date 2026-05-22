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
import {
  MENTION_DEFAULT_API_KEY,
  TRIAL_MENTION_MODELS,
  TRIAL_MODELS_GROUP,
  TRIAL_RECENT_API_KEY_ID,
} from '@/lib/mention-trial';
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
import type { FilterFn } from './inline-combobox';

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

function formatTokenHint(token: string) {
  const trimmed = token.trim();
  if (trimmed.length <= 8) return trimmed;
  return `···${trimmed.slice(-4)}`;
}

function providerGroupLabelWithHint(provider: AIProvider, token: string) {
  return `${providerGroupLabel[provider]} · ${formatTokenHint(token)}`;
}

function recentModelLabel(modelId: string, token: string) {
  return `${modelId} · ${formatTokenHint(token)}`;
}

const RECENT_MODELS_GROUP = 'Recent';

function recentModelKey(apiKeyId: string, modelId: string) {
  return `${apiKeyId}:${modelId}`;
}

type PassedApiKeyEntry = {
  id: string;
  provider: AIProvider;
  token: string;
  groupLabel: string;
};

type MentionModelGroup = {
  apiKeyId: string;
  provider: AIProvider;
  groupLabel: string;
  token: string;
  models: { id: string; label: string }[];
};

function usePassedApiKeys() {
  const apiKeys = useAppStore((s) => s.apiKeys);

  return React.useMemo(() => {
    const entries: PassedApiKeyEntry[] = [];

    for (const k of apiKeys) {
      if (k.status !== "passed" || !k.provider || !k.token?.trim()) continue;
      const token = k.token.trim();
      entries.push({
        id: k.id,
        provider: k.provider,
        token,
        groupLabel: providerGroupLabelWithHint(k.provider, token),
      });
    }

    return entries.sort((a, b) => {
      const byProvider = a.provider.localeCompare(b.provider);
      if (byProvider !== 0) return byProvider;
      return a.groupLabel.localeCompare(b.groupLabel);
    });
  }, [apiKeys]);
}

function MentionModelItem({
  editor,
  search,
  provider,
  modelId,
  apiKey,
  group,
  displayLabel,
  keywords,
  onSelect,
}: {
  editor: PlateElementProps<TComboboxInputElement>['editor'];
  search: string;
  provider: AIProvider;
  modelId: string;
  apiKey: string;
  group: string;
  displayLabel: string;
  keywords: string[];
  onSelect: () => void;
}) {
  const item = { key: modelId, text: modelId };

  return (
    <InlineComboboxItem
      group={group}
      keywords={keywords}
      label={displayLabel}
      value={displayLabel}
      onClick={() => {
        insertMentionWithAI(editor, item, search, provider, apiKey);
        onSelect();
      }}
    >
      <span className="truncate">{displayLabel}</span>
    </InlineComboboxItem>
  );
}

const trialApiKeyEntry: PassedApiKeyEntry = {
  id: TRIAL_RECENT_API_KEY_ID,
  provider: TRIAL_MENTION_MODELS[0].provider,
  token: MENTION_DEFAULT_API_KEY,
  groupLabel: TRIAL_MODELS_GROUP,
};

const trialModelIds = new Set(TRIAL_MENTION_MODELS.map((m) => m.id));

function MentionComboboxModels({
  editor,
  search,
}: {
  editor: PlateElementProps<TComboboxInputElement>["editor"];
  search: string;
}) {
  const store = useComboboxContext()!;
  const open = store.useState("open");
  const passedApiKeys = usePassedApiKeys();
  const recentMentionModels = useAppStore((s) => s.recentMentionModels);
  const addRecentMentionModel = useAppStore((s) => s.recentMentionModelsAdd);

  const passedById = React.useMemo(() => {
    const map = new Map(passedApiKeys.map((k) => [k.id, k]));
    map.set(TRIAL_RECENT_API_KEY_ID, trialApiKeyEntry);
    return map;
  }, [passedApiKeys]);

  const recordRecent = React.useCallback(
    (apiKey: PassedApiKeyEntry, modelId: string) => {
      addRecentMentionModel({
        provider: apiKey.provider,
        modelId,
        apiKeyId: apiKey.id,
      });
    },
    [addRecentMentionModel]
  );

  const { recentModels, groups } = React.useMemo(() => {
    if (!open) {
      return { recentModels: [], groups: [] as MentionModelGroup[] };
    }

    const recentKeys = new Set<string>();
    const recentModels: {
      apiKey: PassedApiKeyEntry;
      modelId: string;
      displayLabel: string;
    }[] = [];

    for (const entry of recentMentionModels) {
      const apiKey = passedById.get(entry.apiKeyId);
      if (!apiKey) continue;

      const key = recentModelKey(apiKey.id, entry.modelId);
      if (recentKeys.has(key)) continue;
      recentKeys.add(key);
      recentModels.push({
        apiKey,
        modelId: entry.modelId,
        displayLabel: recentModelLabel(entry.modelId, apiKey.token),
      });
    }

    const nextGroups: MentionModelGroup[] = [];

    for (const apiKey of passedApiKeys) {
      const models = getMentionModelsForProvider(
        apiKey.provider,
        MENTION_MODELS_PER_PROVIDER
      ).filter(
        (m) =>
          !trialModelIds.has(m.id) &&
          !recentKeys.has(recentModelKey(apiKey.id, m.id))
      );

      if (models.length > 0) {
        nextGroups.push({
          apiKeyId: apiKey.id,
          provider: apiKey.provider,
          groupLabel: apiKey.groupLabel,
          token: apiKey.token,
          models,
        });
      }
    }

    return { recentModels, groups: nextGroups };
  }, [open, passedApiKeys, passedById, recentMentionModels]);

  return (
    <>
      <InlineComboboxEmpty>No matching models</InlineComboboxEmpty>

      {recentModels.length > 0 && (
        <InlineComboboxGroup>
          <InlineComboboxGroupLabel>
            {RECENT_MODELS_GROUP}
          </InlineComboboxGroupLabel>
          {recentModels.map((m) => (
            <MentionModelItem
              key={`recent:${m.apiKey.id}:${m.modelId}`}
              editor={editor}
              search={search}
              provider={m.apiKey.provider}
              modelId={m.modelId}
              apiKey={m.apiKey.token}
              group={RECENT_MODELS_GROUP}
              displayLabel={m.displayLabel}
              keywords={[m.modelId, m.apiKey.groupLabel, m.displayLabel]}
              onSelect={() => recordRecent(m.apiKey, m.modelId)}
            />
          ))}
        </InlineComboboxGroup>
      )}

      <InlineComboboxGroup key="trial-models">
        <InlineComboboxGroupLabel>{TRIAL_MODELS_GROUP}</InlineComboboxGroupLabel>
        {TRIAL_MENTION_MODELS.map((m) => (
          <MentionModelItem
            key={`trial:${m.id}`}
            editor={editor}
            search={search}
            provider={m.provider}
            modelId={m.id}
            apiKey={m.apiKey}
            group={TRIAL_MODELS_GROUP}
            displayLabel={m.label}
            keywords={[m.id, m.provider, TRIAL_MODELS_GROUP]}
            onSelect={() => recordRecent(trialApiKeyEntry, m.id)}
          />
        ))}
      </InlineComboboxGroup>

      {groups.map((g) => (
        <InlineComboboxGroup key={g.apiKeyId}>
          <InlineComboboxGroupLabel>{g.groupLabel}</InlineComboboxGroupLabel>
          {g.models.map((m) => (
            <MentionModelItem
              key={`${g.apiKeyId}:${m.id}`}
              editor={editor}
              search={search}
              provider={g.provider}
              modelId={m.id}
              apiKey={g.token}
              group={g.groupLabel}
              displayLabel={m.label}
              keywords={[m.id, g.provider, g.groupLabel]}
              onSelect={() =>
                recordRecent(
                  {
                    id: g.apiKeyId,
                    provider: g.provider,
                    token: g.token,
                    groupLabel: g.groupLabel,
                  },
                  m.id
                )
              }
            />
          ))}
        </InlineComboboxGroup>
      ))}
    </>
  );
}



const mentionFilter: FilterFn = ({ label }, search) => {
  return label?.toLowerCase().includes(search.toLowerCase()) ?? false;
};

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
        filter={mentionFilter}
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
