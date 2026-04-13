import { SidebarProvider } from "@/components/ui/sidebar"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Explorer } from "@/components/explorer"
import { TabProvider } from "@/components/tab-context"
import { RepoProvider } from "@/components/repo-context"

export default function WorkstationLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <TabProvider>
      <RepoProvider>
        <SidebarProvider className="relative min-h-[inherit]">
          <Explorer className="absolute max-h-full bg-none" />
          <div className="relative flex-1 overflow-auto">
            <SidebarTrigger className="absolute top-1 left-2" />
            {children}
          </div>
        </SidebarProvider>
      </RepoProvider>
    </TabProvider>
  )
}
