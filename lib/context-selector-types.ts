import { z } from 'zod';

export const CONTEXT_SELECTOR_METHODS = [
  'getAboveValue',
  'getAboveValueWithKeywords',
  'getOlderSiblings',
  'getAncestors',
  'getHeadingAncestors',
] as const;

export type ContextSelectorMethod = (typeof CONTEXT_SELECTOR_METHODS)[number];

export const DEFAULT_CONTEXT_SELECTOR_METHODS = [
  'getAncestors',
  'getOlderSiblings',
] as const satisfies readonly ContextSelectorMethod[];

const contextSelectorMethodSchema = z.enum(CONTEXT_SELECTOR_METHODS);

export const contextSelectorResultSchema = z
  .object({
    methods: z.array(contextSelectorMethodSchema),
    keywords: z.array(z.string()).optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.methods.includes('getAboveValueWithKeywords')) return;

    if (!data.keywords?.length) {
      ctx.addIssue({
        code: 'custom',
        message:
          'keywords must be a non-empty array when getAboveValueWithKeywords is included',
        path: ['keywords'],
      });
    }
  });

export type ContextSelectorResult = z.infer<typeof contextSelectorResultSchema>;

export function parseContextSelectorResult(
  value: unknown
): ContextSelectorResult {
  return contextSelectorResultSchema.parse(value);
}

export const DEFAULT_CONTEXT_SELECTOR_RESULT = {
  methods: [],
} satisfies ContextSelectorResult;
