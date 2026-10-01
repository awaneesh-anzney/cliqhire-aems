"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useSidebar } from "@/components/ui/sidebar";
import { GlobalSearch } from "@/components/global-search";
import { ModeToggle } from "@/components/mode-toggle";
import { NotificationDropdown } from "@/components/NotificationDropdown";
import { cn } from "@/lib/utils";

// Material UI Components
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import Avatar from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";

// Material UI Icons
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import KeyboardArrowDownOutlinedIcon from "@mui/icons-material/KeyboardArrowDownOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import NavigateNextOutlinedIcon from "@mui/icons-material/NavigateNextOutlined";

function getUserInitials(name?: string) {
  if (!name) return "U";
  return name
    .split(" ")
    .map((w) => w.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { toggleSidebar, open } = useSidebar();

  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);
  const isProfileMenuOpen = Boolean(profileAnchorEl);

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

  return (
    <Box
      component="header"
      className="relative h-[58px] px-3 sm:px-4 md:px-5 flex items-center justify-between gap-3 shrink-0 select-none bg-white/95 dark:bg-[#161C24]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 z-30 font-['Public_Sans',sans-serif]"
    >
      {/* Top Subtle Brand Gradient Line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 opacity-80 pointer-events-none" />

      {showMobileSearch ? (
        /* Mobile Search Bar Expand Mode */
        <Box className="flex items-center w-full gap-2 animate-in fade-in duration-200">
          <IconButton
            size="small"
            onClick={() => setShowMobileSearch(false)}
            sx={{
              color: "#919EAB",
              "&:hover": { color: "#1C252E" },
              borderRadius: "8px",
            }}
          >
            <ArrowBackOutlinedIcon sx={{ fontSize: 18 }} />
          </IconButton>
          <div className="flex-1">
            <GlobalSearch />
          </div>
        </Box>
      ) : (
        /* Standard Header Mode */
        <>
          {/* Left: Sidebar Toggle Button & Navigation Title / Back Action */}
          <Box className="flex items-center gap-2.5 min-w-0">
            <Tooltip
              title={open ? "Collapse Sidebar" : "Expand Sidebar"}
              arrow
              slotProps={{
                tooltip: {
                  sx: {
                    bgcolor: "#1C252E",
                    fontSize: "11px",
                    fontWeight: 600,
                    borderRadius: "8px",
                  },
                },
              }}
            >
              <IconButton
                size="small"
                onClick={toggleSidebar}
                aria-label="Toggle sidebar"
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "10px",
                  color: "#637381",
                  "&:hover": {
                    color: "#1C252E",
                    backgroundColor: "rgba(145, 158, 171, 0.08)",
                  },
                }}
              >
                <MenuOutlinedIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>

            <Divider orientation="vertical" flexItem className="hidden sm:block h-4 my-auto bg-slate-200 dark:bg-slate-700" />

            {isOnIdPage ? (
              <Button
                variant="text"
                size="small"
                onClick={handleBack}
                startIcon={<ArrowBackOutlinedIcon sx={{ fontSize: 16 }} />}
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: "12px",
                  color: "#1C252E",
                  borderRadius: "10px",
                  px: 1.5,
                  py: 0.5,
                  "&:hover": {
                    backgroundColor: "rgba(145, 158, 171, 0.08)",
                  },
                }}
                className="dark:!text-white"
              >
                {getBackNavigation().label}
              </Button>
            ) : (
              <Box className="flex items-center gap-2 text-xs truncate">
                <span className="text-slate-800 dark:text-slate-200 hidden sm:inline font-bold tracking-tight text-[13px]">
                  Cliq<span className="text-blue-600 dark:text-blue-400 font-extrabold">Hire</span>
                </span>
                <NavigateNextOutlinedIcon sx={{ fontSize: 16 }} className="text-[#919EAB] hidden sm:inline" />
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800/80 text-[#1C252E] dark:text-white border border-slate-200/70 dark:border-slate-700/70 shadow-2xs tracking-tight">
                  {getPageTitle()}
                </span>
              </Box>
            )}
          </Box>

          {/* Center: Global Command Search (Desktop) */}
          <Box className="hidden md:flex flex-1 justify-center max-w-md mx-auto">
            <div className="w-full relative">
              <GlobalSearch />
            </div>
          </Box>

          {/* Right: Actions, Notifications, Theme, Profile */}
          <Box className="flex items-center gap-1.5 sm:gap-2 ml-auto shrink-0">
            {/* Mobile Search Trigger Icon */}
            <IconButton
              size="small"
              onClick={() => setShowMobileSearch(true)}
              className="flex md:hidden"
              sx={{
                width: 34,
                height: 34,
                borderRadius: "10px",
                color: "#637381",
                "&:hover": {
                  color: "#1C252E",
                  backgroundColor: "rgba(145, 158, 171, 0.08)",
                },
              }}
            >
              <SearchOutlinedIcon sx={{ fontSize: 19 }} />
            </IconButton>

            {/* Workspace Live Status Badge */}
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Workspace Live</span>
            </div>

            {/* Utility Controls Group */}
            <div className="flex items-center gap-0.5 p-1 rounded-xl bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
              <ModeToggle />
              <NotificationDropdown />

              <Tooltip
                title="Help & Documentation"
                arrow
                slotProps={{
                  tooltip: {
                    sx: {
                      bgcolor: "#1C252E",
                      fontSize: "11px",
                      fontWeight: 600,
                      borderRadius: "8px",
                    },
                  },
                }}
              >
                <IconButton
                  size="small"
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: "8px",
                    color: "#637381",
                    "&:hover": {
                      color: "#1C252E",
                      backgroundColor: "rgba(145, 158, 171, 0.08)",
                    },
                  }}
                >
                  <HelpOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            </div>

            <Divider orientation="vertical" flexItem className="hidden sm:block h-4 my-auto bg-slate-200 dark:bg-slate-700 mx-0.5" />

            {/* User Profile Trigger Button */}
            <button
              type="button"
              onClick={(e) => setProfileAnchorEl(e.currentTarget)}
              aria-controls={isProfileMenuOpen ? "user-profile-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={isProfileMenuOpen ? "true" : undefined}
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-200/80 dark:hover:border-slate-700/80 outline-none cursor-pointer"
            >
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                variant="dot"
                sx={{
                  "& .MuiBadge-badge": {
                    backgroundColor: "#22C55E",
                    color: "#22C55E",
                    boxShadow: "0 0 0 2px #FFFFFF",
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                  },
                }}
              >
                {user?.avatar ? (
                  <Avatar
                    src={user.avatar}
                    alt={user.name || "User"}
                    sx={{ width: 30, height: 30, borderRadius: "9px" }}
                  />
                ) : (
                  <Avatar
                    sx={{
                      width: 30,
                      height: 30,
                      borderRadius: "9px",
                      background: "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)",
                      fontSize: "11px",
                      fontWeight: 700,
                    }}
                  >
                    {getUserInitials(user?.name)}
                  </Avatar>
                )}
              </Badge>

              <div className="hidden md:flex flex-col items-start leading-none">
                <span className="text-xs font-bold text-[#1C252E] dark:text-white truncate max-w-[110px]">
                  {user?.name || "User"}
                </span>
                <span className="text-[9.5px] font-bold px-1.5 py-0.2 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-400/20 uppercase tracking-wider mt-0.5">
                  {user?.role?.toLowerCase() || "member"}
                </span>
              </div>

              <KeyboardArrowDownOutlinedIcon sx={{ fontSize: 16 }} className="text-[#919EAB] hidden sm:block" />
            </button>

            {/* Material UI Profile Menu */}
            <Menu
              id="user-profile-menu"
              anchorEl={profileAnchorEl}
              open={isProfileMenuOpen}
              onClose={() => setProfileAnchorEl(null)}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              slotProps={{
                paper: {
                  elevation: 4,
                  className: "bg-white dark:bg-[#1C252E] border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xl",
                  sx: {
                    width: 230,
                    mt: 1,
                    p: 0.8,
                    borderRadius: "16px",
                  },
                },
              }}
            >
              {/* User Account Info Header */}
              <Box className="p-2.5 flex items-center gap-2.5">
                <Avatar
                  src={user?.avatar}
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: "10px",
                    bgcolor: "rgba(37, 99, 235, 0.1)",
                    color: "#2563eb",
                    fontSize: "12px",
                    fontWeight: 700,
                  }}
                >
                  {getUserInitials(user?.name)}
                </Avatar>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-[#1C252E] dark:text-white truncate">
                    {user?.name || "User"}
                  </span>
                  <span className="text-[10px] text-[#919EAB] truncate">
                    {user?.email || "user@cliqhire.com"}
                  </span>
                </div>
              </Box>

              <Divider sx={{ my: 0.8 }} />

              {/* Navigation Menu Items */}
              <MenuItem
                component={Link}
                href="/profile"
                onClick={() => setProfileAnchorEl(null)}
                sx={{
                  borderRadius: "10px",
                  py: 1,
                  px: 1.5,
                  fontSize: "12.5px",
                  fontWeight: 600,
                  color: "inherit",
                  "&:hover": {
                    bgcolor: "rgba(145, 158, 171, 0.08)",
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 28, color: "#637381" }}>
                  <PersonOutlineOutlinedIcon sx={{ fontSize: 18 }} />
                </ListItemIcon>
                <ListItemText
                  primary={<span className="text-[12.5px] font-semibold text-[#1C252E] dark:text-white">My Profile</span>}
                />
              </MenuItem>

              <MenuItem
                component={Link}
                href="/settings"
                onClick={() => setProfileAnchorEl(null)}
                sx={{
                  borderRadius: "10px",
                  py: 1,
                  px: 1.5,
                  fontSize: "12.5px",
                  fontWeight: 600,
                  color: "inherit",
                  "&:hover": {
                    bgcolor: "rgba(145, 158, 171, 0.08)",
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 28, color: "#637381" }}>
                  <SettingsOutlinedIcon sx={{ fontSize: 18 }} />
                </ListItemIcon>
                <ListItemText
                  primary={<span className="text-[12.5px] font-semibold text-[#1C252E] dark:text-white">Settings</span>}
                />
              </MenuItem>

              <Divider sx={{ my: 0.8 }} />

              {/* Sign Out Item */}
              <MenuItem
                onClick={() => {
                  setProfileAnchorEl(null);
                  logout();
                }}
                sx={{
                  borderRadius: "10px",
                  py: 1,
                  px: 1.5,
                  fontSize: "12.5px",
                  fontWeight: 600,
                  color: "#FF5630",
                  "&:hover": {
                    bgcolor: "rgba(255, 86, 48, 0.08)",
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 28, color: "#FF5630" }}>
                  <LogoutOutlinedIcon sx={{ fontSize: 18 }} />
                </ListItemIcon>
                <ListItemText
                  primary={<span className="text-[12.5px] font-semibold text-[#FF5630]">Sign Out</span>}
                />
              </MenuItem>
            </Menu>
          </Box>
        </>
      )}
    </Box>
  );
}

export default Header;