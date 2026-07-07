"use client";
 
 import Link from "next/link";
 import { usePathname } from "next/navigation";
 import {
   Building2,
   Home,
   Lock,
   Settings,
   Users,
   Briefcase,
   Route,
   LockKeyhole,
   ListTodo,
   UserRoundSearch,
   UserPlus,
   CircleUser,
   ChevronRight,
   LogOut,
   HelpCircle,
   Sparkles,
   Bell
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
 import { SIDEBAR_MODULES } from "@/lib/sidebarModules";
 import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
 
 // Map moduleKey → lucide icon
 const MODULE_ICONS: Record<string, React.ElementType> = {
   home:           Home,
   today_tasks:    ListTodo,
   clients:        Building2,
   jobs:           Briefcase,
   candidates:     Users,
   pipeline:       Route,
   recruiter:      UserPlus,
   headhunter:     UserRoundSearch,
   tem_candidates: Users,
   teams:          Users,
   roles:          LockKeyhole,
   settings:       Settings,
   profile:        CircleUser,
   admin:          Lock,
   notifications:  Bell,
 };
 
export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { loading: loadingPerms, hasPermission } = usePermissions();

  const isAdmin = user?.role === "ADMIN";

  return (
    <UISidebar
      collapsible="icon"
      className="app-sidebar"
      data-variant="sidebar"
    >
      <SidebarHeader className="sidebar-logo-area">
        <Link href="/" className="flex items-center gap-3 w-full group-data-[collapsible=icon]:justify-center">
          <div className="flex shrink-0 items-center justify-center rounded-xl bg-brand p-2 text-white shadow-md shadow-brand/10 transition-transform hover:scale-105 active:scale-95">
            <Route className="h-5 w-5" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden animate-in fade-in slide-in-from-left-4 duration-500">
            <h1 className="text-base font-black tracking-tight text-foreground leading-none">
              Cliqhire
            </h1>
            <p className="text-[9px] font-black text-muted-foreground/80 uppercase tracking-widest mt-0.5">Recruitment OS</p>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3 group-data-[collapsible=icon]:px-1.5">
        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            {loadingPerms ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2 text-muted-foreground group-data-[collapsible=icon]:hidden animate-pulse">
                <div className="w-6 h-6 rounded-full bg-muted" />
                <span className="text-[8px] font-black uppercase tracking-widest">Loading...</span>
              </div>
            ) : (
              <SidebarMenu className="group-data-[collapsible=icon]:gap-1 space-y-1">
                {SIDEBAR_MODULES.filter((item) => {
                  if (isAdmin && ["recruiter", "today_tasks", "headhunter"].includes(item.moduleKey)) return false;
                  if (item.alwaysVisible) return true;
                  if (isAdmin) return true;
                  return hasPermission(item.moduleKey, "view");
                }).map((item, index) => {
                  const active = item.href === "/" ? pathname === "/" || pathname === "/dashboard" : pathname?.startsWith(item.href);
                  const Icon = MODULE_ICONS[item.moduleKey] ?? Home;

                  return (
                    <SidebarMenuItem key={index}>
                      <SidebarMenuButton
                        asChild
                        isActive={!!active}
                        tooltip={{
                          children: item.name,
                          className: "bg-foreground text-white border-none font-black text-[10px] uppercase tracking-widest px-3 py-1.5 shadow-xl",
                        }}
                        className={cn(
                          "sidebar-nav-item group",
                          active && "sidebar-nav-item-active"
                        )}
                      >
                        <Link
                          href={item.href}
                          className="flex items-center gap-3 w-full h-full group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
                        >
                          {active && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-brand rounded-r-xl animate-in slide-in-from-left-2 duration-500 group-data-[collapsible=icon]:hidden" />
                          )}
                          <div className="flex items-center justify-between w-full group-data-[collapsible=icon]:justify-center">
                            <div className="flex items-center gap-2.5">
                              <div className={cn(
                                "sidebar-icon-wrap",
                                active ? "bg-brand text-white shadow-brand/15 shadow-sm" : "bg-muted/80 text-muted-foreground group-hover:bg-brand/10 group-hover:text-brand"
                              )}>
                                <Icon className="h-4 w-4 shrink-0" />
                              </div>
                              <span className={cn(
                                "text-[12.5px] tracking-tight group-data-[collapsible=icon]:hidden whitespace-nowrap overflow-hidden transition-all duration-300",
                                active ? "font-black text-foreground" : "font-bold text-muted-foreground group-hover:text-foreground"
                              )}>
                                {item.name}
                              </span>
                            </div>
                            {active && <ChevronRight className="w-3.5 h-3.5 text-brand group-data-[collapsible=icon]:hidden animate-in fade-in slide-in-from-left-2 duration-500" />}
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

        {/* Sidebar Promotional/Pro Card */}
        <div className="mt-6 px-3 group-data-[collapsible=icon]:hidden animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          <div className="sidebar-pro-card group/pro">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-brand/20 rounded-full blur-3xl group-hover/pro:bg-brand/40 transition-all duration-700" />
            <div className="relative z-10 flex flex-col gap-3">
              <div className="w-8 h-8 rounded-xl bg-brand flex items-center justify-center text-white shadow-md shadow-brand/10">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-black text-white tracking-tight">Upgrade to Pro</h4>
                <p className="text-[8px] font-bold text-muted-foreground leading-relaxed uppercase tracking-widest">Unlock AI Matching</p>
              </div>
              <button className="w-full py-1.5 bg-card text-foreground text-[10px] font-black rounded-lg hover:bg-brand hover:text-white transition-all active:scale-95 shadow-lg">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </SidebarContent>

      <SidebarFooter className="p-3 mt-auto group-data-[collapsible=icon]:p-1.5">
        <div className="sidebar-footer-card">
          <div className="flex items-center gap-2.5 group-data-[collapsible=icon]:justify-center">
            <Avatar className="h-8 w-8 border border-white shadow-sm ring-1 ring-border shrink-0">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="bg-brand/10 text-brand font-black text-[10px]">
                {user?.name?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden min-w-0">
              <span className="text-[11px] font-black text-foreground truncate tracking-tight">{user?.name}</span>
              <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest truncate">{user?.role}</span>
            </div>
            <button 
              onClick={logout}
              className="ml-auto p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-55/80 transition-all group-data-[collapsible=icon]:hidden"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </UISidebar>
  );
}