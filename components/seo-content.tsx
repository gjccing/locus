import { fixtureSeo } from "@/lib/fixture-seo"

export function SeoContent() {
  const { h1, tagline, sections } = fixtureSeo

  return (
    <article className="sr-only">
      <h1>{h1}</h1>
      <p>{tagline}</p>
      {sections.map((section) => (
        <section key={section.heading}>
          <h2>{section.heading}</h2>
          {section.paragraphs.map((paragraph) => (
            <p key={`${section.heading}-${paragraph}`}>{paragraph}</p>
          ))}
        </section>
      ))}
    </article>
  )
}
