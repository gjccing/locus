import { auth } from "@/auth"
import { SettingsSheet } from "@/components/settings-sheet"
import { SidebarTrigger } from "@/components/ui/sidebar"
import PlateEditor from "./plate-editor"

export const metadata = {
  title: "Context",
}

export default async function ContextPage({ params }: { params: Promise<{ id?: string[] }> }) {
  const session = await auth()
  const user = session?.user
  const { id } = await params
  const contextId = id?.[0] ?? "home"

  return (
    <main className="relative flex h-full min-h-0 w-full flex-col items-center justify-start bg-secondary pt-14">
      <SidebarTrigger className="absolute left-4 top-4 z-50" />

      {user && (
        <div className="absolute right-6 top-6 z-50">
          <SettingsSheet user={user} />
        </div>
      )}

      <PlateEditor contextId={contextId} />
    </main>
  )
}

