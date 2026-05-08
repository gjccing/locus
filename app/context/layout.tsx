import { BootstrapStore } from "@/components/bootstrap-store"

export default function ContextLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <BootstrapStore />
      {children}
    </>
  )
}

