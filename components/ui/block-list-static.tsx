import * as React from 'react';

import type { RenderStaticNodeWrapper, TListElement } from 'platejs';
import type { SlateRenderElementProps } from 'platejs/static';

import { isOrderedList } from '@platejs/list';

export const BlockListStatic: RenderStaticNodeWrapper = (props) => {
  if (!props.element.listStyleType) return;

  return (props) => <List {...props} />;
};

function List(props: SlateRenderElementProps) {
  const { indent, listStart, listStyleType } = props.element as TListElement & {
    indent?: number;
  };
  const List = isOrderedList(props.element) ? 'ol' : 'ul';

  const marginLeft = indent ? `${indent * 24}px` : undefined;

  return (
    <List
      className="relative m-0 p-0"
      style={{ listStyleType, marginLeft }}
      start={listStart}
    >
      <li>{props.children}</li>
    </List>
  );
}
