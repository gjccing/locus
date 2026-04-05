import { Geist, Geist_Mono } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Header } from "@/components/header"
import { cn } from "@/lib/utils";
import { APIKeyProvider } from "@/components/api-key-provider"

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", geist.variable)}
    >
      <body className="w-max h-max">
        <ThemeProvider>
          <APIKeyProvider>
            <Header />
            <main className="w-dvw min-h-[calc(100dvh-4rem)] transition-all">
              {children}
            </main>
          </APIKeyProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
