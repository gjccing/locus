import { MarkGithubIcon } from "@primer/octicons-react"
import { Button } from "@/components/ui/button"
import { signIn } from "@/auth"
import { H1, Lead } from "@/components/ui/typography"

export default function Page() {
  return (
    <div className="flex size-full flex-col items-center justify-center gap-8 p-16 md:pb-24 lg:pb-48">
      <H1 className="text-center text-6xl leading-[0.9] tracking-tighter md:text-7xl lg:text-8xl">
        Think in
        <br />
        <span className="text-primary italic">Branches.</span>
      </H1>
      <Lead className="max-w-2xl text-center">
        The LLM workstation for non-linear minds. Version control your thoughts,
        branch your conversations, and restructure your context.
      </Lead>
      <div className="flex flex-col gap-4 pt-4 sm:flex-row">
        <form
          action={async () => {
            "use server"
            await signIn("github", { redirectTo: "/" })
          }}
        >
          <Button type="submit" size="xxl" className="cursor-pointer">
            <MarkGithubIcon className="size-6" size={24} />
            Sign in with GitHub
          </Button>
        </form>
      </div>
    </div>
  )
}
