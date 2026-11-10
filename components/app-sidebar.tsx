import * as React from "react"
import { Logo } from "@/components/Logo"
import { UserMenu } from "@/components/auth/user-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { SavedChatsList } from "./assistant-ui/saved-chats"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="px-2 py-1.5">
          <Logo />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SavedChatsList />
      </SidebarContent>
      
      <SidebarRail />
      <SidebarFooter>
        <div className="px-1 pb-1 sm:hidden">
          <UserMenu />
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
