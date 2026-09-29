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

// Map moduleKey → lucide icon and color accents
const MODULE_THEMES: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  home: { icon: Home, color: "text-blue-400", bg: "bg-blue-500/15" },
  todo: { icon: ListTodo, color: "text-amber-400", bg: "bg-amber-500/15" },
  leads: { icon: Building2, color: "text-cyan-400", bg: "bg-cyan-500/15" },
  clients: { icon: Building2, color: "text-cyan-400", bg: "bg-cyan-500/15" },
  "client-groups": { icon: Layers, color: "text-teal-400", bg: "bg-teal-500/15" },
  jobs: { icon: Briefcase, color: "text-indigo-400", bg: "bg-indigo-500/15" },
  candidates: { icon: User, color: "text-violet-400", bg: "bg-violet-500/15" },
  pipeline: { icon: Workflow, color: "text-emerald-400", bg: "bg-emerald-500/15" },
  recruiter: { icon: UserPlus, color: "text-blue-400", bg: "bg-blue-500/15" },
  headhunter: { icon: UserRoundSearch, color: "text-purple-400", bg: "bg-purple-500/15" },
  tem_candidates: { icon: UserRoundCog, color: "text-pink-400", bg: "bg-pink-500/15" },
  teams: { icon: Users, color: "text-emerald-400", bg: "bg-emerald-500/15" },
  roles: { icon: ShieldCheck, color: "text-amber-400", bg: "bg-amber-500/15" },
  settings: { icon: Settings, color: "text-slate-400", bg: "bg-slate-500/15" },
  profile: { icon: CircleUser, color: "text-sky-400", bg: "bg-sky-500/15" },
  admin: { icon: ShieldCheck, color: "text-rose-400", bg: "bg-rose-500/15" },
  notifications: { icon: Bell, color: "text-rose-400", bg: "bg-rose-500/15" },
  email: { icon: Mail, color: "text-sky-400", bg: "bg-sky-500/15" },
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
      className="border-r border-sidebar-border app-sidebar transition-all duration-200 [&>div[data-sidebar=sidebar]]:bg-sidebar"
      data-variant="sidebar"
    >
      {/* Brand Header */}
      <SidebarHeader className="p-3 border-b border-sidebar-border/80 shrink-0 bg-transparent">
        <Link
          href="/"
          className="group flex items-center gap-3 w-full group-data-[collapsible=icon]:justify-center select-none !no-underline hover:!no-underline active:!no-underline focus:!no-underline outline-none"
        >
          {/* Logo Mark: Gradient Brand Box */}
          <div className="relative flex shrink-0 items-center justify-center">
            <div className="w-8.5 h-8.5 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 border border-white/25 transition-transform duration-200 group-hover:scale-105 active:scale-95 font-black text-sm tracking-tight relative">
              CH
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-sidebar animate-pulse" />
            </div>
          </div>

          {/* Brand Text */}
          <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden animate-in fade-in slide-in-from-left-2 duration-200">
            <div className="flex items-center gap-1.5">
              <span className="text-[15px] font-black tracking-tight text-white leading-none">
                Cliq<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Hire</span>
              </span>
            </div>
            <p className="text-[10px] font-medium text-slate-400 mt-0.5 truncate">
              Talent & Recruitment
            </p>
          </div>
        </Link>
      </SidebarHeader>

      {/* Navigation Links Content */}
      <SidebarContent className="px-2.5 py-3 group-data-[collapsible=icon]:px-1.5 overflow-y-auto custom-scrollbar">
        {loadingPerms ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground group-data-[collapsible=icon]:hidden animate-pulse">
            <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Loading navigation...
            </span>
          </div>
        ) : (
          <div className="space-y-4">
            {groupedModules.map((section, sIndex) => (
              <SidebarGroup key={sIndex} className="p-0">
                <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-wider text-slate-400/80 px-2.5 pb-1 pt-1 select-none group-data-[collapsible=icon]:hidden flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-slate-500/60" />
                  <span>{section.title}</span>
                </SidebarGroupLabel>

                <SidebarGroupContent>
                  <SidebarMenu className="space-y-0.5 group-data-[collapsible=icon]:gap-1">
                    {section.items.map((item, index) => {
                      const isActive =
                        item.href === "/"
                          ? pathname === "/" || pathname === "/dashboard"
                          : pathname?.startsWith(item.href);

                      // Determine icon & color based on route or moduleKey
                      let key = item.moduleKey;
                      if (item.href === "/leads") key = "leads";
                      if (item.href === "/clients") key = "clients";
                      if (item.href === "/client-groups") key = "client-groups";

                      const theme = MODULE_THEMES[key] ?? {
                        icon: Home,
                        color: "text-blue-400",
                        bg: "bg-blue-500/15",
                      };
                      const Icon = theme.icon;

                      return (
                        <SidebarMenuItem key={index}>
                          <SidebarMenuButton
                            asChild
                            isActive={!!isActive}
                            tooltip={{
                              children: item.name,
                              className:
                                "bg-popover text-popover-foreground border border-border text-xs font-semibold px-2.5 py-1 shadow-md",
                            }}
                            className={cn(
                              "relative flex items-center h-8.5 px-2.5 rounded-xl transition-all duration-150 select-none group/item",
                              isActive
                                ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 text-white font-semibold shadow-sm shadow-blue-500/25"
                                : "text-slate-300 hover:text-white hover:bg-white/[0.08] font-medium"
                            )}
                          >
                            <Link
                              href={item.href}
                              className="flex items-center gap-2.5 w-full h-full group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 !no-underline hover:!no-underline"
                            >
                              <div
                                className={cn(
                                  "w-5.5 h-5.5 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover/item:scale-105",
                                  isActive
                                    ? "bg-white/20 text-white shadow-2xs"
                                    : `${theme.bg} ${theme.color}`
                                )}
                              >
                                <Icon className="h-3.5 w-3.5 shrink-0" />
                              </div>

                              <span className="text-xs tracking-tight truncate group-data-[collapsible=icon]:hidden font-medium">
                                {item.name}
                              </span>
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
      <SidebarFooter className="p-2.5 border-t border-sidebar-border/80 shrink-0 bg-transparent">
        <div className="flex items-center justify-between gap-2 p-1.5 rounded-xl bg-white/[0.05] border border-white/10 group-data-[collapsible=icon]:justify-center hover:bg-white/[0.08] transition-all">
          <Link
            href="/profile"
            className="flex items-center gap-2 min-w-0 flex-1 hover:opacity-90 transition-opacity !no-underline hover:!no-underline"
          >
            <div className="relative shrink-0">
              <Avatar className="h-7 w-7 rounded-lg border border-white/15 shadow-2xs">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-[10px] rounded-lg">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-sidebar" />
            </div>

            <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
              <span className="text-xs font-semibold text-white truncate leading-none">
                {user?.name || "User"}
              </span>
              <div className="flex items-center gap-1 mt-0.5">
                <span className={cn(
                  "text-[9px] font-bold px-1.5 py-0.2 rounded-md uppercase tracking-wider truncate",
                  user?.role === "ADMIN"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                )}>
                  {user?.role || "Member"}
                </span>
              </div>
            </div>
          </Link>

          <button
            type="button"
            onClick={logout}
            title="Sign Out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/10 transition-colors group-data-[collapsible=icon]:hidden shrink-0"
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