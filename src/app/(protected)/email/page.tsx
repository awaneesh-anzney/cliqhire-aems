"use client";

import React, { useState, useEffect } from "react";
import { 
  EmailHeader,
  MailboxConnectCard,
  EmailSidebar,
  EmailFolder,
  EmailThreadList,
  EmailListItem,
  EmailThreadDetail,
  EmailComposerDialog,
  ComposerInitialData,
  AdminMailboxesDialog
} from "@/components/email";
import { 
  useMailboxStatus, 
  useEmailList, 
  useEmailThread, 
  useMarkThreadRead,
  useToggleStar
} from "@/hooks/useEmail";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Loader2, Sparkles } from "lucide-react";

export default function EmailPage() {
  const { 
    data: mailboxData, 
    isLoading: loadingStatus, 
    refetch: refetchStatus, 
    isRefetching: refetchingStatus 
  } = useMailboxStatus();

  const isConnected = !!mailboxData?.connected && !!mailboxData?.data;
  const mailbox = mailboxData?.data || null;

  // Folder & list state
  const [activeFolder, setActiveFolder] = useState<EmailFolder>("inbox");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);

  // Responsive sidebar states
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Modals state
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerInitialData, setComposerInitialData] = useState<ComposerInitialData | undefined>(undefined);
  const [adminMailboxesOpen, setAdminMailboxesOpen] = useState(false);

  // Fetch lists
  const { 
    data: listData, 
    isLoading: loadingList, 
    refetch: refetchList, 
    isRefetching: refetchingList 
  } = useEmailList(
    activeFolder,
    {
      page,
      limit: 25,
    },
    isConnected
  );

  // Fetch active thread detail
  const { 
    data: threadDetailData, 
    isLoading: loadingDetail 
  } = useEmailThread(selectedThreadId);

  const markReadMutation = useMarkThreadRead();
  const toggleStarMutation = useToggleStar();

  const rawList = listData?.data || [];
  const totalThreads = listData?.total || 0;
  const totalPages = listData?.pages || 1;

  const mappedItems: EmailListItem[] = rawList.map((item: any) => {
    if (activeFolder === "starred") {
      return {
        id: item._id,
        threadId: item._id,
        subject: item.subject,
        participants: item.participants || ["Participants"],
        date: item.lastMessageAt || item.createdAt,
        unreadCount: item.unreadCount || 0,
        isStarred: item.isStarred ?? true,
        isDraft: false,
        hasAttachments: item.hasAttachments || false,
      };
    } else if (activeFolder === "drafts") {
      return {
        id: item._id,
        threadId: item.threadId,
        subject: item.subject || "(No Subject)",
        participants: item.to && item.to.length > 0 ? item.to : ["No Recipients"],
        date: item.updatedAt || item.createdAt,
        unreadCount: 0,
        isStarred: false,
        isDraft: true,
        hasAttachments: item.attachments && item.attachments.length > 0,
      };
    } else {
      return {
        id: item._id,
        threadId: item.threadId,
        subject: item.subject || "(No Subject)",
        participants: item.direction === "received" ? [item.from] : (item.to || ["Unknown Contact"]),
        date: item.receivedAt || item.sentAt || item.createdAt,
        unreadCount: item.isRead ? 0 : 1,
        isStarred: item.isStarred || false,
        isDraft: false,
        hasAttachments: item.attachments && item.attachments.length > 0,
      };
    }
  });

  // Auto-select first thread on wide desktop displays only (>= 1280px)
  useEffect(() => {
    if (!selectedThreadId && mappedItems.length > 0 && typeof window !== "undefined" && window.innerWidth >= 1280) {
      if (!mappedItems[0].isDraft) {
        setSelectedThreadId(mappedItems[0].threadId || mappedItems[0].id);
      }
    }
  }, [mappedItems, selectedThreadId]);

  const handleSelectThread = (item: EmailListItem) => {
    if (item.isDraft) {
      const rawDraft: any = rawList.find((d: any) => d._id === item.id);
      handleCompose({
        to: rawDraft?.to?.join(", "),
        cc: rawDraft?.cc?.join(", "),
        bcc: rawDraft?.bcc?.join(", "),
        subject: rawDraft?.subject,
        text: rawDraft?.bodyText,
        threadId: rawDraft?.threadId,
        inReplyTo: rawDraft?.inReplyTo,
        draftId: item.id,
      });
    } else {
      const targetId = item.threadId || item.id;
      setSelectedThreadId(targetId);
      if (item.unreadCount > 0) {
        markReadMutation.mutate({ threadId: targetId, isRead: true });
      }
    }
  };

  const handleToggleStar = (threadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const item = mappedItems.find((i) => i.id === threadId || i.threadId === threadId);
    const targetId = item?.threadId || threadId;
    const currentStatus = item?.isStarred || false;
    toggleStarMutation.mutate({ threadId: targetId, isStarred: !currentStatus });
  };

  const handleCompose = (prefill?: ComposerInitialData) => {
    setComposerInitialData(prefill);
    setComposerOpen(true);
  };

  const handleRefresh = () => {
    refetchStatus();
    refetchList();
  };

  // Compute unread count (only meaningful for inbox and starred)
  const totalUnread = activeFolder === "inbox" || activeFolder === "starred"
    ? mappedItems.reduce((acc, t) => acc + (t.unreadCount || 0), 0)
    : 0;

  if (loadingStatus) {
    return (
      <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center">
        <div className="flex items-center gap-2.5 text-xs text-muted-foreground font-medium p-4 rounded-2xl bg-card border shadow-xs">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span>Connecting to mailbox service...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4.25rem)] p-2 sm:p-3 md:p-4 flex flex-col gap-2.5 sm:gap-3 max-w-[1800px] mx-auto overflow-hidden">
      {/* Top Application Bar */}
      <EmailHeader
        mailbox={mailbox}
        isConnected={isConnected}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onComposeClick={() => handleCompose()}
        onRefreshClick={handleRefresh}
        isRefreshing={refetchingStatus || refetchingList}
        onOpenAdminMailboxes={() => setAdminMailboxesOpen(true)}
        onOpenMobileNav={() => setMobileNavOpen(true)}
        activeFolder={activeFolder}
      />

      {/* Main Mailbox Workspace */}
      {!isConnected ? (
        <div className="flex-1 min-h-0 flex items-start justify-center pt-1 sm:pt-2 md:pt-3 overflow-y-auto">
          <MailboxConnectCard onSuccess={() => refetchStatus()} />
        </div>
      ) : (
        <div className="flex-1 min-h-0 flex gap-2.5 sm:gap-3 overflow-hidden">
          {/* Desktop & Tablet Collapsible Left Sidebar */}
          <div
            className={`hidden md:block shrink-0 transition-all duration-300 ${
              isSidebarCollapsed ? "w-16" : "w-52 lg:w-60"
            }`}
          >
            <EmailSidebar
              activeFolder={activeFolder}
              onFolderChange={(folder) => {
                setActiveFolder(folder);
                setPage(1);
                setSelectedThreadId(null);
              }}
              onComposeClick={() => handleCompose()}
              unreadCount={totalUnread}
              mailbox={mailbox}
              isCollapsed={isSidebarCollapsed}
              onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            />
          </div>

          {/* Middle Thread List Panel */}
          <div
            className={`flex flex-col min-w-0 transition-all ${
              selectedThreadId ? "hidden md:flex md:w-72 lg:w-84 xl:w-96 shrink-0" : "flex-1 md:w-80 lg:w-96 md:flex-initial shrink-0"
            }`}
          >
            {mailbox && mailbox.initialSyncCompleted === false ? (
              <div className="flex flex-col h-full items-center justify-center p-8 text-center bg-card/90 backdrop-blur-md border border-border/70 rounded-2xl shadow-xs min-h-[400px]">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-3">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
                <h3 className="text-sm font-bold mb-1.5 text-foreground">Importing mailbox history...</h3>
                <p className="text-xs text-muted-foreground max-w-[240px] leading-relaxed">
                  Syncing your past emails over IMAP. Recent emails will show up as they are indexed.
                </p>
              </div>
            ) : (
              <EmailThreadList
                threads={mappedItems}
                isLoading={loadingList}
                selectedThreadId={selectedThreadId}
                onSelectThread={handleSelectThread}
                page={page}
                totalPages={totalPages}
                totalThreads={totalThreads}
                onPageChange={setPage}
                searchQuery={searchQuery}
                onToggleStar={handleToggleStar}
              />
            )}
          </div>

          {/* Right Conversation View Panel */}
          <div
            className={`flex-1 min-w-0 flex flex-col transition-all ${
              selectedThreadId ? "flex" : "hidden md:flex"
            }`}
          >
            <EmailThreadDetail
              thread={threadDetailData?.data?.thread || null}
              messages={threadDetailData?.data?.messages || []}
              isLoading={loadingDetail}
              onClose={() => setSelectedThreadId(null)}
              onOpenFullComposer={(replyData) => handleCompose(replyData)}
            />
          </div>
        </div>
      )}

      {/* Mobile Drawer (Folder Navigation) */}
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="p-0 w-72 max-w-[85vw] border-r border-border/70">
          <div className="h-full p-2">
            <EmailSidebar
              activeFolder={activeFolder}
              onFolderChange={(folder) => {
                setActiveFolder(folder);
                setPage(1);
                setSelectedThreadId(null);
                setMobileNavOpen(false);
              }}
              onComposeClick={() => {
                setMobileNavOpen(false);
                handleCompose();
              }}
              unreadCount={totalUnread}
              mailbox={mailbox}
              onCloseMobile={() => setMobileNavOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Compose Modal */}
      <EmailComposerDialog
        open={composerOpen}
        onOpenChange={setComposerOpen}
        initialData={composerInitialData}
      />

      {/* Admin Mailboxes Status Modal */}
      <AdminMailboxesDialog
        open={adminMailboxesOpen}
        onOpenChange={setAdminMailboxesOpen}
      />
    </div>
  );
}
