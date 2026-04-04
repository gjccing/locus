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
  const initials = user?.name 
    ? user.name.slice(0, 2).toUpperCase() 
    : "US"
    
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="rounded-full cursor-pointer hover:opacity-80 transition-opacity outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
          <Avatar>
            <AvatarImage
              src={user.image ?? undefined}
              alt={user.name ?? "User"}
            />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </button>
      </SheetTrigger>
      <SheetContent className="gap-0">
        <SheetHeader>
          <SheetTitle className="text-xl">Settings</SheetTitle>
        </SheetHeader>
        <ApiKeyList />
        <SheetFooter>
          <form
            action={async () => {
              "use server"
              await signOut({ redirectTo: "/" })
            }}
          >
            <Button type="submit" variant="outline" className="w-full text-destructive">
              <SignInIcon size={16} />
              Sign Out
            </Button>
          </form>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
