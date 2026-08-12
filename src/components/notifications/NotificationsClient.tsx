"use client";

import React, { useState } from 'react';
import { 
  Bell, 
  Trash2, 
  CheckCheck, 
  Inbox, 
  Loader2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { 
  useNotificationsQuery, 
  useUnreadNotificationsCountQuery, 
  useNotificationActions 
} from '@/hooks/useNotifications';
import { Notification } from '@/services/notificationService';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

import { useSocket } from '@/contexts/SocketProvider';
import { NotificationItem } from './NotificationItem';

export function NotificationsClient() {
  const { isAuthenticated } = useAuth();
  const { isConnected } = useSocket();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');
  const [page, setPage] = useState(1);
  const limit = 20;

  // Fetch count
  const { data: countData } = useUnreadNotificationsCountQuery(isAuthenticated);
  
  // Fetch notifications based on active tab
  const { data: notificationsData, isLoading } = useNotificationsQuery({
    page,
    limit,
    unreadOnly: activeTab === 'unread',
  });

  const { markAsRead, markAllAsRead, clearRead, deleteNotification } = useNotificationActions();

  const unreadCount = countData?.count || 0;
  
  const priorityOrder: Record<string, number> = { URGENT: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
  const notifications = [...(notificationsData?.data || [])].sort((a, b) => {
    const priorityA = priorityOrder[a.priority] || 0;
    const priorityB = priorityOrder[b.priority] || 0;
    if (priorityA !== priorityB) {
      return priorityB - priorityA; // Higher priority first
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(); // Newer first
  });

  const totalPages = notificationsData?.pages || 1;
  const totalItems = notificationsData?.total || 0;

  const handleMarkAsRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    markAsRead.mutate(id);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNotification.mutate(id);
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead.mutate(notification._id);
    }
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  return (
    <div className="flex flex-col h-full w-full  p-4 animate-in fade-in duration-500">
      
      {/* Header Section with Glassmorphism */}
      <div className="relative overflow-hidden bg-gradient-to-r from-brand/10 via-brand/5 to-transparent rounded-3xl p-6 mb-6 border border-brand/10 shadow-sm">
        <div className="absolute -right-10 -top-10 h-40 w-40 bg-brand/10 blur-3xl rounded-full" />
        <div className="absolute -left-10 -bottom-10 h-40 w-40 bg-brand/5 blur-3xl rounded-full" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-white dark:bg-card rounded-2xl flex items-center justify-center shadow-md border border-border/50 shrink-0 transform transition-transform hover:rotate-3 hover:scale-105 duration-300">
              <Bell className={cn("h-8 w-8 text-brand", unreadCount > 0 && "animate-pulse")} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-foreground tracking-tight flex items-center gap-3">
                Notifications
                {unreadCount > 0 && (
                  <span className="bg-brand text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm animate-in zoom-in duration-300">
                    {unreadCount} new
                  </span>
                )}
                <div 
                  className={cn("h-2.5 w-2.5 rounded-full shadow-sm", isConnected ? "bg-green-500" : "bg-red-500 animate-pulse")} 
                  title={isConnected ? "Real-time updates active" : "Reconnecting real-time updates..."}
                />
              </h1>
              <p className="text-muted-foreground text-sm font-medium mt-1.5 opacity-90">
                Stay updated with your latest alerts and activities.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <Button
                variant="outline"
                className="font-bold hover:bg-brand hover:text-white hover:border-brand transition-all shadow-sm rounded-xl"
                onClick={() => markAllAsRead.mutate()}
                disabled={markAllAsRead.isPending}
              >
                {markAllAsRead.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCheck className="h-4 w-4 mr-2" />
                )}
                Mark all as read
              </Button>
            )}
            {notifications.some(n => n.isRead) && (
              <Button
                variant="outline"
                className="font-bold hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-950/30 transition-all shadow-sm rounded-xl"
                onClick={() => clearRead.mutate()}
                disabled={clearRead.isPending}
              >
                {clearRead.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                Clear read
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs and Content */}
      <div className="flex-1 bg-card/50 backdrop-blur-sm border border-border shadow-sm rounded-3xl overflow-hidden flex flex-col transition-all">
        <Tabs value={activeTab} onValueChange={(val) => { setActiveTab(val as 'all' | 'unread'); setPage(1); }} className="flex flex-col h-full w-full">
          
          <div className="px-6 py-4 border-b border-border/50">
            <TabsList className="bg-muted/50 p-1.5 rounded-2xl w-full sm:w-auto inline-flex">
              <TabsTrigger 
                value="all" 
                className="rounded-xl font-bold text-sm px-6 transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-brand flex-1 sm:flex-none"
              >
                All Notifications
              </TabsTrigger>
              <TabsTrigger 
                value="unread" 
                className="rounded-xl font-bold text-sm px-6 transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-brand flex-1 sm:flex-none"
              >
                Unread
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="flex-1">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-[400px] gap-4">
                <div className="h-12 w-12 rounded-full bg-brand/10 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-brand" />
                </div>
                <span className="text-sm text-muted-foreground font-bold tracking-wide">Loading notifications...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[500px] p-8 text-center animate-in zoom-in-95 duration-500">
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-brand/10 blur-2xl rounded-full scale-150" />
                  <div className="h-24 w-24 rounded-[2rem] bg-gradient-to-br from-muted/50 to-muted/20 flex items-center justify-center border border-border/40 shadow-inner relative z-10 transform rotate-3">
                    <Inbox className="h-10 w-10 text-muted-foreground/60" />
                  </div>
                  <div className="h-20 w-20 rounded-[1.5rem] bg-muted/10 absolute -right-4 -bottom-4 border border-border/20 -rotate-6 z-0" />
                </div>
                <h3 className="text-2xl font-black text-foreground mb-3">No notifications found</h3>
                <p className="text-[15px] text-muted-foreground max-w-sm leading-relaxed">
                  {activeTab === 'unread' 
                    ? "You're all caught up! Take a breather, no new notifications at the moment."
                    : "Your notification history is completely empty."}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border/40 pb-4">
                {notifications.map((notification, index) => (
                  <div 
                    key={notification._id}
                    className="animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <NotificationItem
                      notification={notification}
                      onClick={handleNotificationClick}
                      onMarkAsRead={handleMarkAsRead}
                      onDelete={handleDelete}
                      isMarkingRead={markAsRead.isPending}
                      isDeleting={deleteNotification.isPending}
                    />
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
          
          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-border/50 bg-card/80 backdrop-blur-sm flex items-center justify-between rounded-b-3xl">
              <span className="text-sm text-muted-foreground font-semibold hidden sm:inline-block">
                Showing {notifications.length} of <span className="text-foreground font-bold">{totalItems}</span> items
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="font-bold h-9 rounded-xl hover:bg-muted"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1 || isLoading}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                </Button>
                <div className="flex items-center justify-center min-w-[3.5rem] text-sm font-black text-foreground bg-muted/30 h-9 rounded-xl border border-border/50">
                  {page} / {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="font-bold h-9 rounded-xl hover:bg-muted"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages || isLoading}
                >
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </Tabs>
      </div>
    </div>
  );
}
