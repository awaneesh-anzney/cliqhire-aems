"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNowStrict } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";

// Real API Hooks & Services
import {
  useMailboxStatus,
  useEmailList,
  useEmailThread,
  useMarkThreadRead,
  useToggleStar,
  useSendEmail,
  useMoveToTrash,
  usePermanentDelete,
} from "@/hooks/useEmail";
import { emailService } from "@/services/emailService";
import { Email, EmailThread } from "@/types/email";

// Existing Dialogs & Connect Cards
import {
  EmailComposerDialog,
  ComposerInitialData,
  AdminMailboxesDialog,
  EmailSignatureDialog,
  MailboxConnectCard,
} from "@/components/email";

// Material UI (MUI) Icons
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import DraftsOutlinedIcon from "@mui/icons-material/DraftsOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import ReportGmailerrorredOutlinedIcon from "@mui/icons-material/ReportGmailerrorredOutlined";
import LabelImportantOutlinedIcon from "@mui/icons-material/LabelImportantOutlined";
import StarBorderOutlinedIcon from "@mui/icons-material/StarBorderOutlined";
import StarIcon from "@mui/icons-material/Star";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import MailOutlineIcon from "@mui/icons-material/MailOutlineOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ReplyIcon from "@mui/icons-material/Reply";
import ReplyAllIcon from "@mui/icons-material/ReplyAll";
import ForwardIcon from "@mui/icons-material/Forward";
import KeyboardArrowDownOutlinedIcon from "@mui/icons-material/KeyboardArrowDownOutlined";
import FormatListBulletedOutlinedIcon from "@mui/icons-material/FormatListBulletedOutlined";
import FormatListNumberedOutlinedIcon from "@mui/icons-material/FormatListNumberedOutlined";
import FormatAlignLeftOutlinedIcon from "@mui/icons-material/FormatAlignLeftOutlined";
import FormatAlignCenterOutlinedIcon from "@mui/icons-material/FormatAlignCenterOutlined";
import FormatAlignRightOutlinedIcon from "@mui/icons-material/FormatAlignRightOutlined";
import FormatAlignJustifyOutlinedIcon from "@mui/icons-material/FormatAlignJustifyOutlined";
import InsertLinkOutlinedIcon from "@mui/icons-material/InsertLinkOutlined";
import LinkOffOutlinedIcon from "@mui/icons-material/LinkOffOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import FormatIndentIncreaseOutlinedIcon from "@mui/icons-material/FormatIndentIncreaseOutlined";
import FormatClearOutlinedIcon from "@mui/icons-material/FormatClearOutlined";
import CropFreeOutlinedIcon from "@mui/icons-material/CropFreeOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SendIcon from "@mui/icons-material/Send";
import RefreshIcon from "@mui/icons-material/Refresh";
import CircularProgress from "@mui/material/CircularProgress";

// Navigation Folders Definition
const FOLDERS = [
  { id: "all", label: "All", icon: MailOutlineIcon },
  { id: "inbox", label: "Inbox", icon: InboxOutlinedIcon },
  { id: "sent", label: "Sent", icon: SendOutlinedIcon },
  { id: "drafts", label: "Drafts", icon: DraftsOutlinedIcon },
  { id: "trash", label: "Trash", icon: DeleteOutlineIcon },
  { id: "spam", label: "Spam", icon: ReportGmailerrorredOutlinedIcon },
  { id: "important", label: "Important", icon: LabelImportantOutlinedIcon },
  { id: "starred", label: "Starred", icon: StarBorderOutlinedIcon },
];

// Navigation Labels Definition
const LABELS = [
  { id: "social", label: "Social", color: "#22C55E" },
  { id: "promotions", label: "Promotions", color: "#F59E0B" },
  { id: "forums", label: "Forums", color: "#FF5630" },
];

// Helper to parse sender name and email
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

