import type { TElement, Value } from "platejs"
import type { Node } from "@/lib/editor-value-tree"

export function getOlderSibling(node: Node): Node | null {
  const parent = node.parent
  if (parent === undefined) return null
  const siblings = parent.children
  const index = siblings.indexOf(node)
  if (index === -1) return null
  return siblings[index - 1]
}

export function getAncestors(node: Node): Node[] {
  const ancestors: Node[] = []
  let current = node
  while (current.parent) {
    ancestors.unshift(current.parent)
    current = current.parent
  }
  return ancestors
}

export function getHeadingAncestors(node: Node): Node[] {
  const ancestors: Node[] = []
  let current = node
  while (current.parent) {
    if (current.parent.element?.type.startsWith("h")) {
      ancestors.unshift(current.parent)
    }
    current = current.parent
  }
  return ancestors
}

export function getAboveValue(value: Value, element: TElement): Value {
  const index = value.indexOf(element)
  if (index === -1) return []
  return value.slice(0, index)
}

function getText(element: TElement): string {
  return element.children.map((child) => child.text).join("")
}

export function getAboveValueWithKeywords(
  value: Value,
  element: TElement,
  keywords: string[]
): Value {
  const valueAboveElement = getAboveValue(value, element)
  return valueAboveElement.filter((element) => {
    const text = getText(element)
    return keywords.some((keyword) => text.includes(keyword))
  })
}
