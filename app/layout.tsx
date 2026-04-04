import { Geist, Geist_Mono } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Header } from "@/components/header"
import { cn } from "@/lib/utils";
import { APIKeyProvider } from "@/components/api-key-provider"
import { auth } from "@/auth"

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth()
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", geist.variable)}
    >
      <body>
        <ThemeProvider>
          <APIKeyProvider secret={session?.user.name || ""}>
            <Header />
            <main className="pt-24 px-6 md:px-12 lg:px-24 pb-12 transition-all max-w-360 mx-auto">
              {children}
            </main>
          </APIKeyProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
