'use client';

import * as React from 'react';

import { useComboboxContext } from '@ariakit/react';
import type { TComboboxInputElement, TMentionElement } from 'platejs';
import type { PlateElementProps } from 'platejs/react';

import { getMentionOnSelectItem } from '@platejs/mention';
import { IS_APPLE, KEYS } from 'platejs';
import {
  PlateElement,
  useFocused,
  useReadOnly,
  useSelected,
} from 'platejs/react';

import {
  fetchGatewayCatalog,
  fetchGroqLatestModels,
  gatewayOwnedBy,
  MENTION_MODELS_PER_PROVIDER,
  pickLatestGatewayModels,
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

const onSelectItem = getMentionOnSelectItem();

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

  const [groups, setGroups] = React.useState<MentionModelGroup[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;

    const ac = new AbortController();

    (async () => {
      if (passedByProvider.size === 0) {
        setGroups([]);
        setError(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        let catalog: Awaited<ReturnType<typeof fetchGatewayCatalog>> | null =
          null;

        const nextGroups: MentionModelGroup[] = [];

        for (const provider of [...passedByProvider.keys()].sort((a, b) =>
          a.localeCompare(b)
        )) {
          const token = passedByProvider.get(provider)!;

          if (provider === "Groq") {
            const models = await fetchGroqLatestModels(
              token,
              MENTION_MODELS_PER_PROVIDER,
              ac.signal
            );
            if (models.length > 0) {
              nextGroups.push({ provider, models });
            }
            continue;
          }

          const ownedBy = gatewayOwnedBy(provider);
          if (!ownedBy) continue;

          if (!catalog) {
            catalog = await fetchGatewayCatalog(ac.signal);
          }

          const gatewayModels = pickLatestGatewayModels(
            catalog,
            ownedBy,
            MENTION_MODELS_PER_PROVIDER
          );
          const models = gatewayModels.map((m) => ({
            id: m.id,
            label: m.id,
          }));

          if (models.length > 0) {
            nextGroups.push({ provider, models });
          }
        }

        if (!ac.signal.aborted) {
          setGroups(nextGroups);
        }
      } catch (e) {
        if (ac.signal.aborted) return;
        setError(e instanceof Error ? e.message : "Could not load models");
        setGroups([]);
      } finally {
        if (!ac.signal.aborted) {
          setLoading(false);
        }
      }
    })();

    return () => ac.abort();
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
      <InlineComboboxEmpty>
        {loading
          ? "Loading models…"
          : error
            ? error
            : "No matching models"}
      </InlineComboboxEmpty>

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
                onClick={() => onSelectItem(editor, item, search)}
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
