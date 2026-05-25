"use client"

import { MessageSquare } from "lucide-react"

import { cn } from "@/lib/utils"

export const FEEDBACK_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSfY7iFvJqh72_35o2bGpdKtlovbgpcfTpcy9nT4IKmZYocJ2w/viewform?usp=publish-editor"

interface FeedbackButtonProps {
  className?: string
}

export function FeedbackButton({ className }: FeedbackButtonProps) {
  return (
    <a
      href={FEEDBACK_FORM_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Send feedback"
      className={cn(
        "flex size-10 cursor-pointer items-center justify-center rounded-full bg-background text-foreground shadow-sm transition-opacity outline-none hover:opacity-80 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        className
      )}
    >
      <MessageSquare className="size-5" />
    </a>
  )
}
