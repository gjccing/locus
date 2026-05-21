'use client';

import { TocPlugin } from '@platejs/toc/react';

import { queryTocOutline } from '@/lib/toc-outline';

/** Sidebar-only TOC: no in-document `<toc>` block component. */
export const TocSidebarKit = [
  TocPlugin.configure({
    options: {
      isScroll: true,
      topOffset: 80,
      queryHeading: queryTocOutline,
    },
  }),
];
