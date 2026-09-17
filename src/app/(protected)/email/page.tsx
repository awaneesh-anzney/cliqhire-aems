"use client";

import React, { useState, useEffect, useMemo } from "react";
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
  AdminMailboxesDialog, 
  EmailSignatureDialog, 
  EmailContactType, 
  EMAIL_TYPE_CONFIG 
} from "@/components/email";
import { 
  useMailboxStatus, 
  useEmailList, 
  useEmailThread, 
  useMarkThreadRead, 
  useToggleStar 
} from "@/hooks/useEmail";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Loader2, Mail, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { emailService } from "@/services/emailService";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";

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

  // Email type & address selection state (Client, Candidate, Team)
  const [selectedEmailType, setSelectedEmailType] = useState<EmailContactType | null>(null);
  const [selectedEmailAddress, setSelectedEmailAddress] = useState<string | null>(null);

  // Responsive sidebar states (default collapsed on tablet, expanded on desktop)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Modals state
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerInitialData, setComposerInitialData] = useState<ComposerInitialData | undefined>(undefined);
  const [adminMailboxesOpen, setAdminMailboxesOpen] = useState(false);
  const [signatureDialogOpen, setSignatureDialogOpen] = useState(false);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (!searchParams) return;
    const connected = searchParams.get("connected");
    const message = searchParams.get("message");
    
    if (connected === "success") {
      toast.success("Mailbox connected successfully!");
      refetchStatus();
      const params = new URLSearchParams(searchParams.toString());
      params.delete("connected");
      params.delete("message");
      router.replace(`/email?${params.toString()}`, { scroll: false });
    } else if (connected === "error") {
      toast.error(message || "Could not connect mailbox");
      const params = new URLSearchParams(searchParams.toString());
      params.delete("connected");
      params.delete("message");
      router.replace(`/email?${params.toString()}`, { scroll: false });
    }
  }, [searchParams, router, refetchStatus]);

  useEffect(() => {
    setSelectedIds([]);
  }, [activeFolder, searchQuery, page, selectedEmailType, selectedEmailAddress]);

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    try {
      if (activeFolder === "trash") {
        await Promise.all(selectedIds.map(id => emailService.permanentDelete(id)));
        toast.success("Conversations permanently deleted");
      } else if (activeFolder === "drafts") {
        await Promise.all(selectedIds.map(id => emailService.deleteDraft(id)));
        toast.success("Drafts discarded");
      } else {
        await Promise.all(selectedIds.map(id => emailService.moveToTrash(id)));
        toast.success("Conversations moved to Trash");
      }
      setSelectedIds([]);
      queryClient.invalidateQueries({ queryKey: ["email-list"] });
      queryClient.invalidateQueries({ queryKey: ["email-threads"] });
      refetchList();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Some actions failed");
      queryClient.invalidateQueries({ queryKey: ["email-list"] });
      queryClient.invalidateQueries({ queryKey: ["email-threads"] });
      refetchList();
    }
  };

  // Set initial collapse based on screen width on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (window.innerWidth >= 768 && window.innerWidth < 1024) {
        setIsSidebarCollapsed(true);
      }
    }
  }, []);

  const effectiveSearchQuery = searchQuery || selectedEmailAddress || "";
  const isSearchActive = !!effectiveSearchQuery;

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
      q: effectiveSearchQuery ? effectiveSearchQuery : undefined,
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
    if (isSearchActive || activeFolder === "starred") {
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

  // Items are already filtered by the server when search is active
  const displayItems = mappedItems;

  // Auto-select first thread on wide desktop displays only (>= 1280px)
  useEffect(() => {
    if (!selectedThreadId && displayItems.length > 0 && typeof window !== "undefined" && window.innerWidth >= 1280) {
      if (!displayItems[0].isDraft) {
        setSelectedThreadId(displayItems[0].threadId || displayItems[0].id);
      }
    }
  }, [displayItems, selectedThreadId]);

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
      <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center bg-gradient-to-br from-slate-50/40 via-background to-blue-50/20 dark:from-slate-950/40 dark:via-background dark:to-slate-900/20">
        <div className="flex items-center gap-3 text-xs text-muted-foreground font-semibold p-4 sm:p-5 rounded-2xl bg-card/95 border border-border/70 shadow-sm">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span>Connecting to mailbox service...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full min-h-0 w-full p-2 sm:p-2.5 md:p-3 flex flex-col gap-2.5 sm:gap-3 overflow-hidden bg-transparent">
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
        onOpenSignatures={() => setSignatureDialogOpen(true)}
        activeFolder={activeFolder}
        selectedEmailType={selectedEmailType}
        onSelectEmailType={(type) => {
          setSelectedEmailType(type);
          setSelectedEmailAddress(null);
        }}
        selectedEmailAddress={selectedEmailAddress}
        onSelectEmailAddress={(email) => setSelectedEmailAddress(email)}
      />

      {/* Main Mailbox Workspace */}
      {!isConnected ? (
        <div className="flex-1 min-h-0 w-full flex flex-col overflow-hidden">
          <MailboxConnectCard onSuccess={() => refetchStatus()} />
        </div>
      ) : (
        <div className="flex-1 min-h-0 flex gap-2.5 sm:gap-3 overflow-hidden">
          {/* Desktop & Tablet Collapsible Left Sidebar */}
          <div
            className={`hidden md:block shrink-0 transition-all duration-300 ${
              isSidebarCollapsed ? "w-16" : "w-56 lg:w-60 xl:w-64"
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
              onOpenSignatures={() => setSignatureDialogOpen(true)}
              selectedEmailType={selectedEmailType}
              onSelectEmailType={(type) => {
                setSelectedEmailType(type);
                setSelectedEmailAddress(null);
              }}
              selectedEmailAddress={selectedEmailAddress}
              onSelectEmailAddress={(email) => setSelectedEmailAddress(email)}
            />
          </div>

          {/* Middle Thread List Panel */}
          <div
            className={`flex flex-col min-w-0 transition-all ${
              selectedThreadId 
                ? "hidden md:flex md:w-72 lg:w-80 xl:w-96 shrink-0" 
                : "w-full md:w-80 lg:w-96 md:flex-initial shrink-0"
            }`}
          >
            {mailbox && mailbox.initialSyncCompleted === false ? (
              <div className="flex flex-col h-full items-center justify-center p-8 text-center bg-card/90 backdrop-blur-md border border-border/60 rounded-2xl shadow-xs min-h-[400px]">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-3 shadow-2xs">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
                <h3 className="text-sm font-bold mb-1.5 text-foreground">Importing mailbox history...</h3>
                <p className="text-xs text-muted-foreground max-w-[240px] leading-relaxed">
                  Syncing your past emails over IMAP. Recent emails will show up as they are indexed.
                </p>
              </div>
            ) : (
              <div className="flex flex-col h-full min-h-0">
                {/* Active Stakeholder Email Type / Address Filter Banner */}
                {(selectedEmailType || selectedEmailAddress) && (
                  <div className="mb-2 p-2 px-3 rounded-xl bg-card border border-border/70 shadow-2xs flex items-center justify-between gap-2 text-xs shrink-0 animate-in fade-in slide-in-from-top-1 duration-150">
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={`h-2 w-2 rounded-full shrink-0 ${
                          selectedEmailType === "client"
                            ? "bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.8)]"
                            : selectedEmailType === "candidate"
                            ? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]"
                            : "bg-purple-500 shadow-[0_0_6px_rgba(168,85,247,0.8)]"
                        }`}
                      />
                      <span className="font-semibold text-foreground truncate">
                        {selectedEmailType ? EMAIL_TYPE_CONFIG[selectedEmailType].label : "Filtered"}
                      </span>
                      {selectedEmailAddress && (
                        <span className="font-mono text-[11px] text-muted-foreground truncate">
                          • {selectedEmailAddress}
                        </span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedEmailType(null);
                        setSelectedEmailAddress(null);
                      }}
                      className="h-6 px-2 text-[10px] text-muted-foreground hover:text-destructive rounded-lg transition-colors shrink-0"
                    >
                      <X className="h-3 w-3 mr-1" />
                      <span>Reset</span>
                    </Button>
                  </div>
                )}

                <div className="flex-1 min-h-0">
                  <EmailThreadList
                    threads={displayItems}
                    isLoading={loadingList}
                    selectedThreadId={selectedThreadId}
                    onSelectThread={handleSelectThread}
                    page={page}
                    totalPages={totalPages}
                    totalThreads={totalThreads}
                    onPageChange={setPage}
                    searchQuery={searchQuery}
                    onToggleStar={handleToggleStar}
                    selectedIds={selectedIds}
                    onSelectIdsChange={setSelectedIds}
                    onBulkDelete={handleBulkDelete}
                    activeFolder={activeFolder}
                  />
                </div>
              </div>
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
              onOpenSignatures={() => {
                setMobileNavOpen(false);
                setSignatureDialogOpen(true);
              }}
              selectedEmailType={selectedEmailType}
              onSelectEmailType={(type) => {
                setSelectedEmailType(type);
                setSelectedEmailAddress(null);
                setMobileNavOpen(false);
              }}
              selectedEmailAddress={selectedEmailAddress}
              onSelectEmailAddress={(email) => {
                setSelectedEmailAddress(email);
                setMobileNavOpen(false);
              }}
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

      {/* Email Signature Management Dialog */}
      <EmailSignatureDialog
        open={signatureDialogOpen}
        onOpenChange={setSignatureDialogOpen}
      />
    </div>
  );
}
