"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  Calendar,
  Home,
  Lock,
  MessageSquare,
  Settings,
  Users,
  Briefcase,
  UserCheck,
  BarChart,
  Search,
  DollarSign,
  Route,
  LockKeyhole,
  ListTodo,
  UserRoundSearch,
  UserPlus,
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
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarRail,
} from "@/components/ui/sidebar";

const menuItems = [
  { name: "Home", icon: Home, href: "/", moduleKey: "home", alwaysVisible: true },
  { name: "Today's Tasks", icon: ListTodo, href: "/today-tasks", moduleKey: "today_tasks", alwaysVisible: true },
  { name: "Clients", icon: Building2, href: "/clients", moduleKey: "clients" },
  { name: "Jobs", icon: Briefcase, href: "/jobs", moduleKey: "jobs" },
  { name: "Candidates", icon: Users, href: "/candidates", moduleKey: "candidates" },
  { name: "Recruitment Pipeline", icon: Route, href: "/reactruterpipeline", moduleKey: "pipeline" },
  { name: "Recruiter", icon: UserPlus, href: "/recruiter", moduleKey: "recruiter" },
  { name: "Head Hunter", icon: UserRoundSearch, href: "/headhunter", moduleKey: "headhunter" },
  { name: "Temp Candidates", icon: Users, href: "/tem-candidates", moduleKey: "tem_candidates" },
  { name: "Team Members", icon: Users, href: "/teammembers", moduleKey: "teams" },
  { name: "User Access", icon: LockKeyhole, href: "/user-access", moduleKey: "roles" },
  { name: "Settings", icon: Settings, href: "/settings", moduleKey: "settings" },
  { name: "Administration", icon: Lock, href: "/admin", moduleKey: "admin" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { loading: loadingPerms, hasPermission } = usePermissions();

  // Check user role for fallbacks
  const isAdmin = user?.role === 'ADMIN';

  return (
    <UISidebar
      collapsible="icon"
      className="border-r bg-sidebar"
      data-variant="sidebar"
    >
      <SidebarHeader className="pt-6 pb-2 px-6 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:pt-6 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center">
        <div className="flex items-center gap-3 w-full group-data-[collapsible=icon]:justify-center">
          <div className="flex shrink-0 items-center justify-center rounded-lg bg-brand p-1.5 text-white shadow-sm shadow-brand/20">
            <Route className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-[#2B3674] group-data-[collapsible=icon]:hidden whitespace-nowrap overflow-hidden transition-all">Cliqhire</h1>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-4 py-4 group-data-[collapsible=icon]:px-2">
        <SidebarGroup>
          <SidebarGroupContent>
            {loadingPerms ? (
              <div className="text-sm text-center text-slate-400 py-4 group-data-[collapsible=icon]:hidden">Loading menu...</div>
            ) : (
              <SidebarMenu className="group-data-[collapsible=icon]:gap-1 space-y-1.5">
                {menuItems
                  .filter((item) => {
                    // Always show Home, Tasks
                    if (item.alwaysVisible) return true;
                    
                    if (isAdmin) return true;

                    // Verify view permission effortlessly via the new global context!
                    return hasPermission(item.moduleKey, "view");
                  })
                  .map((item, index) => {
                    const active = (item.href === "/" ? (pathname === "/" || pathname === "/dashboard") : pathname?.startsWith(item.href));
                    const Icon = item.icon;
                    return (
                      <SidebarMenuItem key={index}>
                        <SidebarMenuButton
                          asChild
                          isActive={!!active}
                          tooltip={{
                            children: item.name,
                            className: "bg-primary text-primary-foreground border-none font-medium shadow-md"
                          }}
                          className={cn(
                            "group h-11 transition-all duration-200 ease-out rounded-lg relative ring-offset-0 px-3 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center w-full",
                            active
                              ? "bg-brand/10 text-brand font-medium data-[active=true]:bg-brand/10 data-[active=true]:text-brand hover:bg-brand/10 hover:text-brand"
                              : "text-slate-500 hover:bg-brand/5 hover:text-brand"
                          )}
                        >
                          <Link href={item.href} className="flex items-center gap-3 w-full h-full group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
                            {active && (
                              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-7 bg-brand rounded-r-md transition-all group-data-[collapsible=icon]:h-6" />
                            )}
                            <div className="flex items-center gap-3 w-full group-data-[collapsible=icon]:justify-center">
                              <Icon className={cn("h-[18px] w-[18px] shrink-0 transition-colors", active ? "text-brand" : "text-slate-400 group-hover:text-brand/80")} />
                              <span className="text-[14.5px] font-medium tracking-wide group-data-[collapsible=icon]:hidden whitespace-nowrap overflow-hidden transition-all">{item.name}</span>
                            </div>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
              </SidebarMenu>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
      <SidebarRail />
    </UISidebar>
  );
}
