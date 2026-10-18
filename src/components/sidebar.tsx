"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/contexts/PermissionContext";
import { useSidebar, Sidebar as UISidebar, SidebarRail } from "@/components/ui/sidebar";
import { SIDEBAR_MODULES, SidebarModule } from "@/lib/sidebarModules";

// Material UI Components
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ListSubheader from "@mui/material/ListSubheader";
import Tooltip from "@mui/material/Tooltip";
import Avatar from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";

// Material UI Icons
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import FormatListBulletedOutlinedIcon from "@mui/icons-material/FormatListBulletedOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import WorkOutlineOutlinedIcon from "@mui/icons-material/WorkOutlineOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import PersonAddAlt1OutlinedIcon from "@mui/icons-material/PersonAddAlt1Outlined";
import PersonSearchOutlinedIcon from "@mui/icons-material/PersonSearchOutlined";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import MailOutlineOutlinedIcon from "@mui/icons-material/MailOutlineOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";
import ArrowForwardOutlinedIcon from "@mui/icons-material/ArrowForwardOutlined";

// Soft pastel icon container mapping
interface ModuleTheme {
  icon: React.ElementType;
  color: string;
  bg: string;
}

const MODULE_THEMES: Record<string, ModuleTheme> = {
  home: {
    icon: HomeOutlinedIcon,
    color: "#2563EB",
    bg: "#EFF6FF",
  },
  todo: {
    icon: FormatListBulletedOutlinedIcon,
    color: "#F59E0B",
    bg: "#FFFBEB",
  },
  leads: {
    icon: BusinessOutlinedIcon,
    color: "#06B6D4",
    bg: "#ECFEFF",
  },
  clients: {
    icon: BusinessOutlinedIcon,
    color: "#0284C7",
    bg: "#E0F2FE",
  },
  "client-groups": {
    icon: LayersOutlinedIcon,
    color: "#0D9488",
    bg: "#F0FDFA",
  },
  jobs: {
    icon: WorkOutlineOutlinedIcon,
    color: "#6366F1",
    bg: "#EEF2FF",
  },
  candidates: {
    icon: PersonOutlineOutlinedIcon,
    color: "#8B5CF6",
    bg: "#F5F3FF",
  },
  pipeline: {
    icon: AccountTreeOutlinedIcon,
    color: "#10B981",
    bg: "#ECFDF5",
  },
  recruiter: {
    icon: PersonAddAlt1OutlinedIcon,
    color: "#2563EB",
    bg: "#EFF6FF",
  },
  headhunter: {
    icon: PersonSearchOutlinedIcon,
    color: "#9333EA",
    bg: "#FAF5FF",
  },
  tem_candidates: {
    icon: ManageAccountsOutlinedIcon,
    color: "#EC4899",
    bg: "#FDF2F8",
  },
  teams: {
    icon: GroupsOutlinedIcon,
    color: "#10B981",
    bg: "#ECFDF5",
  },
  roles: {
    icon: AdminPanelSettingsOutlinedIcon,
    color: "#D97706",
    bg: "#FFFBEB",
  },
  settings: {
    icon: SettingsOutlinedIcon,
    color: "#64748B",
    bg: "#F1F5F9",
  },
  profile: {
    icon: AccountCircleOutlinedIcon,
    color: "#0284C7",
    bg: "#E0F2FE",
  },
  admin: {
    icon: AdminPanelSettingsOutlinedIcon,
    color: "#EF4444",
    bg: "#FEF2F2",
  },
  notifications: {
    icon: NotificationsOutlinedIcon,
    color: "#EA580C",
    bg: "#FFF7ED",
  },
  email: {
    icon: MailOutlineOutlinedIcon,
    color: "#2563EB",
    bg: "#EFF6FF",
  },
};

interface NavSection {
  title: string;
  moduleKeys: string[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: "",
    moduleKeys: ["home", "todo"],
  },
  {
    title: "Recruitment",
    moduleKeys: [
      "leads",
      "clients",
      "client-groups",
      "jobs",
      "candidates",
      "pipeline",
      "recruiter",
      "headhunter",
      "tem_candidates",
    ],
  },
  {
    title: "Workspace",
    moduleKeys: ["teams", "email", "notifications"],
  },
  {
    title: "System",
    moduleKeys: ["admin", "settings", "profile"],
  },
];

