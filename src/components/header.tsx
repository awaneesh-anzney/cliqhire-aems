"use client";

import { Gift, HelpCircle, Plus, ArrowLeft, User, LogOut, Settings, Search } from "lucide-react";
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
import { NotificationDropdown } from "@/components/NotificationDropdown";

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
    <header className="app-header bg-[hsl(var(--protected-bg))] border-b border-[hsl(var(--brand-primary))]/10 shadow-none !m-0 !p-0">
      <div className="flex h-14 items-center px-4 md:px-5 gap-4">
        {showMobileSearch ? (
          /* Mobile Search Bar Mode */
          <div className="flex items-center w-full gap-2.5 animate-in fade-in duration-300">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowMobileSearch(false)}
              className="rounded-lg h-8 w-8 text-[hsl(var(--candidate-name))] hover:bg-white/40"
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
            {/* Left: Nav & Toggle */}
            <div className="flex items-center gap-2.5">
              <div className="p-0.5 rounded-lg bg-white/40 hover:bg-white/70 text-[hsl(var(--candidate-name))] transition-all border border-[hsl(var(--brand-primary))]/10 active:scale-95">
                <SidebarTrigger className="h-7 w-7 text-[hsl(var(--candidate-name))]" />
              </div>

              {isOnIdPage && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  className="flex items-center gap-1.5 text-[hsl(var(--candidate-name))] font-black text-[10px] uppercase tracking-widest hover:text-[hsl(var(--candidate-name))] hover:bg-white/70 transition-all rounded-lg px-3 h-8 border border-[hsl(var(--brand-primary))]/10 bg-white/40 shadow-sm"
                >
                  <ArrowLeft className="h-3 w-3" />
                  <span className="hidden md:inline">{getBackNavigation().label}</span>
                </Button>
              )}
            </div>

            {/* Center: Search (Desktop only) */}
            <div className="hidden md:flex flex-1 justify-center max-w-md mx-auto animate-in fade-in slide-in-from-top-2 duration-500">
               <div className="w-full relative group">
                   <GlobalSearch />
               </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 ml-auto">
              {/* Mobile Search Trigger */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowMobileSearch(true)}
                className="flex md:hidden rounded-lg hover:bg-white/40 text-[hsl(var(--candidate-name))] h-8 w-8"
              >
                <Search className="h-4 w-4" />
              </Button>

              <div className="hidden sm:flex items-center gap-1.5 p-1 bg-white/40 rounded-xl border border-[hsl(var(--brand-primary))]/10">
                <ModeToggle />
                <NotificationDropdown />
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-lg hover:bg-white/60 text-[hsl(var(--candidate-name))] transition-all shadow-none h-8 w-8"
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                </Button>
              </div>

              <div className="h-7 w-[1px] bg-[hsl(var(--brand-primary))]/15 mx-1.5 hidden md:block" />

              {/* Profile Dropdown Trigger */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-xl cursor-pointer group hover:bg-white/40 transition-all border border-transparent hover:border-[hsl(var(--brand-primary))]/10 active:scale-[0.98]">
                    <Avatar className="h-8 w-8 ring-2 ring-[hsl(var(--candidate-name))]/20 group-hover:ring-[hsl(var(--candidate-name))]/40 transition-all shadow-md shrink-0">
                      <AvatarImage src={user?.avatar} alt={user?.name} className="object-cover" />
                      <AvatarFallback className="bg-[hsl(var(--brand-primary))] text-white font-black text-[10px]">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden md:flex flex-col items-start">
                      <span className="text-[11px] font-black text-[hsl(var(--candidate-name))] leading-none group-hover:text-[hsl(var(--brand-primary))] transition-colors tracking-tight">
                        {user?.name || 'User'}
                      </span>
                      <span className="text-[8px] text-[hsl(var(--candidate-id))] uppercase tracking-widest font-black mt-0.5">
                        {user?.role || 'Member'}
                      </span>
                    </div>
                  </div>
                </DropdownMenuTrigger>
                
                <DropdownMenuContent className="w-60 mt-2 rounded-2xl shadow-2xl border-[hsl(var(--brand-primary))]/10 p-2 animate-in zoom-in-95 duration-200" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal p-2.5">
                    <div className="flex flex-col space-y-1.5">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-9 w-9 shadow-inner border border-[hsl(var(--brand-primary))]/10">
                           <AvatarImage src={user?.avatar} />
                           <AvatarFallback className="bg-[hsl(var(--brand-primary))] text-white font-black text-xs">{getUserInitials()}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                           <p className="text-xs font-black text-foreground leading-none truncate">{user?.name}</p>
                           <p className="text-[9px] font-bold text-muted-foreground mt-0.5 truncate">{user?.email}</p>
                        </div>
                      </div>
                      <div className="mt-1 bg-[hsl(var(--brand-primary))]/5 rounded-xl p-2 flex items-center justify-between">
                         <span className="text-[9px] font-black text-[hsl(var(--candidate-name))] uppercase tracking-widest">Account Status</span>
                         <span className="px-1.5 py-0.5 bg-[hsl(var(--brand-primary))] text-white text-[8px] font-black rounded-md uppercase tracking-tight shadow-sm">Verified</span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-muted my-1.5" />
                  <div className="space-y-0.5">
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center gap-2.5 p-2 cursor-pointer rounded-xl hover:bg-[hsl(var(--brand-primary))]/5 focus:bg-[hsl(var(--brand-primary))]/5 transition-all outline-none group/item">
                        <div className="h-8 w-8 rounded-lg bg-muted group-hover/item:bg-[hsl(var(--brand-primary))]/10 flex items-center justify-center text-muted-foreground group-hover/item:text-[hsl(var(--brand-primary))] transition-colors">
                          <User className="h-3.5 w-3.5" />
                        </div>
                        <span className="font-black text-[12.5px] text-foreground">My Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="flex items-center gap-2.5 p-2 cursor-pointer rounded-xl hover:bg-muted focus:bg-muted transition-all outline-none group/item">
                       <div className="h-8 w-8 rounded-lg bg-muted group-hover/item:bg-muted flex items-center justify-center text-muted-foreground group-hover/item:text-foreground transition-colors">
                         <Settings className="h-3.5 w-3.5" />
                       </div>
                       <span className="font-black text-[12.5px] text-foreground">Settings</span>
                    </DropdownMenuItem>
                  </div>
                  <DropdownMenuSeparator className="bg-muted my-1.5" />
                  <DropdownMenuItem 
                    onClick={logout}
                    className="flex items-center gap-2.5 p-2 cursor-pointer rounded-xl text-[hsl(var(--brand-secondary))] hover:bg-[hsl(var(--brand-secondary))]/10 focus:bg-[hsl(var(--brand-secondary))]/10 transition-all outline-none group/item"
                  >
                    <div className="h-8 w-8 rounded-lg bg-[hsl(var(--brand-secondary))]/10 group-hover/item:bg-[hsl(var(--brand-secondary))]/20 flex items-center justify-center transition-colors">
                      <LogOut className="h-3.5 w-3.5" />
                    </div>
                    <span className="font-black text-[12.5px]">Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </>
        )}
      </div>
    </header>
  );
}