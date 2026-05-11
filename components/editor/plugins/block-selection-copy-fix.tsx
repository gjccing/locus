'use client';

import { RangeApi } from 'platejs';
import { createTPlatePlugin } from 'platejs/react';

/**
 * Block selection copy uses a shadow <input> and copySelectedBlocks(), which for
 * empty blocks does editor.tf.select({ focus: editor.api.after(editor.selection) }).
 * At the end of the document `after()` is undefined, so Slate throws
 * "Cannot remove the \"focus\" selection property". Collapsed-range fallback matches
 * that copy path only.
 */
export const BlockSelectionCopyFixPlugin = createTPlatePlugin({
  key: 'blockSelectionCopyFix',
  editOnly: true,
}).extendEditorApi(({ editor }) => {
  const previousAfter = editor.api.after;
  return {
    after: (at, options) => {
      const point = previousAfter(at, options);
      if (point != null) return point;
      if (at != null && RangeApi.isRange(at) && RangeApi.isCollapsed(at)) {
        try {
          return editor.api.end(at);
        } catch {
          return undefined;
        }
      }
      return undefined;
    },
  };
});