// Deterministic pastel color for initials
function getInitialsColor(name: string): string {
  const colors = ["#00A76F", "#1877F2", "#8E33FF", "#FF5630", "#00B8D9", "#FFAB00"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

// Relative time formatter
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

// Full date formatter
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

export default function EmailPage() {
  const queryClient = useQueryClient();
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

  // Folder & search state
  const [activeFolder, setActiveFolder] = useState<string>("inbox");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [hasAutoSelected, setHasAutoSelected] = useState(false);

  // Modals state
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerInitialData, setComposerInitialData] = useState<ComposerInitialData | undefined>(undefined);
  const [adminMailboxesOpen, setAdminMailboxesOpen] = useState(false);
  const [signatureDialogOpen, setSignatureDialogOpen] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);

  // Reply box state
  const [replyText, setReplyText] = useState("");
  const [activeFormats, setActiveFormats] = useState<{
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strike?: boolean;
    align?: "left" | "center" | "right" | "justify";
  }>({ align: "left" });

  // Mobile navigation state
  const [mobileView, setMobileView] = useState<"folders" | "list" | "detail">("list");

  // Query parameter handling (OAuth redirects)
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

  // Real API: List emails for current folder & query
  const folderQueryKey = activeFolder === "all" ? "inbox" : activeFolder;
  const {
    data: listData,
    isLoading: loadingList,
    refetch: refetchList,
    isRefetching: refetchingList,
  } = useEmailList(
    folderQueryKey,
    {
      page,
      limit: 30,
      q: searchQuery.trim() ? searchQuery.trim() : undefined,
    },
    isConnected
  );

  // Real API: Active thread detail
  const {
    data: threadDetailData,
    isLoading: loadingDetail,
  } = useEmailThread(selectedThreadId);

  // Real Mutations
  const markReadMutation = useMarkThreadRead();
  const toggleStarMutation = useToggleStar();
  const sendEmailMutation = useSendEmail();
  const moveToTrashMutation = useMoveToTrash();
  const permanentDeleteMutation = usePermanentDelete();

  // Normalize raw list items from various API response shapes
  const rawList: any[] = listData?.data || [];
  const totalThreads = listData?.total || 0;

  interface NormalizedEmailItem {
    id: string;
    threadId: string;
    subject: string;
    sender: string;
    senderEmail: string;
    to: string[];
    date: string;
    relativeTime: string;
    unread: boolean;
    isStarred: boolean;
    isImportant: boolean;
    snippet: string;
    hasAttachments: boolean;
    isDraft: boolean;
  }

  const mappedItems: NormalizedEmailItem[] = useMemo(() => {
    return rawList.map((item: any) => {
      if (activeFolder === "starred" || !!searchQuery.trim()) {
        const primaryParticipant = item.participants?.[0] || "Contact";
        const parsed = parseSender(primaryParticipant);
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
          isImportant: item.isStarred ?? false,
          snippet: item.snippet || item.subject || "...",
          hasAttachments: item.hasAttachments || false,
          isDraft: false,
        };
      } else if (activeFolder === "drafts") {
        const toRecipients = item.to && item.to.length > 0 ? item.to : ["(No recipient)"];
        const parsed = parseSender(toRecipients[0]);
        return {
          id: item._id,
          threadId: item.threadId || item._id,
          subject: item.subject || "(No Subject)",
          sender: parsed.name,
          senderEmail: parsed.email,
          to: item.to || [],
          date: item.updatedAt || item.createdAt,
          relativeTime: formatRelativeTime(item.updatedAt || item.createdAt),
          unread: false,
          isStarred: false,
          isImportant: false,
          snippet: item.bodyText || item.subject || "(Draft)",
          hasAttachments: item.attachments && item.attachments.length > 0,
          isDraft: true,
        };
      } else {
        const rawFrom = item.direction === "received" ? item.from : item.to?.[0] || item.from;
        const parsed = parseSender(rawFrom);
        return {
          id: item._id,
          threadId: item.threadId || item._id,
          subject: item.subject || "(No Subject)",
          sender: parsed.name,
          senderEmail: parsed.email,
          to: item.to || [],
          date: item.receivedAt || item.sentAt || item.createdAt,
          relativeTime: formatRelativeTime(item.receivedAt || item.sentAt || item.createdAt),
          unread: !item.isRead,
          isStarred: item.isStarred || false,
          isImportant: false,
          snippet: item.bodyText?.slice(0, 60) || item.subject || "...",
          hasAttachments: item.attachments && item.attachments.length > 0,
          isDraft: false,
        };
      }
    });
  }, [rawList, activeFolder, searchQuery]);

  // Auto-select first thread on desktop load
  useEffect(() => {
    if (!hasAutoSelected && !selectedThreadId && mappedItems.length > 0 && typeof window !== "undefined" && window.innerWidth >= 1024) {
      const firstId = mappedItems[0].threadId || mappedItems[0].id;
      setSelectedThreadId(firstId);
      setHasAutoSelected(true);
    }
  }, [mappedItems, selectedThreadId, hasAutoSelected]);

  // Current selected thread details & messages
  const activeThread = threadDetailData?.data?.thread || null;
  const threadMessages: Email[] = threadDetailData?.data?.messages || [];
  const latestMessage = threadMessages[threadMessages.length - 1] || null;

  // Selected thread preview meta
  const selectedListItem = useMemo(() => {
    return mappedItems.find((i) => i.threadId === selectedThreadId || i.id === selectedThreadId) || null;
  }, [mappedItems, selectedThreadId]);

  // Handlers
  const handleSelectThread = (item: NormalizedEmailItem) => {
    const targetId = item.threadId || item.id;
    setSelectedThreadId(targetId);
    setMobileView("detail");

    if (item.unread) {
      markReadMutation.mutate({ threadId: targetId, isRead: true });
    }
  };

  const handleToggleStar = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!selectedThreadId && !selectedListItem) return;
    const targetId = selectedThreadId || selectedListItem?.threadId || selectedListItem?.id;
    if (!targetId) return;

    const currentStatus = activeThread?.isStarred ?? selectedListItem?.isStarred ?? false;
    toggleStarMutation.mutate({ threadId: targetId, isStarred: !currentStatus });
  };

  const handleDelete = () => {
    if (!selectedThreadId && !selectedListItem) return;
    const targetId = selectedListItem?.id || selectedThreadId;
    if (!targetId) return;

    if (activeFolder === "trash") {
      permanentDeleteMutation.mutate(targetId, {
        onSuccess: () => {
          setSelectedThreadId(null);
          refetchList();
        },
      });
    } else {
      moveToTrashMutation.mutate(targetId, {
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

  const handleSendReply = async () => {
    if (!replyText.trim()) {
      toast.error("Please enter a reply message");
      return;
    }
    if (!selectedThreadId || !latestMessage) {
      toast.error("No active email to reply to");
      return;
    }

    try {
      const recipient = latestMessage.from || selectedListItem?.senderEmail || "";
      await sendEmailMutation.mutateAsync({
        to: recipient,
        subject: latestMessage.subject?.startsWith("Re:") ? latestMessage.subject : `Re: ${latestMessage.subject || ""}`,
        text: replyText,
        threadId: selectedThreadId,
        inReplyTo: latestMessage._id,
      });
      setReplyText("");
    } catch {
      // Error handled by mutation
    }
  };

  const handleCompose = (prefill?: ComposerInitialData) => {
    setComposerInitialData(prefill);
    setComposerOpen(true);
  };

  const toggleFormat = (formatKey: "bold" | "italic" | "underline" | "strike") => {
    setActiveFormats((prev) => ({ ...prev, [formatKey]: !prev[formatKey] }));
  };

  // Sender details for detail view
  const detailSender = useMemo(() => {
    if (latestMessage?.from) return parseSender(latestMessage.from);
    if (selectedListItem?.sender) return { name: selectedListItem.sender, email: selectedListItem.senderEmail };
    return { name: "Sender", email: "" };
  }, [latestMessage, selectedListItem]);

  const detailSubject = activeThread?.subject || latestMessage?.subject || selectedListItem?.subject || "(No Subject)";
  const detailDate = latestMessage?.sentAt || latestMessage?.receivedAt || latestMessage?.createdAt || selectedListItem?.date;
  const detailRecipients = latestMessage?.to?.join(", ") || selectedListItem?.to?.join(", ") || mailbox?.emailAddress || "";

  // Loading state
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

  return (
    <div className="h-full min-h-0 w-full p-2 sm:p-3 md:p-4 flex flex-col overflow-hidden font-['Public_Sans',sans-serif]">
      {/* Outer Card Chassis matching the exact Minimals/Material UI Reference */}
      <div className="flex-1 min-h-0 w-full bg-white dark:bg-[#1C252E] border border-slate-200/80 dark:border-slate-800 rounded-2xl md:rounded-[20px] shadow-[0_0_2px_0_rgba(145,158,171,0.2),0_12px_24px_-4px_rgba(145,158,171,0.08)] flex overflow-hidden">
        
        {/* ========================================================= */}
        {/* COLUMN 1: LEFT NAVIGATION (FOLDERS & LABELS)             */}
        {/* ========================================================= */}
        <div
          className={cn(
            "w-full md:w-[210px] lg:w-[220px] shrink-0 p-4 sm:p-5 flex flex-col gap-4 overflow-y-auto bg-transparent border-r border-slate-100 dark:border-slate-800/80 transition-all",
            mobileView !== "folders" && "hidden md:flex"
          )}
        >
          {/* Compose Button */}
          <button
            type="button"
            onClick={() => handleCompose()}
            className="w-full h-10 px-4 rounded-xl bg-[#1C252E] hover:bg-[#28323D] dark:bg-white dark:hover:bg-slate-100 text-white dark:text-[#1C252E] font-bold text-[13px] flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.98] outline-none"
          >
            <EditOutlinedIcon sx={{ fontSize: 17 }} />
            <span>Compose</span>
          </button>

          {/* Folders List */}
          <div className="flex flex-col space-y-0.5">
            {FOLDERS.map((f) => {
              const Icon = f.icon;
              const isActive = activeFolder === f.id;
              // Active unread / thread count for inbox
              const countBadge = f.id === "inbox" && activeFolder === "inbox" && totalThreads > 0 ? totalThreads : undefined;

              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => {
                    setActiveFolder(f.id);
                    setPage(1);
                    setMobileView("list");
                  }}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 rounded-xl text-[13px] transition-colors outline-none",
                    isActive
                      ? "bg-slate-100/90 dark:bg-slate-800 font-bold text-[#1C252E] dark:text-white"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/40 font-medium"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      sx={{
                        fontSize: 19,
                        color: isActive ? "#1C252E" : "#637381",
                      }}
                      className={isActive ? "dark:!text-white" : "dark:!text-slate-400"}
                    />
                    <span className="capitalize">{f.label}</span>
                  </div>
                  {countBadge !== undefined && (
                    <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 tabular-nums">
                      {countBadge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Labels Section */}
          <div className="flex flex-col space-y-1 pt-3">
            {LABELS.map((lbl) => {
              const isActive = activeFolder === lbl.id;
              return (
                <button
                  key={lbl.id}
                  type="button"
                  onClick={() => {
                    setActiveFolder(lbl.id);
                    setMobileView("list");
                  }}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 rounded-xl text-[13px] transition-colors outline-none",
                    isActive
                      ? "bg-slate-100/90 dark:bg-slate-800 font-bold text-[#1C252E] dark:text-white"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/40 font-medium"
                  )}
                >
                  <div className="flex items-center gap-3">
                    {/* Vertical Pill Tag exactly like reference image */}
                    <span
                      className="w-1.5 h-3.5 rounded-full shrink-0"
                      style={{ backgroundColor: lbl.color }}
                    />
                    <span>{lbl.label}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Mailbox Status Quick Action in Sidebar */}
          {mailbox && (
            <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-[#919EAB]">
              <div className="flex items-center justify-between">
                <span className="truncate max-w-[140px] font-medium">{mailbox.emailAddress}</span>
                <button
                  type="button"
                  onClick={() => {
                    refetchStatus();
                    refetchList();
                  }}
                  title="Sync Mailbox"
                  className="p-1 hover:text-foreground transition-colors"
                >
                  <RefreshIcon sx={{ fontSize: 14 }} className={refetchingList ? "animate-spin" : ""} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* COLUMN 2 & 3 CONTAINER                                   */}
        {/* ========================================================= */}
        {!isConnected ? (
          /* Mailbox Connect State (if not connected yet) */
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            {mailbox?.authType === "oauth2" && mailbox?.connectionStatus !== "connected" ? (
              <div className="max-w-md space-y-4">
                <div className="h-14 w-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mx-auto shadow-sm">
                  <MailOutlineIcon sx={{ fontSize: 28 }} />
                </div>
                <h2 className="text-lg font-bold text-[#1C252E] dark:text-white">Reconnect your Microsoft Mailbox</h2>
                <p className="text-xs text-[#919EAB] leading-relaxed">
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
                  className="h-10 px-6 rounded-xl bg-[#00a4ef] hover:bg-[#0078d4] text-white font-bold text-xs shadow-md transition-all inline-flex items-center gap-2"
                >
                  {oauthLoading ? <CircularProgress size={16} color="inherit" /> : null}
                  <span>Reconnect with Microsoft</span>
                </button>
              </div>
            ) : (
              <div className="w-full max-w-lg">
                <MailboxConnectCard onSuccess={() => refetchStatus()} />
              </div>
            )}
          </div>
        ) : (
          <>
            {/* ========================================================= */}
            {/* COLUMN 2: EMAIL CONVERSATION LIST                        */}
            {/* ========================================================= */}
            <div
              className={cn(
                "w-full md:w-[280px] lg:w-[320px] shrink-0 p-3.5 sm:p-4 flex flex-col gap-3 overflow-hidden border-r border-slate-100 dark:border-slate-800/80 bg-transparent transition-all",
                mobileView !== "list" && "hidden md:flex"
              )}
            >
              {/* Mobile Back to Folders */}
              <div className="flex md:hidden items-center justify-between pb-1">
                <button
                  type="button"
                  onClick={() => setMobileView("folders")}
                  className="flex items-center gap-1 text-xs font-bold text-slate-600 dark:text-slate-300"
                >
                  <ArrowBackIcon sx={{ fontSize: 16 }} />
                  <span>Folders</span>
                </button>
                <span className="text-xs font-bold text-[#1C252E] dark:text-white capitalize">
                  {activeFolder}
                </span>
              </div>

              {/* Search Bar Input */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-900/60 shadow-2xs focus-within:border-slate-400 dark:focus-within:border-slate-500 transition-all">
                <SearchOutlinedIcon sx={{ fontSize: 19, color: "#919EAB" }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full bg-transparent border-none outline-none text-xs sm:text-[13px] text-[#1C252E] dark:text-white placeholder:text-[#919EAB] font-normal"
                />
              </div>

              {/* Emails Conversation List */}
              <div className="flex-1 min-h-0 overflow-y-auto space-y-1 pr-0.5 custom-scrollbar">
                {loadingList && mappedItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-2 text-[#919EAB]">
                    <CircularProgress size={20} />
                    <span className="text-xs">Loading conversations...</span>
                  </div>
                ) : mappedItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-14 text-center text-slate-400">
                    <MailOutlineIcon sx={{ fontSize: 36, color: "#919EAB", opacity: 0.6 }} />
                    <p className="text-xs font-medium mt-2 text-slate-500">No emails in this folder</p>
                  </div>
                ) : (
                  mappedItems.map((item) => {
                    const isSelected = item.threadId === selectedThreadId || item.id === selectedThreadId;
                    const initialLetter = (item.sender || "U").charAt(0).toUpperCase();
                    const color = getInitialsColor(item.sender || "U");

                    return (
                      <div
                        key={item.id}
                        onClick={() => handleSelectThread(item)}
                        className={cn(
                          "group p-3 rounded-xl cursor-pointer transition-all flex items-center gap-3 select-none",
                          isSelected
                            ? "bg-[#F4F6F8] dark:bg-slate-800/80 shadow-2xs"
                            : "hover:bg-[#F4F6F8]/60 dark:hover:bg-slate-800/40"
                        )}
                      >
                        {/* Avatar */}
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-2xs"
                          style={{ backgroundColor: color }}
                        >
                          {initialLetter}
                        </div>

                        {/* Sender, Subject snippet & time */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 leading-tight">
                            <span className={cn(
                              "text-[13px] truncate",
                              item.unread ? "font-bold text-[#1C252E] dark:text-white" : "font-semibold text-slate-700 dark:text-slate-300"
                            )}>
                              {item.sender}
                            </span>
                            <span className="text-[11px] font-medium text-[#919EAB] shrink-0">
                              {item.relativeTime}
                            </span>
                          </div>
                          <p className="text-[12px] text-[#919EAB] truncate mt-1">
                            {item.snippet}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* ========================================================= */}
            {/* COLUMN 3: EMAIL DETAIL & COMPOSER                        */}
            {/* ========================================================= */}
            <div
              className={cn(
                "flex-1 min-w-0 flex flex-col overflow-hidden bg-transparent",
                mobileView !== "detail" && "hidden md:flex"
              )}
            >
              {loadingDetail && !latestMessage ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-2 text-[#919EAB]">
                  <CircularProgress size={24} />
                  <span className="text-xs">Loading email thread...</span>
                </div>
              ) : selectedListItem || latestMessage ? (
                <>
                  {/* Top Action Bar */}
                  <div className="h-12 px-4 sm:px-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 shrink-0">
                    {/* Mobile Back Button */}
                    <button
                      type="button"
                      onClick={() => setMobileView("list")}
                      className="flex md:hidden items-center gap-1 text-xs font-bold text-slate-600 dark:text-slate-300"
                    >
                      <ArrowBackIcon sx={{ fontSize: 16 }} />
                      <span>List</span>
                    </button>

                    {/* Right Header Action Icons */}
                    <div className="flex items-center gap-1 sm:gap-2 ml-auto">
                      <button
                        type="button"
                        onClick={handleToggleStar}
                        className="p-1.5 rounded-lg text-[#637381] hover:text-[#1C252E] dark:text-[#919EAB] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Star"
                      >
                        {(activeThread?.isStarred ?? selectedListItem?.isStarred) ? (
                          <StarIcon sx={{ fontSize: 19, color: "#F59E0B" }} />
                        ) : (
                          <StarBorderOutlinedIcon sx={{ fontSize: 19 }} />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={handleToggleStar}
                        className="p-1.5 rounded-lg text-[#637381] hover:text-[#1C252E] dark:text-[#919EAB] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Important"
                      >
                        <LabelImportantOutlinedIcon sx={{ fontSize: 19 }} />
                      </button>

                      <button
                        type="button"
                        onClick={handleDelete}
                        className="p-1.5 rounded-lg text-[#637381] hover:text-[#1C252E] dark:text-[#919EAB] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Archive"
                      >
                        <ArchiveOutlinedIcon sx={{ fontSize: 19 }} />
                      </button>

                      <button
                        type="button"
                        onClick={handleMarkUnread}
                        className="p-1.5 rounded-lg text-[#637381] hover:text-[#1C252E] dark:text-[#919EAB] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Mark unread"
                      >
                        <MailOutlineIcon sx={{ fontSize: 19 }} />
                      </button>

                      <button
                        type="button"
                        onClick={handleDelete}
                        className="p-1.5 rounded-lg text-[#637381] hover:text-rose-600 dark:text-[#919EAB] dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Delete"
                      >
                        <DeleteOutlineIcon sx={{ fontSize: 19 }} />
                      </button>

                      <button
                        type="button"
                        onClick={() => toast.info("Conversation synced")}
                        className="p-1.5 rounded-lg text-[#637381] hover:text-[#1C252E] dark:text-[#919EAB] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="More"
                      >
                        <MoreVertIcon sx={{ fontSize: 19 }} />
                      </button>
                    </div>
                  </div>

                  {/* Subject Header & Quick Reply Actions */}
                  <div className="px-5 sm:px-7 pt-4 pb-1 shrink-0">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <h1 className="text-[15px] sm:text-[16px] font-bold text-[#1C252E] dark:text-white tracking-tight leading-snug">
                        {detailSubject}
                      </h1>

                      <div className="flex flex-col items-end shrink-0">
                        <div className="flex items-center gap-1 text-[#637381] dark:text-[#919EAB]">
                          <button
                            type="button"
                            onClick={() => handleCompose({ inReplyTo: latestMessage?._id, subject: `Re: ${detailSubject}`, to: detailSender.email || detailSender.name })}
                            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Reply"
                          >
                            <ReplyIcon sx={{ fontSize: 18 }} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCompose({ inReplyTo: latestMessage?._id, subject: `Re: ${detailSubject}`, to: detailSender.email || detailSender.name })}
                            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Reply all"
                          >
                            <ReplyAllIcon sx={{ fontSize: 18 }} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCompose({ subject: `Fwd: ${detailSubject}`, text: latestMessage?.bodyText || "" })}
                            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Forward"
                          >
                            <ForwardIcon sx={{ fontSize: 18 }} />
                          </button>
                        </div>
                        <span className="text-[11px] text-[#919EAB] font-normal mt-0.5">
                          {formatFullDate(detailDate)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Subtle Dashed Divider */}
                  <div className="border-b border-dashed border-slate-200 dark:border-slate-800 mx-5 sm:mx-7 my-3" />

                  {/* Sender Info Row */}
                  <div className="px-5 sm:px-7 py-1 flex items-start gap-3 shrink-0">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 mt-0.5 shadow-2xs"
                      style={{ backgroundColor: getInitialsColor(detailSender.name) }}
                    >
                      {detailSender.name.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex flex-col min-w-0">
                      <div className="flex flex-wrap items-baseline gap-1.5 leading-snug">
                        <span className="text-[13.5px] font-bold text-[#1C252E] dark:text-white">
                          {detailSender.name}
                        </span>
                        {detailSender.email && (
                          <span className="text-[12px] text-[#637381] dark:text-[#919EAB]">
                            &lt;{detailSender.email}&gt;
                          </span>
                        )}
                      </div>
                      <span className="text-[11.5px] text-[#919EAB] mt-0.5 truncate">
                        To: {detailRecipients}
                      </span>
                    </div>
                  </div>

                  {/* Email Content Body */}
                  <div className="flex-1 min-h-0 overflow-y-auto px-5 sm:px-7 py-4 text-[13.5px] text-[#212B36] dark:text-slate-200 leading-relaxed font-normal">
                    {threadMessages.length > 0 ? (
                      <div className="space-y-6">
                        {threadMessages.map((msg, index) => {
                          const isLast = index === threadMessages.length - 1;
                          return (
                            <div key={msg._id} className={cn(!isLast && "pb-4 border-b border-slate-100 dark:border-slate-800/60")}>
                              {msg.bodyHtml ? (
                                <div
                                  className="prose prose-sm dark:prose-invert max-w-none text-[#212B36] dark:text-slate-200"
                                  dangerouslySetInnerHTML={{ __html: msg.bodyHtml }}
                                />
                              ) : (
                                <p className="whitespace-pre-wrap">{msg.bodyText || "(No message body)"}</p>
                              )}

                              {/* Message Attachments */}
                              {msg.attachments && msg.attachments.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                                  {msg.attachments.map((att, aIdx) => (
                                    <a
                                      key={aIdx}
                                      href={att.storageUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                    >
                                      <span>📎 {att.fileName}</span>
                                      <span className="text-[10px] text-muted-foreground">({Math.round(att.sizeBytes / 1024)} KB)</span>
                                    </a>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{selectedListItem?.snippet || "(No content)"}</p>
                    )}
                  </div>

                  {/* Bottom Rich-Text Reply Composer */}
                  <div className="p-4 sm:p-6 pt-2 shrink-0">
                    <div className="rounded-2xl border border-slate-200/90 dark:border-slate-700/80 bg-white dark:bg-slate-900/40 p-3 shadow-2xs focus-within:border-slate-300 dark:focus-within:border-slate-600 transition-all">
                      {/* Toolbar Row 1: Formatting options */}
                      <div className="flex flex-wrap items-center gap-1 pb-2 border-b border-slate-100 dark:border-slate-800 text-[#637381] dark:text-[#919EAB]">
                        {/* Paragraph Dropdown */}
                        <button
                          type="button"
                          className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold text-[#1C252E] dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <span>Paragraph</span>
                          <KeyboardArrowDownOutlinedIcon sx={{ fontSize: 16 }} />
                        </button>

                        <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1" />

                        {/* Text Styling: B, I, U, S */}
                        <button
                          type="button"
                          onClick={() => toggleFormat("bold")}
                          className={cn(
                            "h-7 w-7 rounded-lg text-xs font-bold transition-colors flex items-center justify-center",
                            activeFormats.bold
                              ? "bg-slate-200 text-[#1C252E] dark:bg-slate-700 dark:text-white"
                              : "hover:bg-slate-100 dark:hover:bg-slate-800"
                          )}
                        >
                          B
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleFormat("italic")}
                          className={cn(
                            "h-7 w-7 rounded-lg text-xs italic font-serif transition-colors flex items-center justify-center",
                            activeFormats.italic
                              ? "bg-slate-200 text-[#1C252E] dark:bg-slate-700 dark:text-white"
                              : "hover:bg-slate-100 dark:hover:bg-slate-800"
                          )}
                        >
                          I
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleFormat("underline")}
                          className={cn(
                            "h-7 w-7 rounded-lg text-xs underline transition-colors flex items-center justify-center",
                            activeFormats.underline
                              ? "bg-slate-200 text-[#1C252E] dark:bg-slate-700 dark:text-white"
                              : "hover:bg-slate-100 dark:hover:bg-slate-800"
                          )}
                        >
                          U
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleFormat("strike")}
                          className={cn(
                            "h-7 w-7 rounded-lg text-xs line-through transition-colors flex items-center justify-center",
                            activeFormats.strike
                              ? "bg-slate-200 text-[#1C252E] dark:bg-slate-700 dark:text-white"
                              : "hover:bg-slate-100 dark:hover:bg-slate-800"
                          )}
                        >
                          S
                        </button>

                        <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1" />

                        {/* Lists & Alignment */}
                        <button
                          type="button"
                          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Bulleted list"
                        >
                          <FormatListBulletedOutlinedIcon sx={{ fontSize: 17 }} />
                        </button>

                        <button
                          type="button"
                          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Numbered list"
                        >
                          <FormatListNumberedOutlinedIcon sx={{ fontSize: 17 }} />
                        </button>

                        <button
                          type="button"
                          onClick={() => setActiveFormats((p) => ({ ...p, align: "left" }))}
                          className={cn(
                            "p-1 rounded transition-colors",
                            activeFormats.align === "left" && "bg-slate-100 text-[#1C252E] dark:bg-slate-800 dark:text-white"
                          )}
                          title="Align left"
                        >
                          <FormatAlignLeftOutlinedIcon sx={{ fontSize: 17 }} />
                        </button>

                        <button
                          type="button"
                          onClick={() => setActiveFormats((p) => ({ ...p, align: "center" }))}
                          className={cn(
                            "p-1 rounded transition-colors",
                            activeFormats.align === "center" && "bg-slate-100 text-[#1C252E] dark:bg-slate-800 dark:text-white"
                          )}
                          title="Align center"
                        >
                          <FormatAlignCenterOutlinedIcon sx={{ fontSize: 17 }} />
                        </button>

                        <button
                          type="button"
                          onClick={() => setActiveFormats((p) => ({ ...p, align: "right" }))}
                          className={cn(
                            "p-1 rounded transition-colors",
                            activeFormats.align === "right" && "bg-slate-100 text-[#1C252E] dark:bg-slate-800 dark:text-white"
                          )}
                          title="Align right"
                        >
                          <FormatAlignRightOutlinedIcon sx={{ fontSize: 17 }} />
                        </button>

                        <button
                          type="button"
                          onClick={() => setActiveFormats((p) => ({ ...p, align: "justify" }))}
                          className={cn(
                            "p-1 rounded transition-colors",
                            activeFormats.align === "justify" && "bg-slate-100 text-[#1C252E] dark:bg-slate-800 dark:text-white"
                          )}
                          title="Justify"
                        >
                          <FormatAlignJustifyOutlinedIcon sx={{ fontSize: 17 }} />
                        </button>
                      </div>

                      {/* Toolbar Row 2: Secondary media & tools */}
                      <div className="flex items-center justify-between pt-1 text-[#637381] dark:text-[#919EAB]">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Insert link"
                          >
                            <InsertLinkOutlinedIcon sx={{ fontSize: 18 }} />
                          </button>

                          <button
                            type="button"
                            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Remove link"
                          >
                            <LinkOffOutlinedIcon sx={{ fontSize: 18 }} />
                          </button>

                          <button
                            type="button"
                            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Add image"
                          >
                            <ImageOutlinedIcon sx={{ fontSize: 18 }} />
                          </button>

                          <button
                            type="button"
                            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Indent"
                          >
                            <FormatIndentIncreaseOutlinedIcon sx={{ fontSize: 18 }} />
                          </button>

                          <button
                            type="button"
                            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Clear formatting"
                          >
                            <FormatClearOutlinedIcon sx={{ fontSize: 18 }} />
                          </button>

                          <button
                            type="button"
                            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Fullscreen"
                          >
                            <CropFreeOutlinedIcon sx={{ fontSize: 17 }} />
                          </button>
                        </div>

                        {/* Send Reply Button */}
                        <button
                          type="button"
                          onClick={handleSendReply}
                          disabled={sendEmailMutation.isPending}
                          className="px-3.5 py-1.5 rounded-xl bg-[#1C252E] hover:bg-[#28323D] dark:bg-white dark:hover:bg-slate-100 text-white dark:text-[#1C252E] font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs disabled:opacity-50"
                        >
                          {sendEmailMutation.isPending ? (
                            <CircularProgress size={12} color="inherit" />
                          ) : (
                            <>
                              <span>Reply</span>
                              <SendIcon sx={{ fontSize: 13 }} />
                            </>
                          )}
                        </button>
                      </div>

                      {/* Typing Textarea */}
                      <textarea
                        rows={2}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write a message..."
                        className={cn(
                          "w-full bg-transparent border-none outline-none text-xs sm:text-[13px] text-[#1C252E] dark:text-white placeholder:text-[#919EAB] resize-none pt-2 font-normal",
                          activeFormats.bold && "font-bold",
                          activeFormats.italic && "italic",
                          activeFormats.underline && "underline",
                          activeFormats.strike && "line-through",
                          activeFormats.align === "center" && "text-center",
                          activeFormats.align === "right" && "text-right",
                          activeFormats.align === "justify" && "text-justify"
                        )}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
                  <MailOutlineIcon sx={{ fontSize: 44, color: "#919EAB", opacity: 0.5 }} />
                  <p className="text-sm font-semibold mt-3 text-slate-600 dark:text-slate-300">
                    Select an email to view details
                  </p>
                </div>
              )}
            </div>
          </>
        )}
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
