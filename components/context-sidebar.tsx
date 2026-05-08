"use client"

import Link from "next/link"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { H1, Lead, InlineCode } from "@/components/ui/typography"

export function ContextSidebar({ contextId }: { contextId?: string }) {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Context</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={!contextId}>
                    <Link href="/context">Home</Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={contextId === "preview"}>
                    <Link href="/context/preview">Preview</Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter />
      </Sidebar>

      <SidebarInset>
        <div className="flex items-center gap-2 p-3">
          <SidebarTrigger />
        </div>

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
      </SidebarInset>
    </SidebarProvider>
  )
}

