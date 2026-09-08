"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { listClientGroups, ClientGroup } from "@/services/clientService";
import { CreateGroupModal } from "./CreateGroupModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Search,
  Plus,
  Loader2,
  Building2,
  LayoutGrid,
  List,
  Users,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ExternalLink,
  Layers,
  Sparkles,
} from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export default function ClientGroupsModule() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
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

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
        {/* Executive Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Building2 className="h-5 w-5" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Client Groups
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Organize corporate conglomerates, holding companies, and related subsidiaries
            </p>
          </div>

          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="h-10 px-4 rounded-xl bg-primary text-primary-foreground font-bold shadow-md hover:bg-primary/90 active:scale-95 transition-all self-start sm:self-center"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            New Group
          </Button>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-card p-4 rounded-xl border border-border/70 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Total Corporate Groups
              </span>
              <p className="text-2xl font-bold text-foreground mt-0.5">{totalGroups}</p>
            </div>
            <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Layers className="h-5 w-5" />
            </div>
          </div>

          <div className="bg-card p-4 rounded-xl border border-border/70 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Affiliated Companies
              </span>
              <p className="text-2xl font-bold text-foreground mt-0.5">{totalMembersCount}</p>
            </div>
            <div className="h-9 w-9 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
          </div>

          <div className="bg-card p-4 rounded-xl border border-border/70 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Active Conglomerates
              </span>
              <p className="text-2xl font-bold text-foreground mt-0.5">
                {data?.data?.filter((g) => (g.memberCount || 0) > 0).length || 0}
              </p>
            </div>
            <div className="h-9 w-9 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Sparkles className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Search Bar & View Mode Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border/70 shadow-2xs">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by group name or code..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 h-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <span className="text-xs font-semibold text-muted-foreground hidden sm:inline mr-1">
              {totalGroups} {totalGroups === 1 ? "group" : "groups"} found
            </span>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-muted/60 p-0.5 rounded-lg border border-border/60">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-1.5 rounded-md text-xs font-medium transition-all",
                  viewMode === "grid"
                    ? "bg-background text-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
                title="Grid Card View"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={cn(
                  "p-1.5 rounded-md text-xs font-medium transition-all",
                  viewMode === "table"
                    ? "bg-background text-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
                title="Table View"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Content Section: Grid View vs Table View */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Loading Client Groups...
            </p>
          </div>
        ) : !data?.data || data.data.length === 0 ? (
          <div className="bg-card rounded-2xl border border-dashed border-border/80 p-12 text-center flex flex-col items-center">
            <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center mb-3 text-muted-foreground">
              <Building2 className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-foreground">
              {search ? "No matching groups found" : "No client groups yet"}
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-4">
              {search
                ? "Try searching for a different keyword or group code."
                : "Create a group to consolidate parent companies and related subsidiaries together."}
            </p>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              variant="outline"
              size="sm"
              className="text-xs font-semibold"
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> Create Group
            </Button>
          </div>
        ) : viewMode === "grid" ? (
          /* Visual Conglomerate Cards Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.data.map((group) => {
              const initials = group.name ? group.name.slice(0, 2).toUpperCase() : "CG";
              const membersCount = group.memberCount || 0;

              return (
                <div
                  key={group._id}
                  onClick={() => router.push(`/client-groups/${group._id}`)}
                  className="group bg-card rounded-xl border border-border/70 p-4 shadow-2xs hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    {/* Card Top: Avatar, Name, Code */}
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-extrabold text-xs shrink-0 shadow-2xs">
                          <AvatarFallback className="rounded-xl">{initials}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
                            {group.name}
                          </h3>
                          {group.groupCode ? (
                            <span className="text-[10px] font-mono text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded border border-border/60">
                              {group.groupCode}
                            </span>
                          ) : (
                            <span className="text-[10px] text-muted-foreground/60 italic">No code</span>
                          )}
                        </div>
                      </div>

                      <Badge
                        variant="outline"
                        className="bg-primary/5 text-primary border-primary/20 text-xs font-semibold shrink-0"
                      >
                        {membersCount} {membersCount === 1 ? "Company" : "Companies"}
                      </Badge>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {group.description || "No description provided for this client group."}
                    </p>
                  </div>

                  {/* Card Bottom: Navigation action */}
                  <div className="pt-3 border-t border-border/40 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {membersCount} Member {membersCount === 1 ? "Entity" : "Entities"}
                    </span>

                    <span className="inline-flex items-center text-xs font-semibold text-primary group-hover:translate-x-0.5 transition-transform">
                      <span>View details</span>
                      <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Dense Table View */
          <div className="bg-card rounded-xl border border-border/70 shadow-2xs overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/40">
                <tr className="border-b border-border/70 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  <TableHead className="py-3 px-4">Group Name</TableHead>
                  <TableHead className="py-3 px-4">Group Code</TableHead>
                  <TableHead className="py-3 px-4">Description</TableHead>
                  <TableHead className="py-3 px-4 text-center">Affiliated Members</TableHead>
                  <TableHead className="py-3 px-4 text-right">Action</TableHead>
                </tr>
              </TableHeader>
              <TableBody className="divide-y divide-border/40 text-xs">
                {data.data.map((group) => {
                  const initials = group.name ? group.name.slice(0, 2).toUpperCase() : "CG";
                  return (
                    <TableRow
                      key={group._id}
                      className="cursor-pointer hover:bg-muted/40 transition-colors"
                      onClick={() => router.push(`/client-groups/${group._id}`)}
                    >
                      <TableCell className="py-3 px-4 font-semibold text-foreground">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="h-7 w-7 rounded-lg bg-primary/10 text-primary font-bold text-xs shrink-0">
                            <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                          </Avatar>
                          <span className="truncate max-w-[200px]">{group.name}</span>
                        </div>
                      </TableCell>

                      <TableCell className="py-3 px-4">
                        {group.groupCode ? (
                          <span className="px-2 py-0.5 rounded-md bg-muted/80 text-[11px] font-mono border border-border/60">
                            {group.groupCode}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/60">—</span>
                        )}
                      </TableCell>

                      <TableCell className="py-3 px-4 max-w-xs truncate text-muted-foreground">
                        {group.description || <span className="text-muted-foreground/40">—</span>}
                      </TableCell>

                      <TableCell className="py-3 px-4 text-center">
                        <Badge variant="secondary" className="text-xs font-semibold px-2 py-0.5">
                          {group.memberCount || 0}
                        </Badge>
                      </TableCell>

                      <TableCell className="py-3 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs font-semibold text-primary hover:bg-primary/10"
                        >
                          View <ExternalLink className="h-3 w-3 ml-1" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between bg-card p-3 rounded-xl border border-border/70 shadow-2xs text-xs">
            <span className="text-muted-foreground font-medium">
              Page {page} of {totalPages}
            </span>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2.5 text-xs font-semibold rounded-lg"
                disabled={page <= 1 || isFetching}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Previous
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2.5 text-xs font-semibold rounded-lg"
                disabled={page >= totalPages || isFetching}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      <CreateGroupModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        mode="create"
        onSuccess={() => {
          setIsCreateModalOpen(false);
          refetch();
        }}
      />
    </div>
  );
}
