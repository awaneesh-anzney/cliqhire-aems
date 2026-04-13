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
  { name: "Home", icon: Home, href: "/", permission: "HOME" },
  { name: "Today's Tasks", icon: ListTodo, href: "/today-tasks", permission: "TODAY_TASKS" },
  { name: "Clients", icon: Building2, href: "/clients", permission: "CLIENTS" },
  { name: "Jobs", icon: Briefcase, href: "/jobs", permission: "JOBS" },
  { name: "Candidates", icon: Users, href: "/candidates", permission: "CANDIDATE" },
  { name: "Recruitment Pipeline", icon: Route, href: "/reactruterpipeline", permission: "RECRUITMENT_PIPELINE" },
  { name: "Recruiter", icon: UserPlus, href: "/recruiter", permission: "RECRUITER" },
  { name: "Head Hunter", icon: UserRoundSearch, href: "/headhunter", permission: "HEAD_HUNTER" },
  { name: "Temp Candidates", icon: Users, href: "/tem-candidates", permission: "TEM_CANDIDATES" },
  { name: "Team Members", icon: Users, href: "/teammembers", permission: "TEAM_MEMBERS" },
  { name: "User Access", icon: LockKeyhole, href: "/user-access", permission: "USER_ACCESS" },
  // { name: "Placements", icon: UserCheck, href: "/placements", permission: "PLACEMENTS" },
  // { name: "Activities", icon: Calendar, href: "/activities", permission: "ACTIVITIES" },
  // { name: "Inbox", icon: MessageSquare, href: "/inbox", permission: "INBOX" },
  // { name: "Account & Finance", icon: DollarSign, href: "/finance", permission: "FINANCE" },
  // { name: "Reports", icon: BarChart, href: "/reports", permission: "REPORTS" },
  { name: "Settings", icon: Settings, href: "/settings", permission: "SETTINGS" },
  { name: "Administration", icon: Lock, href: "/admin", permission: "ADMIN" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  // Check user role
  const isAdmin = user?.role === 'ADMIN';
  const isHiringManager = user?.role === 'HIRING_MANAGER';
  const isTeamLead = user?.role === 'TEAM_LEAD';
  const isHeadhunter = (() => {
    const role = user?.role ? String(user.role).toUpperCase() : '';
    return role === 'HEADHUNTER' || role === 'HEAD_HUNTER';
  })();
  const isManagerOrLead = isAdmin || isHiringManager || isTeamLead;

  // Determine which permissions to use
  // If user has custom permissions, use those; otherwise use default permissions
  let finalPermissions = (user?.permissions && user.permissions.length > 0)
    ? user.permissions
    : user?.defaultPermissions || [];

  // Ensure TODAY_TASKS permission is available for all non-admin users (except headhunters)
  if (!isAdmin && !isHeadhunter && !finalPermissions.includes('TODAY_TASKS')) {
    finalPermissions = [...finalPermissions, 'TODAY_TASKS'];
  }

  // Map base permissions to required VIEW permissions for sidebar visibility
  const permissionViewMap: Record<string, string> = {
    CLIENTS: 'CLIENTS_VIEW',
    JOBS: 'JOBS_VIEW',
    CANDIDATE: 'CANDIDATE_VIEW',
    RECRUITMENT_PIPELINE: 'RECRUITMENT_PIPELINE_VIEW',
    TEAM_MEMBERS: 'TEAM_MEMBERS_VIEW',
    USER_ACCESS: 'USER_ACCESS_VIEW',
    HEAD_HUNTER: 'HEAD_HUNTER_VIEW',
  };

  // Special permissions for managers and leads
  if (isManagerOrLead) {
    finalPermissions = [...finalPermissions, 'TEAM_MEMBERS_VIEW', 'USER_ACCESS_VIEW'];
  }

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
            <SidebarMenu className="group-data-[collapsible=icon]:gap-1 space-y-1.5">
              {menuItems
                .filter((item) => {
                  if (item.permission === 'RECRUITER') {
                    return !isAdmin && !isHeadhunter;
                  }
                  if (isHeadhunter && finalPermissions.includes('HEAD_HUNTER_VIEW')) {
                    return item.permission === 'HEAD_HUNTER';
                  }
                  if (isAdmin) {
                    if (item.permission === 'TODAY_TASKS') return false;
                    if (item.permission === 'HEAD_HUNTER') return false;
                    return true;
                  }
                  if (item.permission === 'HOME') return true;
                  const requiredView = permissionViewMap[item.permission as keyof typeof permissionViewMap];
                  if (requiredView) {
                    return finalPermissions.includes(requiredView);
                  }
                  return finalPermissions.includes(item.permission);
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
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
      <SidebarRail />
    </UISidebar>
  );
}
