"use client";
 
 import { Bell, Gift, HelpCircle, Plus, ArrowLeft, User, LogOut, Settings, Search } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
 import { usePathname, useRouter } from "next/navigation";
 import { useState, useEffect } from "react";
 import { GlobalSearch } from "@/components/global-search";
 import { useAuth } from "@/contexts/AuthContext";
 import { SidebarTrigger } from "@/components/ui/sidebar";
 import { ModeToggle } from "@/components/mode-toggle";
 import {
   DropdownMenu,
   DropdownMenuContent,
   DropdownMenuItem,
   DropdownMenuLabel,
   DropdownMenuSeparator,
   DropdownMenuTrigger,
 } from "@/components/ui/dropdown-menu";
 import Link from "next/link";
 import { cn } from "@/lib/utils";
 
 export function Header() {
   const pathname = usePathname();
   const router = useRouter();
   const { user, logout } = useAuth();
 
   const isOnIdPage = pathname ? /\/[^\/]+\/[^\/]+$/.test(pathname) : false;
 
   const getBackNavigation = () => {
     if (!pathname) return { path: "/", label: "Back" };
     const parts = pathname.split("/").filter(Boolean);
     if (parts.length > 1) {
       if (pathname.includes("/candidate/") && parts.length >= 4) {
         const parentPath = "/" + parts.slice(0, parts.length - 2).join("/");
         return { path: parentPath, label: "Back to Pipeline" };
       }
       const parentPath = "/" + parts.slice(0, parts.length - 1).join("/");
       let label = "Back";
       if (pathname.includes("/reactruterpipeline/")) label = "Back to Pipeline";
       if (pathname.includes("/clients/")) label = "Back to Clients";
       if (pathname.includes("/jobs/")) label = "Back to Jobs";
       if (pathname.includes("/candidates/")) label = "Back to Candidates";
       return { path: parentPath, label };
     }
     return { path: "/", label: "Back" };
   };
 
   const handleBack = () => {
     if (window.history.length > 1) {
       router.back();
     } else {
       const { path } = getBackNavigation();
       router.push(path);
     }
   };
 
   const getUserInitials = () => {
     if (user?.name) {
       return user.name
         .split(' ')
         .map((word: string) => word.charAt(0))
         .join('')
         .toUpperCase()
         .slice(0, 2);
     }
     return 'U';
   };
 
   return (
     <header className="sticky top-0 z-50 w-full border-b border-border bg-card/70 backdrop-blur-2xl transition-all duration-300">
       <div className="flex h-16 items-center px-6 gap-6">
         {/* Left: Nav & Context */}
         <div className="flex items-center gap-4">
           <div className="p-1 rounded-2xl bg-muted hover:bg-brand/10 hover:text-brand transition-all active:scale-95">
             <SidebarTrigger className="h-9 w-9 text-muted-foreground" />
           </div>
 
           {isOnIdPage && (
             <Button
               variant="ghost"
               size="sm"
               onClick={handleBack}
               className="flex items-center gap-2 text-muted-foreground font-black text-[11px] uppercase tracking-widest hover:text-brand hover:bg-brand/10 transition-all rounded-2xl px-5 h-10 border border-border hover:border-brand/20 bg-card shadow-sm"
             >
               <ArrowLeft className="h-3.5 w-3.5" />
               <span className="hidden md:inline">{getBackNavigation().label}</span>
             </Button>
           )}
         </div>
 
         {/* Center: Search (E-commerce Style) */}
         <div className="flex-1 flex justify-center max-w-2xl mx-auto animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="w-full relative group">
                <GlobalSearch />
            </div>
         </div>
 
         {/* Right: Actions */}
         <div className="flex items-center gap-3">
           <div className="hidden sm:flex items-center gap-1.5 p-1.5 bg-muted rounded-2xl border border-border/50">
             <ModeToggle />
             <Button
               variant="ghost"
               size="icon"
               className="relative rounded-xl hover:bg-card hover:text-brand transition-all shadow-none h-9 w-9 text-muted-foreground"
             >
               <Bell className="h-4 w-4" />
               <span className="absolute top-2 right-2 w-2 h-2 bg-brand rounded-full border-2 border-border ring-2 ring-brand/20 animate-pulse" />
             </Button>
             <Button
               variant="ghost"
               size="icon"
               className="rounded-xl hover:bg-card hover:text-blue-500 transition-all shadow-none h-9 w-9 text-muted-foreground"
             >
               <HelpCircle className="h-4 w-4" />
             </Button>
           </div>
 
           <div className="h-10 w-[1px] bg-muted mx-2 hidden md:block" />
 
           {/* Profile Dropdown Trigger */}
           <DropdownMenu>
             <DropdownMenuTrigger asChild>
               <div className="flex items-center gap-3 pl-1 pr-1 py-1 rounded-2xl cursor-pointer group hover:bg-muted transition-all border border-transparent hover:border-border active:scale-[0.98]">
                 <Avatar className="h-10 w-10 ring-2 ring-transparent group-hover:ring-brand/30 transition-all shadow-md shrink-0">
                   <AvatarImage src={user?.avatar} alt={user?.name} className="object-cover" />
                   <AvatarFallback className="bg-brand/10 text-brand font-black text-xs">
                     {getUserInitials()}
                   </AvatarFallback>
                 </Avatar>
                 <div className="hidden md:flex flex-col items-start pr-3">
                   <span className="text-xs font-black text-foreground leading-none group-hover:text-brand transition-colors tracking-tight">
                     {user?.name || 'User'}
                   </span>
                   <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-black mt-1">
                     {user?.role || 'Member'}
                   </span>
                 </div>
               </div>
             </DropdownMenuTrigger>
             
             <DropdownMenuContent className="w-64 mt-3 rounded-[2rem] shadow-2xl border-border p-3 animate-in zoom-in-95 duration-200" align="end" forceMount>
               <DropdownMenuLabel className="font-normal p-3">
                 <div className="flex flex-col space-y-2">
                   <div className="flex items-center gap-3">
                     <Avatar className="h-12 w-12 shadow-inner border border-border">
                        <AvatarImage src={user?.avatar} />
                        <AvatarFallback className="bg-brand/10 text-brand font-black">{getUserInitials()}</AvatarFallback>
                     </Avatar>
                     <div className="flex flex-col">
                        <p className="text-sm font-black text-foreground leading-none">{user?.name}</p>
                        <p className="text-[10px] font-bold text-muted-foreground mt-1">{user?.email}</p>
                     </div>
                   </div>
                   <div className="mt-2 bg-brand/5 rounded-2xl p-2.5 flex items-center justify-between">
                      <span className="text-[10px] font-black text-brand uppercase tracking-widest">Account Status</span>
                      <span className="px-2 py-0.5 bg-brand text-white text-[9px] font-black rounded-full uppercase tracking-tighter shadow-sm">Verified</span>
                   </div>
                 </div>
               </DropdownMenuLabel>
               <DropdownMenuSeparator className="bg-muted my-2" />
               <div className="space-y-1">
                 <DropdownMenuItem asChild>
                   <Link href="/profile" className="flex items-center gap-3 p-2.5 cursor-pointer rounded-2xl hover:bg-brand/5 focus:bg-brand/5 transition-all outline-none group/item">
                     <div className="h-9 w-9 rounded-xl bg-muted group-hover/item:bg-brand/10 flex items-center justify-center text-muted-foreground group-hover/item:text-brand transition-colors">
                       <User className="h-4 w-4" />
                     </div>
                     <span className="font-black text-[13px] text-foreground">My Profile</span>
                   </Link>
                 </DropdownMenuItem>
                 <DropdownMenuItem className="flex items-center gap-3 p-2.5 cursor-pointer rounded-2xl hover:bg-muted focus:bg-muted transition-all outline-none group/item">
                    <div className="h-9 w-9 rounded-xl bg-muted group-hover/item:bg-muted flex items-center justify-center text-muted-foreground group-hover/item:text-foreground transition-colors">
                      <Settings className="h-4 w-4" />
                    </div>
                    <span className="font-black text-[13px] text-foreground">Settings</span>
                 </DropdownMenuItem>
               </div>
               <DropdownMenuSeparator className="bg-muted my-2" />
               <DropdownMenuItem 
                 onClick={logout}
                 className="flex items-center gap-3 p-2.5 cursor-pointer rounded-2xl text-red-600 hover:bg-red-50 focus:bg-red-50 transition-all outline-none group/item"
               >
                 <div className="h-9 w-9 rounded-xl bg-red-50 group-hover/item:bg-red-100 flex items-center justify-center transition-colors">
                   <LogOut className="h-4 w-4" />
                 </div>
                 <span className="font-black text-[13px]">Sign Out</span>
               </DropdownMenuItem>
             </DropdownMenuContent>
           </DropdownMenu>
         </div>
       </div>
     </header>
   );
 }
