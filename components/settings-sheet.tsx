"use client"

import { handleSignOut } from "@/app/actions/auth"
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
import { SignInIcon } from "@primer/octicons-react"
import { ApiKeyList } from "@/components/api-key/api-key-list"
import { AssistantList } from "@/components/assistant/assistant-list"
import { cn } from "@/lib/utils"

interface SettingsSheetProps {
  classNameOfTrigger?: string
  user: {
    name?: string | null
    image?: string | null
  }
}

export function SettingsSheet({
  classNameOfTrigger,
  user
}: SettingsSheetProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className={cn(
          "cursor-pointer rounded-full transition-opacity outline-none hover:opacity-80 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          classNameOfTrigger
        )}>
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
          <AssistantList />
        </div>
        <SheetFooter>
          <form action={handleSignOut}>
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
