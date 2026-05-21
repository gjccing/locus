'use client';

import * as React from 'react';

import type { PlateElementProps } from 'platejs/react';

import { PlateElement, useEditorRef, usePath } from 'platejs/react';

import { isTocModelMentionBlock, tocPathToId } from '@/lib/toc-outline';
import { cn } from '@/lib/utils';

export function ParagraphElement(props: PlateElementProps) {
  const editor = useEditorRef();
  const path = usePath();
  const existingId = props.element.id as string | undefined;
  const id =
    existingId ??
    (path && isTocModelMentionBlock(editor, path)
      ? tocPathToId(path)
      : undefined);

  return (
    <PlateElement
      {...props}
      className={cn('m-0 px-0 py-1')}
      attributes={{
        ...props.attributes,
        id,
      }}
    >
      {props.children}
    </PlateElement>
  );
}
