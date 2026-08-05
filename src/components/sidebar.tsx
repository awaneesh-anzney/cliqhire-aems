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
   Bell,
   ShieldCheck,
   UserRoundCog,
   Workflow,
   User,
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
   todo:           ListTodo,
   Leads:          Building2,
   clients:        Building2,
   jobs:           Briefcase,
   candidates:     User,
   pipeline:       Workflow,
   recruiter:      UserPlus,
   headhunter:     UserRoundSearch,
   tem_candidates: UserRoundCog,
   teams:          Users,
   roles:          LockKeyhole,
   settings:       Settings,
   profile:        CircleUser,
   admin:          ShieldCheck,
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
      className="app-sidebar bg-[#7ce0ad] !border-none shadow-none"
      data-variant="sidebar"
    >
      <SidebarHeader className="sidebar-logo-area bg-[#7ce0ad]">
        <Link href="/" className="flex items-center gap-3 w-full group-data-[collapsible=icon]:justify-center">
          <div className="flex shrink-0 items-center justify-center rounded-xl bg-[#064e3b] p-2 text-[#7ce0ad] shadow-md shadow-emerald-950/20 transition-transform hover:scale-105 active:scale-95">
            <Route className="h-5 w-5" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden animate-in fade-in slide-in-from-left-4 duration-500">
            <h1 className="text-lg font-black tracking-tight text-emerald-950 leading-none">
              Cliqhire
            </h1>
            <p className="text-[9px] font-black text-emerald-900/90 uppercase tracking-widest mt-0.5">Recruitment OS</p>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3 group-data-[collapsible=icon]:px-1.5 bg-[#7ce0ad]">
        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            {loadingPerms ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2 text-emerald-950 group-data-[collapsible=icon]:hidden animate-pulse">
                <div className="w-6 h-6 rounded-full bg-emerald-900/20" />
                <span className="text-[8px] font-black uppercase tracking-widest">Loading...</span>
              </div>
            ) : (
              <SidebarMenu className="group-data-[collapsible=icon]:gap-1 space-y-1">
                {SIDEBAR_MODULES.filter((item) => {
                  if (isAdmin && ["recruiter", "todo", "headhunter"].includes(item.moduleKey)) return false;
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
                          className: "bg-emerald-950 text-white border-none font-black text-[10px] uppercase tracking-widest px-3 py-1.5 shadow-xl",
                        }}
                        className={cn(
                          "sidebar-nav-item group transition-all duration-200 rounded-xl",
                          active ? "bg-white/60 text-emerald-950 font-black shadow-sm" : "hover:bg-white/30 text-emerald-950/80 hover:text-emerald-950"
                        )}
                      >
                        <Link
                          href={item.href}
                          className="flex items-center gap-3 w-full h-full group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
                        >
                          {active && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#064e3b] rounded-r-xl animate-in slide-in-from-left-2 duration-500 group-data-[collapsible=icon]:hidden" />
                          )}
                          <div className="flex items-center justify-between w-full group-data-[collapsible=icon]:justify-center">
                            <div className="flex items-center gap-2.5">
                              <div className={cn(
                                "sidebar-icon-wrap",
                                active ? "bg-[#064e3b] text-[#7ce0ad] shadow-sm" : "bg-emerald-950/10 text-emerald-950 group-hover:bg-[#064e3b]/20 group-hover:text-emerald-950"
                              )}>
                                <Icon className="h-4 w-4 shrink-0" />
                              </div>
                              <span className={cn(
                                "text-[12.5px] tracking-tight group-data-[collapsible=icon]:hidden whitespace-nowrap overflow-hidden transition-all duration-300",
                                active ? "font-black text-emerald-950" : "font-bold text-emerald-950/80 group-hover:text-emerald-950"
                              )}>
                                {item.name}
                              </span>
                            </div>
                            {active && <ChevronRight className="w-3.5 h-3.5 text-emerald-950 group-data-[collapsible=icon]:hidden animate-in fade-in slide-in-from-left-2 duration-500" />}
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
          <div className="sidebar-pro-card group/pro bg-emerald-950 text-white rounded-2xl p-4 relative overflow-hidden shadow-xl border border-emerald-900/40">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#7ce0ad]/20 rounded-full blur-3xl group-hover/pro:bg-[#7ce0ad]/40 transition-all duration-700" />
            <div className="relative z-10 flex flex-col gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#7ce0ad] flex items-center justify-center text-emerald-950 shadow-md">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-black text-white tracking-tight">Upgrade to Pro</h4>
                <p className="text-[8px] font-bold text-emerald-200/80 leading-relaxed uppercase tracking-widest">Unlock AI Matching</p>
              </div>
              <button className="w-full py-1.5 bg-white text-emerald-950 text-[10px] font-black rounded-lg hover:bg-[#7ce0ad] transition-all active:scale-95 shadow-lg">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </SidebarContent>

      <SidebarFooter className="p-3 mt-auto group-data-[collapsible=icon]:p-1.5 bg-[#7ce0ad]">
        <div className="sidebar-footer-card bg-white/40 border border-emerald-900/10 rounded-2xl p-2.5">
          <div className="flex items-center gap-2.5 group-data-[collapsible=icon]:justify-center">
            <Avatar className="h-8 w-8 border border-white shadow-sm ring-1 ring-emerald-950/20 shrink-0">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="bg-[#064e3b] text-[#7ce0ad] font-black text-[10px]">
                {user?.name?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden min-w-0">
              <span className="text-[11px] font-black text-emerald-950 truncate tracking-tight">{user?.name}</span>
              <span className="text-[8px] font-black text-emerald-900/80 uppercase tracking-widest truncate">{user?.role}</span>
            </div>
            <button 
              onClick={logout}
              className="ml-auto p-1.5 rounded-lg text-emerald-950/70 hover:text-red-600 hover:bg-red-50 transition-all group-data-[collapsible=icon]:hidden"
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