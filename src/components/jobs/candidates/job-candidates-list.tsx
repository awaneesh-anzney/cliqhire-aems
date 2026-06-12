'use client';

import React, { forwardRef, useImperativeHandle, useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Loader2,
  Users,
  Search,
  LayoutGrid,
  Table as TableIcon,
  X,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  ExternalLink,
  FileText,
  Copy,
  Check,
  Building,
} from 'lucide-react';
import { api, initializeAuth } from '@/lib/axios-config';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';

export interface JobCandidatesListRef {
  refresh: () => Promise<void>;
}

// Visual mapping interfaces matching the API response data
export interface JobCandidate {
  candidateId: string;
  _id?: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  experience?: string;
  skills?: string[];
  resume?: string;
  status: string;
  isTempCandidate: boolean;
  pipelineInfo?: {
    currentStage: string;
    currentStatus: string;
    priority: string;
    notes: string;
    addedAt: string;
    lastUpdated: string;
    interviewRounds: any[];
    currentInterviewRound: any;
    stageHistory: any[];
  };
}

interface JobCandidatesListProps {
  jobId: string;
  jobTitle?: string;
  reloadToken?: number;
  onLoaded?: (count: number) => void;
}

export function getCandidateDisplayName(candidate: any) {
  const name = candidate.name || 'Unknown Candidate';
  return name;
}

// Stage visual themes
const stageColors: Record<string, string> = {
  Sourcing: 'bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-950/20 dark:text-indigo-400',
  Screening: 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400',
  'Client Review': 'bg-sky-50 text-sky-700 border-sky-100 dark:bg-sky-950/20 dark:text-sky-400',
  Interview: 'bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-950/20 dark:text-purple-400',
  Verification: 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400',
  Onboarding: 'bg-cyan-50 text-cyan-700 border-cyan-100 dark:bg-cyan-950/20 dark:text-cyan-400',
  Hired: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400',
};

// Pipeline status visual themes
const statusColors: Record<string, string> = {
  Pending: 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400',
  Active: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400',
  Disqualified: 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400',
  Hired: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400',
};

