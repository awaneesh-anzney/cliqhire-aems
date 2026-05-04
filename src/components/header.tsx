"use client";

import { Bell, Gift, HelpCircle, Plus, ArrowLeft, User, LogOut, Settings } from "lucide-react";
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

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  // Check if we're on an ID page (contains /[id] pattern)
  const isOnIdPage = pathname ? /\/[^\/]+\/[^\/]+$/.test(pathname) : false;

  // Determine the back navigation path and label
  const getBackNavigation = () => {
    if (!pathname) return { path: "/", label: "Back" };
    
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length > 1) {
      // If we're deep in a pipeline (e.g., .../candidate/[id]), 
      // going "one step back" means going back to the pipeline board
      if (pathname.includes("/candidate/") && parts.length >= 4) {
        const parentPath = "/" + parts.slice(0, parts.length - 2).join("/");
        return { path: parentPath, label: "Back to Pipeline" };
      }

      // Default: Remove the last segment to go "one step back"
      const parentPath = "/" + parts.slice(0, parts.length - 1).join("/");
      
      // Customize label based on context
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
    // Attempt to go back in history first for better UX
    // but fallback to calculated path if history is unavailable
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
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md dark:bg-background/80">
        <div className="flex h-14 items-center px-6 gap-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="hover:bg-brand/10 hover:text-brand transition-colors" />
          </div>

          {isOnIdPage && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="flex items-center gap-2 text-muted-foreground hover:text-brand hover:bg-brand/10 transition-all rounded-full px-4"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden md:inline">{getBackNavigation().label}</span>
            </Button>
          )}

          <div className="flex-1 flex justify-center max-w-2xl mx-auto">
            <GlobalSearch />
          </div>

          <div className="flex items-center gap-3">
            <ModeToggle />

            <Button
              variant="ghost"
              size="icon"
              className="relative rounded-full hover:bg-brand/10 hover:text-brand transition-colors"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-brand rounded-full border-2 border-white ring-1 ring-brand/20 animate-pulse" />
            </Button>

            <div className="h-8 w-[1px] bg-border mx-1 hidden sm:block" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-3 pl-2 cursor-pointer group">
                  <div className="hidden md:flex flex-col items-end">
                    <span className="text-sm font-semibold leading-none group-hover:text-brand transition-colors">
                      {user?.name || 'User'}
                    </span>
                    <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-medium">
                      {user?.role || 'Member'}
                    </span>
                  </div>
                  <Avatar
                    className="h-9 w-9 ring-2 ring-transparent group-hover:ring-brand/30 transition-all shadow-sm"
                  >
                    <AvatarImage src={user?.avatar} alt={user?.name} className="object-cover" />
                    <AvatarFallback className="bg-brand/10 text-brand font-bold text-xs">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 mt-2 rounded-2xl shadow-2xl border-slate-100 p-2" align="end" forceMount>
                <DropdownMenuLabel className="font-normal p-2">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-black leading-none text-slate-900">{user?.name}</p>
                    <p className="text-[10px] font-bold leading-none text-slate-400 uppercase tracking-tighter">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-50" />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center gap-2 p-2 cursor-pointer rounded-xl hover:bg-brand/5 focus:bg-brand/5 transition-colors">
                    <div className="h-8 w-8 rounded-lg bg-brand/10 flex items-center justify-center text-brand">
                      <User className="h-4 w-4" />
                    </div>
                    <span className="font-bold text-slate-700">My Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2 p-2 cursor-pointer rounded-xl hover:bg-slate-50 focus:bg-slate-50 transition-colors">
                   <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                     <Settings className="h-4 w-4" />
                   </div>
                   <span className="font-bold text-slate-700">Account Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-50" />
                <DropdownMenuItem 
                  onClick={logout}
                  className="flex items-center gap-2 p-2 cursor-pointer rounded-xl text-red-600 hover:bg-red-50 focus:bg-red-50 transition-colors group"
                >
                  <div className="h-8 w-8 rounded-lg bg-red-50 group-hover:bg-red-100 flex items-center justify-center transition-colors">
                    <LogOut className="h-4 w-4" />
                  </div>
                  <span className="font-bold">Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

    </>
  );
}
