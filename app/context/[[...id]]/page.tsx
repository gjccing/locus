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

    <main className="relative h-full w-full overflow-hidden">
      <SidebarTrigger className="absolute top-4 left-4 sm:top-6 sm:left-6" />
      {user && (
        <SettingsSheet
          classNameOfTrigger="absolute top-4 right-4 sm:top-6 sm:right-6"
          user={user}
        />
      )}
      <ContextEditor contextId={contextId} />
    </main>
  )
}

