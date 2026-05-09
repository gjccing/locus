import { auth } from "@/auth"
import { SettingsSheet } from "@/components/settings-sheet"

import { SidebarTrigger } from "@/components/ui/sidebar"

export const metadata = {
  title: "Context",
}

export default async function ContextPage() {
  const session = await auth()
  const user = session?.user

  return (
    <main className="relative h-full w-full">
      <SidebarTrigger className="absolute left-4 top-4 z-50" />

      {user && (
        <div className="absolute right-6 top-6 z-50">
          <SettingsSheet user={user} />
        </div>
      )}


    </main>
  )
}

