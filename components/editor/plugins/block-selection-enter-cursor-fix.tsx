'use client';

import * as React from 'react';

import { BlockSelectionPlugin } from '@platejs/selection/react';
import { isHotkey } from 'platejs';
import { useEditorRef, usePluginOption } from 'platejs/react';

/**
 * Block selection uses a shadow &lt;input&gt; for shortcuts. Enter is handled there
 * with `editor.api.node(...)` (first match) and never clears `selectedIds`, so the
 * shadow input steals focus again and the caret looks stuck at the pre-selection
 * position. Intercept Enter in capture phase: collapse selection to the end of the
 * last selected block (document order) and clear block selection via `tf.select`.
 */
export function BlockSelectionEnterCursorFix() {
  const editor = useEditorRef();
  const isSelectingSome = usePluginOption(BlockSelectionPlugin, 'isSelectingSome');
  const shadowInputRef = usePluginOption(BlockSelectionPlugin, 'shadowInputRef');

  React.useEffect(() => {
    const onKeyDownCapture = (event: KeyboardEvent) => {
      if (!isHotkey('enter')(event) || event.shiftKey) return;
      const target = event.target;
      if (target !== shadowInputRef?.current) return;
      if (!isSelectingSome || editor.api.isReadOnly()) return;

      const blocks = editor
        .getApi(BlockSelectionPlugin)
        .blockSelection.getNodes({ sort: true });
      const last = blocks.at(-1);
      if (!last) return;

      const [, lastPath] = last;
      const end = editor.api.end(lastPath);
      if (!end) return;

      event.preventDefault();
      event.stopImmediatePropagation();

      editor.meta._forceFocus = true;
      editor.tf.select({ anchor: end, focus: end });
      editor.tf.focus();
      editor.meta._forceFocus = undefined;
    };

    document.addEventListener('keydown', onKeyDownCapture, true);
    return () => document.removeEventListener('keydown', onKeyDownCapture, true);
  }, [editor, isSelectingSome, shadowInputRef]);

  return null;
}
