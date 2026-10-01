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
import Chip from "@mui/material/Chip";
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

// Icon mapping per module key
const MODULE_ICONS: Record<string, React.ElementType> = {
  home: HomeOutlinedIcon,
  todo: FormatListBulletedOutlinedIcon,
  leads: BusinessOutlinedIcon,
  clients: BusinessOutlinedIcon,
  "client-groups": LayersOutlinedIcon,
  jobs: WorkOutlineOutlinedIcon,
  candidates: PersonOutlineOutlinedIcon,
  pipeline: AccountTreeOutlinedIcon,
  recruiter: PersonAddAlt1OutlinedIcon,
  headhunter: PersonSearchOutlinedIcon,
  tem_candidates: ManageAccountsOutlinedIcon,
  teams: GroupsOutlinedIcon,
  roles: AdminPanelSettingsOutlinedIcon,
  settings: SettingsOutlinedIcon,
  profile: AccountCircleOutlinedIcon,
  admin: AdminPanelSettingsOutlinedIcon,
  notifications: NotificationsOutlinedIcon,
  email: MailOutlineOutlinedIcon,
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
      className="border-r border-slate-200/80 dark:border-slate-800 app-sidebar bg-white dark:bg-[#161C24] font-['Public_Sans',sans-serif] select-none transition-all duration-200"
    >
      {/* Brand Header */}
      <Box
        component="header"
        className={cn(
          "h-16 px-4 flex items-center border-b border-slate-200/80 dark:border-slate-800/80 shrink-0",
          isCollapsed ? "justify-center px-2" : "justify-between"
        )}
      >
        <Link
          href="/"
          className={cn(
            "flex items-center gap-3 no-underline outline-none group",
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
              <span className="text-[10.5px] font-medium text-[#919EAB] truncate leading-tight mt-0.5">
                Talent & Recruitment
              </span>
            </div>
          )}
        </Link>
      </Box>

      {/* Navigation List Viewport */}
      <Box
        component="nav"
        className="flex-1 overflow-y-auto px-3 py-3 custom-scrollbar flex flex-col gap-4"
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
                    className="bg-transparent text-[10px] font-extrabold uppercase tracking-wider text-[#919EAB] px-3 pb-1.5 pt-1 select-none flex items-center gap-1.5 leading-none"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500/60" />
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
                    : pathname?.startsWith(item.href);

                let key = item.moduleKey;
                if (item.href === "/leads") key = "leads";
                if (item.href === "/clients") key = "clients";
                if (item.href === "/client-groups") key = "client-groups";

                const Icon = MODULE_ICONS[key] || HomeOutlinedIcon;

                const navButton = (
                  <ListItem disablePadding key={iIdx} className="block mb-0.5">
                    <ListItemButton
                      component={Link}
                      href={item.href}
                      className={cn(
                        "h-10 px-3 rounded-xl transition-all duration-150 outline-none",
                        isCollapsed ? "justify-center px-0 w-10 mx-auto" : "justify-start gap-3",
                        isActive
                          ? "bg-[#1C252E] dark:bg-white text-white dark:text-[#1C252E] font-bold shadow-xs"
                          : "text-slate-600 dark:text-slate-300 hover:text-[#1C252E] dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/60 font-medium"
                      )}
                      sx={{
                        minHeight: 40,
                        "&:hover": {
                          backgroundColor: isActive ? undefined : "rgba(145, 158, 171, 0.08)",
                        },
                      }}
                    >
                      <ListItemIcon
                        className={cn(
                          "min-w-0 transition-colors",
                          isCollapsed ? "mx-auto" : "",
                          isActive
                            ? "text-white dark:text-[#1C252E]"
                            : "text-[#637381] dark:text-[#919EAB] group-hover:text-[#1C252E] dark:group-hover:text-white"
                        )}
                        sx={{ minWidth: isCollapsed ? 0 : 28 }}
                      >
                        <Icon sx={{ fontSize: 20 }} />
                      </ListItemIcon>

                      {!isCollapsed && (
                        <ListItemText
                          primary={
                            <span
                              className={cn(
                                "text-[13px] tracking-tight truncate block",
                                isActive ? "font-bold" : "font-medium"
                              )}
                            >
                              {item.name}
                            </span>
                          }
                        />
                      )}
                    </ListItemButton>
                  </ListItem>
                );

                if (isCollapsed) {
                  return (
                    <Tooltip
                      key={iIdx}
                      title={item.name}
                      placement="right"
                      arrow
                      slotProps={{
                        tooltip: {
                          sx: {
                            bgcolor: "#1C252E",
                            color: "#FFFFFF",
                            fontSize: "11px",
                            fontWeight: 600,
                            borderRadius: "8px",
                            px: 1.5,
                            py: 0.5,
                            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                          },
                        },
                        arrow: { sx: { color: "#1C252E" } },
                      }}
                    >
                      {navButton}
                    </Tooltip>
                  );
                }

                return navButton;
              })}
            </List>
          ))
        )}
      </Box>

      {/* User Profile Card Footer */}
      <Box
        component="footer"
        className={cn(
          "p-3 border-t border-slate-200/80 dark:border-slate-800/80 shrink-0",
          isCollapsed ? "flex justify-center" : ""
        )}
      >
        <div
          className={cn(
            "p-2 rounded-xl bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 flex items-center transition-all",
            isCollapsed ? "justify-center p-1.5" : "justify-between gap-2 shadow-2xs"
          )}
        >
          <Link
            href="/profile"
            className={cn(
              "flex items-center gap-2.5 min-w-0 no-underline hover:opacity-90 transition-opacity",
              isCollapsed && "justify-center"
            )}
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

            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-[#1C252E] dark:text-white truncate leading-tight">
                  {user?.name || "User"}
                </span>
                <span className="text-[10px] font-semibold text-[#919EAB] truncate leading-tight mt-0.5 uppercase tracking-wider">
                  {user?.role || "Member"}
                </span>
              </div>
            )}
          </Link>

          {!isCollapsed && (
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
          )}
        </div>
      </Box>

      <SidebarRail />
    </UISidebar>
  );
}

export default Sidebar;