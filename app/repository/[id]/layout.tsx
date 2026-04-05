import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
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
          <AppSidebar className="absolute max-h-full" />
          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </SidebarProvider>
      </RepoProvider>
    </TabProvider>
  )
}
