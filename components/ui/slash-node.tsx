'use client';

import * as React from 'react';

import type { PlateEditor, PlateElementProps } from 'platejs/react';

import {
  ChevronRightIcon,
  Code2,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  ListIcon,
  ListOrdered,
  MinusIcon,
  PilcrowIcon,
  Quote,
  Square,
} from 'lucide-react';
import { type TComboboxInputElement, KEYS } from 'platejs';
import { PlateElement } from 'platejs/react';

import { insertBlock } from '@/components/editor/transforms';

import {
  InlineCombobox,
  InlineComboboxContent,
  InlineComboboxEmpty,
  InlineComboboxGroup,
  InlineComboboxGroupLabel,
  InlineComboboxInput,
  InlineComboboxItem,
} from './inline-combobox';

type Item = {
  icon: React.ReactNode;
  value: string;
  keywords?: string[];
  label?: string;
};

const basicBlockItems: Item[] = [
  {
    icon: <PilcrowIcon />,
    keywords: ['paragraph'],
    label: 'Text',
    value: KEYS.p,
  },
  {
    icon: <Heading1Icon />,
    keywords: ['title', 'h1'],
    label: 'Heading 1',
    value: KEYS.h1,
  },
  {
    icon: <Heading2Icon />,
    keywords: ['subtitle', 'h2'],
    label: 'Heading 2',
    value: KEYS.h2,
  },
  {
    icon: <Heading3Icon />,
    keywords: ['subtitle', 'h3'],
    label: 'Heading 3',
    value: KEYS.h3,
  },
  {
    icon: <ListIcon />,
    keywords: ['unordered', 'ul', '-'],
    label: 'Bulleted list',
    value: KEYS.ul,
  },
  {
    icon: <ListOrdered />,
    keywords: ['ordered', 'ol', '1'],
    label: 'Numbered list',
    value: KEYS.ol,
  },
  {
    icon: <Square />,
    keywords: ['checklist', 'task', 'checkbox', '[]'],
    label: 'To-do list',
    value: KEYS.listTodo,
  },
  {
    icon: <ChevronRightIcon />,
    keywords: ['collapsible', 'expandable'],
    label: 'Toggle',
    value: KEYS.toggle,
  },
  {
    icon: <Code2 />,
    keywords: ['```'],
    label: 'Code block',
    value: KEYS.codeBlock,
  },
  {
    icon: <Quote />,
    keywords: ['citation', 'blockquote', 'quote', '>'],
    label: 'Blockquote',
    value: KEYS.blockquote,
  },
  {
    icon: <MinusIcon />,
    keywords: ['divider', 'horizontal rule', '---'],
    label: 'Divider',
    value: KEYS.hr,
  },
];

export function SlashInputElement(
  props: PlateElementProps<TComboboxInputElement>
) {
  const { editor, element } = props;

  return (
    <PlateElement {...props} as="span">
      <InlineCombobox element={element} trigger="/">
        <InlineComboboxInput />

        <InlineComboboxContent>
          <InlineComboboxEmpty>No results</InlineComboboxEmpty>

          <InlineComboboxGroup>
            <InlineComboboxGroupLabel>Basic blocks</InlineComboboxGroupLabel>

            {basicBlockItems.map(({ icon, keywords, label, value }) => (
              <InlineComboboxItem
                key={value}
                value={value}
                onClick={() => insertBlock(editor, value, { upsert: true })}
                label={label}
                group="Basic blocks"
                keywords={keywords}
              >
                <div className="mr-2 text-muted-foreground">{icon}</div>
                {label ?? value}
              </InlineComboboxItem>
            ))}
          </InlineComboboxGroup>
        </InlineComboboxContent>
      </InlineCombobox>

      {props.children}
    </PlateElement>
  );
}
