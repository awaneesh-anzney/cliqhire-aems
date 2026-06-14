'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Users,
  RefreshCw,
  LayoutGrid,
  Table as TableIcon,
  Search,
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Link as LinkIcon,
  User2,
  Trash2,
} from 'lucide-react';
import { TemporaryCandidate } from '@/types/temCandidate';
import { CandidateTable } from './candidate-table';
import { CandidateCard } from './candidate-card';
import { cn } from '@/lib/utils';

interface CandidateListProps {
  candidates: TemporaryCandidate[];
  isLoading: boolean;
  error: Error | null;
  results: number;
  onRefresh: () => void;
}

export const CandidateList: React.FC<CandidateListProps> = ({
  candidates,
  isLoading,
  error,
  results,
  onRefresh,
}) => {
  // Local filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'visible' | 'hidden'>('all');
  const [creatorFilter, setCreatorFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to page 1 on filter/sort change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, visibilityFilter, creatorFilter, sortBy]);

  // Extract unique creators for filter dropdown
  const creatorOptions = useMemo(() => {
    const names = candidates
      .map((c) => c.CreatedBy?.name)
      .filter((name): name is string => Boolean(name));
    return Array.from(new Set(names)).sort();
  }, [candidates]);

  // KPI Calculations
  const kpis = useMemo(() => {
    const total = candidates.length;
    const visible = candidates.filter((c) => c.showProfile).length;
    const linked = candidates.filter((c) => Boolean(c.profileLink)).length;
    return { total, visible, linked };
  }, [candidates]);

  // Filter and sort candidates in memory
  const processedCandidates = useMemo(() => {
    let result = [...candidates];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.name?.toLowerCase().includes(query) ||
          c.email?.toLowerCase().includes(query) ||
          c.phone?.toLowerCase().includes(query) ||
          c.pipelineId?.toLowerCase().includes(query)
      );
    }

    // Visibility filter
    if (visibilityFilter !== 'all') {
      result = result.filter((c) =>
        visibilityFilter === 'visible' ? c.showProfile : !c.showProfile
      );
    }

    // Creator filter
    if (creatorFilter !== 'all') {
      result = result.filter((c) => c.CreatedBy?.name === creatorFilter);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === 'name-asc') {
        return (a.name || '').localeCompare(b.name || '');
      }
      if (sortBy === 'name-desc') {
        return (b.name || '').localeCompare(a.name || '');
      }
      return 0;
    });

    return result;
  }, [candidates, searchQuery, visibilityFilter, creatorFilter, sortBy]);

  // Pagination calculations
  const pageSize = viewMode === 'grid' ? 9 : 10;
  const totalPages = Math.ceil(processedCandidates.length / pageSize) || 1;
  const paginatedCandidates = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return processedCandidates.slice(startIndex, startIndex + pageSize);
  }, [processedCandidates, currentPage, pageSize]);

  const clearAllFilters = () => {
    setSearchQuery('');
    setVisibilityFilter('all');
    setCreatorFilter('all');
    setSortBy('newest');
    setCurrentPage(1);
  };

  const isFilterActive =
    searchQuery.trim() !== '' || visibilityFilter !== 'all' || creatorFilter !== 'all';

  if (error) {
    return (
      <Card className="w-full border-red-200/50 bg-red-50/10 shadow-sm rounded-xl">
        <CardContent className="flex flex-col items-center justify-center py-16 px-6">
          <div className="flex flex-col items-center text-center max-w-md space-y-4">
            <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center mb-2 animate-bounce">
              <User2 className="h-6 w-6 text-rose-600" />
            </div>
            <h3 className="text-lg font-bold text-foreground tracking-tight">Sync/Sync error</h3>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider leading-relaxed">
              {error.message || 'Failed to synchronize temporary candidates database.'}
            </p>
            <Button onClick={onRefresh} className="bg-brand hover:bg-brand/90 text-white rounded-xl text-xs font-semibold px-6 py-2.5 shadow-md shadow-brand/20 transition-all flex items-center gap-2">
              <RefreshCw className="h-3.5 w-3.5" />
              Try Sync Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 space-y-4">
      {/* Title & Actions Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-shrink-0">
        <div>
          <h2 className="text-lg font-bold text-foreground tracking-tight flex items-center gap-2.5">
            <Users className="h-5 w-5 text-brand" />
            Temporary Talent Hub
          </h2>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">
            Manage raw profiles imported from resume parsers or extensions waiting to be promoted to full candidates.
          </p>
        </div>
        <Button
          onClick={onRefresh}
          variant="outline"
          size="sm"
          className="h-9 px-4 rounded-xl font-semibold text-[10px] uppercase tracking-wider border-border hover:bg-muted self-start sm:self-center shadow-sm"
          disabled={isLoading}
        >
          <RefreshCw className={cn("h-3.5 w-3.5 mr-2 text-brand", isLoading && "animate-spin")} />
          {isLoading ? "Syncing..." : "Sync Candidates"}
        </Button>
      </div>

      {/* KPI Cards section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-shrink-0">
        <Card className="rounded-xl border border-border/80 shadow-sm bg-card overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-24 h-full bg-brand/5 rounded-full blur-2xl pointer-events-none -mr-8 -mt-4 transition-transform group-hover:scale-110" />
          <CardContent className="p-4 flex items-center justify-between relative z-10">
            <div className="space-y-1">
              <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">Total Raw Imports</p>
              <h3 className="text-2xl font-bold text-foreground tracking-tight">{isLoading ? '...' : kpis.total}</h3>
            </div>
            <div className="w-9 h-9 bg-brand/10 rounded-xl flex items-center justify-center">
              <Users className="h-4 w-4 text-brand" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-border/80 shadow-sm bg-card overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-24 h-full bg-emerald-500/5 rounded-full blur-2xl pointer-events-none -mr-8 -mt-4 transition-transform group-hover:scale-110" />
          <CardContent className="p-4 flex items-center justify-between relative z-10">
            <div className="space-y-1">
              <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">Visible Profiles</p>
              <h3 className="text-2xl font-bold text-foreground tracking-tight">{isLoading ? '...' : kpis.visible}</h3>
            </div>
            <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center dark:bg-emerald-950/20">
              <UserCheck className="h-4 w-4 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-border/80 shadow-sm bg-card overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-24 h-full bg-blue-500/5 rounded-full blur-2xl pointer-events-none -mr-8 -mt-4 transition-transform group-hover:scale-110" />
          <CardContent className="p-4 flex items-center justify-between relative z-10">
            <div className="space-y-1">
              <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">Linked CVs</p>
              <h3 className="text-2xl font-bold text-foreground tracking-tight">{isLoading ? '...' : kpis.linked}</h3>
            </div>
            <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center dark:bg-blue-950/20">
              <LinkIcon className="h-4 w-4 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toolbar Controls */}
      <div className="flex-shrink-0 bg-card rounded-xl border border-border/80 shadow-sm p-3 flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Quick Search */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
            <Input
              type="text"
              placeholder="Search by name, email, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 h-9 text-xs bg-muted/20 border-border rounded-xl focus-visible:ring-1 focus-visible:ring-brand font-medium"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Visibility Dropdown */}
          <div className="w-[140px]">
            <Select
              value={visibilityFilter}
              onValueChange={(val) => setVisibilityFilter(val as any)}
            >
              <SelectTrigger className="w-full bg-muted/20 border-border rounded-xl text-xs font-semibold h-9">
                <SelectValue placeholder="Visibility" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border">
                <SelectItem value="all" className="text-xs font-medium">All Visibility</SelectItem>
                <SelectItem value="visible" className="text-xs font-medium">Visible Profiles</SelectItem>
                <SelectItem value="hidden" className="text-xs font-medium">Hidden Profiles</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Creator Dropdown */}
          {creatorOptions.length > 0 && (
            <div className="w-[150px]">
              <Select value={creatorFilter} onValueChange={setCreatorFilter}>
                <SelectTrigger className="w-full bg-muted/20 border-border rounded-xl text-xs font-semibold h-9">
                  <SelectValue placeholder="Added By" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border">
                  <SelectItem value="all" className="text-xs font-medium">All Creators</SelectItem>
                  {creatorOptions.map((name) => (
                    <SelectItem key={name} value={name} className="text-xs font-medium">
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Sort Dropdown */}
          <div className="w-[150px]">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full bg-muted/20 border-border rounded-xl text-xs font-semibold h-9">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-border">
                <SelectItem value="newest" className="text-xs font-medium">Newest Imported</SelectItem>
                <SelectItem value="oldest" className="text-xs font-medium">Oldest Imported</SelectItem>
                <SelectItem value="name-asc" className="text-xs font-medium">Name (A - Z)</SelectItem>
                <SelectItem value="name-desc" className="text-xs font-medium">Name (Z - A)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Layout Toggle Group */}
          <div className="flex items-center border border-border/80 rounded-xl p-0.5 bg-muted/20">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode('table')}
              className={cn(
                "h-8 w-8 rounded-lg text-muted-foreground",
                viewMode === 'table' && "bg-card text-brand border border-border/60 shadow-sm"
              )}
            >
              <TableIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode('grid')}
              className={cn(
                "h-8 w-8 rounded-lg text-muted-foreground",
                viewMode === 'grid' && "bg-card text-brand border border-border/60 shadow-sm"
              )}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>

          {/* Clear Filters Button */}
          {isFilterActive && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="rounded-xl h-9 px-3.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <X className="h-4 w-4 mr-2" />
              Reset Filters
            </Button>
          )}
        </div>
      </div>

      {/* Main List Section */}
      <div className="flex-1 min-h-0 bg-card rounded-xl border border-border/80 shadow-sm overflow-hidden flex flex-col">
        {processedCandidates.length === 0 && !isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-muted/60 flex items-center justify-center mb-4 text-muted-foreground">
              <Search className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-semibold text-foreground">No matching candidates found</h4>
            <p className="text-xs text-muted-foreground mt-1 max-w-[280px]">
              Try adjusting your quick search text or filter selections.
            </p>
            {isFilterActive && (
              <Button
                variant="outline"
                onClick={clearAllFilters}
                className="mt-4 rounded-xl text-xs font-semibold h-9 border-border"
              >
                Clear all filters
              </Button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 min-h-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <Card key={index} className="w-full border-border/60 bg-muted/5 rounded-xl h-[200px] animate-pulse" />
                ))
              ) : (
                paginatedCandidates.map((candidate) => (
                  <CandidateCard key={candidate._id} candidate={candidate} />
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            <CandidateTable candidates={paginatedCandidates} isLoading={isLoading} />
          </div>
        )}

        {/* Pagination Footer */}
        {processedCandidates.length > 0 && !isLoading && (
          <div className="flex-shrink-0 bg-muted/20 border-t border-border/80 py-2.5 px-4 flex items-center justify-between">
            <div className="text-[10px] sm:text-xs font-semibold text-muted-foreground">
              Showing <span className="text-foreground font-bold">{Math.min(processedCandidates.length, (currentPage - 1) * pageSize + 1)}</span> to{' '}
              <span className="text-foreground font-bold">{Math.min(processedCandidates.length, currentPage * pageSize)}</span> of{' '}
              <span className="text-foreground font-bold">{processedCandidates.length}</span> results
            </div>

            {totalPages > 1 && (
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-lg border-border"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                {Array.from({ length: totalPages }).map((_, i) => {
                  const pageNum = i + 1;
                  const isCurrent = currentPage === pageNum;
                  return (
                    <Button
                      key={pageNum}
                      variant={isCurrent ? "default" : "outline"}
                      size="icon"
                      className={cn(
                        "h-8 w-8 rounded-lg text-xs font-semibold",
                        isCurrent ? "bg-brand hover:bg-brand/90 text-white" : "border-border"
                      )}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}

                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-lg border-border"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
