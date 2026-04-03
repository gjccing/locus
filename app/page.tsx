import { MarkGithubIcon } from '@primer/octicons-react'
import { Button } from "@/components/ui/button"
import { signIn } from "@/auth"

export default function Page() {
  return (
    <section className="mt-24 flex flex-col justify-center items-center gap-8">
      <h1 className="text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter leading-[0.9] text-center">
        Think in<br /><span className="text-primary italic">Branches.</span>
      </h1>
      <p className="text-xl max-w-2xl mx-auto text-center">
        The LLM workstation for non-linear minds. Version control your thoughts, branch your conversations, and restructure your context.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 pt-4">
        <form
          action={async () => {
            "use server"
            await signIn("github")
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
