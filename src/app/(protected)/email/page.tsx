"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatDistanceToNowStrict, format } from "date-fns";
import { useSearchParams, useRouter } from "next/navigation";

// Real API Hooks & Services
import {
  useMailboxStatus,
  useEmailList,
  useEmailSearch,
  useEmailThread,
  useMarkThreadRead,
  useToggleStar,
  useToggleImportant,
  useArchiveEmail,
  useUnarchiveEmail,
  useSendEmail,
  useMoveToTrash,
  useRestoreEmail,
  useDeleteDraft,
  usePermanentDelete,
  useDisconnectMailbox,
} from "@/hooks/useEmail";
import { emailService } from "@/services/emailService";
import { Email } from "@/types/email";

// Modular Reusable Components
import {
  EmailNavSidebar,
  EmailConversationList,
  EmailDetailPane,
  ConversationItem,
  EmailComposerDialog,
  ComposerInitialData,
  AdminMailboxesDialog,
  EmailSignatureDialog,
  MailboxConnectCard,
} from "@/components/email";

// Material UI Icons
import CircularProgress from "@mui/material/CircularProgress";
import MailOutlineIcon from "@mui/icons-material/MailOutlineOutlined";

function parseSender(fromStr: string | undefined): { name: string; email: string } {
  if (!fromStr) return { name: "Unknown", email: "" };
  const match = fromStr.match(/^(.*?)(?:<(.+?)>)?$/);
  if (match) {
    const name = (match[1] || "").trim().replace(/^["']|["']$/g, "");
    const email = (match[2] || "").trim();
    return {
      name: name || email || "Unknown",
      email: email || (name.includes("@") ? name : ""),
    };
  }
  return { name: fromStr, email: fromStr };
}

function getSenderDisplayInfo(item: any): { name: string; email: string } {
  if (item.fromName !== undefined || item.fromEmail !== undefined) {
    const email = item.fromEmail || "";
    const name = item.fromName || email.split("@")[0] || "Unknown";
    return { name, email };
  }
  const raw = typeof item === "string" ? item : (item.direction === "received" ? item.from : item.to?.[0] || item.from);
  return parseSender(raw);
}

function formatRelativeTime(dateInput: string | Date | undefined): string {
  if (!dateInput) return "";
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return "";
    return formatDistanceToNowStrict(d, { addSuffix: false });
  } catch {
    return "";
  }
}

function formatFullDate(dateInput: string | Date | undefined): string {
  if (!dateInput) return "";
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return "";
    return format(d, "dd MMM yyyy h:mm a");
  } catch {
    return "";
  }
}

/** Map a thread-level search result item into a ConversationItem */
function mapSearchThread(item: any): ConversationItem {
  // Search response: { _id, subject, participants[], lastMessageAt, unreadCount, isStarred }
  const firstParticipant = item.participants?.[0] || "Contact";
  const parsed = getSenderDisplayInfo(firstParticipant);
  return {
    id: item._id,
    threadId: item._id,
    subject: item.subject || "(No Subject)",
    sender: parsed.name,
    senderEmail: parsed.email,
    to: item.participants || [],
    date: item.lastMessageAt || item.createdAt,
    relativeTime: formatRelativeTime(item.lastMessageAt || item.createdAt),
    unread: (item.unreadCount || 0) > 0,
    isStarred: item.isStarred ?? false,
    isImportant: item.isImportant ?? false,
    snippet: item.snippet || item.subject || "...",
    hasAttachments: item.hasAttachments || false,
  };
}

