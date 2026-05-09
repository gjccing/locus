import { BootstrapStore } from "@/components/bootstrap-store"
import { SidebarProvider } from "@/components/ui/sidebar"
import { ContextSidebar } from "@/components/context-sidebar"

export default async function ContextLayout({
  params,
  children,
}: Readonly<{
  params: Promise<{ id?: string[] }>
  children: React.ReactNode
}>) {
  const { id } = await params
  const contextId = id?.[0]
  return (
    <>
      <BootstrapStore />
      <SidebarProvider className="h-dvh w-dvw">
        <ContextSidebar contextId={contextId} />
        {children}
      </SidebarProvider>
    </>
  )
}

