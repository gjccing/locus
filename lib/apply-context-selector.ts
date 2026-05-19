import { buildTreeFromValue, type Node } from "@/lib/editor-value-tree"
import type {
  ContextSelectorMethod,
  ContextSelectorResult,
} from "@/lib/context-selector-types"
import {
  getAncestors,
  getHeadingAncestors,
  getOlderSiblings,
} from "@/lib/selectors"
import { PathApi, type Path, type TElement, type Value } from "platejs"
import type { PlateEditor } from "platejs/react"

type EditorTreeContext = {
  /** Top-level blocks strictly above the mention block. */
  value: Value
  forest: Node[]
  /** Mention block node in the outline tree. */
  anchorNode: Node | null
}

function findNodeByElement(forest: Node[], element: TElement): Node | null {
  for (const root of forest) {
    const found = findNodeInSubtree(root, element)
    if (found) return found
  }

  return null
}

function findNodeInSubtree(node: Node, element: TElement): Node | null {
  if (node.element === element) return node

  for (const child of node.children) {
    const found = findNodeInSubtree(child, element)
    if (found) return found
  }

  return null
}

function blockIdsFromValue(value: Value): string[] {
  return value.flatMap((element) => (element.id ? [element.id as string] : []))
}

function collectBlockIdsFromNode(node: Node): string[] {
  const ids: string[] = []

  const walk = (current: Node) => {
    if (current.element?.id) ids.push(current.element.id as string)
    for (const child of current.children) walk(child)
  }

  walk(node)
  return ids
}

function collectBlockIdsFromNodes(nodes: Node[]): string[] {
  return nodes.flatMap((node) => collectBlockIdsFromNode(node))
}

export function getValueAboveMentionBlock(
  editor: PlateEditor,
  mentionPath: Path
): Value {
  const mentionIndex = mentionPath[0]
  return mentionIndex > 0
    ? (editor.children.slice(0, mentionIndex) as Value)
    : ([] as Value)
}

function getEditorTreeContext(
  editor: PlateEditor,
  mentionPath: Path
): EditorTreeContext {
  const value = getValueAboveMentionBlock(editor, mentionPath)
  const mentionIndex = mentionPath[0]

  const valueForTree =
    mentionIndex >= 0 && editor.children[mentionIndex]
      ? (editor.children.slice(0, mentionIndex + 1) as Value)
      : value

  const forest = buildTreeFromValue(
    valueForTree as Parameters<typeof buildTreeFromValue>[0]
  )

  const mentionEntry = editor.api.node(mentionPath)
  const mentionElement = mentionEntry?.[0] as TElement | undefined
  const anchorNode = mentionElement
    ? findNodeByElement(forest, mentionElement)
    : null

  return { value, forest, anchorNode }
}

/** Union block ids, ordered by their position in `value`. */
export function filterBlockIdsInDocOrder(
  value: Value,
  ...idLists: string[][]
): string[] {
  const included = new Set<string>()

  for (const idList of idLists) {
    for (const id of idList) included.add(id)
  }

  return blockIdsFromValue(value).filter((id) => included.has(id))
}

/** Resolve block ids to top-level elements in document order. */
export function filterValueByBlockIds(value: Value, blockIds: string[]): Value {
  if (blockIds.length === 0) return []

  const idSet = new Set(blockIds)

  return value.filter(
    (element) => element.id && idSet.has(element.id as string)
  )
}

function applyOneMethod(
  ctx: EditorTreeContext,
  method: ContextSelectorMethod,
  keywords?: string[]
): string[] {
  const { value, anchorNode } = ctx

  switch (method) {
    case "getAboveValue":
      return blockIdsFromValue(value)

    case "getAboveValueWithKeywords": {
      if (!keywords?.length) return []
      return blockIdsFromValue(
        value.filter((element) => {
          const text = element.children
            .map((child) => ("text" in child ? String(child.text) : ""))
            .join("")
          return keywords.some((keyword) => text.includes(keyword))
        })
      )
    }

    case "getOlderSiblings": {
      if (!anchorNode) return []
      return collectBlockIdsFromNodes(getOlderSiblings(anchorNode))
    }

    case "getAncestors": {
      if (!anchorNode) return []
      return collectBlockIdsFromNodes(getAncestors(anchorNode))
    }

    case "getHeadingAncestors": {
      if (!anchorNode) return []
      return collectBlockIdsFromNodes(getHeadingAncestors(anchorNode))
    }

    default:
      return []
  }
}

function ensureMentionBlockIdIncluded(
  editor: PlateEditor,
  mentionPath: Path,
  blockIds: string[]
): string[] {
  const mentionEntry = editor.api.node(mentionPath)
  if (!mentionEntry) return blockIds

  const mentionId = (mentionEntry[0] as TElement).id as string | undefined
  if (!mentionId || blockIds.includes(mentionId)) return blockIds

  return filterBlockIdsInDocOrder(editor.children, blockIds, [mentionId])
}

export function selectContextBlockIds(
  editor: PlateEditor,
  targetPath: Path,
  result: ContextSelectorResult
): string[] {
  const { methods } = result
  if (methods.length === 0) return []

  const mentionPath = PathApi.previous(targetPath)
  if (!mentionPath) return []

  const ctx = getEditorTreeContext(editor, mentionPath)

  const idLists = methods.map((method) =>
    applyOneMethod(ctx, method, result.keywords)
  )

  const merged = filterBlockIdsInDocOrder(ctx.value, ...idLists)

  return ensureMentionBlockIdIncluded(editor, mentionPath, merged)
}

export function applyContextSelector(
  editor: PlateEditor,
  targetPath: Path,
  result: ContextSelectorResult
): Value {
  return filterValueByBlockIds(
    editor.children,
    selectContextBlockIds(editor, targetPath, result)
  )
}