export const JobCandidatesList = forwardRef<JobCandidatesListRef, JobCandidatesListProps>(
  ({ jobId, jobTitle = 'this job', reloadToken, onLoaded }, ref) => {
    const router = useRouter();
    const queryClient = useQueryClient();

    const [searchQuery, setSearchQuery] = useState('');
    const [stageFilter, setStageFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
    const [currentPage, setCurrentPage] = useState(1);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    // TanStack Query
    const {
      data: response,
      isLoading,
      isError,
      refetch,
    } = useQuery({
      queryKey: ['job', jobId, 'candidates', reloadToken],
      queryFn: async () => {
        await initializeAuth();
        const res = await api.get(`/api/jobs/${jobId}/candidates`);
        return res.data;
      },
      enabled: !!jobId,
    });

    const candidates = useMemo(() => {
      const list = response?.data || [];
      onLoaded?.(list.length);
      return list as JobCandidate[];
    }, [response, onLoaded]);

    // Expose ref for external refresh triggers
    useImperativeHandle(ref, () => ({
      refresh: async () => {
        await refetch();
      },
    }));

    // Invalidate queries when candidates are added/refetched
    const handleCandidatesAdded = async () => {
      queryClient.invalidateQueries({ queryKey: ['job', jobId, 'candidates'] });
      await refetch();
    };

    // Reset page on filter changes
    useEffect(() => {
      setCurrentPage(1);
    }, [searchQuery, stageFilter, statusFilter]);

    // KPI Calculations
    const kpis = useMemo(() => {
      const total = candidates.length;
      const inProgress = candidates.filter((c) => {
        const stage = c.pipelineInfo?.currentStage || '';
        return ['Sourcing', 'Screening', 'Client Review', 'Interview', 'Verification', 'Onboarding'].includes(stage);
      }).length;
      const hired = candidates.filter((c) => c.pipelineInfo?.currentStage === 'Hired').length;
      const disqualified = candidates.filter((c) => c.pipelineInfo?.currentStatus === 'Disqualified').length;
      return { total, inProgress, hired, disqualified };
    }, [candidates]);

    // Filter Candidates locally
    const filteredCandidates = useMemo(() => {
      let result = [...candidates];

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        result = result.filter(
          (c) =>
            c.name?.toLowerCase().includes(query) ||
            c.email?.toLowerCase().includes(query) ||
            c.phone?.toLowerCase().includes(query) ||
            c.location?.toLowerCase().includes(query)
        );
      }

      if (stageFilter !== 'all') {
        result = result.filter((c) => c.pipelineInfo?.currentStage === stageFilter);
      }

      if (statusFilter !== 'all') {
        result = result.filter((c) => c.pipelineInfo?.currentStatus === statusFilter);
      }

      return result;
    }, [candidates, searchQuery, stageFilter, statusFilter]);

    // Pagination
    const pageSize = viewMode === 'grid' ? 9 : 10;
    const totalPages = Math.ceil(filteredCandidates.length / pageSize) || 1;
    const paginatedCandidates = useMemo(() => {
      const startIndex = (currentPage - 1) * pageSize;
      return filteredCandidates.slice(startIndex, startIndex + pageSize);
    }, [filteredCandidates, currentPage, pageSize]);

    const isFilterActive = searchQuery.trim() !== '' || stageFilter !== 'all' || statusFilter !== 'all';

    const clearAllFilters = () => {
      setSearchQuery('');
      setStageFilter('all');
      setStatusFilter('all');
      setCurrentPage(1);
    };

    const handleCopyEmail = (email: string, id: string) => {
      navigator.clipboard.writeText(email);
      setCopiedId(id);
      toast.success('Email copied to clipboard');
      setTimeout(() => setCopiedId(null), 2000);
    };

    const getInitials = (name: string) => {
      return name
        .split(' ')
        .map((word) => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
    };

    const getInitialsGradient = (name: string) => {
      const charCode = name.charCodeAt(0) || 0;
      const gradients = [
        'from-indigo-600 to-purple-500 text-indigo-50 bg-indigo-500/10',
        'from-emerald-600 to-teal-500 text-emerald-50 bg-emerald-500/10',
        'from-blue-600 to-cyan-500 text-blue-50 bg-blue-500/10',
        'from-violet-600 to-fuchsia-500 text-violet-50 bg-violet-500/10',
      ];
      return gradients[charCode % gradients.length];
    };

    if (isError) {
      return (
        <Card className="w-full border-red-200/50 bg-red-50/10 shadow-sm rounded-xl">
          <CardContent className="flex flex-col items-center justify-center py-16 px-6">
            <div className="flex flex-col items-center text-center max-w-md space-y-4">
              <div className="w-12 h-12 bg-rose-100 rounded-2xl flex items-center justify-center mb-2">
                <Users className="h-6 w-6 text-rose-600" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Sync Error</h3>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider leading-relaxed">
                Failed to load candidates attached to this job.
              </p>
              <Button onClick={() => refetch()} className="bg-brand hover:bg-brand/90 text-white rounded-xl text-xs font-semibold px-6 py-2.5 shadow-md shadow-brand/20 flex items-center gap-2">
                <Loader2 className="h-3.5 w-3.5" />
                Retry Loading
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="w-full flex flex-col space-y-4 p-4">
        {/* KPI Banner section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="rounded-xl border border-border/80 shadow-sm bg-card overflow-hidden relative">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">Total Candidates</p>
                <h3 className="text-xl font-bold text-foreground tracking-tight">{isLoading ? '...' : kpis.total}</h3>
              </div>
              <div className="w-9 h-9 bg-brand/10 rounded-xl flex items-center justify-center">
                <Users className="h-4 w-4 text-brand" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border border-border/80 shadow-sm bg-card overflow-hidden relative">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">In Progress</p>
                <h3 className="text-xl font-bold text-foreground tracking-tight">{isLoading ? '...' : kpis.inProgress}</h3>
              </div>
              <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center dark:bg-blue-950/20">
                <Building className="h-4 w-4 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border border-border/80 shadow-sm bg-card overflow-hidden relative">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">Hired Profiles</p>
                <h3 className="text-xl font-bold text-foreground tracking-tight">{isLoading ? '...' : kpis.hired}</h3>
              </div>
              <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center dark:bg-emerald-950/20">
                <Badge className="bg-emerald-500 hover:bg-emerald-600 px-1 py-0 shadow-none h-4 w-4 flex items-center justify-center rounded-full text-white text-[8px] font-black">✓</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border border-border/80 shadow-sm bg-card overflow-hidden relative">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">Disqualified</p>
                <h3 className="text-xl font-bold text-foreground tracking-tight">{isLoading ? '...' : kpis.disqualified}</h3>
              </div>
              <div className="w-9 h-9 bg-rose-50 rounded-xl flex items-center justify-center dark:bg-rose-950/20">
                <span className="text-rose-600 text-xs font-black">✕</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Toolbar Controls */}
        <div className="bg-card rounded-xl border border-border/80 shadow-sm p-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            {/* Search input */}
            <div className="relative w-full sm:w-[240px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/60" />
              <Input
                type="text"
                placeholder="Search candidates..."
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

            {/* Stage filter */}
            <div className="w-[140px]">
              <Select value={stageFilter} onValueChange={setStageFilter}>
                <SelectTrigger className="w-full bg-muted/20 border-border rounded-xl text-xs font-semibold h-9">
                  <SelectValue placeholder="Stage" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border">
                  <SelectItem value="all" className="text-xs font-medium">All Stages</SelectItem>
                  <SelectItem value="Sourcing" className="text-xs font-medium">Sourcing</SelectItem>
                  <SelectItem value="Screening" className="text-xs font-medium">Screening</SelectItem>
                  <SelectItem value="Client Review" className="text-xs font-medium">Client Review</SelectItem>
                  <SelectItem value="Interview" className="text-xs font-medium">Interview</SelectItem>
                  <SelectItem value="Verification" className="text-xs font-medium">Verification</SelectItem>
                  <SelectItem value="Onboarding" className="text-xs font-medium">Onboarding</SelectItem>
                  <SelectItem value="Hired" className="text-xs font-medium">Hired</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status filter */}
            <div className="w-[140px]">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full bg-muted/20 border-border rounded-xl text-xs font-semibold h-9">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border">
                  <SelectItem value="all" className="text-xs font-medium">All Statuses</SelectItem>
                  <SelectItem value="Pending" className="text-xs font-medium">Pending</SelectItem>
                  <SelectItem value="Active" className="text-xs font-medium">Active</SelectItem>
                  <SelectItem value="Disqualified" className="text-xs font-medium">Disqualified</SelectItem>
                  <SelectItem value="Hired" className="text-xs font-medium">Hired</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Reset Filters */}
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

          <div className="flex items-center gap-3">
            {/* View switcher */}
            <div className="flex items-center border border-border/80 rounded-xl p-0.5 bg-muted/20">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode('table')}
                className={cn(
                  'h-8 w-8 rounded-lg text-muted-foreground',
                  viewMode === 'table' && 'bg-card text-brand border border-border/60 shadow-sm'
                )}
              >
                <TableIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode('grid')}
                className={cn(
                  'h-8 w-8 rounded-lg text-muted-foreground',
                  viewMode === 'grid' && 'bg-card text-brand border border-border/60 shadow-sm'
                )}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Candidate List Render Area */}
        <div className="bg-card rounded-xl border border-border/80 shadow-sm overflow-hidden flex flex-col min-h-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-20 w-full">
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin text-brand" />
                <span className="text-[10px] font-semibold uppercase tracking-wider">Syncing Candidate list...</span>
              </div>
            </div>
          ) : filteredCandidates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4 text-muted-foreground">
                <Users className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-semibold text-foreground">No candidates found</h4>
              <p className="text-xs text-muted-foreground mt-1 max-w-[280px]">
                {isFilterActive ? 'Try clearing your filters or adjusting your search term.' : 'Candidates added to this job will be shown here.'}
              </p>
              {isFilterActive && (
                <Button variant="outline" onClick={clearAllFilters} className="mt-4 rounded-xl text-xs font-semibold h-9 border-border">
                  Clear Filters
                </Button>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="p-4 overflow-y-auto custom-scrollbar max-h-[600px]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedCandidates.map((candidate) => {
                  const idToUse = candidate.candidateId || candidate._id || '';
                  const initials = getInitials(candidate.name);
                  const gradient = getInitialsGradient(candidate.name);
                  return (
                    <Card key={idToUse} className="hover:shadow-md border-border/80 hover:border-brand/40 transition-all duration-300 rounded-xl flex flex-col justify-between group bg-card">
                      <div>
                        <div className="p-4 pb-3 flex items-start justify-between gap-2">
                          <div className="flex items-center space-x-3 min-w-0">
                            <Avatar className="h-10 w-10 rounded-xl shrink-0 border border-border/60">
                              <AvatarFallback className={`text-xs font-bold bg-gradient-to-tr ${gradient}`}>
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <h4
                                onClick={() => idToUse && router.push(`/candidates/${idToUse}`)}
                                className="text-sm font-bold text-foreground truncate max-w-[150px] cursor-pointer hover:text-brand transition-colors"
                              >
                                {candidate.name}
                              </h4>
                              {candidate.isTempCandidate && (
                                <Badge className="bg-red-50 text-red-600 border-red-100 font-semibold text-[8px] uppercase tracking-wider scale-90 origin-left mt-0.5">
                                  Temp
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col gap-1 shrink-0 items-end">
                            {candidate.pipelineInfo?.currentStage && (
                              <Badge className={`rounded-lg px-2 py-0.5 text-[9px] font-semibold uppercase border select-none ${stageColors[candidate.pipelineInfo.currentStage] || 'bg-muted border-border'}`}>
                                {candidate.pipelineInfo.currentStage}
                              </Badge>
                            )}
                            {candidate.pipelineInfo?.currentStatus && (
                              <Badge className={`rounded-lg px-2 py-0.2 text-[8px] font-semibold uppercase border select-none ${statusColors[candidate.pipelineInfo.currentStatus] || 'bg-muted border-border'}`}>
                                {candidate.pipelineInfo.currentStatus}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="p-4 pt-0 space-y-2.5 text-xs text-muted-foreground">
                          {candidate.email && (
                            <div className="flex items-center justify-between group/row hover:text-foreground">
                              <a href={`mailto:${candidate.email}`} className="flex items-center space-x-2 truncate min-w-0">
                                <Mail className="h-3.5 w-3.5 shrink-0 group-hover/row:text-brand" />
                                <span className="truncate font-medium">{candidate.email}</span>
                              </a>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleCopyEmail(candidate.email, idToUse)}
                                className="h-6 w-6 rounded-md opacity-0 group-hover/row:opacity-100 hover:bg-muted"
                              >
                                {copiedId === idToUse ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                              </Button>
                            </div>
                          )}

                          {candidate.phone && (
                            <div className="flex items-center space-x-2">
                              <Phone className="h-3.5 w-3.5 shrink-0" />
                              <a href={`tel:${candidate.phone}`} className="font-medium hover:text-foreground">
                                {candidate.phone}
                              </a>
                            </div>
                          )}

                          {candidate.location && (
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-3.5 w-3.5 shrink-0" />
                              <span className="font-medium truncate">{candidate.location}</span>
                            </div>
                          )}

                          {candidate.experience && (
                            <div className="flex items-center space-x-2">
                              <Briefcase className="h-3.5 w-3.5 shrink-0" />
                              <span className="font-medium">{candidate.experience} Years Experience</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="p-4 pt-0 border-t border-border/40 mt-2 flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => idToUse && router.push(`/candidates/${idToUse}`)}
                          className="flex-1 h-8 rounded-lg text-[10px] uppercase font-semibold tracking-wider border-border hover:bg-muted"
                        >
                          <ExternalLink className="h-3 w-3 mr-1.5" />
                          View Profile
                        </Button>
                        {candidate.resume && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(candidate.resume, '_blank')}
                            className="flex-1 h-8 rounded-lg text-[10px] uppercase font-semibold tracking-wider border-border text-brand hover:bg-brand/5 hover:border-brand/40"
                          >
                            <FileText className="h-3 w-3 mr-1.5" />
                            View Resume
                          </Button>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-x-auto min-h-0">
              <Table className="w-full border-separate border-spacing-0 table-auto">
                <TableHeader className="sticky top-0 z-40 bg-muted/95 backdrop-blur-md">
                  <TableRow className="hover:bg-muted/95 transition-colors">
                    <TableHead className="px-4 py-3 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Candidate</TableHead>
                    <TableHead className="px-4 py-3 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Email</TableHead>
                    <TableHead className="px-4 py-3 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Phone</TableHead>
                    <TableHead className="px-4 py-3 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Experience</TableHead>
                    <TableHead className="px-4 py-3 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Location</TableHead>
                    <TableHead className="px-4 py-3 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Recruitment Stage</TableHead>
                    <TableHead className="px-4 py-3 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Status</TableHead>
                    <TableHead className="px-4 py-3 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider text-right pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedCandidates.map((candidate) => {
                    const idToUse = candidate.candidateId || candidate._id || '';
                    const initials = getInitials(candidate.name);
                    const gradient = getInitialsGradient(candidate.name);

                    return (
                      <TableRow key={idToUse} className="group border-b border-border/40 hover:bg-brand/[0.01] transition-all duration-200">
                        <TableCell className="px-4 py-2.5">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8 rounded-lg shrink-0 border border-border/60">
                              <AvatarFallback className={`text-[10px] font-bold bg-gradient-to-tr ${gradient}`}>
                                {initials}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <span
                                onClick={() => idToUse && router.push(`/candidates/${idToUse}`)}
                                className="text-[13px] font-semibold text-foreground hover:text-brand transition-colors cursor-pointer"
                              >
                                {candidate.name}
                              </span>
                              {candidate.isTempCandidate && (
                                <Badge className="bg-red-50 text-red-600 border-red-100 font-semibold text-[8px] uppercase tracking-wider scale-90 ml-1.5 py-0 px-1">
                                  Temp
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="px-4 py-2.5 text-xs">
                          <a href={`mailto:${candidate.email}`} className="font-medium hover:underline text-foreground">
                            {candidate.email}
                          </a>
                        </TableCell>

                        <TableCell className="px-4 py-2.5 text-xs font-medium text-foreground">
                          {candidate.phone || '-'}
                        </TableCell>

                        <TableCell className="px-4 py-2.5 text-xs font-semibold text-foreground">
                          {candidate.experience ? `${candidate.experience} Yrs` : '-'}
                        </TableCell>

                        <TableCell className="px-4 py-2.5 text-xs font-medium text-muted-foreground">
                          {candidate.location || '-'}
                        </TableCell>

                        {/* Stage Badge */}
                        <TableCell className="px-4 py-2.5">
                          {candidate.pipelineInfo?.currentStage ? (
                            <Badge className={`rounded-lg px-2 py-0.5 text-[9px] font-semibold uppercase border select-none ${stageColors[candidate.pipelineInfo.currentStage] || 'bg-muted border-border'}`}>
                              {candidate.pipelineInfo.currentStage}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">—</span>
                          )}
                        </TableCell>

                        {/* Status Badge */}
                        <TableCell className="px-4 py-2.5">
                          {candidate.pipelineInfo?.currentStatus ? (
                            <Badge className={`rounded-lg px-2 py-0.2 text-[8px] font-semibold uppercase border select-none ${statusColors[candidate.pipelineInfo.currentStatus] || 'bg-muted border-border'}`}>
                              {candidate.pipelineInfo.currentStatus}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">—</span>
                          )}
                        </TableCell>

                        {/* Actions column */}
                        <TableCell className="px-4 py-2.5 text-right pr-6">
                          <div className="flex items-center justify-end gap-1">
                            <TooltipProvider>
                              <Tooltip delayDuration={200}>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => handleCopyEmail(candidate.email, idToUse)}
                                    className="h-8 w-8 rounded-lg hover:bg-muted shrink-0 text-muted-foreground"
                                  >
                                    {copiedId === idToUse ? (
                                      <Check className="h-4 w-4 text-emerald-600 animate-in zoom-in-50 duration-200" />
                                    ) : (
                                      <Copy className="h-4 w-4" />
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent className="rounded-lg bg-card border border-border text-foreground font-semibold text-xs shadow-lg p-2">
                                  Copy Email
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>

                            {candidate.resume && (
                              <TooltipProvider>
                                <Tooltip delayDuration={200}>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      onClick={() => window.open(candidate.resume, '_blank')}
                                      className="h-8 w-8 rounded-lg hover:bg-muted text-brand shrink-0"
                                    >
                                      <FileText className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent className="rounded-lg bg-card border border-border text-foreground font-semibold text-xs shadow-lg p-2">
                                    View Resume
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}

                            <TooltipProvider>
                              <Tooltip delayDuration={200}>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => idToUse && router.push(`/candidates/${idToUse}`)}
                                    className="h-8 w-8 rounded-lg hover:bg-muted text-foreground shrink-0"
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent className="rounded-lg bg-card border border-border text-foreground font-semibold text-xs shadow-lg p-2">
                                  View Full Profile
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination Footer */}
          {filteredCandidates.length > 0 && (
            <div className="bg-muted/20 border-t border-border/80 py-2.5 px-4 flex items-center justify-between">
              <div className="text-[10px] sm:text-xs font-semibold text-muted-foreground">
                Showing <span className="text-foreground font-bold">{Math.min(filteredCandidates.length, (currentPage - 1) * pageSize + 1)}</span> to{' '}
                <span className="text-foreground font-bold">{Math.min(filteredCandidates.length, currentPage * pageSize)}</span> of{' '}
                <span className="text-foreground font-bold">{filteredCandidates.length}</span> results
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
                        variant={isCurrent ? 'default' : 'outline'}
                        size="icon"
                        className={cn(
                          'h-8 w-8 rounded-lg text-xs font-semibold',
                          isCurrent ? 'bg-brand hover:bg-brand/90 text-white animate-in zoom-in-50 duration-200' : 'border-border'
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
  }
);

JobCandidatesList.displayName = 'JobCandidatesList';
