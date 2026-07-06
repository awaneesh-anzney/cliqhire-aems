"use client";

import React, { useState } from 'react';
import { 
  Bell, 
  Trash2, 
  CheckCheck, 
  Inbox, 
  AlertCircle, 
  Check, 
  ExternalLink,
  Loader2,
  // Category Icons
  UserCheck,
  CheckCircle2,
  XCircle,
  Clock,
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
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { 
  useNotificationsQuery, 
  useUnreadNotificationsCountQuery, 
  useNotificationActions 
} from '@/hooks/useNotifications';
import { Notification } from '@/services/notificationService';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export function NotificationDropdown() {
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  // Fetch count and list only if user is logged in
  const { data: countData } = useUnreadNotificationsCountQuery(isAuthenticated);
  const { data: notificationsData, isLoading } = useNotificationsQuery({
    page: 1,
    limit: 10,
    unreadOnly: false,
  });

  const { markAsRead, markAllAsRead, clearRead, deleteNotification } = useNotificationActions();

  const unreadCount = countData?.count || 0;
  const notifications = notificationsData?.data || [];

  const handleMarkAsRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    markAsRead.mutate(id);
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead.mutate(notification._id);
    }
    setIsOpen(false);
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  const getNotificationIcon = (type: string): { icon: LucideIcon; bg: string; color: string } => {
    switch (type) {
      // --- Phase 1: Assignment Management ---
      case 'CANDIDATE_ASSIGNED':
        return { icon: UserCheck, bg: 'bg-blue-100 dark:bg-blue-900/30', color: 'text-blue-600 dark:text-blue-400' };
      case 'ASSIGNMENT_ACCEPTED':
        return { icon: CheckCircle2, bg: 'bg-green-100 dark:bg-green-900/30', color: 'text-green-600 dark:text-green-400' };
      case 'ASSIGNMENT_REJECTED':
        return { icon: XCircle, bg: 'bg-red-100 dark:bg-red-900/30', color: 'text-red-600 dark:text-red-400' };
      case 'ASSIGNMENT_EXPIRED':
        return { icon: Clock, bg: 'bg-orange-100 dark:bg-orange-900/30', color: 'text-orange-600 dark:text-orange-400' };
      case 'ASSIGNMENT_REASSIGNED':
        return { icon: RefreshCw, bg: 'bg-purple-100 dark:bg-purple-900/30', color: 'text-purple-600 dark:text-purple-400' };
      case 'DEADLINE_REMINDER_12H':
      case 'DEADLINE_REMINDER_4H':
      case 'DEADLINE_REMINDER_1H':
        return { icon: Clock, bg: 'bg-yellow-100 dark:bg-yellow-900/30', color: 'text-yellow-600 dark:text-yellow-400' };
      case 'DUPLICATE_CANDIDATE_FOUND':
        return { icon: AlertTriangle, bg: 'bg-rose-100 dark:bg-rose-900/30', color: 'text-rose-600 dark:text-rose-400' };
      case 'SCREENING_DEADLINE_SET':
        return { icon: ClipboardList, bg: 'bg-teal-100 dark:bg-teal-900/30', color: 'text-teal-600 dark:text-teal-400' };

      // --- Phase 2: Pipeline Stage (ATS Pipeline) ---
      case 'PIPELINE_STAGE_CHANGED':
        return { icon: GitCompare, bg: 'bg-indigo-100 dark:bg-indigo-900/30', color: 'text-indigo-600 dark:text-indigo-400' };
      case 'PIPELINE_CANDIDATE_ADDED':
        return { icon: UserPlus, bg: 'bg-blue-100 dark:bg-blue-900/30', color: 'text-blue-600 dark:text-blue-400' };
      case 'PIPELINE_CANDIDATE_REMOVED':
        return { icon: UserMinus, bg: 'bg-gray-100 dark:bg-gray-900/30', color: 'text-gray-600 dark:text-gray-400' };
      case 'PIPELINE_INTERVIEW_SCHEDULED':
        return { icon: Calendar, bg: 'bg-cyan-100 dark:bg-cyan-900/30', color: 'text-cyan-600 dark:text-cyan-400' };
      case 'PIPELINE_OFFER_EXTENDED':
        return { icon: FileSignature, bg: 'bg-violet-100 dark:bg-violet-900/30', color: 'text-violet-600 dark:text-violet-400' };
      case 'PIPELINE_CANDIDATE_HIRED':
        return { icon: Award, bg: 'bg-emerald-100 dark:bg-emerald-900/30', color: 'text-emerald-600 dark:text-emerald-400' };
      case 'PIPELINE_CANDIDATE_REJECTED':
        return { icon: Ban, bg: 'bg-rose-100 dark:bg-rose-900/30', color: 'text-rose-600 dark:text-rose-400' };

      // --- Phase 3: Job & Team Notifications ---
      case 'JOB_CREATED':
        return { icon: Briefcase, bg: 'bg-emerald-100 dark:bg-emerald-900/30', color: 'text-emerald-600 dark:text-emerald-400' };
      case 'JOB_STATUS_CHANGED':
        return { icon: Sliders, bg: 'bg-indigo-100 dark:bg-indigo-900/30', color: 'text-indigo-600 dark:text-indigo-400' };
      case 'JOB_DELETED':
        return { icon: Trash2, bg: 'bg-rose-100 dark:bg-rose-900/30', color: 'text-rose-600 dark:text-rose-400' };
      case 'JOB_TEAM_MEMBER_CHANGED':
      case 'JOB_TEAM_MEMBER_ASSIGNED':
        return { icon: Users, bg: 'bg-blue-100 dark:bg-blue-900/30', color: 'text-blue-600 dark:text-blue-400' };
      case 'TEAM_CREATED':
        return { icon: Building, bg: 'bg-violet-100 dark:bg-violet-900/30', color: 'text-violet-600 dark:text-violet-400' };
      case 'TEAM_UPDATED':
        return { icon: Edit3, bg: 'bg-amber-100 dark:bg-amber-900/30', color: 'text-amber-600 dark:text-amber-400' };
      case 'TEAM_DELETED':
        return { icon: XCircle, bg: 'bg-red-100 dark:bg-red-900/30', color: 'text-red-600 dark:text-red-400' };

      // --- Phase 4: Authentication & Security Alerts ---
      case 'PASSWORD_CHANGED':
      case 'PASSWORD_RESET':
        return { icon: Key, bg: 'bg-slate-100 dark:bg-slate-900/30', color: 'text-slate-600 dark:text-slate-400' };
      case 'SUSPICIOUS_LOGIN':
        return { icon: ShieldAlert, bg: 'bg-rose-100 dark:bg-rose-900/30', color: 'text-rose-600 dark:text-rose-400' };
      case 'NEW_LOGIN':
        return { icon: Smartphone, bg: 'bg-teal-100 dark:bg-teal-900/30', color: 'text-teal-600 dark:text-teal-400' };

      // --- Phase 5: Clients, Users, Candidates & Tasks ---
      case 'CLIENT_CREATED':
        return { icon: Users, bg: 'bg-blue-100 dark:bg-blue-900/30', color: 'text-blue-600 dark:text-blue-400' };
      case 'CLIENT_STAGE_CHANGED':
        return { icon: TrendingUp, bg: 'bg-indigo-100 dark:bg-indigo-900/30', color: 'text-indigo-600 dark:text-indigo-400' };
      case 'CLIENT_DELETED':
        return { icon: Building2, bg: 'bg-red-100 dark:bg-red-900/30', color: 'text-red-600 dark:text-red-400' };
      case 'CONTRACT_CREATED':
        return { icon: FileText, bg: 'bg-violet-100 dark:bg-violet-900/30', color: 'text-violet-600 dark:text-violet-400' };
      case 'CONTRACT_UPDATED':
      case 'CONTRACT_RENEWED':
        return { icon: RefreshCw, bg: 'bg-emerald-100 dark:bg-emerald-900/30', color: 'text-emerald-600 dark:text-emerald-400' };
      case 'CONTRACT_EXPIRY_SOON':
      case 'CONTRACT_RENEWAL_DUE':
        return { icon: FileClock, bg: 'bg-yellow-100 dark:bg-yellow-900/30', color: 'text-yellow-600 dark:text-yellow-400' };
      case 'CONTRACT_EXPIRED':
        return { icon: FileX, bg: 'bg-red-100 dark:bg-red-900/30', color: 'text-red-600 dark:text-red-400' };
      case 'MEMBER_ADDED':
        return { icon: UserPlus, bg: 'bg-teal-100 dark:bg-teal-900/30', color: 'text-teal-600 dark:text-teal-400' };
      case 'USER_ROLE_CHANGED':
        return { icon: Shield, bg: 'bg-amber-100 dark:bg-amber-900/30', color: 'text-amber-600 dark:text-amber-400' };
      case 'USER_DEACTIVATED':
      case 'USER_DELETED':
        return { icon: UserMinus, bg: 'bg-rose-100 dark:bg-rose-900/30', color: 'text-rose-600 dark:text-rose-400' };
      case 'TASK_DUE_SOON':
      case 'TASK_OVERDUE':
        return { icon: Calendar, bg: 'bg-amber-100 dark:bg-amber-900/30', color: 'text-amber-600 dark:text-amber-400' };
      case 'TASK_JOB_ASSIGNMENT_ADDED':
        return { icon: Pin, bg: 'bg-blue-100 dark:bg-blue-900/30', color: 'text-blue-600 dark:text-blue-400' };
      case 'CANDIDATE_CREATED':
        return { icon: User, bg: 'bg-emerald-100 dark:bg-emerald-900/30', color: 'text-emerald-600 dark:text-emerald-400' };
      case 'CANDIDATE_STATUS_CHANGED':
        return { icon: RefreshCw, bg: 'bg-indigo-100 dark:bg-indigo-900/30', color: 'text-indigo-600 dark:text-indigo-400' };

      // --- CV Targets ---
      case 'CV_TARGET_CV_ADDED':
        return { icon: FilePlus, bg: 'bg-blue-100 dark:bg-blue-900/30', color: 'text-blue-600 dark:text-blue-400' };
      case 'CV_TARGET_CV_REMOVED':
        return { icon: FileMinus, bg: 'bg-gray-100 dark:bg-gray-900/30', color: 'text-gray-600 dark:text-gray-400' };
      case 'CV_TARGET_SLOT_COMPLETED':
        return { icon: Target, bg: 'bg-emerald-100 dark:bg-emerald-900/30', color: 'text-emerald-600 dark:text-emerald-400' };
      case 'CV_TARGET_SLOT_EXPIRED':
        return { icon: FileWarning, bg: 'bg-red-100 dark:bg-red-900/30', color: 'text-red-600 dark:text-red-400' };

      default:
        return { icon: Bell, bg: 'bg-muted/70', color: 'text-muted-foreground' };
    }
  };

  const getPriorityClasses = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'border-l-4 border-l-red-500';
      case 'HIGH':
        return 'border-l-4 border-l-orange-500';
      default:
        return '';
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-lg hover:bg-card hover:text-brand transition-all shadow-none h-8 w-8 text-muted-foreground"
        >
          <Bell className="h-3.5 w-3.5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand border border-background"></span>
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        align="end" 
        className="w-96 rounded-2xl shadow-2xl border border-border/80 bg-background/95 backdrop-blur-md p-0 overflow-hidden animate-in fade-in duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 bg-muted/20">
          <div className="flex items-center gap-2">
            <span className="font-black text-sm tracking-tight">Notifications</span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.5 bg-brand text-white text-[10px] font-black rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-md hover:bg-muted text-muted-foreground hover:text-brand transition-all"
                title="Mark all as read"
                onClick={() => markAllAsRead.mutate()}
                disabled={markAllAsRead.isPending}
              >
                {markAllAsRead.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <CheckCheck className="h-3.5 w-3.5" />
                )}
              </Button>
            )}
            {notifications.some(n => n.isRead) && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-md hover:bg-muted text-muted-foreground hover:text-red-500 transition-all"
                title="Clear read notifications"
                onClick={() => clearRead.mutate()}
                disabled={clearRead.isPending}
              >
                {clearRead.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="h-[360px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-48 gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-brand" />
              <span className="text-xs text-muted-foreground font-bold">Loading notifications...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[320px] p-6 text-center">
              <div className="h-12 w-12 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                <Inbox className="h-6 w-6 text-muted-foreground/60" />
              </div>
              <p className="text-xs font-black text-foreground mb-1">All caught up!</p>
              <p className="text-[10px] text-muted-foreground max-w-[200px]">
                No new notifications at the moment. We&apos;ll let you know when action is required.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {notifications.map((notification) => {
                const iconDetails = getNotificationIcon(notification.type);
                const IconComponent = iconDetails.icon;
                return (
                  <div
                    key={notification._id}
                    className={cn(
                      "flex items-start gap-3 p-3.5 cursor-pointer hover:bg-muted/40 transition-all relative group",
                      !notification.isRead && "bg-brand/[0.02]",
                      getPriorityClasses(notification.priority)
                    )}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    {/* Icon Column */}
                    <div className={cn("h-8 w-8 rounded-xl flex items-center justify-center shrink-0 shadow-inner", iconDetails.bg)}>
                      <IconComponent className={cn("h-4 w-4", iconDetails.color)} />
                    </div>

                    {/* Text Column */}
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center gap-1.5 justify-between mb-0.5">
                        <span className={cn(
                          "text-[11.5px] tracking-tight leading-tight truncate",
                          notification.isRead ? "text-foreground/80 font-bold" : "text-foreground font-black"
                        )}>
                          {notification.title}
                        </span>
                        {notification.priority === 'URGENT' && (
                          <span className="px-1 text-[8px] font-black bg-red-150 text-red-650 rounded uppercase shrink-0">
                            Urgent
                          </span>
                        )}
                      </div>
                      <p className="text-[10.5px] text-muted-foreground leading-normal line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 text-[8.5px] text-muted-foreground font-bold">
                        <span>
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </span>
                        {notification.actionUrl && (
                          <span className="flex items-center gap-0.5 text-brand group-hover:underline">
                            Action needed <ExternalLink className="h-2 w-2" />
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action buttons (Appear on Hover) */}
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      {!notification.isRead && (
                        <Button
                          variant="secondary"
                          size="icon"
                          className="h-6 w-6 rounded-md hover:bg-brand hover:text-white transition-all shadow-sm"
                          title="Mark read"
                          onClick={(e) => handleMarkAsRead(notification._id, e)}
                          disabled={markAsRead.isPending}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-6 w-6 rounded-md hover:bg-red-500 hover:text-white transition-all shadow-sm"
                        title="Delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification.mutate(notification._id);
                        }}
                        disabled={deleteNotification.isPending}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
