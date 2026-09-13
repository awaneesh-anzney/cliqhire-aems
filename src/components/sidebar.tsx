"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  Home,
  Briefcase,
  Route,
  ListTodo,
  UserRoundSearch,
  UserPlus,
  CircleUser,
  ChevronRight,
  LogOut,
  Bell,
  ShieldCheck,
  UserRoundCog,
  Workflow,
  User,
  Mail,
  Settings,
  Users,
  Sparkles,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/contexts/PermissionContext";
import {
  Sidebar as UISidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarRail,
} from "@/components/ui/sidebar";
import { SIDEBAR_MODULES, SidebarModule } from "@/lib/sidebarModules";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

// Map moduleKey → lucide icon
const MODULE_ICONS: Record<string, React.ElementType> = {
  home: Home,
  todo: ListTodo,
  leads: Building2,
  clients: Building2,
  "client-groups": Layers,
  jobs: Briefcase,
  candidates: User,
  pipeline: Workflow,
  recruiter: UserPlus,
  headhunter: UserRoundSearch,
  tem_candidates: UserRoundCog,
  teams: Users,
  roles: ShieldCheck,
  settings: Settings,
  profile: CircleUser,
  admin: ShieldCheck,
  notifications: Bell,
  email: Mail,
};

// Group categories for structured navigation
interface NavSection {
  title: string;
  moduleKeys: string[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: "Overview",
    moduleKeys: ["home", "todo"],
  },
  {
    title: "Recruitment",
    moduleKeys: [
      "clients", // Leads, Clients, Client Groups share clients permission
      "jobs",
      "candidates",
      "pipeline",
      "recruiter",
      "headhunter",
      "tem_candidates",
    ],
  },
  {
    title: "Workspace",
    moduleKeys: ["teams", "email", "notifications"],
  },
  {
    title: "System",
    moduleKeys: ["admin", "settings", "profile"],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { loading: loadingPerms, hasPermission } = usePermissions();

  const isAdmin = user?.role === "ADMIN";

  // Filter allowed modules
  const allowedModules = React.useMemo(() => {
    return SIDEBAR_MODULES.filter((item) => {
      if (isAdmin && ["recruiter", "todo", "headhunter"].includes(item.moduleKey)) {
        return false;
      }
      if (item.alwaysVisible) return true;
      if (isAdmin) return true;
      return hasPermission(item.moduleKey, "view");
    });
  }, [isAdmin, hasPermission]);

  // Group modules by section
  const groupedModules = React.useMemo(() => {
    const sections: { title: string; items: SidebarModule[] }[] = [];

    // Map by href or moduleKey
    const remaining = [...allowedModules];

    NAV_SECTIONS.forEach((sec) => {
      const matchedItems: SidebarModule[] = [];
      sec.moduleKeys.forEach((key) => {
        const matches = remaining.filter((m) => {
          if (key === "clients") {
            return (
              m.href === "/leads" ||
              m.href === "/clients" ||
              m.href === "/client-groups"
            );
          }
          if (key === "home") return m.href === "/";
          if (key === "todo") return m.href === "/todo";
          return m.moduleKey === key;
        });

        matches.forEach((item) => {
          if (!matchedItems.includes(item)) {
            matchedItems.push(item);
            const idx = remaining.indexOf(item);
            if (idx > -1) remaining.splice(idx, 1);
          }
        });
      });

      if (matchedItems.length > 0) {
        sections.push({ title: sec.title, items: matchedItems });
      }
    });

    if (remaining.length > 0) {
      sections.push({ title: "Other", items: remaining });
    }

    return sections;
  }, [allowedModules]);

  const getUserInitials = () => {
    if (user?.name) {
      return user.name
        .split(" ")
        .map((w: string) => w.charAt(0))
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return "U";
  };

  return (
    <UISidebar
      collapsible="icon"
      className="border-r border-white/10 bg-brand/85 backdrop-blur-xl text-white shadow-sm transition-all duration-300"
      data-variant="sidebar"
    >
      {/* Brand Header */}
      <SidebarHeader className="p-3.5 border-b border-white/10 shrink-0 bg-transparent">
        <Link
          href="/"
          className="flex items-center gap-3 w-full group-data-[collapsible=icon]:justify-center select-none"
        >
          {/* Logo Mark */}
          <div className="relative flex shrink-0 items-center justify-center">
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-primary shadow-md shadow-black/20 transition-transform duration-200 hover:scale-105 active:scale-95 font-black text-base tracking-tighter">
              CH
            </div>
          </div>

          {/* Brand Text */}
          <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden animate-in fade-in slide-in-from-left-2 duration-300">
            <div className="flex items-center gap-1.5">
              <span className="text-[15px] font-black tracking-tight text-white leading-none">
                Cliq<span className="text-red-400">Hire</span>
              </span>
            </div>
            <p className="text-[10px] font-medium text-white/70 mt-0.5 truncate">
              Talent & Recruitment
            </p>
          </div>
        </Link>
      </SidebarHeader>

      {/* Navigation Links Content */}
      <SidebarContent className="px-2.5 py-2 group-data-[collapsible=icon]:px-1.5 overflow-y-auto custom-scrollbar">
        {loadingPerms ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground group-data-[collapsible=icon]:hidden animate-pulse">
            <div className="w-6 h-6 rounded-full bg-primary/20 animate-spin" />
            <span className="text-[10px] font-semibold uppercase tracking-wider">
              Loading navigation...
            </span>
          </div>
        ) : (
          <div className="space-y-4">
            {groupedModules.map((section, sIndex) => (
              <SidebarGroup key={sIndex} className="p-0">
                <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-wider text-white/60 px-2 pb-1 pt-1 select-none group-data-[collapsible=icon]:hidden">
                  {section.title}
                </SidebarGroupLabel>

                <SidebarGroupContent>
                  <SidebarMenu className="space-y-0.5 group-data-[collapsible=icon]:gap-1">
                    {section.items.map((item, index) => {
                      const isActive =
                        item.href === "/"
                          ? pathname === "/" || pathname === "/dashboard"
                          : pathname?.startsWith(item.href);

                      // Determine icon based on route or moduleKey
                      let Icon = MODULE_ICONS[item.moduleKey] ?? Home;
                      if (item.href === "/leads") Icon = Building2;
                      if (item.href === "/clients") Icon = Building2;
                      if (item.href === "/client-groups") Icon = Layers;

                      return (
                        <SidebarMenuItem key={index}>
                          <SidebarMenuButton
                            asChild
                            isActive={!!isActive}
                            tooltip={{
                              children: item.name,
                              className:
                                "bg-popover text-popover-foreground border border-border text-xs font-semibold px-2.5 py-1 shadow-lg",
                            }}
                            className={cn(
                              "relative flex items-center h-9 px-2.5 rounded-xl transition-all duration-150 select-none",
                              isActive
                                ? "bg-white/20 text-white font-bold border border-white/25 shadow-2xs"
                                : "text-white/80 hover:text-white hover:bg-white/10 border border-transparent font-medium"
                            )}
                          >
                            <Link
                              href={item.href}
                              className="flex items-center gap-2.5 w-full h-full group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
                            >
                              {/* Left active glowing indicator */}
                              {isActive && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-white rounded-r-full group-data-[collapsible=icon]:hidden" />
                              )}

                              <div
                                className={cn(
                                  "w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                                  isActive
                                    ? "text-white"
                                    : "text-white/70 group-hover:text-white"
                                )}
                              >
                                <Icon className="h-4 w-4 shrink-0" />
                              </div>

                              <span className="text-xs tracking-tight truncate group-data-[collapsible=icon]:hidden">
                                {item.name}
                              </span>

                              {isActive && (
                                <ChevronRight className="w-3.5 h-3.5 ml-auto text-white/70 group-data-[collapsible=icon]:hidden" />
                              )}
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </div>
        )}
      </SidebarContent>

      {/* Modern User Profile Footer */}
      <SidebarFooter className="p-2.5 border-t border-white/10 shrink-0 bg-transparent">
        <div className="flex items-center justify-between gap-2 p-1.5 rounded-xl bg-white/10 border border-white/15 group-data-[collapsible=icon]:justify-center">
          <Link
            href="/profile"
            className="flex items-center gap-2 min-w-0 flex-1 hover:opacity-80 transition-opacity"
          >
            <div className="relative shrink-0">
              <Avatar className="h-8 w-8 rounded-lg border border-white/20 shadow-2xs">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="bg-white/20 text-white font-bold text-[10px] rounded-lg">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-brand" />
            </div>

            <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
              <span className="text-xs font-semibold text-white truncate leading-none">
                {user?.name || "User"}
              </span>
              <span className="text-[10px] font-medium text-white/70 truncate mt-0.5">
                {user?.role || "Member"}
              </span>
            </div>
          </Link>

          <button
            type="button"
            onClick={logout}
            title="Sign Out"
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/15 transition-colors group-data-[collapsible=icon]:hidden shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </UISidebar>
  );
}

export default Sidebar;