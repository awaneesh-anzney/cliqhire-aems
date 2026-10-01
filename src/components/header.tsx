"use client";

import React, { useState } from "react";
import {
  HelpCircle,
  ArrowLeft,
  User,
  LogOut,
  Settings,
  Search,
  ChevronRight,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePathname, useRouter } from "next/navigation";
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
import { NotificationDropdown } from "@/components/NotificationDropdown";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [showMobileSearch, setShowMobileSearch] = useState(false);

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
      if (pathname.includes("/leads/")) label = "Back to Leads";
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

  const getPageTitle = () => {
    if (!pathname || pathname === "/" || pathname === "/dashboard") return "Dashboard";
    const segment = pathname.split("/").filter(Boolean)[0];
    if (segment === "leads") return "Leads";
    if (segment === "clients") return "Clients";
    if (segment === "jobs") return "Jobs";
    if (segment === "candidates") return "Candidates";
    if (segment === "reactruterpipeline") return "Pipeline";
    if (segment === "email") return "Email";
    if (segment === "teammembers") return "Team Members";
    if (segment === "settings") return "Settings";
    if (segment === "profile") return "Profile";
    if (segment === "admin") return "Administration";
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  };

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
    <header className="relative h-14 app-header px-3 sm:px-4 md:px-5 flex items-center justify-between gap-3 shrink-0 select-none overflow-visible z-30">
      {/* Top Subtle Brand Gradient Line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-70 pointer-events-none" />

      {showMobileSearch ? (
        /* Mobile Search Bar Expand Mode */
        <div className="flex items-center w-full gap-2 animate-in fade-in duration-200">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setShowMobileSearch(false)}
            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <GlobalSearch />
          </div>
        </div>
      ) : (
        /* Normal Header Mode */
        <>
          {/* Left: Sidebar Trigger & Breadcrumbs / Back */}
          <div className="flex items-center gap-2.5 min-w-0">
            <SidebarTrigger className="h-8 w-8 rounded-xl text-slate-700 dark:text-slate-200 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" />

            <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700 hidden sm:block" />

            {isOnIdPage ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="h-8 px-2.5 rounded-xl text-xs font-semibold text-foreground hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 gap-1.5 transition-colors group"
              >
                <ArrowLeft className="h-3.5 w-3.5 text-blue-500 group-hover:text-blue-600 transition-transform group-hover:-translate-x-0.5" />
                <span>{getBackNavigation().label}</span>
              </Button>
            ) : (
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium truncate">
                <span className="text-slate-800 dark:text-slate-100 hidden sm:inline font-bold tracking-tight">
                  Cliq<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 font-black">Hire</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 hidden sm:inline" />
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs shadow-blue-500/25 tracking-tight">
                  {getPageTitle()}
                </span>
              </div>
            )}
          </div>

          {/* Center: Global Command Search (Desktop) */}
          <div className="hidden md:flex flex-1 justify-center max-w-md mx-auto">
            <div className="w-full relative">
              <GlobalSearch />
            </div>
          </div>

          {/* Right: Actions, Notifications, Theme, Profile */}
          <div className="flex items-center gap-1.5 sm:gap-2 ml-auto shrink-0">
            {/* Mobile Search Icon */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setShowMobileSearch(true)}
              className="flex md:hidden h-8 w-8 rounded-xl text-slate-700 dark:text-slate-200 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Search className="h-4 w-4" />
            </Button>

            {/* Status Pill */}
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Workspace Live</span>
            </div>

            {/* Utility Controls Group */}
            <div className="flex items-center gap-0.5 p-0.5 rounded-xl bg-slate-50/90 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs text-foreground">
              <ModeToggle />
              <NotificationDropdown />

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-lg text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:bg-white dark:hover:bg-slate-700 transition-colors"
                  >
                    <HelpCircle className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="text-xs">Help & Documentation</TooltipContent>
              </Tooltip>
            </div>

            <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700 hidden sm:block mx-0.5" />

            {/* User Profile Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-200/80 dark:hover:border-slate-700/80 outline-none group shadow-2xs"
                >
                  <div className="relative shrink-0">
                    <Avatar className="h-7 w-7 rounded-lg border border-slate-200 dark:border-slate-700 shadow-2xs">
                      <AvatarImage src={user?.avatar} alt={user?.name} className="object-cover" />
                      <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-[10px] rounded-lg">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-800" />
                  </div>
                  <div className="hidden md:flex flex-col items-start leading-none">
                    <span className="text-xs font-bold text-foreground truncate max-w-[100px]">
                      {user?.name || "User"}
                    </span>
                    <span className="text-[9.5px] font-bold px-1.5 py-0.2 rounded-md bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-400/30 uppercase tracking-wider mt-0.5">
                      {user?.role?.toLowerCase() || "member"}
                    </span>
                  </div>
                  <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-blue-600 hidden sm:block transition-colors" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                className="w-56 mt-1.5 rounded-2xl border-border bg-card shadow-xl p-1.5 animate-in zoom-in-95 duration-150"
                align="end"
                forceMount
              >
                <DropdownMenuLabel className="p-2 font-normal">
                  <div className="flex items-center gap-2.5">
                    <Avatar className="h-9 w-9 rounded-xl border border-border shadow-2xs">
                      <AvatarImage src={user?.avatar} />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs rounded-xl">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">
                        {user?.name || "User"}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {user?.email || "user@example.com"}
                      </p>
                    </div>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator className="my-1 bg-border/60" />

                <div className="space-y-0.5">
                  <DropdownMenuItem asChild>
                    <Link
                      href="/profile"
                      className="flex items-center gap-2.5 px-2.5 py-1.5 text-xs font-medium rounded-xl text-foreground hover:bg-muted/60 cursor-pointer"
                    >
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>My Profile</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link
                      href="/settings"
                      className="flex items-center gap-2.5 px-2.5 py-1.5 text-xs font-medium rounded-xl text-foreground hover:bg-muted/60 cursor-pointer"
                    >
                      <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                </div>

                <DropdownMenuSeparator className="my-1 bg-border/60" />

                <DropdownMenuItem
                  onClick={logout}
                  className="flex items-center gap-2.5 px-2.5 py-1.5 text-xs font-semibold rounded-xl text-destructive hover:bg-destructive/10 focus:bg-destructive/10 cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </>
      )}
    </header>
  );
}

export default Header;