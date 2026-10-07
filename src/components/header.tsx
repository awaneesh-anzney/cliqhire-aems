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

// Material UI Icons
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import MenuOpenOutlinedIcon from "@mui/icons-material/MenuOpenOutlined";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import KeyboardArrowDownOutlinedIcon from "@mui/icons-material/KeyboardArrowDownOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import NavigateNextOutlinedIcon from "@mui/icons-material/NavigateNextOutlined";
import MailOutlineOutlinedIcon from "@mui/icons-material/MailOutlineOutlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";

const ROUTE_ICONS: Record<string, React.ElementType> = {
  dashboard: DashboardOutlinedIcon,
  leads: BusinessOutlinedIcon,
  clients: BusinessOutlinedIcon,
  jobs: WorkOutlineOutlinedIcon,
  candidates: PersonOutlineOutlinedIcon,
  pipeline: AccountTreeOutlinedIcon,
  reactruterpipeline: AccountTreeOutlinedIcon,
  email: MailOutlineOutlinedIcon,
  teammembers: GroupsOutlinedIcon,
  teams: GroupsOutlinedIcon,
  settings: SettingsOutlinedIcon,
  profile: PersonOutlineOutlinedIcon,
  admin: AdminPanelSettingsOutlinedIcon,
};

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

  const getPageInfo = () => {
    if (!pathname || pathname === "/" || pathname === "/dashboard") {
      return { title: "Dashboard", key: "dashboard" };
    }
    const segment = pathname.split("/").filter(Boolean)[0];
    let title = segment.charAt(0).toUpperCase() + segment.slice(1);
    if (segment === "leads") title = "Leads";
    if (segment === "clients") title = "Clients";
    if (segment === "jobs") title = "Jobs";
    if (segment === "candidates") title = "Candidates";
    if (segment === "reactruterpipeline") title = "Pipeline";
    if (segment === "email") title = "Email";
    if (segment === "teammembers") title = "Team Members";
    if (segment === "settings") title = "Settings";
    if (segment === "profile") title = "Profile";
    if (segment === "admin") title = "Administration";
    return { title, key: segment };
  };

  const pageInfo = getPageInfo();
  const RouteIcon = ROUTE_ICONS[pageInfo.key] || DashboardOutlinedIcon;

  return (
    <Box
      component="header"
      className="relative mx-3 sm:mx-4 md:mx-6 mt-3 sm:mt-3.5 h-[54px] sm:h-[56px] px-3 sm:px-4 flex items-center justify-between gap-3 shrink-0 select-none bg-white/92 dark:bg-[#1E293B]/92 backdrop-blur-[12px] border border-[#E6EDF5] dark:border-slate-800 rounded-[14px] shadow-[0_4px_18px_rgba(15,23,42,0.04)] z-30 font-sans transition-all"
    >
      {showMobileSearch ? (
        /* Mobile Search Bar Expand Mode */
        <Box className="flex items-center w-full gap-2 animate-in fade-in duration-200">
          <IconButton
            size="small"
            onClick={() => setShowMobileSearch(false)}
            sx={{
              color: "#64748B",
              "&:hover": { color: "#172033" },
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
        /* Standard Floating Header Mode */
        <>
          {/* Left: Sidebar Toggle Button & Navigation Title / Back Action */}
          <Box className="flex items-center gap-2.5 min-w-0">
            <Tooltip
              title={open ? "Collapse Sidebar" : "Expand Sidebar"}
              arrow
              disableInteractive
              slotProps={{
                popper: { sx: { zIndex: 9999 } },
                tooltip: {
                  sx: {
                    bgcolor: "#172033",
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
                  width: 34,
                  height: 34,
                  borderRadius: "10px",
                  color: "#64748B",
                  "&:hover": {
                    color: "#172033",
                    backgroundColor: "#EFF6FF",
                  },
                }}
              >
                {open ? (
                  <MenuOpenOutlinedIcon sx={{ fontSize: 19 }} />
                ) : (
                  <MenuOutlinedIcon sx={{ fontSize: 19 }} />
                )}
              </IconButton>
            </Tooltip>

            <Divider orientation="vertical" flexItem className="hidden sm:block h-4 my-auto bg-[#E2E8F0] dark:bg-slate-700" />

            {isOnIdPage ? (
              <Button
                variant="text"
                size="small"
                onClick={handleBack}
                startIcon={<ArrowBackOutlinedIcon sx={{ fontSize: 16 }} />}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "12px",
                  color: "#172033",
                  borderRadius: "10px",
                  px: 1.5,
                  py: 0.5,
                  "&:hover": {
                    backgroundColor: "#EFF6FF",
                    color: "#2563EB",
                  },
                }}
                className="dark:!text-white group"
              >
                <span>{getBackNavigation().label}</span>
              </Button>
            ) : (
              <Box className="flex items-center gap-2 text-xs truncate">
                <span className="text-[#172033] dark:text-slate-200 hidden sm:inline font-bold tracking-tight text-[13px]">
                  Cliq<span className="text-[#2563EB] font-bold">Hire</span>
                </span>
                <NavigateNextOutlinedIcon sx={{ fontSize: 15 }} className="text-[#94A3B8] hidden sm:inline" />
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#F8FAFC] dark:bg-slate-800 text-[#172033] dark:text-white border border-[#E2E8F0] dark:border-slate-700 shadow-[0_1px_2px_rgba(15,23,42,0.02)] tracking-tight">
                  <RouteIcon sx={{ fontSize: 15, color: "#2563EB" }} />
                  <span>{pageInfo.title}</span>
                </div>
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
                width: 32,
                height: 32,
                borderRadius: "9px",
                color: "#64748B",
                "&:hover": {
                  color: "#172033",
                  backgroundColor: "#EFF6FF",
                },
              }}
            >
              <SearchOutlinedIcon sx={{ fontSize: 18 }} />
            </IconButton>

            {/* Workspace Live Status Badge */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[11px] font-semibold text-[#10B981] shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
              <span>Workspace Live</span>
            </div>

            {/* Utility Controls Group */}
            <div className="flex items-center gap-0.5 p-1 rounded-xl bg-[#F8FAFC] dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700 shadow-2xs">
              <ModeToggle />
              <NotificationDropdown />

              <Tooltip
                title="Help & Documentation"
                arrow
                disableInteractive
                slotProps={{
                  popper: { sx: { zIndex: 9999 } },
                  tooltip: {
                    sx: {
                      bgcolor: "#172033",
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
                    color: "#64748B",
                    "&:hover": {
                      color: "#172033",
                      backgroundColor: "rgba(37, 99, 235, 0.08)",
                    },
                  }}
                >
                  <HelpOutlineOutlinedIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            </div>

            <Divider orientation="vertical" flexItem className="hidden sm:block h-4 my-auto bg-[#E2E8F0] dark:bg-slate-700 mx-0.5" />

            {/* User Profile Trigger Button */}
            <button
              type="button"
              onClick={(e) => setProfileAnchorEl(e.currentTarget)}
              aria-controls={isProfileMenuOpen ? "user-profile-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={isProfileMenuOpen ? "true" : undefined}
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-[#F8FAFC] dark:hover:bg-slate-800 transition-all border border-transparent hover:border-[#E2E8F0] dark:hover:border-slate-700 outline-none cursor-pointer"
            >
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                variant="dot"
                sx={{
                  "& .MuiBadge-badge": {
                    backgroundColor: "#10B981",
                    color: "#10B981",
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
                      backgroundColor: "#2563EB",
                      fontSize: "11px",
                      fontWeight: 700,
                    }}
                  >
                    {getUserInitials(user?.name)}
                  </Avatar>
                )}
              </Badge>

              <div className="hidden md:flex flex-col items-start leading-none">
                <span className="text-xs font-bold text-[#172033] dark:text-white truncate max-w-[110px]">
                  {user?.name || "Abhi Singh"}
                </span>
                <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded bg-[#EFF6FF] text-[#2563EB] dark:bg-blue-950/40 dark:text-blue-400 border border-[#BFDBFE] dark:border-blue-800 uppercase tracking-wider mt-0.5">
                  {user?.role?.toLowerCase() || "admin"}
                </span>
              </div>

              <KeyboardArrowDownOutlinedIcon sx={{ fontSize: 16 }} className="text-[#94A3B8] hidden sm:block" />
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