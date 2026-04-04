import { auth } from "@/auth"
import { SettingsSheet } from "@/components/settings-sheet"

export async function Header() {
  const session = await auth()
  const user = session?.user

  return (
    <header className="fixed top-0 z-50 w-full flex justify-between items-center px-6 md:px-12 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-surface-container-high">
      <div className="flex items-center gap-8">
        <span className="text-xl font-bold tracking-tighter text-slate-900 dark:text-slate-50">Locus</span>
      </div>
      <div className="flex items-center gap-4">
        {user && <SettingsSheet user={user} />}
      </div>
    </header>
  )
}