import React from 'react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { Notification } from '@/services/notificationService';
import { Button } from '@/components/ui/button';
import { 
  Bell, 
  Trash2, 
  Clock, 
  ExternalLink,
  Check,
  // Category Icons
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
  LucideIcon
} from 'lucide-react';

interface NotificationItemProps {
  notification: Notification;
  onClick: (notification: Notification) => void;
  onMarkAsRead: (id: string, e: React.MouseEvent) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  isMarkingRead?: boolean;
  isDeleting?: boolean;
}

export function NotificationItem({
  notification,
  onClick,
  onMarkAsRead,
  onDelete,
  isMarkingRead,
  isDeleting
}: NotificationItemProps) {
  const getNotificationIcon = (type: string): { icon: LucideIcon; bg: string; color: string } => {
    switch (type) {
      // Phase 1
      case 'CANDIDATE_ASSIGNED': return { icon: UserCheck, bg: 'bg-blue-100 dark:bg-blue-900/30', color: 'text-blue-600 dark:text-blue-400' };
      case 'ASSIGNMENT_ACCEPTED': return { icon: CheckCircle2, bg: 'bg-green-100 dark:bg-green-900/30', color: 'text-green-600 dark:text-green-400' };
      case 'ASSIGNMENT_REJECTED': return { icon: XCircle, bg: 'bg-red-100 dark:bg-red-900/30', color: 'text-red-600 dark:text-red-400' };
      case 'ASSIGNMENT_EXPIRED': return { icon: Clock, bg: 'bg-orange-100 dark:bg-orange-900/30', color: 'text-orange-600 dark:text-orange-400' };
      case 'ASSIGNMENT_REASSIGNED': return { icon: RefreshCw, bg: 'bg-purple-100 dark:bg-purple-900/30', color: 'text-purple-600 dark:text-purple-400' };
      case 'DEADLINE_REMINDER_12H':
      case 'DEADLINE_REMINDER_4H':
      case 'DEADLINE_REMINDER_1H': return { icon: Clock, bg: 'bg-yellow-100 dark:bg-yellow-900/30', color: 'text-yellow-600 dark:text-yellow-400' };
      case 'DUPLICATE_CANDIDATE_FOUND': return { icon: AlertTriangle, bg: 'bg-rose-100 dark:bg-rose-900/30', color: 'text-rose-600 dark:text-rose-400' };
      case 'SCREENING_DEADLINE_SET': return { icon: ClipboardList, bg: 'bg-teal-100 dark:bg-teal-900/30', color: 'text-teal-600 dark:text-teal-400' };

      // Phase 2
      case 'PIPELINE_STAGE_CHANGED': return { icon: GitCompare, bg: 'bg-indigo-100 dark:bg-indigo-900/30', color: 'text-indigo-600 dark:text-indigo-400' };
      case 'PIPELINE_CANDIDATE_ADDED': return { icon: UserPlus, bg: 'bg-blue-100 dark:bg-blue-900/30', color: 'text-blue-600 dark:text-blue-400' };
      case 'PIPELINE_CANDIDATE_REMOVED': return { icon: UserMinus, bg: 'bg-gray-100 dark:bg-gray-900/30', color: 'text-gray-600 dark:text-gray-400' };
      case 'PIPELINE_INTERVIEW_SCHEDULED': return { icon: Calendar, bg: 'bg-cyan-100 dark:bg-cyan-900/30', color: 'text-cyan-600 dark:text-cyan-400' };
      case 'PIPELINE_OFFER_EXTENDED': return { icon: FileSignature, bg: 'bg-violet-100 dark:bg-violet-900/30', color: 'text-violet-600 dark:text-violet-400' };
      case 'PIPELINE_CANDIDATE_HIRED': return { icon: Award, bg: 'bg-emerald-100 dark:bg-emerald-900/30', color: 'text-emerald-600 dark:text-emerald-400' };
      case 'PIPELINE_CANDIDATE_REJECTED': return { icon: Ban, bg: 'bg-rose-100 dark:bg-rose-900/30', color: 'text-rose-600 dark:text-rose-400' };
      case 'PIPELINE_STAGE_DATA_UPDATED': return { icon: Edit3, bg: 'bg-cyan-100 dark:bg-cyan-900/30', color: 'text-cyan-600 dark:text-cyan-400' };
      case 'PIPELINE_PROBATION_SET': return { icon: Shield, bg: 'bg-teal-100 dark:bg-teal-900/30', color: 'text-teal-600 dark:text-teal-400' };

      // Phase 3
      case 'JOB_CREATED': return { icon: Briefcase, bg: 'bg-emerald-100 dark:bg-emerald-900/30', color: 'text-emerald-600 dark:text-emerald-400' };
      case 'JOB_STATUS_CHANGED': return { icon: Sliders, bg: 'bg-indigo-100 dark:bg-indigo-900/30', color: 'text-indigo-600 dark:text-indigo-400' };
      case 'JOB_DELETED': return { icon: Trash2, bg: 'bg-rose-100 dark:bg-rose-900/30', color: 'text-rose-600 dark:text-rose-400' };
      case 'JOB_TEAM_MEMBER_CHANGED':
      case 'JOB_TEAM_MEMBER_ASSIGNED': return { icon: Users, bg: 'bg-blue-100 dark:bg-blue-900/30', color: 'text-blue-600 dark:text-blue-400' };
      case 'TEAM_CREATED': return { icon: Building, bg: 'bg-violet-100 dark:bg-violet-900/30', color: 'text-violet-600 dark:text-violet-400' };
      case 'TEAM_UPDATED': return { icon: Edit3, bg: 'bg-amber-100 dark:bg-amber-900/30', color: 'text-amber-600 dark:text-amber-400' };
      case 'TEAM_DELETED': return { icon: XCircle, bg: 'bg-red-100 dark:bg-red-900/30', color: 'text-red-600 dark:text-red-400' };

      // Phase 4
      case 'PASSWORD_CHANGED':
      case 'PASSWORD_RESET': return { icon: Key, bg: 'bg-slate-100 dark:bg-slate-900/30', color: 'text-slate-600 dark:text-slate-400' };
      case 'SUSPICIOUS_LOGIN': return { icon: ShieldAlert, bg: 'bg-rose-100 dark:bg-rose-900/30', color: 'text-rose-600 dark:text-rose-400' };
      case 'NEW_LOGIN': return { icon: Smartphone, bg: 'bg-teal-100 dark:bg-teal-900/30', color: 'text-teal-600 dark:text-teal-400' };

      // Phase 5
      case 'CLIENT_CREATED': return { icon: Users, bg: 'bg-blue-100 dark:bg-blue-900/30', color: 'text-blue-600 dark:text-blue-400' };
      case 'CLIENT_STAGE_CHANGED':
      case 'CLIENT_SUB_STAGE_CHANGED': return { icon: TrendingUp, bg: 'bg-indigo-100 dark:bg-indigo-900/30', color: 'text-indigo-600 dark:text-indigo-400' };
      case 'CLIENT_ACTIVITY_LOGGED': return { icon: ClipboardList, bg: 'bg-teal-100 dark:bg-teal-900/30', color: 'text-teal-600 dark:text-teal-400' };
      case 'CLIENT_NEGOTIATION_UPDATED': return { icon: Briefcase, bg: 'bg-amber-100 dark:bg-amber-900/30', color: 'text-amber-600 dark:text-amber-400' };
      case 'CLIENT_FOLLOWUP_DUE': return { icon: Clock, bg: 'bg-yellow-100 dark:bg-yellow-900/30', color: 'text-yellow-600 dark:text-yellow-400' };
      case 'CLIENT_FOLLOWUP_OVERDUE': return { icon: AlertTriangle, bg: 'bg-rose-100 dark:bg-rose-900/30', color: 'text-rose-600 dark:text-rose-400' };
      case 'CLIENT_DELETED': return { icon: Building2, bg: 'bg-red-100 dark:bg-red-900/30', color: 'text-red-600 dark:text-red-400' };
      case 'CONTRACT_CREATED': return { icon: FileText, bg: 'bg-violet-100 dark:bg-violet-900/30', color: 'text-violet-600 dark:text-violet-400' };
      case 'CONTRACT_UPDATED':
      case 'CONTRACT_RENEWED': return { icon: RefreshCw, bg: 'bg-emerald-100 dark:bg-emerald-900/30', color: 'text-emerald-600 dark:text-emerald-400' };
      case 'CONTRACT_EXPIRY_SOON':
      case 'CONTRACT_RENEWAL_DUE': return { icon: FileClock, bg: 'bg-yellow-100 dark:bg-yellow-900/30', color: 'text-yellow-600 dark:text-yellow-400' };
      case 'CONTRACT_EXPIRED': return { icon: FileX, bg: 'bg-red-100 dark:bg-red-900/30', color: 'text-red-600 dark:text-red-400' };
      case 'MEMBER_ADDED': return { icon: UserPlus, bg: 'bg-teal-100 dark:bg-teal-900/30', color: 'text-teal-600 dark:text-teal-400' };
      case 'USER_ROLE_CHANGED': return { icon: Shield, bg: 'bg-amber-100 dark:bg-amber-900/30', color: 'text-amber-600 dark:text-amber-400' };
      case 'USER_DEACTIVATED':
      case 'USER_DELETED': return { icon: UserMinus, bg: 'bg-rose-100 dark:bg-rose-900/30', color: 'text-rose-600 dark:text-rose-400' };
      case 'TASK_DUE_SOON':
      case 'TASK_OVERDUE': return { icon: Calendar, bg: 'bg-amber-100 dark:bg-amber-900/30', color: 'text-amber-600 dark:text-amber-400' };
      case 'TASK_JOB_ASSIGNMENT_ADDED': return { icon: Pin, bg: 'bg-blue-100 dark:bg-blue-900/30', color: 'text-blue-600 dark:text-blue-400' };
      case 'CANDIDATE_CREATED': return { icon: User, bg: 'bg-emerald-100 dark:bg-emerald-900/30', color: 'text-emerald-600 dark:text-emerald-400' };
      case 'CANDIDATE_STATUS_CHANGED': return { icon: RefreshCw, bg: 'bg-indigo-100 dark:bg-indigo-900/30', color: 'text-indigo-600 dark:text-indigo-400' };

      // CV Targets
      case 'CV_TARGET_CV_ADDED': return { icon: FilePlus, bg: 'bg-blue-100 dark:bg-blue-900/30', color: 'text-blue-600 dark:text-blue-400' };
      case 'CV_TARGET_CV_REMOVED': return { icon: FileMinus, bg: 'bg-gray-100 dark:bg-gray-900/30', color: 'text-gray-600 dark:text-gray-400' };
      case 'CV_TARGET_SLOT_COMPLETED': return { icon: Target, bg: 'bg-emerald-100 dark:bg-emerald-900/30', color: 'text-emerald-600 dark:text-emerald-400' };
      case 'CV_TARGET_SLOT_EXPIRED': return { icon: FileWarning, bg: 'bg-red-100 dark:bg-red-900/30', color: 'text-red-600 dark:text-red-400' };

      // CV Submission Responsibility
      case 'CV_SUBMISSION_ASSIGNED': return { icon: UserCheck, bg: 'bg-blue-100 dark:bg-blue-900/30', color: 'text-blue-600 dark:text-blue-400' };
      case 'CV_SUBMISSION_REMINDER_12H':
      case 'CV_SUBMISSION_REMINDER_4H':
      case 'CV_SUBMISSION_REMINDER_1H': return { icon: Clock, bg: 'bg-yellow-100 dark:bg-yellow-900/30', color: 'text-yellow-600 dark:text-yellow-400' };
      case 'CV_SUBMISSION_OVERDUE': return { icon: AlertTriangle, bg: 'bg-rose-100 dark:bg-rose-900/30', color: 'text-rose-600 dark:text-rose-400' };
      case 'CV_SUBMISSION_REOPENED': return { icon: RefreshCw, bg: 'bg-indigo-100 dark:bg-indigo-900/30', color: 'text-indigo-600 dark:text-indigo-400' };
      case 'CV_SUBMISSION_REASSIGNED': return { icon: RefreshCw, bg: 'bg-purple-100 dark:bg-purple-900/30', color: 'text-purple-600 dark:text-purple-400' };
      case 'CV_SUBMISSION_COMPLETED': return { icon: CheckCircle2, bg: 'bg-green-100 dark:bg-green-900/30', color: 'text-green-600 dark:text-green-400' };

      default: return { icon: Bell, bg: 'bg-muted/70', color: 'text-muted-foreground' };
    }
  };

  const getPriorityClasses = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'border-l-[4px] border-l-red-500';
      case 'HIGH': return 'border-l-[4px] border-l-orange-500';
      default: return 'border-l-[4px] border-l-transparent';
    }
  };

  const iconDetails = getNotificationIcon(notification.type);
  const IconComponent = iconDetails.icon;

  return (
    <div
      className={cn(
        "group relative flex flex-col sm:flex-row sm:items-start gap-4 p-5 cursor-pointer bg-card transition-all duration-300 hover:shadow-sm hover:bg-muted/30",
        !notification.isRead && "bg-brand/[0.02]",
        getPriorityClasses(notification.priority)
      )}
      onClick={() => onClick(notification)}
    >
      <div className={cn(
        "h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105 shadow-sm", 
        iconDetails.bg
      )}>
        <IconComponent className={cn("h-5 w-5", iconDetails.color)} />
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <h4 className={cn(
            "text-[15px] tracking-tight leading-tight transition-colors duration-200 group-hover:text-brand",
            notification.isRead ? "text-foreground/80 font-semibold" : "text-foreground font-bold"
          )}>
            {notification.title}
          </h4>
          {notification.priority === 'URGENT' && (
            <span className="px-2 py-0.5 text-[10px] font-black bg-red-100 text-red-600 rounded-md uppercase tracking-wider shadow-sm">
              Urgent
            </span>
          )}
          {!notification.isRead && (
            <span className="h-2 w-2 rounded-full bg-brand shadow-[0_0_8px_rgba(var(--brand),0.5)] ml-1 animate-pulse" />
          )}
        </div>
        <p className="text-[14px] text-muted-foreground leading-snug md:max-w-[95%]">
          {notification.message}
        </p>
        
        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground font-medium">
          <span className="flex items-center gap-1.5 opacity-80 transition-opacity group-hover:opacity-100">
            <Clock className="h-3.5 w-3.5" />
            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
          </span>
          {notification.actionUrl && (
            <span className="flex items-center gap-1 text-brand opacity-0 transform -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 group-hover:underline font-semibold">
              View details <ExternalLink className="h-3 w-3" />
            </span>
          )}
        </div>
      </div>

      {/* Hover Actions */}
      <div className="absolute right-4 top-4 sm:top-1/2 sm:-translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0 flex items-center gap-2 bg-card/95 backdrop-blur-md p-1.5 rounded-xl shadow-sm border border-border/50 z-10">
        {!notification.isRead && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg hover:bg-brand hover:text-white transition-colors duration-200"
            title="Mark as read"
            onClick={(e) => {
              e.stopPropagation();
              onMarkAsRead(notification._id, e);
            }}
            disabled={isMarkingRead}
          >
            <Check className="h-4 w-4" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-lg hover:bg-red-500 hover:text-white transition-colors duration-200"
          title="Delete notification"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(notification._id, e);
          }}
          disabled={isDeleting}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
