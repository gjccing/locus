'use client';

import * as React from 'react';

import { BlockSelectionPlugin } from '@platejs/selection/react';
import { isHotkey } from 'platejs';
import { useEditorRef, usePluginOption } from 'platejs/react';

function isPlainArrow(event: KeyboardEvent, key: 'ArrowLeft' | 'ArrowRight') {
  return (
    event.key === key &&
    !event.shiftKey &&
    !event.altKey &&
    !event.metaKey &&
    !event.ctrlKey
  );
}

/**
 * Block selection uses a hidden `.slate-shadow-input` for shortcuts. Plate’s
 * default Enter handler is wrong for multi-block selection, and arrow keys do
 * nothing. Intercept in capture: collapse to start of first selected block
 * (Left), end of last (Right / Enter), clear block selection via `tf.select`,
 * then focus the editor.
 */
export function BlockSelectionShadowKeyboardFix() {
  const editor = useEditorRef();
  const isSelectingSome = usePluginOption(BlockSelectionPlugin, 'isSelectingSome');
  const shadowInputRef = usePluginOption(BlockSelectionPlugin, 'shadowInputRef');

  React.useEffect(() => {
    const onKeyDownCapture = (event: KeyboardEvent) => {
      if (event.target !== shadowInputRef?.current) return;
      if (!isSelectingSome || editor.api.isReadOnly()) return;

      const blocks = editor
        .getApi(BlockSelectionPlugin)
        .blockSelection.getNodes({ sort: true });
      if (blocks.length === 0) return;

      const goStart = isPlainArrow(event, 'ArrowLeft');
      const goEnd =
        isPlainArrow(event, 'ArrowRight') ||
        (isHotkey('enter')(event) && !event.shiftKey);

      let point: ReturnType<typeof editor.api.start> | undefined;
      if (goStart) {
        const [, firstPath] = blocks[0];
        point = editor.api.start(firstPath);
      } else if (goEnd) {
        const last = blocks.at(-1);
        if (!last) return;
        const [, lastPath] = last;
        point = editor.api.end(lastPath);
      } else {
        return;
      }

      if (!point) return;

      event.preventDefault();
      event.stopImmediatePropagation();

      editor.meta._forceFocus = true;
      editor.tf.select({ anchor: point, focus: point });
      editor.tf.focus();
      editor.meta._forceFocus = undefined;
    };

    document.addEventListener('keydown', onKeyDownCapture, true);
    return () => document.removeEventListener('keydown', onKeyDownCapture, true);
  }, [editor, isSelectingSome, shadowInputRef]);

  return null;
}
