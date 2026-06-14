'use client';

import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ExternalLink, Mail, Phone, Calendar, Copy, Check, Eye, EyeOff } from 'lucide-react';
import { TemporaryCandidate } from '@/types/temCandidate';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface CandidateTableProps {
  candidates: TemporaryCandidate[];
  isLoading: boolean;
}

export const CandidateTable: React.FC<CandidateTableProps> = ({ candidates, isLoading }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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

  const handleCopyEmail = (email: string, id: string) => {
    navigator.clipboard.writeText(email);
    setCopiedId(id);
    toast.success('Email copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const TableSkeleton: React.FC = () => {
    return (
      <>
        {Array.from({ length: 5 }).map((_, index) => (
          <TableRow key={index} className="border-b border-border/40">
            <TableCell className="px-4 py-3"><Skeleton className="h-4 w-32 rounded" /></TableCell>
            <TableCell className="px-4 py-3"><Skeleton className="h-4 w-40 rounded" /></TableCell>
            <TableCell className="px-4 py-3"><Skeleton className="h-4 w-28 rounded" /></TableCell>
            <TableCell className="px-4 py-3"><Skeleton className="h-4 w-20 rounded" /></TableCell>
            <TableCell className="px-4 py-3"><Skeleton className="h-4 w-24 rounded" /></TableCell>
            <TableCell className="px-4 py-3"><Skeleton className="h-5 w-20 rounded-md" /></TableCell>
            <TableCell className="px-4 py-3"><Skeleton className="h-4 w-20 rounded" /></TableCell>
            <TableCell className="px-4 py-3 text-right"><Skeleton className="h-8 w-24 rounded-lg ml-auto" /></TableCell>
          </TableRow>
        ))}
      </>
    );
  };

  if (isLoading) {
    return (
      <div className="flex-1 overflow-auto custom-scrollbar relative">
        <Table className="w-full border-separate border-spacing-0 table-auto">
          <TableHeader className="sticky top-0 z-40 bg-muted/95 backdrop-blur-md">
            <TableRow>
              <TableHead className="px-4 py-3 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Name</TableHead>
              <TableHead className="px-4 py-3 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Email</TableHead>
              <TableHead className="px-4 py-3 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Phone</TableHead>
              <TableHead className="px-4 py-3 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Added By</TableHead>
              <TableHead className="px-4 py-3 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Created Date</TableHead>
              <TableHead className="px-4 py-3 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Visibility</TableHead>
              <TableHead className="px-4 py-3 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Pipeline ID</TableHead>
              <TableHead className="px-4 py-3 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider text-right pr-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableSkeleton />
          </TableBody>
        </Table>
      </div>
    );
  }

  if (candidates.length === 0) {
    return (
      <div className="flex-1 overflow-auto custom-scrollbar relative">
        <Table className="w-full border-separate border-spacing-0 table-auto">
          <TableHeader className="sticky top-0 z-40 bg-muted/95 backdrop-blur-md">
            <TableRow>
              <TableHead className="px-4 py-3 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Name</TableHead>
              <TableHead className="px-4 py-3 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Email</TableHead>
              <TableHead className="px-4 py-3 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Phone</TableHead>
              <TableHead className="px-4 py-3 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Added By</TableHead>
              <TableHead className="px-4 py-3 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Created Date</TableHead>
              <TableHead className="px-4 py-3 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Visibility</TableHead>
              <TableHead className="px-4 py-3 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Pipeline ID</TableHead>
              <TableHead className="px-4 py-3 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider text-right pr-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={8} className="text-center py-12 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                No temporary candidates found
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto custom-scrollbar relative min-h-0">
      <Table className="w-full border-separate border-spacing-0 table-auto">
        <TableHeader className="sticky top-0 z-40 bg-muted/95 backdrop-blur-md">
          <TableRow className="hover:bg-muted/95 transition-colors">
            <TableHead className="px-4 py-3 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Name</TableHead>
            <TableHead className="px-4 py-3 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Email</TableHead>
            <TableHead className="px-4 py-3 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Phone</TableHead>
            <TableHead className="px-4 py-3 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Added By</TableHead>
            <TableHead className="px-4 py-3 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Created Date</TableHead>
            <TableHead className="px-4 py-3 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Visibility</TableHead>
            <TableHead className="px-4 py-3 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Pipeline ID</TableHead>
            <TableHead className="px-4 py-3 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider text-right pr-6">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {candidates.map((candidate) => (
            <TableRow
              key={candidate._id}
              className={cn(
                "group border-b border-border/40 transition-all duration-200",
                "hover:bg-brand/[0.02]"
              )}
            >
              {/* Name */}
              <TableCell className="px-4 py-2.5 font-medium">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8 rounded-lg shadow-sm border border-border/60">
                    <AvatarFallback className={`text-[11px] font-bold bg-gradient-to-tr ${getInitialsGradient(candidate.name)}`}>
                      {getInitials(candidate.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-[13px] font-semibold text-foreground group-hover:text-brand transition-colors">
                    {candidate.name}
                  </span>
                </div>
              </TableCell>

              {/* Email */}
              <TableCell className="px-4 py-2.5">
                <div className="flex items-center space-x-2 text-xs">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <a href={`mailto:${candidate.email}`} className="hover:text-brand hover:underline font-medium text-foreground max-w-[180px] truncate">
                    {candidate.email}
                  </a>
                </div>
              </TableCell>

              {/* Phone */}
              <TableCell className="px-4 py-2.5">
                <div className="flex items-center space-x-2 text-xs">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <a href={`tel:${candidate.phone}`} className="hover:text-brand font-medium text-foreground">
                    {candidate.phone}
                  </a>
                </div>
              </TableCell>

              {/* Added By */}
              <TableCell className="px-4 py-2.5 text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                {candidate.CreatedBy?.name || 'System'}
              </TableCell>

              {/* Created Date */}
              <TableCell className="px-4 py-2.5 text-xs">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="text-foreground font-medium">{formatDate(candidate.createdAt)}</span>
                </div>
              </TableCell>

              {/* Visibility Status */}
              <TableCell className="px-4 py-2.5">
                <Badge
                  variant={candidate.showProfile ? 'default' : 'secondary'}
                  className={`rounded-lg px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider select-none shrink-0 ${
                    candidate.showProfile
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400'
                      : 'bg-muted text-muted-foreground border-border/60 hover:bg-muted'
                  }`}
                >
                  <span className="flex items-center gap-1">
                    {candidate.showProfile ? (
                      <>
                        <Eye className="h-2.5 w-2.5" />
                        Visible
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-2.5 w-2.5" />
                        Hidden
                      </>
                    )}
                  </span>
                </Badge>
              </TableCell>

              {/* Pipeline ID */}
              <TableCell className="px-4 py-2.5 text-xs">
                <TooltipProvider>
                  <Tooltip delayDuration={200}>
                    <TooltipTrigger asChild>
                      <span className="font-mono text-[10px] bg-muted/60 text-foreground px-1.5 py-0.5 rounded border border-border/40 cursor-help">
                        {candidate.pipelineId.slice(-8)}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent className="rounded-lg bg-card border border-border text-foreground font-semibold text-xs shadow-lg p-2 font-mono">
                      {candidate.pipelineId}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableCell>

              {/* Actions */}
              <TableCell className="px-4 py-2.5 text-right pr-6">
                <div className="flex items-center justify-end gap-1.5">
                  <TooltipProvider>
                    <Tooltip delayDuration={200}>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleCopyEmail(candidate.email, candidate._id)}
                          className="h-8 w-8 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground shrink-0"
                        >
                          {copiedId === candidate._id ? (
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

                  {candidate.profileLink && (
                    <TooltipProvider>
                      <Tooltip delayDuration={200}>
                        <TooltipTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => window.open(candidate.profileLink, '_blank')}
                            className="h-8 w-8 rounded-lg hover:bg-muted text-brand shrink-0"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="rounded-lg bg-card border border-border text-foreground font-semibold text-xs shadow-lg p-2">
                          View External Profile
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
