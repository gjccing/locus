import type { Value, TElement } from "platejs"

type LevelRelativeProps = {
  type: string
  indent?: number
}
interface Node {
  element?: TElement & LevelRelativeProps
  children: Node[]
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
      path.at(-1)?.children.push(currentNode)
      path.push(currentNode)
      if (path.length === 1) res.push(currentNode)
    }
  }

  return res
}
