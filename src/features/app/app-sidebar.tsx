import {
  AudioWaveform,
  Command,
  File,
  GalleryVerticalEnd,
  Home,
  MessageCircle,
  Settings,
  Settings2,
  Users,
} from "lucide-react";
import * as React from "react";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar";
import { NavItems } from "@/features/app/nav-items";
import { NavUser } from "@/features/app/nav-user";
import { OrganizationSwitcher } from "@/features/organization/organization-switcher";

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  organizations: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  items: [
    {
      name: "Overview",
      url: "/dashboard",
      icon: Home,
    },
    {
      name: "Settings",
      url: "/dashboard/settings",
      icon: Settings2,
    },
    {
      name: "Enhanced Settings",
      url: "/dashboard/settings-enhanced",
      icon: Settings,
    },
    {
      name: "Admin Users",
      url: "/dashboard/admin/users",
      icon: Users,
    },
    {
      name: "Chat",
      url: "/dashboard/chat",
      icon: MessageCircle,
    },
    {
      name: "RAG",
      url: "/dashboard/chat/rag",
      icon: File,
    },
    {
      name: "Vercel",
      url: "/dashboard/chat/vercel",
      icon: MessageCircle,
    },
    {
      name: "Agent",
      url: "/dashboard/chat/agent",
      icon: MessageCircle,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <OrganizationSwitcher organizations={data.organizations} />
      </SidebarHeader>
      <SidebarContent>
        <NavItems items={data.items} label="" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
