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
   Sparkles
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
 };
 
 export function Sidebar() {
   const pathname = usePathname();
   const { user, logout } = useAuth();
   const { loading: loadingPerms, hasPermission } = usePermissions();
 
   const isAdmin = user?.role === "ADMIN";
 
   return (
     <UISidebar
       collapsible="icon"
       className="border-r border-border bg-card shadow-xl shadow-black/10"
       data-variant="sidebar"
     >
       <SidebarHeader className="py-8 px-6 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:justify-center">
         <Link href="/" className="flex items-center gap-4 w-full group-data-[collapsible=icon]:justify-center">
           <div className="flex shrink-0 items-center justify-center rounded-2xl bg-brand p-2.5 text-white shadow-lg shadow-brand/20 transition-transform hover:scale-105 active:scale-95">
             <Route className="h-6 w-6" />
           </div>
           <div className="flex flex-col group-data-[collapsible=icon]:hidden animate-in fade-in slide-in-from-left-4 duration-500">
             <h1 className="text-xl font-black tracking-tight text-foreground leading-none">
               Cliqhire
             </h1>
             <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">Recruitment OS</p>
           </div>
         </Link>
       </SidebarHeader>
 
       <SidebarContent className="px-3 py-4 group-data-[collapsible=icon]:px-2">
         <SidebarGroup>
           <SidebarGroupContent>
             {loadingPerms ? (
               <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground group-data-[collapsible=icon]:hidden animate-pulse">
                 <div className="w-8 h-8 rounded-full bg-muted" />
                 <span className="text-[10px] font-black uppercase tracking-widest">Initalizing Navigation...</span>
               </div>
             ) : (
               <SidebarMenu className="group-data-[collapsible=icon]:gap-2 space-y-2">
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
                           "group h-12 transition-all duration-300 ease-out rounded-2xl relative px-4 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center w-full",
                           active
                             ? "bg-brand/5 text-brand shadow-sm shadow-brand/5"
                             : "text-muted-foreground hover:bg-muted hover:text-foreground"
                         )}
                       >
                         <Link
                           href={item.href}
                           className="flex items-center gap-4 w-full h-full group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
                         >
                           {active && (
                             <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-brand rounded-r-2xl animate-in slide-in-from-left-2 duration-500 group-data-[collapsible=icon]:h-6" />
                           )}
                           <div className="flex items-center justify-between w-full group-data-[collapsible=icon]:justify-center">
                             <div className="flex items-center gap-3">
                               <div className={cn(
                                 "p-2 rounded-xl transition-all duration-300",
                                 active ? "bg-brand text-white shadow-brand/20 shadow-md" : "bg-muted text-muted-foreground group-hover:bg-brand/10 group-hover:text-brand"
                               )}>
                                 <Icon className="h-[18px] w-[18px] shrink-0" />
                               </div>
                               <span className={cn(
                                 "text-[13px] font-black tracking-tight group-data-[collapsible=icon]:hidden whitespace-nowrap overflow-hidden transition-all duration-300",
                                 active ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
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
         <div className="mt-8 px-4 group-data-[collapsible=icon]:hidden animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
           <div className="bg-foreground rounded-[2rem] p-6 relative overflow-hidden group/pro shadow-2xl shadow-black/10">
             <div className="absolute -top-12 -right-12 w-32 h-32 bg-brand/20 rounded-full blur-3xl group-hover/pro:bg-brand/40 transition-all duration-700" />
             <div className="relative z-10 flex flex-col gap-4">
               <div className="w-10 h-10 rounded-2xl bg-brand flex items-center justify-center text-white shadow-lg shadow-brand/20">
                 <Sparkles className="w-5 h-5" />
               </div>
               <div className="space-y-1">
                 <h4 className="text-sm font-black text-white tracking-tight">Upgrade to Pro</h4>
                 <p className="text-[10px] font-bold text-muted-foreground leading-relaxed uppercase tracking-widest">Unlock AI Matching</p>
               </div>
               <button className="w-full py-2 bg-card text-foreground text-[11px] font-black rounded-xl hover:bg-brand hover:text-white transition-all active:scale-95 shadow-xl">
                 Get Started
               </button>
             </div>
           </div>
         </div>
       </SidebarContent>
 
       <SidebarFooter className="p-4 mt-auto group-data-[collapsible=icon]:p-2">
         <div className="bg-muted rounded-[2rem] p-3 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:bg-transparent transition-all border border-border/50">
           <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
             <Avatar className="h-10 w-10 border-2 border-white shadow-sm ring-2 ring-border shrink-0">
               <AvatarImage src={user?.avatar} />
               <AvatarFallback className="bg-brand/10 text-brand font-black text-xs">
                 {user?.name?.slice(0, 2).toUpperCase()}
               </AvatarFallback>
             </Avatar>
             <div className="flex flex-col group-data-[collapsible=icon]:hidden min-w-0">
               <span className="text-xs font-black text-foreground truncate tracking-tight">{user?.name}</span>
               <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest truncate">{user?.role}</span>
             </div>
             <button 
               onClick={logout}
               className="ml-auto p-2 rounded-xl text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-all group-data-[collapsible=icon]:hidden"
             >
               <LogOut className="w-4 h-4" />
             </button>
           </div>
         </div>
       </SidebarFooter>
       <SidebarRail />
     </UISidebar>
   );
 }