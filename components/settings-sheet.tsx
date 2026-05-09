import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { signOut } from "@/auth"
import { SignInIcon } from "@primer/octicons-react"
import { ApiKeyList } from "@/components/api-key-list"

interface SettingsSheetProps {
  user: {
    name?: string | null
    image?: string | null
  }
}

export function SettingsSheet({ user }: SettingsSheetProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="cursor-pointer rounded-full transition-opacity outline-none hover:opacity-80 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
          <Avatar>
            <AvatarImage
              src={user.image ?? undefined}
              alt={user.name ?? "User"}
            />
            <AvatarFallback>
              {user.name?.slice(0, 2).toUpperCase() ?? "US"}
            </AvatarFallback>
          </Avatar>
        </button>
      </SheetTrigger>
      <SheetContent className="gap-0">
        <SheetHeader>
          <SheetTitle className="text-xl">Settings</SheetTitle>
        </SheetHeader>
        <div className="overflow-y-auto scroll-shadow-y">
          <ApiKeyList />
        </div>
        <SheetFooter>
          <form
            action={async () => {
              "use server"
              await signOut({ redirectTo: "/" })
            }}
          >
            <Button
              type="submit"
              variant="outline"
              className="w-full text-destructive"
            >
              <SignInIcon size={16} />
              Sign Out
            </Button>
          </form>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
