import { auth } from "@/auth"
import { SettingsSheet } from "@/components/settings-sheet"
import { HeaderNav } from "./header-nav"
import { Large } from "@/components/ui/typography"
import { HeaderActions } from "./header-actions"

export async function Header() {
  const session = await auth()
  const user = session?.user
  return (
    <header className="fixed left-0 top-0 z-50 w-full flex justify-between items-center px-6 md:px-12 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-all">
      <div className="flex items-center gap-8">
        <Large className="text-xl font-bold tracking-tighter text-slate-900 dark:text-slate-50">Locus</Large>
        <HeaderNav />
      </div>
      <div className="flex items-center gap-4">
        <HeaderActions />
        {user && <SettingsSheet user={user} />}
      </div>
    </header>
  )
}