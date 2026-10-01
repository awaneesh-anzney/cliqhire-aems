"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Tooltip from "@mui/material/Tooltip";
import { listClientGroups, ClientGroup } from "@/services/clientService";
import { CreateGroupModal } from "./CreateGroupModal";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Material UI Icons
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import PeopleOutlineOutlinedIcon from "@mui/icons-material/PeopleOutlineOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import AddOutlinedIcon from "@mui/icons-material/AddOutlined";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
import ViewListOutlinedIcon from "@mui/icons-material/ViewListOutlined";
import ArrowOutwardOutlinedIcon from "@mui/icons-material/ArrowOutwardOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import FolderOpenOutlinedIcon from "@mui/icons-material/FolderOpenOutlined";
import NavigateBeforeOutlinedIcon from "@mui/icons-material/NavigateBeforeOutlined";
import NavigateNextOutlinedIcon from "@mui/icons-material/NavigateNextOutlined";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import CheckOutlinedIcon from "@mui/icons-material/CheckOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";

function getInitials(name: string = ""): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return "CG";
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function getAvatarGradient(name: string = ""): string {
  const gradients = [
    "from-purple-600 to-indigo-600",
    "from-blue-600 to-indigo-600",
    "from-indigo-600 to-violet-600",
    "from-emerald-600 to-teal-600",
    "from-sky-600 to-blue-700",
    "from-amber-500 to-orange-600",
    "from-rose-600 to-pink-600",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return gradients[Math.abs(hash) % gradients.length];
}

export default function ClientGroupsModule() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const limit = 20;

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["clientGroupsList", debouncedSearch, page],
    queryFn: () => listClientGroups(debouncedSearch, page, limit),
  });

  const totalGroups = data?.totalCount || data?.data?.length || 0;
  const totalPages = Math.max(1, Math.ceil(totalGroups / limit));

  // Compute aggregate stats across currently loaded groups
  const totalMembersCount = useMemo(() => {
    if (!data?.data) return 0;
    return data.data.reduce((acc, g) => acc + (g.memberCount || 0), 0);
  }, [data?.data]);

  const activeConglomeratesCount = useMemo(() => {
    if (!data?.data) return 0;
    return data.data.filter((g) => (g.memberCount || 0) > 0).length;
  }, [data?.data]);

  const handleCopyCode = (e: React.MouseEvent, code?: string) => {
    e.stopPropagation();
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedId(code);
    toast.success(`Copied Group Code: ${code}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <Box
      sx={{
        height: "calc(100vh - 4.25rem)",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        overflow: "hidden",
        p: { xs: 1.5, sm: 2 },
        gap: 1.5,
      }}
    >
      {/* ─── 1. EXECUTIVE COMMAND HEADER ─── */}
      <Box
        sx={{
          flexShrink: 0,
          borderRadius: "12px",
          border: 1,
          borderColor: "divider",
          bgcolor: "background.paper",
          boxShadow: "0px 1px 3px 0px rgba(0, 0, 0, 0.04)",
          p: { xs: 1.5, sm: 2 },
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: { xs: "stretch", md: "center" },
            justifyContent: "space-between",
            gap: 1.5,
          }}
        >
          {/* Left: Module Title & Icon */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, flexShrink: 0 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: "8px",
                bgcolor: "rgba(142, 51, 255, 0.1)",
                color: "#8E33FF",
                border: 1,
                borderColor: "rgba(142, 51, 255, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AccountTreeOutlinedIcon sx={{ fontSize: 20 }} />
            </Box>

            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography sx={{ fontSize: "1rem", fontWeight: 800, color: "text.primary", lineHeight: 1.2 }}>
                  Client Groups
                </Typography>
                <Chip
                  icon={<LayersOutlinedIcon sx={{ fontSize: "12px !important", color: "#8E33FF !important" }} />}
                  label="Holding Portfolios"
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    bgcolor: "rgba(142, 51, 255, 0.1)",
                    color: "#8E33FF",
                    border: 0,
                    "& .MuiChip-label": { px: 0.6 },
                  }}
                />
              </Box>
              <Typography sx={{ fontSize: "0.6875rem", color: "text.secondary", mt: 0.25, display: { xs: "none", sm: "block" } }}>
                Organize corporate conglomerates, holding companies, and affiliated subsidiaries
              </Typography>
            </Box>
          </Box>

          {/* Middle: Search Input */}
          <Box sx={{ position: "relative", flex: 1, maxWidth: { md: 360 }, minWidth: 200 }}>
            <Box sx={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "text.disabled", display: "flex", alignItems: "center", pointerEvents: "none" }}>
              <SearchOutlinedIcon sx={{ fontSize: 16 }} />
            </Box>
            <input
              type="text"
              placeholder="Search by group name or code..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-8 pr-7 h-8 text-xs bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100/70 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#8E33FF] focus:border-[#8E33FF] text-[#1C252E] dark:text-white placeholder:text-slate-400 transition-all font-medium"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setPage(1);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
              >
                <CloseOutlinedIcon sx={{ fontSize: 13 }} />
              </button>
            )}
          </Box>

          {/* Right: Actions (View Mode Switcher, Refresh, + New Group) */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", flexShrink: 0 }}>
            <Chip
              label={`${totalGroups} ${totalGroups === 1 ? "group" : "groups"}`}
              size="small"
              sx={{
                height: 28,
                fontSize: "0.6875rem",
                fontWeight: 700,
                bgcolor: "background.paper",
                color: "text.secondary",
                border: 1,
                borderColor: "divider",
              }}
            />

            {/* View Switcher: Grid vs Table */}
            <Box sx={{ display: "flex", alignItems: "center", p: 0.25, borderRadius: "8px", bgcolor: "background.paper", border: 1, borderColor: "divider" }}>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                title="Grid View"
                className={cn(
                  "p-1 rounded-md text-xs transition-all flex items-center justify-center",
                  viewMode === "grid"
                    ? "bg-[#8E33FF] text-white shadow-2xs font-semibold"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                )}
              >
                <GridViewOutlinedIcon sx={{ fontSize: 16 }} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                title="Table View"
                className={cn(
                  "p-1 rounded-md text-xs transition-all flex items-center justify-center",
                  viewMode === "table"
                    ? "bg-[#8E33FF] text-white shadow-2xs font-semibold"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                )}
              >
                <ViewListOutlinedIcon sx={{ fontSize: 16 }} />
              </button>
            </Box>

            {/* Refresh Button */}
            <Button
              type="button"
              variant="outlined"
              size="small"
              onClick={() => refetch()}
              disabled={isFetching}
              title="Refresh"
              sx={{
                height: 32,
                minWidth: 32,
                p: 0,
                borderRadius: "8px",
                borderColor: "divider",
                color: "text.primary",
              }}
            >
              <RefreshOutlinedIcon sx={{ fontSize: 16 }} className={cn(isFetching && "animate-spin text-[#8E33FF]")} />
            </Button>

            {/* Primary Action Button: + New Group */}
            <Button
              type="button"
              variant="contained"
              size="small"
              onClick={() => setIsCreateModalOpen(true)}
              startIcon={<AddOutlinedIcon sx={{ fontSize: 16 }} />}
              sx={{
                height: 32,
                px: 1.5,
                borderRadius: "8px",
                textTransform: "none",
                fontWeight: 700,
                fontSize: "11.5px",
                bgcolor: "#8E33FF",
                boxShadow: "0 2px 8px rgba(142, 51, 255, 0.24)",
                "&:hover": {
                  bgcolor: "#7927E0",
                },
              }}
            >
              <span>New Group</span>
            </Button>
          </Box>
        </Box>

        {/* ─── 2. COMPACT SUMMARY METRIC CARDS STRIP ─── */}
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 1.5, pt: 1, borderTop: 1, borderColor: "divider" }}>
          {/* Metric 1: Total Corporate Groups */}
          <Box
            sx={{
              p: 1.5,
              borderRadius: "10px",
              bgcolor: "rgba(142, 51, 255, 0.04)",
              border: 1,
              borderColor: "rgba(142, 51, 255, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box>
              <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", color: "#8E33FF", letterSpacing: "0.5px" }}>
                Total Holding Groups
              </Typography>
              <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.75, mt: 0.25 }}>
                <Typography sx={{ fontSize: "1.25rem", fontWeight: 800, color: "text.primary", lineHeight: 1 }}>
                  {totalGroups}
                </Typography>
                <Typography sx={{ fontSize: "0.6875rem", color: "text.secondary" }}>
                  entities
                </Typography>
              </Box>
            </Box>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: "8px",
                bgcolor: "rgba(142, 51, 255, 0.1)",
                color: "#8E33FF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AccountTreeOutlinedIcon sx={{ fontSize: 18 }} />
            </Box>
          </Box>

          {/* Metric 2: Affiliated Subsidiaries */}
          <Box
            sx={{
              p: 1.5,
              borderRadius: "10px",
              bgcolor: "rgba(0, 167, 111, 0.04)",
              border: 1,
              borderColor: "rgba(0, 167, 111, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box>
              <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", color: "#00A76F", letterSpacing: "0.5px" }}>
                Affiliated Subsidiaries
              </Typography>
              <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.75, mt: 0.25 }}>
                <Typography sx={{ fontSize: "1.25rem", fontWeight: 800, color: "text.primary", lineHeight: 1 }}>
                  {totalMembersCount}
                </Typography>
                <Typography sx={{ fontSize: "0.6875rem", color: "text.secondary" }}>
                  companies
                </Typography>
              </Box>
            </Box>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: "8px",
                bgcolor: "rgba(0, 167, 111, 0.1)",
                color: "#00A76F",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <PeopleOutlineOutlinedIcon sx={{ fontSize: 18 }} />
            </Box>
          </Box>

          {/* Metric 3: Active Conglomerates */}
          <Box
            sx={{
              p: 1.5,
              borderRadius: "10px",
              bgcolor: "rgba(255, 171, 0, 0.04)",
              border: 1,
              borderColor: "rgba(255, 171, 0, 0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box>
              <Typography sx={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", color: "#FFAB00", letterSpacing: "0.5px" }}>
                Active Conglomerates
              </Typography>
              <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.75, mt: 0.25 }}>
                <Typography sx={{ fontSize: "1.25rem", fontWeight: 800, color: "text.primary", lineHeight: 1 }}>
                  {activeConglomeratesCount}
                </Typography>
                <Typography sx={{ fontSize: "0.6875rem", color: "text.secondary" }}>
                  with members
                </Typography>
              </Box>
            </Box>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: "8px",
                bgcolor: "rgba(255, 171, 0, 0.1)",
                color: "#FFAB00",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <BusinessOutlinedIcon sx={{ fontSize: 18 }} />
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ─── 3. MAIN WORKSPACE: GRID VIEW OR TABLE VIEW ─── */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
          borderRadius: "12px",
          border: 1,
          borderColor: "divider",
          bgcolor: "background.paper",
          boxShadow: "0px 1px 3px 0px rgba(0, 0, 0, 0.04)",
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}
      >
        {/* Top subtle fetching pulse */}
        {isFetching && !isLoading && (
          <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, bgcolor: "rgba(142, 51, 255, 0.2)", overflow: "hidden", zIndex: 30 }}>
            <Box sx={{ height: "100%", width: "100%", bgcolor: "#8E33FF" }} className="animate-pulse" />
          </Box>
        )}

        {/* Loading State */}
        {isLoading ? (
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", p: 4, gap: 1.5 }}>
            <Box sx={{ width: 36, height: 36, borderRadius: "10px", bgcolor: "rgba(142, 51, 255, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#8E33FF" }}>
              <RefreshOutlinedIcon sx={{ fontSize: 22 }} className="animate-spin" />
            </Box>
            <Typography sx={{ fontSize: "11.5px", fontWeight: 700, color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              Loading Client Groups...
            </Typography>
          </Box>
        ) : !data?.data || data.data.length === 0 ? (
          /* Empty State */
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", p: 4, textAlign: "center" }}>
            <Box sx={{ width: 48, height: 48, borderRadius: "12px", bgcolor: "rgba(145, 158, 171, 0.08)", border: 1, borderColor: "divider", display: "flex", alignItems: "center", justifyContent: "center", color: "text.disabled", mb: 1.5 }}>
              <FolderOpenOutlinedIcon sx={{ fontSize: 26 }} />
            </Box>
            <Typography sx={{ fontSize: "0.875rem", fontWeight: 800, color: "text.primary", mb: 0.5 }}>
              {search ? "No matching groups found" : "No client groups yet"}
            </Typography>
            <Typography sx={{ fontSize: "0.75rem", color: "text.secondary", maxWidth: 360, mb: 2 }}>
              {search
                ? "Try searching for a different keyword or group code."
                : "Create a group to consolidate parent companies and related subsidiaries together."}
            </Typography>
            <Button
              variant="contained"
              size="small"
              onClick={() => setIsCreateModalOpen(true)}
              startIcon={<AddOutlinedIcon sx={{ fontSize: 15 }} />}
              sx={{ height: 30, px: 1.5, fontSize: "11px", fontWeight: 700, textTransform: "none", borderRadius: "8px", bgcolor: "#8E33FF" }}
            >
              Create Group
            </Button>
          </Box>
        ) : viewMode === "grid" ? (
          /* Grid View */
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 sm:p-3.5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {data.data.map((group) => {
                const initials = getInitials(group.name);
                const membersCount = group.memberCount || 0;

                return (
                  <Box
                    key={group._id}
                    onClick={() => router.push(`/client-groups/${group._id}`)}
                    sx={{
                      bgcolor: "background.paper",
                      borderRadius: "12px",
                      border: 1,
                      borderColor: "divider",
                      p: 2,
                      cursor: "pointer",
                      transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      gap: 1.5,
                      boxShadow: "0px 1px 3px 0px rgba(0, 0, 0, 0.04)",
                      "&:hover": {
                        borderColor: "rgba(142, 51, 255, 0.4)",
                        transform: "translateY(-1px)",
                        boxShadow: "0 4px 12px rgba(142, 51, 255, 0.08)",
                      },
                    }}
                  >
                    {/* Top Row: Avatar, Name, Code & Count Badge */}
                    <div>
                      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, minWidth: 0 }}>
                          <div
                            className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-2xs bg-gradient-to-br",
                              getAvatarGradient(group.name)
                            )}
                          >
                            {initials}
                          </div>

                          <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ fontSize: "0.8125rem", fontWeight: 700, color: "text.primary", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {group.name}
                            </Typography>
                            {group.groupCode ? (
                              <button
                                type="button"
                                onClick={(e) => handleCopyCode(e, group.groupCode)}
                                className="inline-flex items-center gap-1 font-mono text-[10px] text-muted-foreground hover:text-foreground mt-0.5"
                              >
                                {copiedId === group.groupCode ? (
                                  <CheckOutlinedIcon sx={{ fontSize: 11, color: "#00A76F" }} />
                                ) : (
                                  <ContentCopyOutlinedIcon sx={{ fontSize: 10 }} />
                                )}
                                <span>{group.groupCode}</span>
                              </button>
                            ) : (
                              <Typography sx={{ fontSize: "10px", color: "text.disabled", fontStyle: "italic" }}>
                                No code
                              </Typography>
                            )}
                          </Box>
                        </Box>

                        <Chip
                          label={`${membersCount} ${membersCount === 1 ? "Company" : "Companies"}`}
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: "0.625rem",
                            fontWeight: 700,
                            bgcolor: membersCount > 0 ? "rgba(142, 51, 255, 0.1)" : "rgba(145, 158, 171, 0.1)",
                            color: membersCount > 0 ? "#8E33FF" : "text.secondary",
                            border: 0,
                            "& .MuiChip-label": { px: 0.6 },
                          }}
                        />
                      </Box>

                      {/* Description */}
                      <Typography sx={{ fontSize: "0.6875rem", color: "text.secondary", mt: 1.25, lineClamp: 2, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", minHeight: 32, lineHeight: 1.4 }}>
                        {group.description || "No description provided for this corporate holding group."}
                      </Typography>
                    </div>

                    {/* Bottom Row: Member Indicator & Navigation Link */}
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", pt: 1, borderTop: 1, borderColor: "divider" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                        <PeopleOutlineOutlinedIcon sx={{ fontSize: 14, color: "text.disabled" }} />
                        <Typography sx={{ fontSize: "10.5px", fontWeight: 600, color: "text.secondary" }}>
                          {membersCount} Member {membersCount === 1 ? "Entity" : "Entities"}
                        </Typography>
                      </Box>

                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.25, color: "#8E33FF" }}>
                        <Typography sx={{ fontSize: "11px", fontWeight: 700 }}>
                          View
                        </Typography>
                        <ArrowOutwardOutlinedIcon sx={{ fontSize: 13 }} />
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </div>
          </div>
        ) : (
          /* Table View */
          <div className="flex-1 overflow-auto custom-scrollbar relative">
            <Table className="w-full border-separate border-spacing-0 table-auto">
              <TableHeader className="sticky top-0 z-20 bg-slate-50/95 dark:bg-[#1C252E]/95 backdrop-blur-md">
                <TableRow className="border-b border-border/80 hover:bg-transparent">
                  <TableHead className="px-3 py-2 border-b border-border/80 text-[10.5px] font-extrabold text-[#637381] dark:text-[#919EAB] uppercase tracking-wider">
                    Group Name
                  </TableHead>
                  <TableHead className="px-3 py-2 border-b border-border/80 text-[10.5px] font-extrabold text-[#637381] dark:text-[#919EAB] uppercase tracking-wider">
                    Group Code
                  </TableHead>
                  <TableHead className="px-3 py-2 border-b border-border/80 text-[10.5px] font-extrabold text-[#637381] dark:text-[#919EAB] uppercase tracking-wider">
                    Description
                  </TableHead>
                  <TableHead className="px-3 py-2 border-b border-border/80 text-[10.5px] font-extrabold text-[#637381] dark:text-[#919EAB] uppercase tracking-wider text-center">
                    Affiliated Companies
                  </TableHead>
                  <TableHead className="px-3 py-2 border-b border-border/80 text-[10.5px] font-extrabold text-[#637381] dark:text-[#919EAB] uppercase tracking-wider text-right pr-4">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.data.map((group) => {
                  const initials = getInitials(group.name);
                  const membersCount = group.memberCount || 0;

                  return (
                    <TableRow
                      key={group._id}
                      onClick={() => router.push(`/client-groups/${group._id}`)}
                      className="group border-b border-border/50 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                    >
                      {/* Name + Avatar */}
                      <TableCell className="px-3 py-2">
                        <div className="flex items-center gap-2 max-w-[240px]">
                          <div
                            className={cn(
                              "w-6 h-6 rounded-md flex items-center justify-center text-white font-bold text-[9.5px] shrink-0 shadow-2xs bg-gradient-to-br",
                              getAvatarGradient(group.name)
                            )}
                          >
                            {initials}
                          </div>
                          <Typography sx={{ fontSize: "12px", fontWeight: 700, color: "text.primary" }} className="truncate group-hover:text-[#8E33FF] transition-colors">
                            {group.name}
                          </Typography>
                        </div>
                      </TableCell>

                      {/* Code */}
                      <TableCell className="px-3 py-2">
                        {group.groupCode ? (
                          <Chip
                            label={group.groupCode}
                            size="small"
                            onClick={(e) => handleCopyCode(e, group.groupCode)}
                            sx={{
                              height: 20,
                              fontFamily: "monospace",
                              fontSize: "10px",
                              fontWeight: 700,
                              bgcolor: "rgba(145, 158, 171, 0.1)",
                              color: "text.primary",
                              border: 1,
                              borderColor: "divider",
                              cursor: "pointer",
                            }}
                          />
                        ) : (
                          <span className="text-[10.5px] text-muted-foreground/60">—</span>
                        )}
                      </TableCell>

                      {/* Description */}
                      <TableCell className="px-3 py-2 max-w-xs">
                        <Typography sx={{ fontSize: "11.5px", color: "text.secondary", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {group.description || "—"}
                        </Typography>
                      </TableCell>

                      {/* Members Count */}
                      <TableCell className="px-3 py-2 text-center">
                        <Chip
                          label={`${membersCount} ${membersCount === 1 ? "member" : "members"}`}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: "10.5px",
                            fontWeight: 700,
                            bgcolor: membersCount > 0 ? "rgba(142, 51, 255, 0.1)" : "rgba(145, 158, 171, 0.1)",
                            color: membersCount > 0 ? "#8E33FF" : "text.secondary",
                            border: 0,
                          }}
                        />
                      </TableCell>

                      {/* Action */}
                      <TableCell className="px-3 py-2 text-right pr-4">
                        <Button
                          variant="text"
                          size="small"
                          endIcon={<ArrowOutwardOutlinedIcon sx={{ fontSize: 13 }} />}
                          sx={{
                            height: 26,
                            px: 1,
                            fontSize: "11px",
                            fontWeight: 700,
                            textTransform: "none",
                            color: "#8E33FF",
                            borderRadius: "6px",
                            "&:hover": { bgcolor: "rgba(142, 51, 255, 0.08)" },
                          }}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Integrated Pagination Footer */}
        {totalPages > 1 && (
          <Box
            sx={{
              flexShrink: 0,
              bgcolor: "background.paper",
              borderTop: 1,
              borderColor: "divider",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              px: 2,
              py: 1,
            }}
          >
            <Typography sx={{ fontSize: "11px", color: "text.secondary" }}>
              Page <Typography component="span" sx={{ fontWeight: 800, color: "text.primary", fontSize: "11px" }}>{page}</Typography> of{" "}
              <Typography component="span" sx={{ fontWeight: 800, color: "text.primary", fontSize: "11px" }}>{totalPages}</Typography>
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || isFetching}
                startIcon={<NavigateBeforeOutlinedIcon sx={{ fontSize: 15 }} />}
                sx={{
                  height: 28,
                  px: 1.25,
                  fontSize: "11px",
                  fontWeight: 700,
                  borderRadius: "6px",
                  textTransform: "none",
                  borderColor: "divider",
                  color: "text.primary",
                  "&:disabled": { opacity: 0.4 },
                }}
              >
                Previous
              </Button>

              <Button
                variant="outlined"
                size="small"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || isFetching}
                endIcon={<NavigateNextOutlinedIcon sx={{ fontSize: 15 }} />}
                sx={{
                  height: 28,
                  px: 1.25,
                  fontSize: "11px",
                  fontWeight: 700,
                  borderRadius: "6px",
                  textTransform: "none",
                  borderColor: "divider",
                  color: "text.primary",
                  "&:disabled": { opacity: 0.4 },
                }}
              >
                Next
              </Button>
            </Box>
          </Box>
        )}
      </Box>

      {/* ─── 4. CREATE GROUP MODAL ─── */}
      <CreateGroupModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        mode="create"
        onSuccess={() => {
          setIsCreateModalOpen(false);
          refetch();
        }}
      />
    </Box>
  );
}
