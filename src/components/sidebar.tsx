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

// Multicolored icon theme mapping per module key
interface ModuleTheme {
  icon: React.ElementType;
  color: string;
  bg: string;
}

const MODULE_THEMES: Record<string, ModuleTheme> = {
  home: {
    icon: HomeOutlinedIcon,
    color: "#3B82F6",
    bg: "rgba(59, 130, 246, 0.12)",
  },
  todo: {
    icon: FormatListBulletedOutlinedIcon,
    color: "#F59E0B",
    bg: "rgba(245, 158, 11, 0.12)",
  },
  leads: {
    icon: BusinessOutlinedIcon,
    color: "#06B6D4",
    bg: "rgba(6, 182, 212, 0.12)",
  },
  clients: {
    icon: BusinessOutlinedIcon,
    color: "#0EA5E9",
    bg: "rgba(14, 165, 233, 0.12)",
  },
  "client-groups": {
    icon: LayersOutlinedIcon,
    color: "#14B8A6",
    bg: "rgba(20, 184, 166, 0.12)",
  },
  jobs: {
    icon: WorkOutlineOutlinedIcon,
    color: "#6366F1",
    bg: "rgba(99, 102, 241, 0.12)",
  },
  candidates: {
    icon: PersonOutlineOutlinedIcon,
    color: "#8B5CF6",
    bg: "rgba(139, 92, 246, 0.12)",
  },
  pipeline: {
    icon: AccountTreeOutlinedIcon,
    color: "#22C55E",
    bg: "rgba(34, 197, 94, 0.12)",
  },
  recruiter: {
    icon: PersonAddAlt1OutlinedIcon,
    color: "#2563EB",
    bg: "rgba(37, 99, 235, 0.12)",
  },
  headhunter: {
    icon: PersonSearchOutlinedIcon,
    color: "#A855F7",
    bg: "rgba(168, 85, 247, 0.12)",
  },
  tem_candidates: {
    icon: ManageAccountsOutlinedIcon,
    color: "#EC4899",
    bg: "rgba(236, 72, 153, 0.12)",
  },
  teams: {
    icon: GroupsOutlinedIcon,
    color: "#10B981",
    bg: "rgba(16, 185, 129, 0.12)",
  },
  roles: {
    icon: AdminPanelSettingsOutlinedIcon,
    color: "#D97706",
    bg: "rgba(217, 119, 6, 0.12)",
  },
  settings: {
    icon: SettingsOutlinedIcon,
    color: "#64748B",
    bg: "rgba(100, 116, 139, 0.12)",
  },
  profile: {
    icon: AccountCircleOutlinedIcon,
    color: "#0284C7",
    bg: "rgba(2, 132, 199, 0.12)",
  },
  admin: {
    icon: AdminPanelSettingsOutlinedIcon,
    color: "#F43F5E",
    bg: "rgba(244, 63, 94, 0.12)",
  },
  notifications: {
    icon: NotificationsOutlinedIcon,
    color: "#F97316",
    bg: "rgba(249, 115, 22, 0.12)",
  },
  email: {
    icon: MailOutlineOutlinedIcon,
    color: "#0284C7",
    bg: "rgba(2, 132, 199, 0.12)",
  },
};

