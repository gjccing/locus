"use client"

import { useState } from "react"
import { Settings } from "lucide-react"
import { TrashIcon } from "@primer/octicons-react"

import { ApiKeyList } from "@/components/api-key/api-key-list"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { useAppStore } from "@/stores/app-store"

interface SettingsSheetProps {
  classNameOfTrigger?: string
}

export function SettingsSheet({ classNameOfTrigger }: SettingsSheetProps) {
  const clearAllData = useAppStore((s) => s.apiKeysClearAll)
  const [open, setOpen] = useState(false)

  const handleClearAllData = async () => {
    await clearAllData()
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="Settings"
          className={cn(
            "flex size-10 cursor-pointer items-center justify-center rounded-full bg-background text-foreground shadow-sm transition-opacity outline-none hover:opacity-80 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
            classNameOfTrigger
          )}
        >
          <Settings className="size-5" />
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
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="w-full text-destructive"
              >
                <TrashIcon size={16} />
                Clear all data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear all data?</AlertDialogTitle>
                <AlertDialogDescription>
                  This removes your saved API keys and device storage from this
                  browser. You cannot undo this action.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  onClick={() => void handleClearAllData()}
                >
                  Clear all data
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
