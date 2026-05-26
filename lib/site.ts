import { fixtureSeo } from "@/lib/fixture-seo"

function getSiteUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "")
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  return "http://localhost:3000"
}

export const siteConfig = {
  name: "Locus",
  title: fixtureSeo.title,
  description: fixtureSeo.metaDescription,
  keywords: fixtureSeo.keywords,
  url: getSiteUrl(),
} as const

export const siteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: siteConfig.name,
  description: siteConfig.description,
  url: siteConfig.url,
  applicationCategory: "ProductivityApplication",
  operatingSystem: "Any",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
} as const
