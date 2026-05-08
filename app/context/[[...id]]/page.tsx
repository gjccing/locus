import { auth } from "@/auth"
import { SettingsSheet } from "@/components/settings-sheet"
import { ContextSidebar } from "@/components/context-sidebar"

export const metadata = {
  title: "Context",
}

export default async function ContextPage({
  params,
}: {
  params: Promise<{ id?: string[] }>
}) {
  const { id } = await params
  const contextId = id?.[0]
  const session = await auth()
  const user = session?.user

  return (
    <main className="min-h-dvh w-dvw transition-all">
      {user && (
        <div className="fixed right-6 top-6 z-50">
          <SettingsSheet user={user} />
        </div>
      )}

      <ContextSidebar contextId={contextId} />
    </main>
  )
}