/** Map a folder-list email item into a ConversationItem */
function mapFolderEmail(item: any, folder: string): ConversationItem {
  if (folder === "starred") {
    // Threads endpoint for starred
    const primaryParticipant = item.participants?.[0] || "Contact";
    const parsed = getSenderDisplayInfo(primaryParticipant);
    return {
      id: item._id,
      threadId: item._id,
      subject: item.subject || "(No Subject)",
      sender: parsed.name,
      senderEmail: parsed.email,
      to: item.participants || [],
      date: item.lastMessageAt || item.createdAt,
      relativeTime: formatRelativeTime(item.lastMessageAt || item.createdAt),
      unread: (item.unreadCount || 0) > 0,
      isStarred: item.isStarred ?? true,
      isImportant: item.isImportant ?? false,
      snippet: item.snippet || item.subject || "...",
      hasAttachments: item.hasAttachments || false,
    };
  } else if (folder === "drafts") {
    let displayName = "To: (No recipient)";
    let avatarEmail = "";
    
    const firstRecipient = item.toRecipients && item.toRecipients.length > 0 ? item.toRecipients[0] : null;
    if (firstRecipient) {
      const nameToUse = firstRecipient.name || firstRecipient.email;
      const extraCount = item.toRecipients.length - 1;
      displayName = extraCount > 0 ? `${nameToUse} +${extraCount}` : nameToUse;
      avatarEmail = firstRecipient.email;
    } else if (item.to && item.to.length > 0) {
      const parsed = parseSender(item.to[0]);
      displayName = parsed.name;
      avatarEmail = parsed.email;
    }

    return {
      id: item._id,
      threadId: item.threadId || item._id,
      subject: item.subject || "(No Subject)",
      sender: displayName,
      senderEmail: avatarEmail,
      to: item.to || [],
      date: item.updatedAt || item.createdAt,
      relativeTime: formatRelativeTime(item.updatedAt || item.createdAt),
      unread: false,
      isStarred: false,
      isImportant: false,
      snippet: item.bodyText || item.subject || "(Draft)",
      hasAttachments: item.attachments && item.attachments.length > 0,
    };
  } else {
    let displayName = "Unknown Sender";
    let avatarEmail = "";
    
    const isSent = item.folder === "sent" || item.direction === "sent";

    if (isSent) {
      const firstRecipient = item.toRecipients && item.toRecipients.length > 0 ? item.toRecipients[0] : null;
      if (firstRecipient) {
        const nameToUse = firstRecipient.name || firstRecipient.email;
        const extraCount = item.toRecipients.length - 1;
        displayName = extraCount > 0 ? `${nameToUse} +${extraCount}` : nameToUse;
        avatarEmail = firstRecipient.email;
      } else {
        const parsed = parseSender(item.to?.[0] || item.from);
        displayName = parsed.name;
        avatarEmail = parsed.email;
      }
    } else {
      const parsed = getSenderDisplayInfo(item);
      displayName = parsed.name;
      avatarEmail = parsed.email;
    }

    return {
      id: item._id,
      threadId: item.threadId || item._id,
      subject: item.subject || "(No Subject)",
      sender: displayName,
      senderEmail: avatarEmail,
      to: item.to || [],
      date: item.receivedAt || item.sentAt || item.createdAt,
      relativeTime: formatRelativeTime(item.receivedAt || item.sentAt || item.createdAt),
      unread: !item.isRead,
      isStarred: item.isStarred || false,
      isImportant: item.isImportant || false,
      snippet: item.bodyText?.slice(0, 80) || item.subject || "...",
      hasAttachments: item.attachments && item.attachments.length > 0,
    };
  }
}

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function EmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Real Mailbox Status API
  const {
    data: mailboxData,
    isLoading: loadingStatus,
    refetch: refetchStatus,
    isRefetching: refetchingStatus,
  } = useMailboxStatus();

  const isConnected = !!mailboxData?.connected && !!mailboxData?.data;
  const mailbox = mailboxData?.data || null;

  // ─── State ─────────────────────────────────────────────────────────────────
  const [activeFolder, setActiveFolder] = useState<string>("inbox");

  // Raw input value — updated on every keystroke
  const [searchInputValue, setSearchInputValue] = useState("");

  // Debounced value — triggers the search API call (400ms delay)
  const debouncedSearch = useDebounce(searchInputValue, 400);

  // Contact filter from nav sidebar
  const [selectedContactEmail, setSelectedContactEmail] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [searchPage, setSearchPage] = useState(1);
  const pageSize = 20;

  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [hasAutoSelected, setHasAutoSelected] = useState(false);

  // Modals state
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerInitialData, setComposerInitialData] = useState<ComposerInitialData | undefined>(undefined);
  const [adminMailboxesOpen, setAdminMailboxesOpen] = useState(false);
  const [signatureDialogOpen, setSignatureDialogOpen] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);

  // Reply loading state for reply-info fetch
  const [replyLoading, setReplyLoading] = useState(false);

  // Mobile navigation state
  const [mobileView, setMobileView] = useState<"folders" | "list" | "detail">("list");

  // ─── Derived: are we in search mode? ───────────────────────────────────────
  // Search mode = user typed something in search box OR contact filter is active
  const activeSearchQuery = debouncedSearch.trim();
  const isSearchMode = activeSearchQuery.length > 0 || !!selectedContactEmail;

  // The actual search term: if contact filter is active with no text, use the email as query
  const effectiveSearchTerm = activeSearchQuery || selectedContactEmail || "";

  // ─── OAuth redirect handling ────────────────────────────────────────────────
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

  // ─── Data Fetching ──────────────────────────────────────────────────────────

  // SEARCH: dedicated hook hitting /api/email/search
  // Folder passed as undefined when "all" so backend searches across all folders
  const searchFolder = ["inbox", "sent", "trash"].includes(activeFolder) ? activeFolder : undefined;

  const {
    data: searchData,
    isLoading: searchLoading,
    isRefetching: searchRefetching,
  } = useEmailSearch(
    {
      q: effectiveSearchTerm,
      folder: searchFolder,
      starredOnly: activeFolder === "starred" ? true : undefined,
      page: searchPage,
      limit: pageSize,
    },
    isConnected && isSearchMode
  );

  // FOLDER LIST: normal folder browsing (when not in search mode)
  const folderQueryKey = activeFolder === "all" ? "inbox" : activeFolder;

  const {
    data: listData,
    isLoading: listLoading,
    refetch: refetchList,
    isRefetching: refetchingList,
  } = useEmailList(
    folderQueryKey,
    { page, limit: pageSize },
    isConnected && !isSearchMode
  );

  // ─── Thread Detail ──────────────────────────────────────────────────────────
  const {
    data: threadDetailData,
    isLoading: loadingDetail,
  } = useEmailThread(selectedThreadId);

  // ─── Mutations ──────────────────────────────────────────────────────────────
  const markReadMutation = useMarkThreadRead();
  const toggleStarMutation = useToggleStar();
  const toggleImportantMutation = useToggleImportant();
  const archiveMutation = useArchiveEmail();
  const unarchiveMutation = useUnarchiveEmail();
  const restoreMutation = useRestoreEmail();
  const sendEmailMutation = useSendEmail();
  const moveToTrashMutation = useMoveToTrash();
  const permanentDeleteMutation = usePermanentDelete();
  const disconnectMutation = useDisconnectMailbox();
  const deleteDraftMutation = useDeleteDraft();

  // ─── Derived List State ─────────────────────────────────────────────────────
  const isLoading = isSearchMode ? searchLoading || searchRefetching : listLoading || refetchingList;

  // Pagination for active mode
  const activeData = isSearchMode ? searchData : listData;
  const rawList: any[] = activeData?.data || [];
  const totalItems = isSearchMode
    ? (searchData?.total ?? searchData?.count ?? rawList.length)
    : (listData?.total ?? rawList.length);
  const totalPages = isSearchMode
    ? (searchData?.pages ?? Math.max(1, Math.ceil(totalItems / pageSize)))
    : (listData?.pages ?? Math.max(1, Math.ceil(totalItems / pageSize)));
  const activePage = isSearchMode ? searchPage : page;

  // Map items based on mode
  const mappedItems: ConversationItem[] = useMemo(() => {
    if (isSearchMode) {
      return rawList.map((item) => mapSearchThread(item));
    }
    return rawList.map((item) => mapFolderEmail(item, activeFolder));
  }, [rawList, isSearchMode, activeFolder]);

  // Client-side fallback pagination if server doesn't slice
  const displayItems = useMemo(() => {
    if (activeData?.pages && activeData.pages > 1) {
      return mappedItems;
    }
    if (mappedItems.length > pageSize) {
      const start = (activePage - 1) * pageSize;
      return mappedItems.slice(start, start + pageSize);
    }
    return mappedItems;
  }, [mappedItems, activeData?.pages, activePage, pageSize]);

  // Auto-select first thread on desktop load
  useEffect(() => {
    if (!hasAutoSelected && !selectedThreadId && displayItems.length > 0 && typeof window !== "undefined" && window.innerWidth >= 1024) {
      const firstId = displayItems[0].threadId || displayItems[0].id;
      setSelectedThreadId(firstId);
      setHasAutoSelected(true);
    }
  }, [displayItems, selectedThreadId, hasAutoSelected]);

  // Reset auto-select when entering search mode so first result can be selected
  useEffect(() => {
    if (isSearchMode) {
      setHasAutoSelected(false);
      setSelectedThreadId(null);
    }
  }, [isSearchMode]);

  // Active Thread & Messages
  const activeThread = threadDetailData?.data?.thread || null;
  const threadMessages: Email[] = threadDetailData?.data?.messages || [];
  const latestMessage = threadMessages[threadMessages.length - 1] || null;

  const selectedListItem = useMemo(() => {
    return (
      displayItems.find((i) => i.threadId === selectedThreadId || i.id === selectedThreadId) ||
      mappedItems.find((i) => i.threadId === selectedThreadId || i.id === selectedThreadId) ||
      null
    );
  }, [displayItems, mappedItems, selectedThreadId]);

  // ─── Handlers ───────────────────────────────────────────────────────────────
  const handleSelectThread = (item: ConversationItem) => {
    const targetId = item.threadId || item.id;
    setSelectedThreadId(targetId);
    setMobileView("detail");

    if (item.unread) {
      markReadMutation.mutate({ threadId: targetId, isRead: true });
    }
  };

  const handleToggleStar = () => {
    if (!selectedThreadId && !selectedListItem) return;
    const targetId = selectedThreadId || selectedListItem?.threadId || selectedListItem?.id;
    if (!targetId) return;

    const currentStatus = activeThread?.isStarred ?? selectedListItem?.isStarred ?? false;
    toggleStarMutation.mutate({ threadId: targetId, isStarred: !currentStatus });
  };

  const handleToggleImportant = () => {
    const targetEmailId = latestMessage?._id;
    if (!targetEmailId) return;

    const currentStatus = activeThread?.isImportant ?? selectedListItem?.isImportant ?? false;
    toggleImportantMutation.mutate({ emailId: targetEmailId, isImportant: !currentStatus });
  };

  const handleArchive = () => {
    const targetEmailId = latestMessage?._id;
    if (!targetEmailId) return;

    if (activeFolder === "archive") {
      unarchiveMutation.mutate(targetEmailId, {
        onSuccess: () => {
          setSelectedThreadId(null);
          refetchList();
        },
      });
    } else {
      archiveMutation.mutate(targetEmailId, {
        onSuccess: () => {
          setSelectedThreadId(null);
          refetchList();
        },
      });
    }
  };

  const handleDelete = () => {
    const targetEmailId = latestMessage?._id;
    if (!targetEmailId) return;

    if (activeFolder === "trash") {
      permanentDeleteMutation.mutate(targetEmailId, {
        onSuccess: () => {
          setSelectedThreadId(null);
          refetchList();
        },
      });
    } else if (activeFolder === "drafts") {
      deleteDraftMutation.mutate(targetEmailId, {
        onSuccess: () => {
          setSelectedThreadId(null);
          refetchList();
        },
      });
    } else {
      moveToTrashMutation.mutate(targetEmailId, {
        onSuccess: () => {
          setSelectedThreadId(null);
          refetchList();
        },
      });
    }
  };

  const handleMarkUnread = () => {
    if (!selectedThreadId) return;
    markReadMutation.mutate(
      { threadId: selectedThreadId, isRead: false },
      {
        onSuccess: () => {
          toast.success("Marked conversation as unread");
          refetchList();
        },
      }
    );
  };

  const handleDisconnect = () => {
    if (window.confirm("Are you sure you want to disconnect your mailbox? You will need to sign in again to access emails.")) {
      disconnectMutation.mutate(undefined, {
        onSuccess: () => {
          setSelectedThreadId(null);
          refetchStatus();
        },
      });
    }
  };

  const handleCompose = (prefill?: ComposerInitialData) => {
    setComposerInitialData(prefill);
    setComposerOpen(true);
  };

  const handleQuickAction = async (type: "reply" | "replyAll" | "forward") => {
    if (!latestMessage) return;

    if (type === "forward") {
      const cleanSubject = latestMessage.subject?.replace(/^(Re:\s*|Fwd:\s*)+/i, "") || "";
      const forwardHtml = latestMessage.bodyHtml || (latestMessage.bodyText ? `<p>${latestMessage.bodyText.replace(/\n/g, "<br/>")}</p>` : undefined);
      handleCompose({
        to: "",
        subject: `Fwd: ${cleanSubject}`,
        html: forwardHtml
          ? `<p><br/></p><hr/><p><strong>---------- Forwarded message ---------</strong><br/>From: ${latestMessage.from || ""}<br/>Date: ${latestMessage.sentAt || latestMessage.receivedAt || ""}<br/>Subject: ${latestMessage.subject || ""}<br/>To: ${latestMessage.to?.join(", ") || ""}</p>${forwardHtml}`
          : undefined,
        inReplyTo: undefined,
        threadId: undefined,
      });
      return;
    }

    // mode = "reply" | "replyAll"
    try {
      setReplyLoading(true);
      const res = await emailService.getReplyInfo(latestMessage._id, type);
      if (res?.success && res.data) {
        const info = res.data;
        handleCompose({
          to: info.to.map((r) => r.address || (r.name ? `${r.name} <${r.email}>` : r.email)),
          cc: info.cc.map((r) => r.address || (r.name ? `${r.name} <${r.email}>` : r.email)),
          bcc: info.bcc?.map((r) => r.address || (r.name ? `${r.name} <${r.email}>` : r.email)) || [],
          subject: info.subject,
          threadId: info.threadId,
          inReplyTo: info.inReplyTo,
          html: "", // Fresh reply with signature injected
        });
      } else {
        throw new Error("No data in reply-info response");
      }
    } catch (err: any) {
      console.warn("Could not fetch reply-info, falling back to local email headers:", err);
      const cleanSubject = latestMessage.subject?.replace(/^(Re:\s*|Fwd:\s*)+/i, "") || "";
      const recipient = latestMessage.from || selectedListItem?.senderEmail || "";
      handleCompose({
        to: recipient,
        subject: `Re: ${cleanSubject}`,
        threadId: selectedThreadId || undefined,
        inReplyTo: latestMessage._id,
        html: "",
      });
    } finally {
      setReplyLoading(false);
    }
  };

  // Handle search input change — reset to page 1
  const handleSearchChange = useCallback((q: string) => {
    setSearchInputValue(q);
    setSearchPage(1);
    if (!q.trim()) {
      // Exiting search mode — reset state
      setSelectedThreadId(null);
      setHasAutoSelected(false);
    }
  }, []);

  // Handle folder change — exit search mode
  const handleFolderChange = (f: string) => {
    setActiveFolder(f);
    setPage(1);
    setSearchPage(1);
    setSearchInputValue("");
    setSelectedContactEmail(null);
    setSelectedThreadId(null);
    setHasAutoSelected(false);
    setMobileView("list");
  };

  // Handle page change depending on mode
  const handlePageChange = (p: number) => {
    if (isSearchMode) {
      setSearchPage(p);
    } else {
      setPage(p);
    }
    setSelectedThreadId(null);
  };

  // Detail fallback values
  const detailSender = useMemo(() => {
    if (latestMessage?.from) return parseSender(latestMessage.from);
    if (selectedListItem?.sender) return { name: selectedListItem.sender, email: selectedListItem.senderEmail };
    return { name: "Sender", email: "" };
  }, [latestMessage, selectedListItem]);

  const detailSubject = activeThread?.subject || latestMessage?.subject || selectedListItem?.subject || "(No Subject)";
  const detailDate = formatFullDate(latestMessage?.sentAt || latestMessage?.receivedAt || (latestMessage as any)?.createdAt || selectedListItem?.date);
  const detailRecipients = latestMessage?.to?.join(", ") || selectedListItem?.to?.join(", ") || mailbox?.emailAddress || "";

  // Loading indicator for mailbox service check
  if (loadingStatus) {
    return (
      <div className="h-full w-full flex items-center justify-center p-4">
        <div className="flex items-center gap-3 p-5 rounded-2xl bg-white dark:bg-[#1C252E] border border-slate-200/80 dark:border-slate-800 shadow-sm text-xs font-semibold text-slate-600 dark:text-slate-300">
          <CircularProgress size={18} thickness={4} />
          <span>Connecting to mailbox service...</span>
        </div>
      </div>
    );
  }

  // If not connected, present the fully polished, dedicated email login page
  if (!isConnected) {
    return (
      <div className="h-full min-h-0 w-full p-2 sm:p-3 md:p-4 flex flex-col overflow-hidden font-['Public_Sans',sans-serif]">
        {mailbox?.authType === "oauth2" && mailbox?.connectionStatus !== "connected" ? (
          <div className="flex-1 min-h-0 w-full bg-white dark:bg-[#1C252E] border border-slate-200/80 dark:border-slate-800 rounded-2xl md:rounded-[20px] shadow-[0_0_2px_0_rgba(145,158,171,0.2),0_12px_24px_-4px_rgba(145,158,171,0.08)] flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
            <div className="h-16 w-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mb-4 shadow-sm">
              <MailOutlineIcon sx={{ fontSize: 32 }} />
            </div>
            <h2 className="text-xl font-bold text-[#1C252E] dark:text-white mb-2">Reconnect your Microsoft Mailbox</h2>
            <p className="text-xs sm:text-sm text-[#919EAB] max-w-md mb-6 leading-relaxed">
              Please authenticate with your Microsoft work account to sync your emails.
            </p>
            <button
              type="button"
              onClick={async () => {
                try {
                  setOauthLoading(true);
                  const { url } = await emailService.getMicrosoftAuthUrl();
                  window.location.href = url;
                } catch (error: any) {
                  toast.error(error?.response?.data?.message || "Failed to start sign-in");
                  setOauthLoading(false);
                }
              }}
              disabled={oauthLoading}
              className="h-11 px-8 rounded-xl bg-[#00a4ef] hover:bg-[#0078d4] text-white font-bold text-xs shadow-md transition-all inline-flex items-center gap-2.5 active:scale-[0.99] disabled:opacity-50"
            >
              {oauthLoading ? <CircularProgress size={16} color="inherit" /> : null}
              <span>Reconnect with Microsoft</span>
            </button>
          </div>
        ) : (
          <MailboxConnectCard onSuccess={() => refetchStatus()} />
        )}
      </div>
    );
  }

  return (
    <div className="h-full min-h-0 w-full p-2 sm:p-3 md:p-4 flex flex-col overflow-hidden font-['Public_Sans',sans-serif]">
      {/* Outer Card Chassis matching the exact Minimals/Material UI Reference */}
      <div className="flex-1 min-h-0 w-full bg-white dark:bg-[#1C252E] border border-slate-200/80 dark:border-slate-800 rounded-2xl md:rounded-[20px] shadow-[0_0_2px_0_rgba(145,158,171,0.2),0_12px_24px_-4px_rgba(145,158,171,0.08)] flex overflow-hidden">
        
        {/* ========================================================= */}
        {/* COLUMN 1: LEFT NAVIGATION COMPONENT                      */}
        {/* ========================================================= */}
        <EmailNavSidebar
          activeFolder={activeFolder}
          onSelectFolder={handleFolderChange}
          onCompose={() => handleCompose()}
          mailbox={mailbox}
          totalInboxCount={activeFolder === "inbox" && !isSearchMode ? totalItems : undefined}
          onRefresh={() => {
            refetchStatus();
            refetchList();
          }}
          isRefreshing={refetchingList || refetchingStatus}
          onDisconnect={handleDisconnect}
          isDisconnecting={disconnectMutation.isPending}
          onOpenSignatures={() => setSignatureDialogOpen(true)}
          selectedContactEmail={selectedContactEmail}
          onSelectContactFilter={(email) => {
            setSelectedContactEmail(email);
            setSearchPage(1);
            setMobileView("list");
          }}
          onComposeToContact={(email, name) => {
            handleCompose({
              to: name ? `${name} <${email}>` : email,
              subject: "",
              html: "",
            });
          }}
          className={mobileView !== "folders" ? "hidden md:flex" : "flex"}
        />

        {/* ========================================================= */}
        {/* COLUMN 2 & 3: CONTENT VIEWPORT                            */}
        {/* ========================================================= */}
        <>
          {/* COLUMN 2: CONVERSATION LIST COMPONENT */}
            <EmailConversationList
              items={displayItems}
              selectedId={selectedThreadId}
              onSelectItem={handleSelectThread}
              searchQuery={searchInputValue}
              onSearchChange={handleSearchChange}
              activeFolder={activeFolder}
              isLoading={isLoading}
              isSearchMode={isSearchMode}
              searchResultCount={isSearchMode ? totalItems : undefined}
              onMobileBack={() => setMobileView("folders")}
              page={activePage}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              selectedContactEmail={selectedContactEmail}
              onClearContactFilter={() => {
                setSelectedContactEmail(null);
                setSearchPage(1);
              }}
              className={mobileView !== "list" ? "hidden md:flex" : "flex"}
            />

            {/* COLUMN 3: DETAIL PANE COMPONENT (WITH FULLSCREEN-ENABLED EDITOR) */}
            {selectedListItem || latestMessage ? (
              <EmailDetailPane
                thread={activeThread}
                messages={threadMessages}
                fallbackSubject={detailSubject}
                fallbackSender={detailSender}
                fallbackDate={detailDate}
                fallbackRecipients={detailRecipients}
                fallbackSnippet={selectedListItem?.snippet}
                isStarred={activeThread?.isStarred ?? selectedListItem?.isStarred ?? false}
                isImportant={activeThread?.isImportant ?? selectedListItem?.isImportant ?? false}
                isLoading={loadingDetail}
                isReplying={replyLoading}
                onToggleStar={handleToggleStar}
                onToggleImportant={handleToggleImportant}
                onDelete={handleDelete}
                onArchive={handleArchive}
                onMarkUnread={handleMarkUnread}
                onReplyQuick={handleQuickAction}
                onMobileBack={() => setMobileView("list")}
                className={mobileView !== "detail" ? "hidden md:flex" : "flex"}
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
                <MailOutlineIcon sx={{ fontSize: 44, color: "#919EAB", opacity: 0.5 }} />
                <p className="text-sm font-semibold mt-3 text-slate-600 dark:text-slate-300">
                  {isSearchMode
                    ? searchLoading
                      ? "Searching..."
                      : `No results for "${effectiveSearchTerm}"`
                    : "Select an email to view details"}
                </p>
              </div>
            )}
          </>
        </div>

      {/* Compose Dialog */}
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
