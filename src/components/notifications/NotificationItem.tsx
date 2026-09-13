"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Notification } from "@/services/notificationService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Bell,
  Trash2,
  Clock,
  ExternalLink,
  Check,
  UserCheck,
  CheckCircle2,
  XCircle,
  RefreshCw,
  AlertTriangle,
  ClipboardList,
  GitCompare,
  UserPlus,
  UserMinus,
  Calendar,
  FileSignature,
  Award,
  Ban,
  Briefcase,
  Sliders,
  Users,
  Building,
  Edit3,
  Key,
  ShieldAlert,
  Smartphone,
  Building2,
  TrendingUp,
  FileText,
  FileClock,
  FileX,
  Shield,
  Pin,
  User,
  Target,
  FilePlus,
  FileMinus,
  FileWarning,
  UploadCloud,
  LucideIcon,
  AlertCircle,
  UserCircle2,
} from "lucide-react";

interface NotificationItemProps {
  notification: Notification;
  onClick: (notification: Notification) => void;
  onMarkAsRead: (id: string, e: React.MouseEvent) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  isMarkingRead?: boolean;
  isDeleting?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (id: string, e: React.MouseEvent) => void;
  isSelectionMode?: boolean;
}

export function NotificationItem({
  notification,
  onClick,
  onMarkAsRead,
  onDelete,
  isMarkingRead,
  isDeleting,
  isSelected = false,
  onToggleSelect,
  isSelectionMode = false,
}: NotificationItemProps) {
  const getNotificationVisuals = (
    type: string
  ): { icon: LucideIcon; badgeBg: string; iconColor: string; category: string } => {
    switch (type) {
      // Candidates & Screening
      case "CANDIDATE_ASSIGNED":
      case "CV_SUBMISSION_ASSIGNED":
        return {
          icon: UserCheck,
          badgeBg: "bg-blue-500/10 dark:bg-blue-500/15",
          iconColor: "text-blue-600 dark:text-blue-400",
          category: "Candidate",
        };
      case "ASSIGNMENT_ACCEPTED":
      case "CV_SUBMISSION_COMPLETED":
        return {
          icon: CheckCircle2,
          badgeBg: "bg-emerald-500/10 dark:bg-emerald-500/15",
          iconColor: "text-emerald-600 dark:text-emerald-400",
          category: "Candidate",
        };
      case "ASSIGNMENT_REJECTED":
        return {
          icon: XCircle,
          badgeBg: "bg-destructive/10",
          iconColor: "text-destructive",
          category: "Candidate",
        };
      case "ASSIGNMENT_EXPIRED":
      case "DEADLINE_REMINDER_12H":
      case "DEADLINE_REMINDER_4H":
      case "DEADLINE_REMINDER_1H":
      case "CV_SUBMISSION_REMINDER_12H":
      case "CV_SUBMISSION_REMINDER_4H":
      case "CV_SUBMISSION_REMINDER_1H":
        return {
          icon: Clock,
          badgeBg: "bg-amber-500/10 dark:bg-amber-500/15",
          iconColor: "text-amber-600 dark:text-amber-400",
          category: "Reminder",
        };
      case "ASSIGNMENT_REASSIGNED":
      case "CV_SUBMISSION_REASSIGNED":
      case "CV_SUBMISSION_REOPENED":
        return {
          icon: RefreshCw,
          badgeBg: "bg-purple-500/10 dark:bg-purple-500/15",
          iconColor: "text-purple-600 dark:text-purple-400",
          category: "Candidate",
        };
      case "DUPLICATE_CANDIDATE_FOUND":
      case "CV_SUBMISSION_OVERDUE":
        return {
          icon: AlertTriangle,
          badgeBg: "bg-destructive/10",
          iconColor: "text-destructive",
          category: "Alert",
        };
      case "SCREENING_DEADLINE_SET":
        return {
          icon: ClipboardList,
          badgeBg: "bg-teal-500/10 dark:bg-teal-500/15",
          iconColor: "text-teal-600 dark:text-teal-400",
          category: "Candidate",
        };

      // Pipeline
      case "PIPELINE_STAGE_CHANGED":
      case "PIPELINE_STAGE_DATA_UPDATED":
        return {
          icon: GitCompare,
          badgeBg: "bg-indigo-500/10 dark:bg-indigo-500/15",
          iconColor: "text-indigo-600 dark:text-indigo-400",
          category: "Pipeline",
        };
      case "PIPELINE_CANDIDATE_ADDED":
        return {
          icon: UserPlus,
          badgeBg: "bg-primary/10",
          iconColor: "text-primary",
          category: "Pipeline",
        };
      case "PIPELINE_CANDIDATE_REMOVED":
        return {
          icon: UserMinus,
          badgeBg: "bg-muted",
          iconColor: "text-muted-foreground",
          category: "Pipeline",
        };
      case "PIPELINE_INTERVIEW_SCHEDULED":
        return {
          icon: Calendar,
          badgeBg: "bg-cyan-500/10 dark:bg-cyan-500/15",
          iconColor: "text-cyan-600 dark:text-cyan-400",
          category: "Interview",
        };
      case "PIPELINE_OFFER_EXTENDED":
        return {
          icon: FileSignature,
          badgeBg: "bg-violet-500/10 dark:bg-violet-500/15",
          iconColor: "text-violet-600 dark:text-violet-400",
          category: "Offer",
        };
      case "PIPELINE_CANDIDATE_HIRED":
        return {
          icon: Award,
          badgeBg: "bg-emerald-500/15 dark:bg-emerald-500/20",
          iconColor: "text-emerald-600 dark:text-emerald-400",
          category: "Placement",
        };
      case "PIPELINE_CANDIDATE_REJECTED":
        return {
          icon: Ban,
          badgeBg: "bg-destructive/10",
          iconColor: "text-destructive",
          category: "Pipeline",
        };
      case "PIPELINE_PROBATION_SET":
        return {
          icon: Shield,
          badgeBg: "bg-teal-500/10 dark:bg-teal-500/15",
          iconColor: "text-teal-600 dark:text-teal-400",
          category: "Pipeline",
        };

      // Jobs & Teams
      case "JOB_CREATED":
        return {
          icon: Briefcase,
          badgeBg: "bg-emerald-500/10 dark:bg-emerald-500/15",
          iconColor: "text-emerald-600 dark:text-emerald-400",
          category: "Job",
        };
      case "JOB_STATUS_CHANGED":
        return {
          icon: Sliders,
          badgeBg: "bg-indigo-500/10 dark:bg-indigo-500/15",
          iconColor: "text-indigo-600 dark:text-indigo-400",
          category: "Job",
        };
      case "JOB_DELETED":
        return {
          icon: Trash2,
          badgeBg: "bg-destructive/10",
          iconColor: "text-destructive",
          category: "Job",
        };
      case "JOB_TEAM_MEMBER_CHANGED":
      case "JOB_TEAM_MEMBER_ASSIGNED":
        return {
          icon: Users,
          badgeBg: "bg-primary/10",
          iconColor: "text-primary",
          category: "Team",
        };
      case "TEAM_CREATED":
      case "TEAM_UPDATED":
        return {
          icon: Building,
          badgeBg: "bg-violet-500/10 dark:bg-violet-500/15",
          iconColor: "text-violet-600 dark:text-violet-400",
          category: "Team",
        };
      case "TEAM_DELETED":
        return {
          icon: XCircle,
          badgeBg: "bg-destructive/10",
          iconColor: "text-destructive",
          category: "Team",
        };

      // Security
      case "PASSWORD_CHANGED":
      case "PASSWORD_RESET":
        return {
          icon: Key,
          badgeBg: "bg-slate-500/10 dark:bg-slate-500/15",
          iconColor: "text-slate-600 dark:text-slate-400",
          category: "Security",
        };
      case "SUSPICIOUS_LOGIN":
        return {
          icon: ShieldAlert,
          badgeBg: "bg-destructive/15",
          iconColor: "text-destructive",
          category: "Security",
        };
      case "NEW_LOGIN":
        return {
          icon: Smartphone,
          badgeBg: "bg-teal-500/10 dark:bg-teal-500/15",
          iconColor: "text-teal-600 dark:text-teal-400",
          category: "Security",
        };

      // Clients & Contracts
      case "CLIENT_CREATED":
      case "CLIENT_BULK_IMPORTED":
        return {
          icon: Building2,
          badgeBg: "bg-primary/10",
          iconColor: "text-primary",
          category: "Client",
        };
      case "CLIENT_STAGE_CHANGED":
      case "CLIENT_SUB_STAGE_CHANGED":
        return {
          icon: TrendingUp,
          badgeBg: "bg-indigo-500/10 dark:bg-indigo-500/15",
          iconColor: "text-indigo-600 dark:text-indigo-400",
          category: "Client",
        };
      case "CONTRACT_CREATED":
      case "CONTRACT_UPDATED":
      case "CONTRACT_RENEWED":
        return {
          icon: FileText,
          badgeBg: "bg-emerald-500/10 dark:bg-emerald-500/15",
          iconColor: "text-emerald-600 dark:text-emerald-400",
          category: "Contract",
        };
      case "CONTRACT_EXPIRY_SOON":
      case "CONTRACT_RENEWAL_DUE":
        return {
          icon: FileClock,
          badgeBg: "bg-amber-500/10 dark:bg-amber-500/15",
          iconColor: "text-amber-600 dark:text-amber-400",
          category: "Contract",
        };
      case "CONTRACT_EXPIRED":
        return {
          icon: FileX,
          badgeBg: "bg-destructive/10",
          iconColor: "text-destructive",
          category: "Contract",
        };

      // CV Targets
      case "CV_TARGET_CV_ADDED":
        return {
          icon: FilePlus,
          badgeBg: "bg-primary/10",
          iconColor: "text-primary",
          category: "Target",
        };
      case "CV_TARGET_CV_REMOVED":
        return {
          icon: FileMinus,
          badgeBg: "bg-muted",
          iconColor: "text-muted-foreground",
          category: "Target",
        };
      case "CV_TARGET_SLOT_COMPLETED":
        return {
          icon: Target,
          badgeBg: "bg-emerald-500/10 dark:bg-emerald-500/15",
          iconColor: "text-emerald-600 dark:text-emerald-400",
          category: "Target",
        };
      case "CV_TARGET_SLOT_EXPIRED":
        return {
          icon: FileWarning,
          badgeBg: "bg-destructive/10",
          iconColor: "text-destructive",
          category: "Target",
        };

      default:
        return {
          icon: Bell,
          badgeBg: "bg-muted/80",
          iconColor: "text-muted-foreground",
          category: "General",
        };
    }
  };

  const visuals = getNotificationVisuals(notification.type);
  const IconComponent = visuals.icon;

  const isUrgent = notification.priority === "URGENT";
  const isHigh = notification.priority === "HIGH";

  return (
    <div
      onClick={() => onClick(notification)}
      className={cn(
        "group relative flex items-start gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-xl border transition-all duration-150 select-none cursor-pointer",
        notification.isRead
          ? "bg-card/75 hover:bg-card border-border/60 hover:border-border/90 opacity-85 hover:opacity-100"
          : "bg-card hover:bg-card border-primary/30 hover:border-primary/50 shadow-2xs",
        isSelected && "ring-2 ring-primary/40 bg-primary/[0.03] border-primary/50"
      )}
    >
      {/* Selection Checkbox */}
      {(isSelectionMode || isSelected) && (
        <div
          className="pt-0.5 shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelect?.(notification._id, e);
          }}
        >
          <Checkbox
            checked={isSelected}
            className="h-3.5 w-3.5 rounded data-[state=checked]:bg-primary"
          />
        </div>
      )}

      {/* Category Icon */}
      <div
        className={cn(
          "relative h-8 w-8 sm:h-9 sm:w-9 rounded-lg flex items-center justify-center shrink-0 border border-border/40 transition-transform duration-150 group-hover:scale-105",
          visuals.badgeBg
        )}
      >
        <IconComponent className={cn("h-4 w-4", visuals.iconColor)} />

        {/* Unread indicator dot */}
        {!notification.isRead && (
          <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary ring-2 ring-card" />
          </span>
        )}
      </div>

      {/* Content Body */}
      <div className="flex-1 min-w-0 pr-1">
        {/* Badges & Title */}
        <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
          <Badge
            variant="outline"
            className="text-[9px] font-bold px-1.5 py-0 rounded border-border/70 text-muted-foreground bg-muted/40 uppercase tracking-wider h-4.5"
          >
            {visuals.category}
          </Badge>

          {isUrgent && (
            <Badge
              variant="destructive"
              className="text-[9px] font-extrabold px-1.5 py-0 rounded uppercase tracking-wider gap-0.5 h-4.5 shadow-2xs"
            >
              <AlertTriangle className="h-2.5 w-2.5" />
              Urgent
            </Badge>
          )}

          {isHigh && (
            <Badge
              variant="outline"
              className="text-[9px] font-extrabold px-1.5 py-0 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 uppercase tracking-wider gap-0.5 h-4.5"
            >
              <AlertCircle className="h-2.5 w-2.5" />
              High
            </Badge>
          )}

          <h3
            className={cn(
              "text-xs sm:text-[13px] tracking-tight leading-snug w-full sm:w-auto",
              notification.isRead
                ? "font-semibold text-foreground/80"
                : "font-extrabold text-foreground"
            )}
          >
            {notification.title}
          </h3>
        </div>

        {/* Message */}
        <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed line-clamp-2 sm:line-clamp-1">
          {notification.message}
        </p>

        {/* Metadata Pills & Timestamps */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2.5 mt-1 text-[10px] text-muted-foreground">
          {/* Relative Time */}
          <span className="inline-flex items-center gap-1 font-medium text-muted-foreground/80">
            <Clock className="h-2.5 w-2.5" />
            {formatDistanceToNow(new Date(notification.createdAt), {
              addSuffix: true,
            })}
          </span>

          {/* Related Candidate */}
          {notification.relatedCandidate && (
            <span className="inline-flex items-center gap-1 font-semibold text-foreground/90 bg-muted/50 px-1.5 py-0.2 rounded border border-border/50 max-w-[140px] truncate">
              <User className="h-2.5 w-2.5 text-primary" />
              {notification.relatedCandidate.name}
            </span>
          )}

          {/* Related Job */}
          {notification.relatedJob && (
            <span className="inline-flex items-center gap-1 font-semibold text-foreground/90 bg-muted/50 px-1.5 py-0.2 rounded border border-border/50 max-w-[160px] truncate">
              <Briefcase className="h-2.5 w-2.5 text-indigo-500" />
              {notification.relatedJob.title}
            </span>
          )}

          {/* Triggered By User */}
          {notification.triggeredBy && (
            <span className="inline-flex items-center gap-1 font-medium text-muted-foreground bg-muted/40 px-1.5 py-0.2 rounded border border-border/40 max-w-[120px] truncate">
              <UserCircle2 className="h-2.5 w-2.5" />
              {notification.triggeredBy.name}
            </span>
          )}

          {/* Destination Link */}
          {notification.actionUrl && (
            <span className="inline-flex items-center gap-0.5 text-primary font-bold hover:underline ml-auto">
              Open <ExternalLink className="h-2.5 w-2.5" />
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-0.5 shrink-0">
        {!notification.isRead && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={(e) => onMarkAsRead(notification._id, e)}
            disabled={isMarkingRead}
            title="Mark as read"
            className="h-7 w-7 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
          >
            <Check className="h-3.5 w-3.5" />
          </Button>
        )}

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={(e) => onDelete(notification._id, e)}
          disabled={isDeleting}
          title="Delete notification"
          className="h-7 w-7 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
