import Link from "next/link"
import { auth } from "@/auth"
import { SettingsSheet } from "@/components/settings-sheet"
import { H1, Lead, InlineCode } from "@/components/ui/typography"
import { Button } from "@/components/ui/button"

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

      <div className="flex w-full flex-col gap-6 p-6 md:p-12">
        <div className="flex flex-col gap-2">
          <H1>Context</H1>
          <Lead>
            {contextId ? (
              <>
                Viewing context <InlineCode>{contextId}</InlineCode>.
              </>
            ) : (
              <>This is the landing page for context.</>
            )}
          </Lead>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {contextId ? (
            <Button variant="outline" asChild>
              <Link href="/context">Back to `/context`</Link>
            </Button>
          ) : (
            <Button asChild>
              <Link href="/context/preview">Open `/context/preview`</Link>
            </Button>
          )}
        </div>
      </div>
    </main>
  )
}