interface NavSection {
  title: string;
  moduleKeys: string[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: "Overview",
    moduleKeys: ["home", "todo"],
  },
  {
    title: "Recruitment",
    moduleKeys: [
      "clients",
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
          if (key === "clients") {
            return (
              m.href === "/leads" ||
              m.href === "/clients" ||
              m.href === "/client-groups"
            );
          }
          if (key === "home") return m.href === "/";
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
      sections.push({ title: "Other", items: remaining });
    }

    return sections;
  }, [allowedModules]);

  return (
    <UISidebar
      collapsible="icon"
      className="border-r border-slate-200/80 dark:border-slate-800 app-sidebar bg-white dark:bg-[#161C24] font-sans select-none transition-all duration-200"
    >
      {/* Brand Header */}
      <Box
        component="header"
        className={cn(
          "h-16 flex items-center border-b border-slate-200/80 dark:border-slate-800/80 shrink-0",
          isCollapsed ? "justify-center px-1" : "justify-between px-3.5"
        )}
      >
        <Link
          href="/"
          className={cn(
            "flex items-center gap-2.5 no-underline outline-none group",
            isCollapsed && "justify-center"
          )}
        >
          {/* Logo Mark: Gradient Brand Box */}
          <div className="relative flex shrink-0 items-center justify-center">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 border border-white/20 transition-transform duration-200 group-hover:scale-105 active:scale-95 font-extrabold text-sm tracking-tight relative">
              CH
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-white dark:ring-[#161C24] animate-pulse" />
            </div>
          </div>

          {/* Brand Typography */}
          {!isCollapsed && (
            <div className="flex flex-col min-w-0 animate-in fade-in duration-200">
              <span className="text-[15px] font-extrabold tracking-tight text-[#1C252E] dark:text-white leading-tight">
                Cliq<span className="text-blue-600 dark:text-blue-400 font-extrabold">Hire</span>
              </span>
              <span className="text-[10px] font-medium text-[#637381] dark:text-[#919EAB] truncate leading-tight mt-0.5">
                Talent & Recruitment
              </span>
            </div>
          )}
        </Link>
      </Box>

      {/* Navigation List Viewport */}
      <Box
        component="nav"
        className={cn(
          "flex-1 overflow-y-auto overflow-x-hidden flex flex-col gap-3 transition-all",
          isCollapsed
            ? "px-1 py-3 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            : "px-2.5 py-3 custom-scrollbar"
        )}
      >
        {loadingPerms ? (
          <Box className="flex flex-col items-center justify-center py-12 gap-2 text-slate-400">
            <CircularProgress size={22} thickness={4} />
            {!isCollapsed && (
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#919EAB]">
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
                    className="bg-transparent text-[10px] font-extrabold uppercase tracking-wider text-[#637381] dark:text-[#919EAB] px-2.5 pb-1.5 pt-1 select-none flex items-center gap-1.5 leading-none"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500/70" />
                    <span>{section.title}</span>
                  </ListSubheader>
                ) : undefined
              }
              className="space-y-0.5"
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
                  color: "#3B82F6",
                  bg: "rgba(59, 130, 246, 0.12)",
                };
                const Icon = theme.icon;

                const navButton = (
                  <ListItemButton
                    component={Link}
                    href={item.href}
                    className={cn(
                      "rounded-xl transition-all duration-150 outline-none select-none",
                      isCollapsed
                        ? "w-11 h-11 p-0 mx-auto justify-center flex items-center"
                        : "w-full h-10 px-2.5 justify-start gap-2.5 flex items-center",
                      isActive
                        ? "!bg-[#2563EB] !text-white font-bold shadow-sm shadow-blue-500/30"
                        : "!bg-transparent text-slate-700 dark:text-slate-200 hover:!bg-slate-100/80 dark:hover:!bg-slate-800/60 font-semibold"
                    )}
                    sx={{
                      minHeight: isCollapsed ? 44 : 40,
                      width: isCollapsed ? 44 : "100%",
                      justifyContent: isCollapsed ? "center" : "flex-start",
                      p: isCollapsed ? 0 : undefined,
                    }}
                  >
                    {/* Multicolored Icon Container */}
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
                          "w-7.5 h-7.5 rounded-lg flex items-center justify-center transition-transform",
                          isActive ? "bg-white/20 text-white" : ""
                        )}
                        style={{
                          backgroundColor: isActive ? "rgba(255, 255, 255, 0.2)" : theme.bg,
                          color: isActive ? "#FFFFFF" : theme.color,
                        }}
                      >
                        <Icon
                          sx={{
                            fontSize: 19,
                            color: isActive ? "#FFFFFF" : theme.color,
                          }}
                        />
                      </div>
                    </ListItemIcon>

                    {/* Navigation Item Label */}
                    {!isCollapsed && (
                      <ListItemText
                        primary={
                          <span
                            className={cn(
                              "text-[13px] tracking-tight truncate block",
                              isActive ? "font-bold text-white" : "font-semibold text-slate-700 dark:text-slate-200"
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
                              bgcolor: "#1C252E",
                              color: "#FFFFFF",
                              fontFamily: "'Public Sans', sans-serif",
                              fontSize: "12px",
                              fontWeight: 600,
                              borderRadius: "10px",
                              px: 1.5,
                              py: 0.6,
                              boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
                              border: "1px solid rgba(255,255,255,0.15)",
                            },
                          },
                          arrow: {
                            sx: {
                              color: "#1C252E",
                              "&::before": {
                                border: "1px solid rgba(255,255,255,0.15)",
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

      {/* User Profile Card Footer */}
      <Box
        component="footer"
        className={cn(
          "p-2 border-t border-slate-200/80 dark:border-slate-800/80 shrink-0",
          isCollapsed ? "flex justify-center" : ""
        )}
      >
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
                  bgcolor: "#1C252E",
                  color: "#FFFFFF",
                  fontFamily: "'Public Sans', sans-serif",
                  fontSize: "12px",
                  fontWeight: 600,
                  borderRadius: "10px",
                  px: 1.5,
                  py: 0.6,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
                  border: "1px solid rgba(255,255,255,0.15)",
                },
              },
              arrow: {
                sx: {
                  color: "#1C252E",
                  "&::before": {
                    border: "1px solid rgba(255,255,255,0.15)",
                  },
                },
              },
            }}
          >
            <Link
              href="/profile"
              className="flex items-center justify-center p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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
                    sx={{ width: 34, height: 34, borderRadius: "10px" }}
                  />
                ) : (
                  <Avatar
                    sx={{
                      width: 34,
                      height: 34,
                      borderRadius: "10px",
                      background: "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)",
                      fontSize: "12px",
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
          <div className="p-2 rounded-xl bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between gap-2 shadow-2xs transition-all">
            <Link
              href="/profile"
              className="flex items-center gap-2.5 min-w-0 no-underline hover:opacity-90 transition-opacity"
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
                    sx={{ width: 32, height: 32, borderRadius: "10px" }}
                  />
                ) : (
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: "10px",
                      background: "linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)",
                      fontSize: "12px",
                      fontWeight: 700,
                    }}
                  >
                    {getUserInitials(user?.name)}
                  </Avatar>
                )}
              </Badge>

              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-[#1C252E] dark:text-white truncate leading-tight">
                  {user?.name || "User"}
                </span>
                <span className="text-[10px] font-semibold text-[#637381] dark:text-[#919EAB] truncate leading-tight mt-0.5 uppercase tracking-wider">
                  {user?.role || "Member"}
                </span>
              </div>
            </Link>

            <IconButton
              size="small"
              onClick={logout}
              title="Sign Out"
              aria-label="Sign out"
              sx={{
                color: "#919EAB",
                "&:hover": {
                  color: "#FF5630",
                  backgroundColor: "rgba(255, 86, 48, 0.08)",
                },
                borderRadius: "8px",
                p: 0.8,
              }}
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