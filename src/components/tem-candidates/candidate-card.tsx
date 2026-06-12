'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ExternalLink, Mail, Phone, Calendar, User, Copy, Check, Eye, EyeOff } from 'lucide-react';
import { TemporaryCandidate } from '@/types/temCandidate';
import { toast } from 'sonner';

interface CandidateCardProps {
  candidate: TemporaryCandidate;
}

export const CandidateCard: React.FC<CandidateCardProps> = ({ candidate }) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

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

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(`${field} copied to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleCopyAll = () => {
    const text = `Name: ${candidate.name}
Email: ${candidate.email}
Phone: ${candidate.phone}
Pipeline ID: ${candidate.pipelineId}
Profile: ${candidate.profileLink || 'N/A'}`;
    handleCopy(text, 'Candidate details');
  };

  return (
    <Card className="w-full hover:shadow-md border-border/80 hover:border-brand/40 transition-all duration-300 bg-card rounded-xl flex flex-col justify-between group">
      <div>
        {/* Card Header */}
        <CardHeader className="p-4 pb-3 flex-shrink-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center space-x-3 min-w-0">
              <Avatar className="h-10 w-10 rounded-xl shadow-inner border border-border/60 shrink-0">
                <AvatarFallback className={`text-sm font-bold bg-gradient-to-tr ${getInitialsGradient(candidate.name)}`}>
                  {getInitials(candidate.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <CardTitle className="text-sm font-bold text-foreground truncate max-w-[140px] group-hover:text-brand transition-colors">
                  {candidate.name}
                </CardTitle>
                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mt-0.5">
                  By {candidate.CreatedBy?.name || 'System'}
                </p>
              </div>
            </div>

            {/* Visibility Badge */}
            <Badge 
              variant={candidate.showProfile ? 'default' : 'secondary'} 
              className={`rounded-lg px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider shrink-0 select-none ${
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
          </div>
        </CardHeader>

        {/* Card Content */}
        <CardContent className="p-4 pt-0 space-y-2.5 text-xs">
          {/* Email row */}
          <div className="flex items-center justify-between group/row text-muted-foreground hover:text-foreground transition-colors">
            <a href={`mailto:${candidate.email}`} className="flex items-center space-x-2 truncate min-w-0 py-0.5">
              <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0 group-hover/row:text-brand transition-colors" />
              <span className="truncate font-medium">{candidate.email}</span>
            </a>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => handleCopy(candidate.email, 'Email')}
              className="h-6 w-6 rounded-md opacity-0 group-hover/row:opacity-100 transition-opacity hover:bg-muted"
            >
              {copiedField === 'Email' ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
            </Button>
          </div>

          {/* Phone row */}
          <div className="flex items-center justify-between group/row text-muted-foreground hover:text-foreground transition-colors">
            <a href={`tel:${candidate.phone}`} className="flex items-center space-x-2 truncate min-w-0 py-0.5">
              <Phone className="h-3.5 w-3.5 text-muted-foreground shrink-0 group-hover/row:text-brand transition-colors" />
              <span className="truncate font-medium">{candidate.phone}</span>
            </a>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => handleCopy(candidate.phone, 'Phone')}
              className="h-6 w-6 rounded-md opacity-0 group-hover/row:opacity-100 transition-opacity hover:bg-muted"
            >
              {copiedField === 'Phone' ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
            </Button>
          </div>

          {/* Calendar row */}
          <div className="flex items-center space-x-2 text-muted-foreground py-0.5">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <span className="font-medium">Added {formatDate(candidate.createdAt)}</span>
          </div>

          {/* Pipeline ID row */}
          <div className="flex items-center justify-between py-0.5">
            <div className="flex items-center space-x-2 text-muted-foreground truncate min-w-0">
              <User className="h-3.5 w-3.5 shrink-0" />
              <span className="font-semibold uppercase tracking-wider text-[9px] text-muted-foreground">Pipeline:</span>
              <TooltipProvider>
                <Tooltip delayDuration={200}>
                  <TooltipTrigger asChild>
                    <span className="font-mono text-[10px] bg-muted/60 text-foreground px-1.5 py-0.5 rounded border border-border/40 cursor-help truncate">
                      {candidate.pipelineId.slice(-8)}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="rounded-lg bg-card border border-border text-foreground font-semibold text-xs shadow-lg p-2 font-mono">
                    {candidate.pipelineId}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => handleCopy(candidate.pipelineId, 'Pipeline ID')}
              className="h-6 w-6 rounded-md hover:bg-muted shrink-0"
            >
              {copiedField === 'Pipeline ID' ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3 text-muted-foreground/60 group-hover:text-foreground" />}
            </Button>
          </div>
        </CardContent>
      </div>

      {/* Card Footer Actions */}
      <div className="p-4 pt-0 border-t border-border/40 mt-2 flex-shrink-0 flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyAll}
          className="flex-1 h-8 rounded-lg text-[10px] uppercase font-semibold tracking-wider border-border hover:bg-muted transition-all"
        >
          {copiedField === 'Candidate details' ? (
            <>
              <Check className="h-3 w-3 mr-1.5 text-emerald-600" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-3 w-3 mr-1.5 text-muted-foreground" />
              Copy Details
            </>
          )}
        </Button>
        {candidate.profileLink && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(candidate.profileLink, '_blank')}
            className="flex-1 h-8 rounded-lg text-[10px] uppercase font-semibold tracking-wider border-border text-brand hover:bg-brand/5 hover:border-brand/40 transition-all"
          >
            <ExternalLink className="h-3 w-3 mr-1.5" />
            View Profile
          </Button>
        )}
      </div>
    </Card>
  );
};
