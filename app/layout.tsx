import { Geist, Geist_Mono } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Header } from "@/components/header"
import { cn } from "@/lib/utils"
import { APIKeyProvider } from "@/components/api-key-provider"
import { TooltipProvider } from "@/components/ui/tooltip"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })

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
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        geist.variable
      )}
    >
      <body className="h-max w-max">
        <ThemeProvider>
          <APIKeyProvider>
            <TooltipProvider>
              <Header />
              <main className="min-h-[calc(100dvh-4rem)] w-dvw transition-all">
                {children}
              </main>
            </TooltipProvider>
          </APIKeyProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