function getUserInitials(name?: string) {
  if (!name) return "U";
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { loading: loadingPerms, hasPermission } = usePermissions();
  const { state, isMobile } = useSidebar();

  const isCollapsed = !isMobile && state === "collapsed";
  const isAdmin = user?.role === "ADMIN";

  // Filter allowed modules based on role and permissions
  const allowedModules = useMemo(() => {
    return SIDEBAR_MODULES.filter((item) => {
      if (isAdmin && ["recruiter", "todo", "headhunter"].includes(item.moduleKey)) {
        return false;
      }
      if (item.alwaysVisible) return true;
      if (isAdmin) return true;
      return hasPermission(item.moduleKey, "view");
    });
  }, [isAdmin, hasPermission]);

  // Group modules into structured sections
  const groupedModules = useMemo(() => {
    const sections: { title: string; items: SidebarModule[] }[] = [];
    const remaining = [...allowedModules];

    NAV_SECTIONS.forEach((sec) => {
      const matchedItems: SidebarModule[] = [];
      sec.moduleKeys.forEach((key) => {
        const matches = remaining.filter((m) => {
          if (key === "leads") return m.href === "/leads";
          if (key === "clients") return m.href === "/clients";
          if (key === "client-groups") return m.href === "/client-groups";
          if (key === "home") return m.href === "/" || m.href === "/dashboard";
          if (key === "todo") return m.href === "/todo";
          return m.moduleKey === key;
        });

        matches.forEach((item) => {
          if (!matchedItems.includes(item)) {
            matchedItems.push(item);
            const idx = remaining.indexOf(item);
            if (idx > -1) remaining.splice(idx, 1);
          }
        });
      });

      if (matchedItems.length > 0) {
        sections.push({ title: sec.title, items: matchedItems });
      }
    });

    if (remaining.length > 0) {
      sections.push({ title: "OTHER", items: remaining });
    }

    return sections;
  }, [allowedModules]);

  return (
    <UISidebar
      collapsible="icon"
      className="border-r border-[#E6EDF5] dark:border-slate-800 app-sidebar bg-[#FFFFFF] dark:bg-[#111827] font-sans select-none transition-all duration-200 h-screen max-h-screen flex flex-col overflow-hidden"
    >
      {/* ─── 1. LOGO SECTION (Centered, comfortable container) ─── */}
      <Box
        component="header"
        className={cn(
          "h-[64px] flex items-center justify-center border-b border-[#EEF2F7] dark:border-slate-800 shrink-0",
          isCollapsed ? "px-1.5" : "px-3"
        )}
      >
        <Link
          href="/"
          className="flex items-center justify-center w-full no-underline outline-none group"
        >
          {isCollapsed ? (
            /* Collapsed State: cliqhire-f icon (34px x 34px) */
            <div className="relative flex shrink-0 items-center justify-center">
              <Image
                src="/cliqhire-f.png"
                alt="CliqHire"
                width={34}
                height={34}
                priority
                className="w-[34px] h-[34px] object-contain rounded-lg group-hover:scale-105 active:scale-95 transition-transform duration-200"
              />
            </div>
          ) : (
            /* Expanded State: cliqhire-icon centered, zoomed in & prominent */
            <div className="relative flex items-center justify-center w-full px-1.5">
              <Image
                src="/cliqhire-icon.png"
                alt="CliqHire"
                width={240}
                height={52}
                priority
                className="h-[50px] w-auto max-w-[240px] object-contain scale-[1.08] group-hover:scale-[1.12] active:scale-[1.04] transition-transform duration-200"
              />
            </div>
          )}
        </Link>
      </Box>

      {/* ─── 2. NAVIGATION LIST (Scrolls independently, compact spacing) ─── */}
      <Box
        component="nav"
        className={cn(
          "flex-1 overflow-y-auto overflow-x-hidden flex flex-col min-h-0 transition-all",
          isCollapsed
            ? "px-1.5 py-1.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            : "px-2 pt-1.5 pb-1 custom-scrollbar"
        )}
      >
        {loadingPerms ? (
          <Box className="flex flex-col items-center justify-center py-8 gap-2 text-slate-400">
            <CircularProgress size={18} thickness={4} sx={{ color: "#2563EB" }} />
            {!isCollapsed && (
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#94A3B8]">
                Loading navigation...
              </span>
            )}
          </Box>
        ) : (
          groupedModules.map((section, sIdx) => (
            <List
              key={sIdx}
              disablePadding
              subheader={
                !isCollapsed && Boolean(section.title) ? (
                  <ListSubheader
                    disableSticky
                    disableGutters
                    className="bg-transparent px-2.5 pt-2.5 pb-1 select-none flex items-center justify-between leading-none"
                  >
                    <div className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          "w-1.5 h-1.5 rounded-full shrink-0",
                          section.title === "Recruitment"
                            ? "bg-blue-500 shadow-[0_0_6px_rgba(37,99,235,0.5)]"
                            : section.title === "Workspace"
                            ? "bg-indigo-500 shadow-[0_0_6px_rgba(99,102,241,0.5)]"
                            : section.title === "System"
                            ? "bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.5)]"
                            : "bg-slate-400"
                        )}
                      />
                      <span className="text-[10.5px] font-bold text-[#64748B] dark:text-[#94A3B8] tracking-wider uppercase">
                        {section.title}
                      </span>
                    </div>
                    <span className="h-[1px] flex-1 ml-2.5 bg-gradient-to-r from-[#E2E8F0] dark:from-slate-800 to-transparent" />
                  </ListSubheader>
                ) : undefined
              }
              className={cn("space-y-[2px]", sIdx > 0 ? "mt-1.5" : "mt-0")}
            >
              {section.items.map((item, iIdx) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/" || pathname === "/dashboard"
                    : pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));

                let key = item.moduleKey;
                if (item.href === "/leads") key = "leads";
                if (item.href === "/clients") key = "clients";
                if (item.href === "/client-groups") key = "client-groups";

                const theme = MODULE_THEMES[key] || {
                  icon: HomeOutlinedIcon,
                  color: "#2563EB",
                  bg: "#EFF6FF",
                };
                const Icon = theme.icon;

                const navButton = (
                  <ListItemButton
                    component={Link}
                    href={item.href}
                    className={cn(
                      "group rounded-[9px] transition-all duration-200 outline-none select-none relative",
                      isCollapsed
                        ? "w-[38px] h-[38px] p-0 mx-auto justify-center flex items-center"
                        : cn(
                            "w-full px-2.5 justify-start gap-2.5 flex items-center",
                            isActive ? "h-[40px]" : "h-[38px]"
                          ),
                      isActive
                        ? "bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] !text-white font-semibold shadow-[0_3px_10px_rgba(37,99,235,0.25)]"
                        : "!bg-transparent text-[#334155] dark:text-slate-300 hover:!bg-slate-100/70 dark:hover:!bg-slate-800/70 hover:!text-[#0F172A] dark:hover:!text-white font-medium hover:translate-x-0.5"
                    )}
                    sx={{
                      minHeight: isCollapsed ? 38 : (isActive ? 40 : 38),
                      height: isCollapsed ? 38 : (isActive ? 40 : 38),
                      width: isCollapsed ? 38 : "100%",
                      justifyContent: isCollapsed ? "center" : "flex-start",
                      p: isCollapsed ? 0 : "0 10px",
                      borderRadius: "9px",
                    }}
                  >
                    {/* Active Left Indicator Notch */}
                    {isActive && !isCollapsed && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 rounded-r-full bg-white shadow-sm" />
                    )}

                    {/* Icon Container (30px x 30px, rounded-8px, clear 18px icon) */}
                    <ListItemIcon
                      className="transition-colors flex items-center justify-center shrink-0"
                      sx={{
                        minWidth: "unset",
                        width: isCollapsed ? "100%" : 30,
                        justifyContent: "center",
                        m: 0,
                      }}
                    >
                      <div
                        className={cn(
                          "w-[30px] h-[30px] rounded-[8px] flex items-center justify-center transition-all duration-200",
                          isActive
                            ? "bg-white/20 text-white shadow-inner scale-100"
                            : "group-hover:scale-110"
                        )}
                        style={{
                          backgroundColor: isActive ? "rgba(255, 255, 255, 0.22)" : theme.bg,
                          color: isActive ? "#FFFFFF" : theme.color,
                          border: isActive ? "1px solid rgba(255, 255, 255, 0.35)" : `1px solid ${theme.color}26`,
                          boxShadow: isActive ? "0 2px 6px rgba(0,0,0,0.12)" : `0 1px 3px ${theme.color}18`,
                        }}
                      >
                        <Icon
                          sx={{
                            fontSize: 18,
                            color: isActive ? "#FFFFFF" : theme.color,
                          }}
                          className="transition-transform duration-200"
                        />
                      </div>
                    </ListItemIcon>

                    {/* Navigation Item Label (13px, stays crisp slate/white on hover, NEVER blue) */}
                    {!isCollapsed && (
                      <ListItemText
                        primary={
                          <span
                            className={cn(
                              "text-[13px] tracking-tight truncate block leading-none transition-colors duration-150",
                              isActive
                                ? "font-semibold text-white"
                                : "font-medium text-[#334155] dark:text-slate-300 group-hover:text-[#0F172A] dark:group-hover:text-white"
                            )}
                          >
                            {item.name}
                          </span>
                        }
                      />
                    )}
                  </ListItemButton>
                );

                return (
                  <ListItem disablePadding key={iIdx} className="block">
                    {isCollapsed ? (
                      <Tooltip
                        title={item.name}
                        placement="right"
                        arrow
                        disableInteractive
                        slotProps={{
                          popper: {
                            sx: { zIndex: 9999 },
                          },
                          tooltip: {
                            sx: {
                              bgcolor: "#172033",
                              color: "#FFFFFF",
                              fontFamily: "'Inter', sans-serif",
                              fontSize: "12px",
                              fontWeight: 600,
                              borderRadius: "8px",
                              px: 1.5,
                              py: 0.6,
                              boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
                              border: "1px solid rgba(255,255,255,0.1)",
                            },
                          },
                          arrow: {
                            sx: {
                              color: "#172033",
                              "&::before": {
                                border: "1px solid rgba(255,255,255,0.1)",
                              },
                            },
                          },
                        }}
                      >
                        {navButton}
                      </Tooltip>
                    ) : (
                      navButton
                    )}
                  </ListItem>
                );
              })}
            </List>
          ))
        )}
      </Box>

      {/* ─── 3. FIXED BOTTOM AREA (Upgrade Plan + User Profile, compact) ─── */}
      <Box className="mt-auto shrink-0 p-[6px_8px] border-t border-[#EEF2F7] dark:border-slate-800 bg-white dark:bg-[#111827] flex flex-col gap-1.5">
        {/* Compact Upgrade Plan Card */}
        {!isCollapsed && (
          <Link
            href="/settings"
            className="h-[46px] p-[6px_10px] rounded-[10px] bg-gradient-to-r from-amber-500/10 via-orange-500/8 to-rose-500/10 dark:from-amber-500/15 dark:via-orange-500/12 dark:to-rose-500/15 border border-amber-300/60 dark:border-amber-600/40 flex items-center justify-between gap-2 transition-all duration-200 hover:shadow-md hover:border-amber-400 dark:hover:border-amber-500/60 hover:-translate-y-0.5 no-underline group relative overflow-hidden"
          >
            {/* Ambient soft glow on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400/0 via-amber-400/10 to-orange-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            <div className="flex items-center gap-2.5 min-w-0 relative z-10">
              <div className="w-7 h-7 rounded-[8px] bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(245,158,11,0.35)] group-hover:scale-105 transition-transform duration-200">
                <WorkspacePremiumOutlinedIcon sx={{ fontSize: 16 }} />
              </div>
              <div className="flex flex-col min-w-0 leading-tight">
                <div className="flex items-center gap-1.5">
                  <span className="text-[12px] font-bold text-[#172033] dark:text-white truncate">
                    Upgrade Plan
                  </span>
                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 tracking-wider">
                    PRO
                  </span>
                </div>
                <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] truncate mt-0.5">
                  Unlock enterprise tools
                </span>
              </div>
            </div>
            <ArrowForwardOutlinedIcon
              sx={{ fontSize: 13 }}
              className="text-amber-600 dark:text-amber-400 group-hover:translate-x-1 transition-transform duration-200 shrink-0 relative z-10"
            />
          </Link>
        )}

        {/* Compact User Profile Section */}
        {isCollapsed ? (
          <Tooltip
            title={user?.name || "Profile"}
            placement="right"
            arrow
            disableInteractive
            slotProps={{
              popper: {
                sx: { zIndex: 9999 },
              },
              tooltip: {
                sx: {
                  bgcolor: "#172033",
                  color: "#FFFFFF",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "12px",
                  fontWeight: 600,
                  borderRadius: "8px",
                  px: 1.5,
                  py: 0.6,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
                  border: "1px solid rgba(255,255,255,0.1)",
                },
              },
              arrow: {
                sx: {
                  color: "#172033",
                  "&::before": {
                    border: "1px solid rgba(255,255,255,0.1)",
                  },
                },
              },
            }}
          >
            <Link
              href="/profile"
              className="flex items-center justify-center p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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
                    sx={{ width: 32, height: 32, borderRadius: "8px" }}
                    className="hover:scale-105 transition-transform"
                  />
                ) : (
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: "8px",
                      background: "linear-gradient(135deg, #2563EB 0%, #4F46E5 100%)",
                      fontSize: "11px",
                      fontWeight: 700,
                      boxShadow: "0 2px 6px rgba(37,99,235,0.25)",
                    }}
                    className="hover:scale-105 transition-transform"
                  >
                    {getUserInitials(user?.name)}
                  </Avatar>
                )}
              </Badge>
            </Link>
          </Tooltip>
        ) : (
          <div className="h-[48px] p-[6px_10px] rounded-[10px] bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-2 transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-100/70 dark:hover:bg-slate-800">
            <Link
              href="/profile"
              className="flex items-center gap-2.5 min-w-0 no-underline group"
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
                    sx={{ width: 32, height: 32, borderRadius: "8px" }}
                    className="group-hover:ring-2 ring-blue-500/30 transition-all"
                  />
                ) : (
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: "8px",
                      background: "linear-gradient(135deg, #2563EB 0%, #4F46E5 100%)",
                      fontSize: "11px",
                      fontWeight: 700,
                      boxShadow: "0 2px 6px rgba(37,99,235,0.25)",
                    }}
                    className="group-hover:scale-105 transition-transform"
                  >
                    {getUserInitials(user?.name)}
                  </Avatar>
                )}
              </Badge>

              <div className="flex flex-col min-w-0 leading-tight">
                <span className="text-[12px] font-semibold text-[#172033] dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {user?.name || "Abhi Singh"}
                </span>
                <span className="text-[9.5px] font-semibold text-[#64748B] dark:text-[#94A3B8] truncate uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {user?.role || "ADMIN"}
                </span>
              </div>
            </Link>

            <IconButton
              size="small"
              onClick={logout}
              title="Sign Out"
              aria-label="Sign out"
              sx={{
                color: "#94A3B8",
                "&:hover": {
                  color: "#EF4444",
                  backgroundColor: "rgba(239, 68, 68, 0.1)",
                },
                borderRadius: "8px",
                p: 0.6,
                transition: "all 0.2s ease-out",
              }}
              className="hover:scale-110 active:scale-95"
            >
              <LogoutOutlinedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </div>
        )}
      </Box>

      <SidebarRail />
    </UISidebar>
  );
}

export default Sidebar;