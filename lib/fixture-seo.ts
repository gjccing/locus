import { NodeApi, type TElement, type Value } from "platejs"

import { contextEditorFixture } from "@/components/editor/context-editor-fixture"

type FixtureSection = {
  heading: string
  paragraphs: string[]
}

function blockText(node: TElement): string {
  return NodeApi.string(node).trim()
}

function buildMetaDescription(tagline: string, bullets: string[]): string {
  const benefits = bullets
    .map((bullet) => bullet.split(" — ")[0]?.trim())
    .filter(Boolean)
    .join(", ")

  const description = benefits
    ? `${tagline} ${benefits}.`
    : tagline

  if (description.length <= 160) {
    return description
  }

  return `${tagline} ${benefits.split(", ")[0]}.`.slice(0, 160).trim()
}

export function extractFixtureSeo(value: Value = contextEditorFixture) {
  const h1 =
    value
      .filter((node): node is TElement => (node as TElement).type === "h1")
      .map(blockText)[0] ?? "Locus"

  const taglineIndex = value.findIndex(
    (node) => (node as TElement).type === "p"
  )
  const tagline =
    taglineIndex >= 0 ? blockText(value[taglineIndex] as TElement) : ""

  const sections: FixtureSection[] = []
  let current: FixtureSection | null = null

  for (const node of value) {
    const element = node as TElement
    const text = blockText(element)
    if (!text) continue

    if (element.type === "h2") {
      if (current) sections.push(current)
      current = { heading: text, paragraphs: [] }
      continue
    }

    if (element.type === "p" && current) {
      current.paragraphs.push(text)
    }
  }

  if (current) sections.push(current)

  const whySection = sections.find((section) => section.heading === "Why Locus")
  const metaDescription = buildMetaDescription(
    tagline,
    whySection?.paragraphs ?? []
  )

  const keywords = [
    "Locus",
    "notes",
    "AI answers",
    "editable page",
    "context-aware AI",
    "@mention",
    "OpenAI",
    "Anthropic",
    "Gemini",
    "Groq",
    "note-taking",
    "AI chat",
  ]

  return {
    h1,
    tagline,
    sections,
    metaDescription,
    keywords,
    title: `${h1} — Notes and AI on one page`,
  }
}

export const fixtureSeo = extractFixtureSeo()
