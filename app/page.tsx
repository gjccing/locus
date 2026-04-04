import { MarkGithubIcon } from '@primer/octicons-react'
import { Button } from "@/components/ui/button"
import { signIn } from "@/auth"
import { H1, Lead } from "@/components/ui/typography"

export default function Page() {
  return (
    <section className="mt-24 flex flex-col justify-center items-center gap-8 px-4">
      <H1 className="text-6xl md:text-7xl lg:text-8xl tracking-tighter leading-[0.9] text-center">
        Think in<br /><span className="text-primary italic">Branches.</span>
      </H1>
      <Lead className="max-w-2xl text-center">
        The LLM workstation for non-linear minds. Version control your thoughts, branch your conversations, and restructure your context.
      </Lead>
      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <form
          action={async () => {
            "use server"
            await signIn("github", { redirectTo: "/repository" })
          }}
        >
          <Button type="submit" size="xxl" className="cursor-pointer">
            <MarkGithubIcon className="size-6" size={24} />
            Sign in with GitHub
          </Button>
        </form>
      </div>
    </section>
  )
}
