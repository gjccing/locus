import type { TElement, Value } from "platejs"

type LevelRelativeProps = {
  type: string
  indent?: number
}
interface Node {
  element?: TElement & LevelRelativeProps
  children: Node[]
  parent?: Node
}

function getLevel(element?: LevelRelativeProps): number {
  if (element === undefined) return Infinity

  switch (element.type) {
    case "h1":
      return 60
    case "h2":
      return 50
    case "h3":
      return 40
    case "h4":
      return 30
    case "h5":
      return 20
    case "h6":
      return 10
    default:
      return 9 - (element.indent || 0)
  }
}

export function buildTreeFromValue(
  value: (TElement & LevelRelativeProps)[]
): Node[] {
  const res: Node[] = []
  const path: Node[] = []
  for (const curr of value) {
    if (curr.type === "hr") {
      path.splice(0, path.length)
    } else {
      const currentLevel = getLevel(curr)
      const currentNode: Node = { children: [], element: curr }
      while (getLevel(path.at(-1)?.element) <= currentLevel) path.pop()
      const parent = path.at(-1)
      if (parent) {
        parent.children.push(currentNode)
        currentNode.parent = parent
      }
      path.push(currentNode)
      if (path.length === 1) res.push(currentNode)
    }
  }

  return res
}

export function getNodeByElementId(id: string, node: Node): Node | null {
  if (node.element?.id === id) return node
  for (const child of node.children) {
    const result = getNodeByElementId(id, child)
    if (result) return result
  }
  return null
}

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

export function getValueAboveElement(value: Value, element: TElement): Value {
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
  const valueAboveElement = getValueAboveElement(value, element)
  return valueAboveElement.filter((element) => {
    const text = getText(element)
    return keywords.some((keyword) => text.includes(keyword))
  })
}
