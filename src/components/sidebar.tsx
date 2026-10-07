"use client";

import React, { useMemo } from "react";
import Link from "next/link";
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
    title: "OVERVIEW",
    moduleKeys: ["home", "todo"],
  },
  {
    title: "RECRUITMENT",
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
    title: "WORKSPACE",
    moduleKeys: ["teams", "email", "notifications"],
  },
  {
    title: "SYSTEM",
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
      {/* ─── 1. LOGO SECTION (68px–72px, border-bottom #EEF2F7) ─── */}
      <Box
        component="header"
        className={cn(
          "h-[70px] flex items-center border-b border-[#EEF2F7] dark:border-slate-800 shrink-0",
          isCollapsed ? "justify-center px-1" : "justify-between px-4 py-3"
        )}
      >
        <Link
          href="/"
          className={cn(
            "flex items-center gap-3 no-underline outline-none group",
            isCollapsed && "justify-center"
          )}
        >
          {/* Logo Mark: 42px x 42px */}
          <div className="relative flex shrink-0 items-center justify-center">
            <div className="w-[42px] h-[42px] rounded-xl bg-[#2563EB] flex items-center justify-center text-white shadow-sm shadow-blue-500/25 transition-transform duration-200 group-hover:scale-105 active:scale-95 font-black text-sm tracking-tight relative">
              CH
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#10B981] ring-2 ring-white dark:ring-[#111827]" />
            </div>
          </div>

          {/* Brand Typography */}
          {!isCollapsed && (
            <div className="flex flex-col min-w-0 animate-in fade-in duration-200">
              <span className="text-[16px] font-bold tracking-tight text-[#172033] dark:text-white leading-tight">
                Cliq<span className="text-[#2563EB]">Hire</span>
              </span>
              <span className="text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8] truncate leading-tight mt-0.5">
                Talent & Recruitment
              </span>
            </div>
          )}
        </Link>
      </Box>

      {/* ─── 2. NAVIGATION LIST (Scrolls independently, padding: 14px 10px 10px) ─── */}
      <Box
        component="nav"
        className={cn(
          "flex-1 overflow-y-auto overflow-x-hidden flex flex-col min-h-0 transition-all",
          isCollapsed
            ? "px-1.5 py-2.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            : "px-2.5 pt-3.5 pb-2.5 custom-scrollbar"
        )}
      >
        {loadingPerms ? (
          <Box className="flex flex-col items-center justify-center py-12 gap-2 text-slate-400">
            <CircularProgress size={20} thickness={4} sx={{ color: "#2563EB" }} />
            {!isCollapsed && (
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#94A3B8]">
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
                !isCollapsed ? (
                  <ListSubheader
                    disableSticky
                    disableGutters
                    className="bg-transparent text-[11px] font-semibold uppercase tracking-[0.08em] text-[#94A3B8] px-2.5 pb-1.5 pt-0 select-none leading-none mb-1.5"
                  >
                    {section.title}
                  </ListSubheader>
                ) : undefined
              }
              className={cn("space-y-[3px]", sIdx > 0 ? "mt-[18px]" : "mt-0")}
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
                      "rounded-[8px] transition-all duration-150 outline-none select-none mb-[3px]",
                      isCollapsed
                        ? "w-10 h-10 p-0 mx-auto justify-center flex items-center"
                        : cn(
                            "w-full px-2.5 justify-start gap-2.5 flex items-center",
                            isActive ? "h-[42px]" : "h-[40px]"
                          ),
                      isActive
                        ? "!bg-[#2563EB] !text-white font-semibold shadow-[0_4px_10px_rgba(37,99,235,0.16)]"
                        : "!bg-transparent text-[#334155] dark:text-slate-300 hover:!bg-[#F8FAFC] dark:hover:!bg-slate-800/80 hover:!text-[#2563EB] font-medium"
                    )}
                    sx={{
                      minHeight: isCollapsed ? 40 : (isActive ? 42 : 40),
                      height: isCollapsed ? 40 : (isActive ? 42 : 40),
                      width: isCollapsed ? 40 : "100%",
                      justifyContent: isCollapsed ? "center" : "flex-start",
                      p: isCollapsed ? 0 : "0 10px",
                      borderRadius: "8px",
                    }}
                  >
                    {/* Compact Icon Container (32px x 32px, rounded-9px) */}
                    <ListItemIcon
                      className="transition-colors flex items-center justify-center shrink-0"
                      sx={{
                        minWidth: "unset",
                        width: isCollapsed ? "100%" : 32,
                        justifyContent: "center",
                        m: 0,
                      }}
                    >
                      <div
                        className={cn(
                          "w-8 h-8 rounded-[9px] flex items-center justify-center transition-all",
                          isActive ? "bg-white/18 text-white" : ""
                        )}
                        style={{
                          backgroundColor: isActive ? "rgba(255, 255, 255, 0.18)" : theme.bg,
                          color: isActive ? "#FFFFFF" : theme.color,
                        }}
                      >
                        <Icon
                          sx={{
                            fontSize: 18,
                            color: isActive ? "#FFFFFF" : theme.color,
                          }}
                        />
                      </div>
                    </ListItemIcon>

                    {/* Navigation Item Label (14px, 500 font-weight) */}
                    {!isCollapsed && (
                      <ListItemText
                        primary={
                          <span
                            className={cn(
                              "text-[14px] tracking-tight truncate block leading-none",
                              isActive
                                ? "font-semibold text-white"
                                : "font-medium text-[#334155] dark:text-slate-300 group-hover:text-[#2563EB]"
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
                  <ListItem disablePadding key={iIdx} className="block mb-0.5">
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

      {/* ─── 3. FIXED BOTTOM AREA (Upgrade Plan + User Profile, padding: 8px 10px) ─── */}
      <Box className="mt-auto shrink-0 p-[8px_10px] border-t border-[#EEF2F7] dark:border-slate-800 bg-white dark:bg-[#111827] flex flex-col gap-2">
        {/* Compact Upgrade Plan Card (58px–64px) */}
        {!isCollapsed && (
          <Link
            href="/settings"
            className="h-[60px] p-[10px_12px] rounded-[12px] bg-white dark:bg-slate-800/80 border border-[#E2E8F0] dark:border-slate-700/80 flex items-center justify-between gap-2.5 transition-all duration-150 hover:border-slate-300 dark:hover:border-slate-600 no-underline group mb-0.5"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-[9px] bg-[#FFF7ED] text-[#EA580C] flex items-center justify-center shrink-0">
                <WorkspacePremiumOutlinedIcon sx={{ fontSize: 18 }} />
              </div>
              <div className="flex flex-col min-w-0 leading-tight">
                <span className="text-[13px] font-bold text-[#172033] dark:text-white truncate">
                  Upgrade Plan
                </span>
                <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] truncate mt-0.5">
                  Get more features
                </span>
              </div>
            </div>
            <ArrowForwardOutlinedIcon
              sx={{ fontSize: 14 }}
              className="text-[#94A3B8] group-hover:text-[#2563EB] group-hover:translate-x-0.5 transition-all shrink-0"
            />
          </Link>
        )}

        {/* Compact User Profile Section (64px–68px, padding: 8px 10px) */}
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
              className="flex items-center justify-center p-1 rounded-xl hover:bg-[#F8FAFC] dark:hover:bg-slate-800 transition-colors"
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
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                  },
                }}
              >
                {user?.avatar ? (
                  <Avatar
                    src={user.avatar}
                    alt={user.name || "User"}
                    sx={{ width: 40, height: 40, borderRadius: "10px" }}
                  />
                ) : (
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "10px",
                      backgroundColor: "#2563EB",
                      fontSize: "13px",
                      fontWeight: 700,
                    }}
                  >
                    {getUserInitials(user?.name)}
                  </Avatar>
                )}
              </Badge>
            </Link>
          </Tooltip>
        ) : (
          <div className="h-[64px] p-[8px_10px] rounded-[12px] bg-white dark:bg-slate-800 border border-[#E2E8F0] dark:border-slate-700/80 flex items-center justify-between gap-2 transition-all">
            <Link
              href="/profile"
              className="flex items-center gap-2.5 min-w-0 no-underline hover:opacity-95 transition-opacity"
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
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                  },
                }}
              >
                {user?.avatar ? (
                  <Avatar
                    src={user.avatar}
                    alt={user.name || "User"}
                    sx={{ width: 40, height: 40, borderRadius: "10px" }}
                  />
                ) : (
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "10px",
                      backgroundColor: "#2563EB",
                      fontSize: "13px",
                      fontWeight: 700,
                    }}
                  >
                    {getUserInitials(user?.name)}
                  </Avatar>
                )}
              </Badge>

              <div className="flex flex-col min-w-0 leading-tight">
                <span className="text-[13px] font-semibold text-[#172033] dark:text-white truncate">
                  {user?.name || "Abhi Singh"}
                </span>
                <span className="text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8] truncate mt-0.5 uppercase tracking-wider">
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
                  backgroundColor: "rgba(239, 68, 68, 0.08)",
                },
                borderRadius: "8px",
                p: 0.8,
              }}
            >
              <LogoutOutlinedIcon sx={{ fontSize: 17 }} />
            </IconButton>
          </div>
        )}
      </Box>

      <SidebarRail />
    </UISidebar>
  );
}

export default Sidebar;