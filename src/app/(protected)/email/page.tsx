"use client";

import React, { useState } from "react";
import { 
  EmailHeader,
  MailboxConnectCard,
  EmailSidebar,
  EmailFolder,
  EmailThreadList,
  EmailThreadDetail,
  EmailComposerDialog,
  AdminMailboxesDialog
} from "@/components/email";
import { EmailListItem } from "@/components/email/EmailThreadList";
import { 
  useMailboxStatus, 
  useEmailList, 
  useEmailThread, 
  useMarkThreadRead 
} from "@/hooks/useEmail";
import { Loader2 } from "lucide-react";

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

  // Modals state
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerInitialData, setComposerInitialData] = useState<{
    to?: string;
    cc?: string;
    bcc?: string;
    subject?: string;
    threadId?: string;
    inReplyTo?: string;
    text?: string;
    draftId?: string;
  } | undefined>(undefined);
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
      limit: 20,
    },
    isConnected
  );

  // Fetch active thread detail
  const { 
    data: threadDetailData, 
    isLoading: loadingDetail 
  } = useEmailThread(selectedThreadId);

  const markReadMutation = useMarkThreadRead();

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
        isStarred: item.isStarred || false,
        isDraft: false,
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
      };
    } else {
      return {
        id: item._id,
        threadId: item.threadId,
        subject: item.subject || "(No Subject)",
        participants: item.direction === "received" ? [item.from] : (item.to || ["Unknown"]),
        date: item.receivedAt || item.sentAt || item.createdAt,
        unreadCount: item.isRead ? 0 : 1,
        isStarred: false,
        isDraft: false,
      };
    }
  });

  // Auto-select first thread on desktop if none selected
  React.useEffect(() => {
    if (!selectedThreadId && mappedItems.length > 0 && typeof window !== "undefined" && window.innerWidth >= 1024) {
      if (!mappedItems[0].isDraft) {
        setSelectedThreadId(mappedItems[0].threadId || mappedItems[0].id);
      }
    }
  }, [mappedItems, selectedThreadId]);

  const handleSelectThread = (item: EmailListItem) => {
    if (item.isDraft) {
      const rawDraft = rawList.find((d: any) => d._id === item.id);
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
      setSelectedThreadId(item.threadId || item.id);
      if (item.unreadCount > 0 && activeFolder === "starred") {
        markReadMutation.mutate({ threadId: item.threadId || item.id, isRead: true });
      }
    }
  };

  const handleCompose = (prefill?: { to?: string; cc?: string; bcc?: string; subject?: string; threadId?: string; inReplyTo?: string; draftId?: string }) => {
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
      <div className="flex h-[80vh] w-full items-center justify-center">
        <div className="flex items-center gap-2.5 text-xs text-muted-foreground font-medium">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          Loading mailbox session...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] p-3 sm:p-4 md:p-5 flex flex-col gap-3.5 max-w-[1700px] mx-auto">
      {/* Top Action Bar */}
      <EmailHeader
        mailbox={mailbox}
        isConnected={isConnected}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onComposeClick={() => handleCompose()}
        onRefreshClick={handleRefresh}
        isRefreshing={refetchingStatus || refetchingList}
        onOpenAdminMailboxes={() => setAdminMailboxesOpen(true)}
      />

      {/* Main Content Area */}
      {!isConnected ? (
        <MailboxConnectCard onSuccess={() => refetchStatus()} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 flex-1 min-h-[640px]">
          {/* Left Navigation Sidebar */}
          <div className="md:col-span-3 lg:col-span-2">
            <EmailSidebar
              activeFolder={activeFolder}
              onFolderChange={(folder) => {
                setActiveFolder(folder);
                setPage(1);
              }}
              onComposeClick={() => handleCompose()}
              unreadCount={totalUnread}
              mailbox={mailbox}
            />
          </div>

          {/* Middle Thread List */}
          <div
            className={`md:col-span-4 lg:col-span-4 ${
              selectedThreadId ? "hidden md:block" : "block"
            }`}
          >
            {mailbox && mailbox.initialSyncCompleted === false ? (
              <div className="flex flex-col h-full items-center justify-center p-8 text-center bg-card border rounded-xl shadow-xs min-h-[500px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <h3 className="text-sm font-semibold mb-2">Importing your mail history...</h3>
                <p className="text-xs text-muted-foreground max-w-[250px]">
                  This may take a few minutes for larger mailboxes. We are bringing in your past emails.
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
              />
            )}
          </div>

          {/* Right Thread Detail Conversation View */}
          <div
            className={`md:col-span-5 lg:col-span-6 ${
              selectedThreadId ? "block" : "hidden md:block"
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
