'use client';

import * as React from 'react';

import type { Heading } from '@platejs/toc';
import {
  checkIn,
  useTocSideBar,
  useTocSideBarState,
} from '@platejs/toc/react';
import { NodeApi } from 'platejs';
import {
  sampleTocBars,
  tocBarWidthPx,
  TOC_MAX_BARS,
  type TocOutlineItem,
} from '@/lib/toc-outline';
import { cn } from '@/lib/utils';

function isTocOutlineItem(item: Heading): item is TocOutlineItem {
  return 'kind' in item && 'preview' in item;
}

export function EditorTocSidebar({ className }: { className?: string }) {
  const state = useTocSideBarState({ topOffset: 80 });
  const { activeContentId, editor, headingList, mouseInToc, setMouseInToc } =
    state;
  const { navProps, onContentClick } = useTocSideBar(state);

  const outline = React.useMemo(
    () => headingList.filter(isTocOutlineItem),
    [headingList]
  );

  const barSamples = React.useMemo(
    () => sampleTocBars(outline, TOC_MAX_BARS),
    [outline]
  );

  const handleBarClick = (
    e: React.MouseEvent<HTMLButtonElement>,
    item: TocOutlineItem
  ) => {
    onContentClick(e, item, 'smooth');
  };

  const handlePanelItemClick = (
    e: React.MouseEvent<HTMLButtonElement>,
    item: TocOutlineItem
  ) => {
    const node = NodeApi.get(editor, item.path);
    const el = node ? editor.api.toDOMNode(node) : null;
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    onContentClick(e, item, 'smooth');
  };

  if (outline.length === 0) return null;

  return (
    <aside
      className={cn(
        'pointer-events-none fixed top-1/2 right-3 z-30 hidden -translate-y-1/2 sm:block',
        className
      )}
      aria-label="Document outline"
    >
      <nav
        {...navProps}
        className="pointer-events-auto relative flex flex-col items-end"
      >
        <div
          className="relative"
          onMouseEnter={() => setMouseInToc(true)}
          onMouseLeave={(e) => {
            const isIn = checkIn(e);
            if (isIn !== mouseInToc) setMouseInToc(isIn);
          }}
        >
          <div
            className={cn(
              'flex flex-col items-end gap-[3px] rounded-full px-1 py-2 transition-opacity',
              mouseInToc && 'pointer-events-none opacity-0'
            )}
            aria-hidden={mouseInToc}
          >
            {barSamples.map(({ item, index }) => {
              const isActive = item.id === activeContentId;
              const width = tocBarWidthPx(item);
              return (
                <button
                  key={`${item.id}-${index}`}
                  type="button"
                  title={
                    item.kind === 'mention' ? `@${item.title}` : item.title
                  }
                  aria-label={
                    item.kind === 'mention' ? `@${item.title}` : item.title
                  }
                  className={cn(
                    'h-[3px] shrink-0 rounded-full transition-colors',
                    item.kind === 'mention'
                      ? 'bg-brand/70 hover:bg-brand'
                      : 'bg-muted-foreground/35 hover:bg-muted-foreground/55',
                    isActive &&
                    (item.kind === 'mention'
                      ? 'bg-brand'
                      : 'bg-foreground/70')
                  )}
                  style={{ width }}
                  onClick={(e) => handleBarClick(e, item)}
                  tabIndex={mouseInToc ? -1 : 0}
                />
              );
            })}
          </div>

          {mouseInToc ? (
            <div
              className="absolute right-0 bottom-0 z-20 flex min-h-full w-64 max-w-[min(18rem,calc(100vw-2rem))] max-h-[min(50vh,320px)] flex-col overflow-hidden rounded-lg border border-border/80 bg-popover text-popover-foreground shadow-lg"
            >
              <div
                id="toc_wrap"
                className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-1"
              >
                {outline.map((item) => {
                  const isActive = item.id === activeContentId;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      id={isActive ? 'toc_item_active' : undefined}
                      className={cn(
                        'flex w-full flex-col gap-0.5 px-3 py-2 text-left text-sm transition-colors',
                        isActive
                          ? 'bg-accent text-foreground'
                          : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
                      )}
                      onClick={(e) => handlePanelItemClick(e, item)}
                    >
                      <span
                        className={cn(
                          'truncate font-medium',
                          item.kind === 'mention' && 'text-brand'
                        )}
                      >
                        {item.kind === 'mention'
                          ? `@${item.title}`
                          : item.title}
                      </span>
                      {item.preview ? (
                        <span className="truncate text-xs text-muted-foreground">
                          {item.preview}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      </nav>
    </aside>
  );
}
