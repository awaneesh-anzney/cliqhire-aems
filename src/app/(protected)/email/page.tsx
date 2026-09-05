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
import { 
  useMailboxStatus, 
  useEmailThreads, 
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
    subject?: string;
    threadId?: string;
    inReplyTo?: string;
    text?: string;
  } | undefined>(undefined);
  const [adminMailboxesOpen, setAdminMailboxesOpen] = useState(false);

  // Fetch threads when mailbox is connected
  const { 
    data: threadsData, 
    isLoading: loadingThreads, 
    refetch: refetchThreads, 
    isRefetching: refetchingThreads 
  } = useEmailThreads(
    {
      page,
      limit: 20,
      starredOnly: activeFolder === "starred",
      folder: activeFolder,
    },
    isConnected
  );

  // Fetch active thread detail
  const { 
    data: threadDetailData, 
    isLoading: loadingDetail 
  } = useEmailThread(selectedThreadId);

  const markReadMutation = useMarkThreadRead();

  const threads = threadsData?.data || [];
  const totalThreads = threadsData?.total || 0;
  const totalPages = threadsData?.pages || 1;

  // Auto-select first thread on desktop if none selected
  React.useEffect(() => {
    if (!selectedThreadId && threads.length > 0 && typeof window !== "undefined" && window.innerWidth >= 1024) {
      setSelectedThreadId(threads[0]._id);
    }
  }, [threads, selectedThreadId]);

  const handleSelectThread = (id: string) => {
    setSelectedThreadId(id);
    const target = threads.find((t) => t._id === id);
    if (target && target.unreadCount > 0) {
      markReadMutation.mutate({ threadId: id, isRead: true });
    }
  };

  const handleCompose = (prefill?: { to?: string; subject?: string; threadId?: string; inReplyTo?: string }) => {
    setComposerInitialData(prefill);
    setComposerOpen(true);
  };

  const handleRefresh = () => {
    refetchStatus();
    refetchThreads();
  };

  // Compute unread count from threads
  const totalUnread = threads.reduce((acc, t) => acc + (t.unreadCount || 0), 0);

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
        isRefreshing={refetchingStatus || refetchingThreads}
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
                threads={threads}
                isLoading={loadingThreads}
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
