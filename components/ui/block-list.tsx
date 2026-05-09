'use client';

import React from 'react';

import type { TListElement } from 'platejs';

import { isOrderedList } from '@platejs/list';
import {
  type PlateElementProps,
  type RenderNodeWrapper,
} from 'platejs/react';

export const BlockList: RenderNodeWrapper = (props) => {
  if (!props.element.listStyleType) return;

  return (props) => <List {...props} />;
};

function List(props: PlateElementProps & { lineBreakBadge?: React.ReactNode }) {
  const { listStart, listStyleType } = props.element as TListElement;
  const List = isOrderedList(props.element) ? 'ol' : 'ul';

  return (
    <List
      className="relative m-0 p-0"
      style={{ listStyleType }}
      start={listStart}
    >
      <li>
        {props.children}
        {props.lineBreakBadge}
      </li>
    </List>
  );
}
