import { auth } from "@/auth"
import { SettingsSheet } from "@/components/settings-sheet"
import { SidebarTrigger } from "@/components/ui/sidebar"
import ContextEditor from "@/components/editor/context-editor"

export const metadata = {
  title: "Context",
}

export default async function ContextPage({ params }: { params: Promise<{ id?: string[] }> }) {
  const session = await auth()
  const user = session?.user
  const { id } = await params
  const contextId = id?.[0] ?? "home"

  return (

    <main className="relative flex h-full min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden bg-secondary">
      <div className="sticky top-0 z-50 flex w-full shrink-0 justify-between px-4 pt-4 sm:pr-6">
        <SidebarTrigger />

        {user && (
          <SettingsSheet user={user} />
        )}
      </div>

      <div className="absolute top-0 left-0 right-0 bottom-0 min-h-0 flex-1 overflow-y-auto">
        <div className="flex min-h-full flex-col justify-end items-center">
          <ContextEditor contextId={contextId} />
        </div>
      </div>
    </main>
  )
}

