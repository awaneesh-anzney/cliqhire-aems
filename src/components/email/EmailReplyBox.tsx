"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Email, EmailThread } from "@/types/email";
import { emailService } from "@/services/emailService";
import { useEmailSignatures } from "@/hooks/useEmailSignatures";
import { EmailRichEditor, EmailRichEditorRef } from "./EmailRichEditor";
import { EmailAddressSelector } from "./EmailAddressSelector";

// MUI Components
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Badge from "@mui/material/Badge";

// MUI Icons
import ReplyIcon from "@mui/icons-material/Reply";
import ReplyAllIcon from "@mui/icons-material/ReplyAll";
import ForwardIcon from "@mui/icons-material/Forward";
import SendIcon from "@mui/icons-material/Send";
import AttachFileOutlinedIcon from "@mui/icons-material/AttachFileOutlined";
import TextFormatOutlinedIcon from "@mui/icons-material/TextFormatOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import OpenInNewOutlinedIcon from "@mui/icons-material/OpenInNewOutlined";
import KeyboardArrowDownOutlinedIcon from "@mui/icons-material/KeyboardArrowDownOutlined";
import CloseIcon from "@mui/icons-material/Close";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DriveFileRenameOutlineOutlinedIcon from "@mui/icons-material/DriveFileRenameOutlineOutlined";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import TableChartOutlinedIcon from "@mui/icons-material/TableChartOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import FolderZipOutlinedIcon from "@mui/icons-material/FolderZipOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";

export type ReplyMode = "reply" | "replyAll" | "forward";

export interface EmailReplyBoxProps {
  latestMessage: Email | null;
  thread: EmailThread | null;
  isOpen: boolean;
  initialMode?: ReplyMode;
  onOpenChange: (open: boolean) => void;
  onSend: (payload: {
    to: string | string[];
    cc?: string | string[];
    bcc?: string | string[];
    subject: string;
    html: string;
    threadId?: string;
    inReplyTo?: string;
    attachments?: File[];
  }) => Promise<void>;
  isSending?: boolean;
  onPopOut?: (initialData: {
    to?: string[];
    cc?: string[];
    bcc?: string[];
    subject?: string;
    threadId?: string;
    inReplyTo?: string;
    html?: string;
    attachments?: File[];
  }) => void;
  className?: string;
}

const MAX_ATTACHMENTS = 5;
const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15MB
const BLOCKED_EXTENSIONS = [".exe", ".bat", ".cmd", ".sh", ".msi", ".dll", ".scr"];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateRecipient(recipient: string): boolean {
  if (/<(.+?)>/.test(recipient)) {
    const match = recipient.match(/<(.+?)>/);
    return match ? EMAIL_REGEX.test(match[1]) : false;
  }
  return EMAIL_REGEX.test(recipient.trim());
}

function formatRecipient(input: string): string {
  input = input.trim();
  if (/<.+@.+>/.test(input)) {
    return input;
  }
  const emailMatch = input.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
  if (!emailMatch) return input;

  const email = emailMatch[1];
  let namePart = input.replace(email, "").trim();

  if (!namePart) {
    namePart = email.split("@")[0];
    namePart = namePart
      .split(/[._-]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  namePart = namePart.replace(/[<>"]/g, "").trim();
  return `${namePart} <${email}>`;
}

export function EmailReplyBox({
  latestMessage,
  thread,
  isOpen,
  initialMode = "reply",
  onOpenChange,
  onSend,
  isSending = false,
  onPopOut,
  className,
}: EmailReplyBoxProps) {
  const [mode, setMode] = useState<ReplyMode>(initialMode);
  const [toRecipients, setToRecipients] = useState<string[]>([]);
  const [ccRecipients, setCcRecipients] = useState<string[]>([]);
  const [bccRecipients, setBccRecipients] = useState<string[]>([]);
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [showSubject, setShowSubject] = useState(false);
  const [subject, setSubject] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [bodyText, setBodyText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [showFormattingBar, setShowFormattingBar] = useState(true);
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Raw typing input states for chip inputs
  const [toInputValue, setToInputValue] = useState("");
  const [ccInputValue, setCcInputValue] = useState("");
  const [bccInputValue, setBccInputValue] = useState("");

  const toInputRef = useRef<HTMLInputElement>(null);
  const ccInputRef = useRef<HTMLInputElement>(null);
  const bccInputRef = useRef<HTMLInputElement>(null);

  // Signatures hook
  const { signatures, defaultReplySignature, getSignatureById } = useEmailSignatures();
  const [activeSignatureId, setActiveSignatureId] = useState<string | null>(null);
  const [signatureMenuAnchor, setSignatureMenuAnchor] = useState<null | HTMLElement>(null);

  // Mode switcher dropdown menu
  const [modeMenuAnchor, setModeMenuAnchor] = useState<null | HTMLElement>(null);

  const editorRef = useRef<EmailRichEditorRef>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastLoadedModeRef = useRef<ReplyMode | null>(null);

  // Helper to add recipients to a specific list
  const addRecipients = useCallback(
    (
      targetList: "to" | "cc" | "bcc",
      rawEmails: string[],
      currentList: string[],
      setter: React.Dispatch<React.SetStateAction<string[]>>
    ) => {
      const cleaned = rawEmails
        .map((e) => e.trim().replace(/^[<"']+|[>"']+$/g, ""))
        .filter((e) => e.length > 0);

      if (cleaned.length === 0) return;
      const unique = Array.from(new Set([...currentList, ...cleaned]));
      setter(unique);
    },
    []
  );

  // Load reply-info from server or compute defaults when opened or mode changes
  const loadReplyInfo = useCallback(
    async (targetMode: ReplyMode) => {
      if (!latestMessage) return;

      const cleanSubject = latestMessage.subject?.replace(/^(Re:\s*|Fwd:\s*)+/i, "") || "";
      const subjectPrefix = targetMode === "forward" ? "Fwd: " : "Re: ";
      const fallbackSubject = `${subjectPrefix}${cleanSubject}`;

      // 1. FORWARD MODE: To is empty, Subject prefilled, original body quoted
      if (targetMode === "forward") {
        setToRecipients([]);
        setCcRecipients([]);
        setBccRecipients([]);
        setShowCc(false);
        setShowBcc(false);
        setSubject(fallbackSubject);
        setShowSubject(true);

        const senderStr = latestMessage.fromName
          ? `${latestMessage.fromName} &lt;${latestMessage.fromEmail || latestMessage.from}&gt;`
          : latestMessage.from || latestMessage.fromEmail || "";

        const toStr = (latestMessage.toRecipients && latestMessage.toRecipients.length > 0)
          ? latestMessage.toRecipients.map(r => r.name ? `${r.name} &lt;${r.email}&gt;` : r.email).join(", ")
          : (latestMessage.to || []).join(", ");

        const forwardedHeader = `<p><br/></p><hr/><p><strong>---------- Forwarded message ---------</strong><br/><strong>From:</strong> ${senderStr}<br/><strong>Date:</strong> ${
          latestMessage.sentAt || latestMessage.receivedAt || ""
        }<br/><strong>Subject:</strong> ${
          latestMessage.subject || ""
        }<br/><strong>To:</strong> ${toStr}</p>`;

        const initialHtml = (latestMessage.bodyHtml || `<p>${latestMessage.bodyText || ""}</p>`) + forwardedHeader;

        setBodyHtml(initialHtml);
        editorRef.current?.setContent(initialHtml);
        lastLoadedModeRef.current = targetMode;
        return;
      }

      // 2. REPLY & REPLY ALL MODE:
      const defaultTo = latestMessage.from || latestMessage.fromEmail || "";
      setToRecipients(defaultTo ? [defaultTo] : []);
      setSubject(fallbackSubject);

      try {
        setLoadingInfo(true);
        const res = await emailService.getReplyInfo(latestMessage._id, targetMode);
        if (res.success && res.data) {
          const info = res.data;
          setToRecipients(info.to.map((r) => r.address || (r.name ? `${r.name} <${r.email}>` : r.email)));

          const ccList = info.cc.map((r) => r.address || (r.name ? `${r.name} <${r.email}>` : r.email));
          setCcRecipients(ccList);
          if (ccList.length > 0) setShowCc(true);

          const bccList = info.bcc?.map((r) => r.address || (r.name ? `${r.name} <${r.email}>` : r.email)) || [];
          setBccRecipients(bccList);
          if (bccList.length > 0) setShowBcc(true);

          if (info.subject) {
            setSubject(info.subject);
          }
        }
      } catch (err: any) {
        console.warn("Could not fetch reply-info from server, fallback to local headers:", err);
      } finally {
        setLoadingInfo(false);
      }

      // Inject default reply signature if configured
      if (defaultReplySignature) {
        const sigBlock = `<div class="gmail_signature" data-signature-block="true">${defaultReplySignature.contentHtml}</div>`;
        const initialWithSig = `<p><br/></p>${sigBlock}`;
        setBodyHtml(initialWithSig);
        editorRef.current?.setContent(initialWithSig);
        setActiveSignatureId(defaultReplySignature._id || defaultReplySignature.id || "");
      } else {
        setBodyHtml("");
        editorRef.current?.setContent("");
      }

      lastLoadedModeRef.current = targetMode;
    },
    [latestMessage, defaultReplySignature]
  );

  // Sync mode when initialMode prop changes or isOpen becomes true
  useEffect(() => {
    if (isOpen && latestMessage) {
      if (initialMode !== mode || lastLoadedModeRef.current !== initialMode) {
        setMode(initialMode);
        loadReplyInfo(initialMode);
      }
      setTimeout(() => {
        containerRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
        editorRef.current?.focus();
      }, 120);
    }
  }, [isOpen, initialMode, latestMessage?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle mode switch from dropdown
  const handleSwitchMode = (newMode: ReplyMode) => {
    setMode(newMode);
    setModeMenuAnchor(null);
    loadReplyInfo(newMode);
  };

  // Signature switching & insertion
  const handleSelectSignature = (sigId: string | null) => {
    setActiveSignatureId(sigId);
    setSignatureMenuAnchor(null);
    let currentHtml = editorRef.current?.getHTML() || bodyHtml || "";

    const sigRegex = /<div class="gmail_signature"[\s\S]*?<\/div>(\s*<\/div>)?/i;

    if (sigId) {
      const sig = getSignatureById(sigId);
      if (!sig) return;
      const sigBlock = `<div class="gmail_signature" data-signature-block="true">${sig.contentHtml}</div>`;

      if (sigRegex.test(currentHtml)) {
        currentHtml = currentHtml.replace(sigRegex, sigBlock);
      } else {
        currentHtml = currentHtml ? `${currentHtml}<p><br/></p>${sigBlock}` : `<p><br/></p>${sigBlock}`;
      }
      toast.success(`Inserted "${sig.name}" signature`);
    } else {
      currentHtml = currentHtml.replace(sigRegex, "");
      toast.info("Signature removed");
    }

    setBodyHtml(currentHtml);
    editorRef.current?.setContent(currentHtml);
  };

  // Attachment handling
  const handleFileSelect = (selectedFiles: File[]) => {
    if (files.length + selectedFiles.length > MAX_ATTACHMENTS) {
      toast.error(`You can attach up to ${MAX_ATTACHMENTS} files maximum.`);
      return;
    }

    const validFiles: File[] = [];
    for (const file of selectedFiles) {
      const ext = "." + (file.name.split(".").pop() || "").toLowerCase();
      if (BLOCKED_EXTENSIONS.includes(ext)) {
        toast.error(`File type ${ext} is not allowed as an attachment.`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast.error(`File "${file.name}" exceeds the 15MB limit.`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      setFiles((prev) => [...prev, ...validFiles]);
      toast.success(`Attached ${validFiles.length} file${validFiles.length > 1 ? "s" : ""}`);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getAttachmentMeta = (fileName: string) => {
    const lower = fileName.toLowerCase();
    if (lower.endsWith(".pdf")) {
      return {
        icon: <PictureAsPdfOutlinedIcon sx={{ fontSize: 15, color: "#E11D48" }} />,
        chipStyle: "border-rose-200 dark:border-rose-900/50 bg-rose-50/70 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300",
      };
    }
    if (lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".webp") || lower.endsWith(".gif")) {
      return {
        icon: <ImageOutlinedIcon sx={{ fontSize: 15, color: "#8E33FF" }} />,
        chipStyle: "border-purple-200 dark:border-purple-900/50 bg-purple-50/70 dark:bg-purple-950/20 text-purple-700 dark:text-purple-300",
      };
    }
    if (lower.endsWith(".xls") || lower.endsWith(".xlsx") || lower.endsWith(".csv")) {
      return {
        icon: <TableChartOutlinedIcon sx={{ fontSize: 15, color: "#00A76F" }} />,
        chipStyle: "border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/70 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300",
      };
    }
    if (lower.endsWith(".doc") || lower.endsWith(".docx")) {
      return {
        icon: <DescriptionOutlinedIcon sx={{ fontSize: 15, color: "#1877F2" }} />,
        chipStyle: "border-blue-200 dark:border-blue-900/50 bg-blue-50/70 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300",
      };
    }
    if (lower.endsWith(".zip") || lower.endsWith(".rar") || lower.endsWith(".tar") || lower.endsWith(".gz")) {
      return {
        icon: <FolderZipOutlinedIcon sx={{ fontSize: 15, color: "#F59E0B" }} />,
        chipStyle: "border-amber-200 dark:border-amber-900/50 bg-amber-50/70 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300",
      };
    }
    return {
      icon: <InsertDriveFileOutlinedIcon sx={{ fontSize: 15, color: "#637381" }} />,
      chipStyle: "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300",
    };
  };

  // Dispatch reply send
  const handleSendReply = async () => {
    // Commit any uncommitted text in toInputValue
    let effectiveTo = [...toRecipients];
    if (toInputValue.trim()) {
      effectiveTo = Array.from(new Set([...effectiveTo, toInputValue.trim()]));
      setToRecipients(effectiveTo);
      setToInputValue("");
    }

    let effectiveCc = [...ccRecipients];
    if (ccInputValue.trim()) {
      effectiveCc = Array.from(new Set([...effectiveCc, ccInputValue.trim()]));
      setCcRecipients(effectiveCc);
      setCcInputValue("");
    }

    let effectiveBcc = [...bccRecipients];
    if (bccInputValue.trim()) {
      effectiveBcc = Array.from(new Set([...effectiveBcc, bccInputValue.trim()]));
      setBccRecipients(effectiveBcc);
      setBccInputValue("");
    }

    if (effectiveTo.length === 0 && mode !== "forward") {
      toast.error("Please add at least one recipient email address.");
      toInputRef.current?.focus();
      return;
    }
    if (!subject.trim()) {
      toast.error("Please enter a subject line.");
      setShowSubject(true);
      return;
    }

    const currentEditorHtml = editorRef.current?.getHTML() || bodyHtml;
    const finalHtml = currentEditorHtml.trim() || (bodyText ? `<p>${bodyText.replace(/\n/g, "<br/>")}</p>` : "<p></p>");

    try {
      await onSend({
        to: effectiveTo.length === 1 ? formatRecipient(effectiveTo[0]) : effectiveTo.map(formatRecipient),
        cc: effectiveCc.length > 0 ? (effectiveCc.length === 1 ? formatRecipient(effectiveCc[0]) : effectiveCc.map(formatRecipient)) : undefined,
        bcc: effectiveBcc.length > 0 ? (effectiveBcc.length === 1 ? formatRecipient(effectiveBcc[0]) : effectiveBcc.map(formatRecipient)) : undefined,
        subject,
        html: finalHtml,
        threadId: mode === "forward" ? undefined : thread?._id || latestMessage?.threadId,
        inReplyTo: mode === "forward" ? undefined : latestMessage?._id,
        attachments: files.length > 0 ? files : undefined,
      });

      // SUCCESS: Reset all fields and collapse reply box
      setToRecipients([]);
      setCcRecipients([]);
      setBccRecipients([]);
      setShowCc(false);
      setShowBcc(false);
      setShowSubject(false);
      setSubject("");
      setBodyHtml("");
      setBodyText("");
      setFiles([]);
      lastLoadedModeRef.current = null;
      onOpenChange(false);
    } catch {
      // ON SEND FAILURE: Keep reply box open so user's draft & files are preserved!
    }
  };

  // Discard draft & collapse
  const handleDiscard = () => {
    if (bodyText.trim() || files.length > 0) {
      if (!window.confirm("Discard unsent reply draft?")) return;
    }
    setToRecipients([]);
    setCcRecipients([]);
    setBccRecipients([]);
    setShowCc(false);
    setShowBcc(false);
    setShowSubject(false);
    setSubject("");
    setBodyHtml("");
    setBodyText("");
    setFiles([]);
    lastLoadedModeRef.current = null;
    onOpenChange(false);
  };

  // Pop out to full EmailComposerDialog
  const handlePopOut = () => {
    if (onPopOut) {
      onPopOut({
        to: toRecipients,
        cc: ccRecipients,
        bcc: bccRecipients,
        subject,
        threadId: mode === "forward" ? undefined : thread?._id || latestMessage?.threadId,
        inReplyTo: mode === "forward" ? undefined : latestMessage?._id,
        html: editorRef.current?.getHTML() || bodyHtml,
        attachments: files,
      });
      onOpenChange(false);
    }
  };

  // Global Ctrl+Enter shortcut in reply box
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSendReply();
    }
  };

  // Drag and Drop files onto reply box
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(Array.from(e.dataTransfer.files));
    }
  };

  // Mode badge icon & label
  const getModeInfo = () => {
    switch (mode) {
      case "replyAll":
        return { label: "Reply all", icon: <ReplyAllIcon sx={{ fontSize: 16 }} /> };
      case "forward":
        return { label: "Forward", icon: <ForwardIcon sx={{ fontSize: 16 }} /> };
      default:
        return { label: "Reply", icon: <ReplyIcon sx={{ fontSize: 16 }} /> };
    }
  };

  const modeInfo = getModeInfo();
  const senderDisplayName = latestMessage?.fromName?.trim() || latestMessage?.fromEmail || latestMessage?.from || "Sender";

  // =========================================================================
  // 1. COLLAPSED GMAIL / OUTLOOK STYLE PROMPT PLACEHOLDER (When not open)
  // =========================================================================
  if (!isOpen) {
    const hasMultiple =
      (latestMessage?.toRecipients?.length || latestMessage?.to?.length || 0) +
        (latestMessage?.ccRecipients?.length || latestMessage?.cc?.length || 0) >
        1 || (thread?.participants?.length || 0) > 2;

    return (
      <div className={cn("p-4 sm:p-5 pt-3 border-t border-slate-100 dark:border-slate-800 shrink-0", className)}>
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-[#1C252E] shadow-2xs hover:shadow-sm transition-all p-2 sm:p-2.5 flex flex-wrap items-center justify-between gap-2.5">
          {/* Main prompt bar */}
          <div
            onClick={() => {
              setMode("reply");
              onOpenChange(true);
            }}
            className="flex-1 min-w-[220px] h-10 px-3.5 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100/80 dark:hover:bg-slate-800 text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2.5 cursor-pointer transition-all active:scale-[0.99]"
          >
            <div className="w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-[#1877F2]">
              <ReplyIcon sx={{ fontSize: 14 }} />
            </div>
            <span className="truncate">Reply to <strong className="text-slate-700 dark:text-slate-200">{senderDisplayName}</strong>...</span>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => {
                setMode("reply");
                onOpenChange(true);
              }}
              className="h-9 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-[#1C252E] hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 shadow-2xs transition-all active:scale-[0.98] cursor-pointer"
            >
              <ReplyIcon sx={{ fontSize: 15, color: "#1877F2" }} />
              <span>Reply</span>
            </button>

            {hasMultiple && (
              <button
                type="button"
                onClick={() => {
                  setMode("replyAll");
                  onOpenChange(true);
                }}
                className="h-9 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-[#1C252E] hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 shadow-2xs transition-all active:scale-[0.98] cursor-pointer"
              >
                <ReplyAllIcon sx={{ fontSize: 15, color: "#1877F2" }} />
                <span>Reply all</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setMode("forward");
                onOpenChange(true);
              }}
              className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-[#1C252E] hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 shadow-2xs transition-all active:scale-[0.98] cursor-pointer"
            >
              <ForwardIcon sx={{ fontSize: 15, color: "#637381" }} />
              <span>Forward</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. EXPANDED GMAIL / OUTLOOK INLINE REPLY CHASSIS
  // =========================================================================
  return (
    <div
      ref={containerRef}
      onKeyDown={handleKeyDown}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "p-3 sm:p-5 pt-2 border-t border-slate-200/90 dark:border-slate-800 shrink-0 font-['Public_Sans',sans-serif]",
        className
      )}
    >
      <div className="rounded-2xl border border-slate-200/90 dark:border-slate-700/90 bg-white dark:bg-[#1C252E] shadow-[0_4px_20px_-4px_rgba(145,158,171,0.16)] flex flex-col overflow-hidden transition-all duration-200 relative">
        {/* Drag & Drop Visual Overlay */}
        {isDraggingOver && (
          <div className="absolute inset-0 z-30 bg-blue-500/10 border-2 border-dashed border-[#1877F2] rounded-2xl flex items-center justify-center pointer-events-none backdrop-blur-[2px]">
            <div className="flex items-center gap-2 text-xs font-bold text-[#1877F2] bg-white dark:bg-slate-900 px-4 py-2.5 rounded-xl shadow-lg border border-blue-200 dark:border-blue-800">
              <AttachFileOutlinedIcon sx={{ fontSize: 18 }} />
              <span>Drop files here to attach (up to 15MB each)</span>
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* A. INTEGRATED HEADER: MODE DROPDOWN + RECIPIENTS CHIPS + CONTROLS     */}
        {/* ===================================================================== */}
        <div className="bg-slate-50/70 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-800">
          {/* TOP TO ROW (Gmail style: Mode dropdown on left + To Chips + Right toggles) */}
          <div
            onClick={() => toInputRef.current?.focus()}
            className="px-3 sm:px-3.5 py-2 flex flex-wrap items-center gap-1.5 min-h-[44px] cursor-text border-b border-slate-100/80 dark:border-slate-800/80"
          >
            {/* Mode Selector Pill button (Reply / Reply all / Forward) */}
            <div className="mr-1">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setModeMenuAnchor(e.currentTarget);
                }}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold text-[#1C252E] dark:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-colors"
              >
                <span className="text-[#1877F2]">{modeInfo.icon}</span>
                <span>{modeInfo.label}</span>
                <KeyboardArrowDownOutlinedIcon sx={{ fontSize: 15, color: "#637381" }} />
              </button>

              {/* Mode Menu Dropdown */}
              <Menu
                anchorEl={modeMenuAnchor}
                open={Boolean(modeMenuAnchor)}
                onClose={() => setModeMenuAnchor(null)}
                transformOrigin={{ horizontal: "left", vertical: "top" }}
                anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
                slotProps={{
                  paper: {
                    sx: {
                      borderRadius: "12px",
                      boxShadow: "0 8px 24px -4px rgba(145,158,171,0.2)",
                      mt: 0.5,
                      minWidth: 160,
                    },
                  },
                }}
              >
                <MenuItem
                  onClick={() => handleSwitchMode("reply")}
                  selected={mode === "reply"}
                  sx={{ fontSize: "12.5px", fontWeight: 600, gap: 1.5 }}
                >
                  <ReplyIcon sx={{ fontSize: 17, color: "#1877F2" }} />
                  <span>Reply</span>
                </MenuItem>
                <MenuItem
                  onClick={() => handleSwitchMode("replyAll")}
                  selected={mode === "replyAll"}
                  sx={{ fontSize: "12.5px", fontWeight: 600, gap: 1.5 }}
                >
                  <ReplyAllIcon sx={{ fontSize: 17, color: "#1877F2" }} />
                  <span>Reply all</span>
                </MenuItem>
                <MenuItem
                  onClick={() => handleSwitchMode("forward")}
                  selected={mode === "forward"}
                  sx={{ fontSize: "12.5px", fontWeight: 600, gap: 1.5 }}
                >
                  <ForwardIcon sx={{ fontSize: 17, color: "#637381" }} />
                  <span>Forward</span>
                </MenuItem>
                <Divider sx={{ my: 0.5 }} />
                <MenuItem
                  onClick={() => {
                    setShowSubject((prev) => !prev);
                    setModeMenuAnchor(null);
                  }}
                  sx={{ fontSize: "12.5px", fontWeight: 500, gap: 1.5 }}
                >
                  <EditOutlinedIcon sx={{ fontSize: 16, color: "#637381" }} />
                  <span>{showSubject ? "Hide subject" : "Edit subject"}</span>
                </MenuItem>
              </Menu>
            </div>

            {/* To Label */}
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 select-none mr-1">
              To:
            </span>

            {/* To Chips */}
            {toRecipients.map((recipient, index) => {
              const isValid = validateRecipient(recipient);
              return (
                <div
                  key={index}
                  className={cn(
                    "inline-flex items-center gap-1 h-6 pl-2 pr-1 rounded-lg text-[11px] font-semibold border transition-all shadow-2xs",
                    isValid
                      ? "bg-blue-50/80 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border-blue-200/80 dark:border-blue-900/60"
                      : "bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-900/60"
                  )}
                >
                  <span className="truncate max-w-[190px]">{recipient}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setToRecipients((prev) => prev.filter((_, i) => i !== index));
                    }}
                    className="p-0.5 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors text-slate-500"
                    title="Remove recipient"
                  >
                    <CloseIcon sx={{ fontSize: 13 }} />
                  </button>
                </div>
              );
            })}

            {/* Inline Input for To */}
            <input
              ref={toInputRef}
              type="text"
              value={toInputValue}
              onChange={(e) => setToInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === "," || e.key === " ") {
                  e.preventDefault();
                  if (toInputValue.trim()) {
                    addRecipients("to", [toInputValue], toRecipients, setToRecipients);
                    setToInputValue("");
                  }
                } else if (e.key === "Backspace" && !toInputValue && toRecipients.length > 0) {
                  e.preventDefault();
                  setToRecipients((prev) => prev.slice(0, -1));
                }
              }}
              onPaste={(e) => {
                e.preventDefault();
                const pasteData = e.clipboardData.getData("text");
                const emails = pasteData.split(/[\s,;]+/).filter(Boolean);
                addRecipients("to", emails, toRecipients, setToRecipients);
              }}
              onBlur={() => {
                if (toInputValue.trim()) {
                  addRecipients("to", [toInputValue], toRecipients, setToRecipients);
                  setToInputValue("");
                }
              }}
              placeholder={toRecipients.length === 0 ? "Add recipients..." : ""}
              className="flex-1 min-w-[120px] bg-transparent outline-none text-xs text-[#1C252E] dark:text-white placeholder:text-[#919EAB] h-6"
            />

            {/* Right Quick Actions (Cc, Bcc, Subject, Stakeholders, Pop-out, Discard) */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="ml-auto flex items-center gap-1 sm:gap-1.5 shrink-0"
            >
              {loadingInfo && (
                <span className="text-[11px] text-[#919EAB] flex items-center gap-1 mr-1">
                  <CircularProgress size={11} color="inherit" />
                  <span className="hidden sm:inline">Loading...</span>
                </span>
              )}

              {/* Quick Contacts Directory Dropdowns */}
              <div className="hidden lg:flex items-center gap-1 mr-1">
                <EmailAddressSelector
                  initialType="client"
                  align="end"
                  title="Select Client Email"
                  onSelect={(email, contact) => {
                    const formatted = contact?.name ? `${contact.name} <${email}>` : email;
                    addRecipients("to", [formatted], toRecipients, setToRecipients);
                  }}
                  trigger={
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10.5px] font-bold bg-blue-500/10 text-blue-700 dark:text-blue-300 hover:bg-blue-500/20 border border-blue-200/60 dark:border-blue-900/50 transition-colors"
                      title="Add Client Email"
                    >
                      <BusinessOutlinedIcon sx={{ fontSize: 13 }} />
                      <span>Client</span>
                    </button>
                  }
                />
                <EmailAddressSelector
                  initialType="candidate"
                  align="end"
                  title="Select Candidate Email"
                  onSelect={(email, contact) => {
                    const formatted = contact?.name ? `${contact.name} <${email}>` : email;
                    addRecipients("to", [formatted], toRecipients, setToRecipients);
                  }}
                  trigger={
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10.5px] font-bold bg-rose-500/10 text-rose-700 dark:text-rose-300 hover:bg-rose-500/20 border border-rose-200/60 dark:border-rose-900/50 transition-colors"
                      title="Add Candidate Email"
                    >
                      <PersonOutlineOutlinedIcon sx={{ fontSize: 13 }} />
                      <span>Candidate</span>
                    </button>
                  }
                />
                <EmailAddressSelector
                  initialType="team"
                  align="end"
                  title="Select Team Member Email"
                  onSelect={(email, contact) => {
                    const formatted = contact?.name ? `${contact.name} <${email}>` : email;
                    addRecipients("to", [formatted], toRecipients, setToRecipients);
                  }}
                  trigger={
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10.5px] font-bold bg-purple-500/10 text-purple-700 dark:text-purple-300 hover:bg-purple-500/20 border border-purple-200/60 dark:border-purple-900/50 transition-colors"
                      title="Add Team Member Email"
                    >
                      <GroupsOutlinedIcon sx={{ fontSize: 13 }} />
                      <span>Team</span>
                    </button>
                  }
                />
              </div>

              {!showCc && (
                <button
                  type="button"
                  onClick={() => {
                    setShowCc(true);
                    setTimeout(() => ccInputRef.current?.focus(), 50);
                  }}
                  className="px-1.5 py-0.5 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 rounded hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
                  title="Add Cc recipient"
                >
                  Cc
                </button>
              )}

              {!showBcc && (
                <button
                  type="button"
                  onClick={() => {
                    setShowBcc(true);
                    setTimeout(() => bccInputRef.current?.focus(), 50);
                  }}
                  className="px-1.5 py-0.5 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 rounded hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
                  title="Add Bcc recipient"
                >
                  Bcc
                </button>
              )}

              {!showSubject && (
                <button
                  type="button"
                  onClick={() => setShowSubject(true)}
                  className="px-1.5 py-0.5 text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 rounded hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
                  title="Edit Subject"
                >
                  Subject
                </button>
              )}

              {onPopOut && (
                <Tooltip title="Pop out into separate window">
                  <IconButton
                    size="small"
                    onClick={handlePopOut}
                    sx={{ color: "#637381", "&:hover": { color: "#1C252E" } }}
                  >
                    <OpenInNewOutlinedIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              )}

              <Tooltip title="Discard draft">
                <IconButton
                  size="small"
                  onClick={handleDiscard}
                  sx={{ color: "#637381", "&:hover": { color: "#E11D48" } }}
                >
                  <CloseIcon sx={{ fontSize: 17 }} />
                </IconButton>
              </Tooltip>
            </div>
          </div>

          {/* CC RECIPIENTS ROW (Collapsible) */}
          {showCc && (
            <div
              onClick={() => ccInputRef.current?.focus()}
              className="px-3 sm:px-3.5 py-1.5 flex flex-wrap items-center gap-1.5 min-h-[38px] cursor-text border-b border-slate-100/80 dark:border-slate-800/80"
            >
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 select-none mr-1 w-7">
                Cc:
              </span>

              {ccRecipients.map((recipient, index) => {
                const isValid = validateRecipient(recipient);
                return (
                  <div
                    key={index}
                    className={cn(
                      "inline-flex items-center gap-1 h-6 pl-2 pr-1 rounded-lg text-[11px] font-semibold border transition-all shadow-2xs",
                      isValid
                        ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                        : "bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-900/60"
                    )}
                  >
                    <span className="truncate max-w-[190px]">{recipient}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCcRecipients((prev) => prev.filter((_, i) => i !== index));
                      }}
                      className="p-0.5 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors text-slate-500"
                      title="Remove Cc"
                    >
                      <CloseIcon sx={{ fontSize: 13 }} />
                    </button>
                  </div>
                );
              })}

              <input
                ref={ccInputRef}
                type="text"
                value={ccInputValue}
                onChange={(e) => setCcInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === "," || e.key === " ") {
                    e.preventDefault();
                    if (ccInputValue.trim()) {
                      addRecipients("cc", [ccInputValue], ccRecipients, setCcRecipients);
                      setCcInputValue("");
                    }
                  } else if (e.key === "Backspace" && !ccInputValue && ccRecipients.length > 0) {
                    e.preventDefault();
                    setCcRecipients((prev) => prev.slice(0, -1));
                  }
                }}
                onPaste={(e) => {
                  e.preventDefault();
                  const pasteData = e.clipboardData.getData("text");
                  const emails = pasteData.split(/[\s,;]+/).filter(Boolean);
                  addRecipients("cc", emails, ccRecipients, setCcRecipients);
                }}
                onBlur={() => {
                  if (ccInputValue.trim()) {
                    addRecipients("cc", [ccInputValue], ccRecipients, setCcRecipients);
                    setCcInputValue("");
                  }
                }}
                placeholder={ccRecipients.length === 0 ? "Cc recipients..." : ""}
                className="flex-1 min-w-[120px] bg-transparent outline-none text-xs text-[#1C252E] dark:text-white placeholder:text-[#919EAB] h-6"
              />

              <button
                type="button"
                onClick={() => {
                  setShowCc(false);
                  setCcRecipients([]);
                  setCcInputValue("");
                }}
                className="text-[11px] text-[#919EAB] hover:text-[#1C252E] dark:hover:text-white ml-auto"
              >
                Remove
              </button>
            </div>
          )}

          {/* BCC RECIPIENTS ROW (Collapsible) */}
          {showBcc && (
            <div
              onClick={() => bccInputRef.current?.focus()}
              className="px-3 sm:px-3.5 py-1.5 flex flex-wrap items-center gap-1.5 min-h-[38px] cursor-text border-b border-slate-100/80 dark:border-slate-800/80"
            >
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 select-none mr-1 w-7">
                Bcc:
              </span>

              {bccRecipients.map((recipient, index) => {
                const isValid = validateRecipient(recipient);
                return (
                  <div
                    key={index}
                    className={cn(
                      "inline-flex items-center gap-1 h-6 pl-2 pr-1 rounded-lg text-[11px] font-semibold border transition-all shadow-2xs",
                      isValid
                        ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                        : "bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border-rose-200/80 dark:border-rose-900/60"
                    )}
                  >
                    <span className="truncate max-w-[190px]">{recipient}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setBccRecipients((prev) => prev.filter((_, i) => i !== index));
                      }}
                      className="p-0.5 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors text-slate-500"
                      title="Remove Bcc"
                    >
                      <CloseIcon sx={{ fontSize: 13 }} />
                    </button>
                  </div>
                );
              })}

              <input
                ref={bccInputRef}
                type="text"
                value={bccInputValue}
                onChange={(e) => setBccInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === "," || e.key === " ") {
                    e.preventDefault();
                    if (bccInputValue.trim()) {
                      addRecipients("bcc", [bccInputValue], bccRecipients, setBccRecipients);
                      setBccInputValue("");
                    }
                  } else if (e.key === "Backspace" && !bccInputValue && bccRecipients.length > 0) {
                    e.preventDefault();
                    setBccRecipients((prev) => prev.slice(0, -1));
                  }
                }}
                onPaste={(e) => {
                  e.preventDefault();
                  const pasteData = e.clipboardData.getData("text");
                  const emails = pasteData.split(/[\s,;]+/).filter(Boolean);
                  addRecipients("bcc", emails, bccRecipients, setBccRecipients);
                }}
                onBlur={() => {
                  if (bccInputValue.trim()) {
                    addRecipients("bcc", [bccInputValue], bccRecipients, setBccRecipients);
                    setBccInputValue("");
                  }
                }}
                placeholder={bccRecipients.length === 0 ? "Bcc recipients..." : ""}
                className="flex-1 min-w-[120px] bg-transparent outline-none text-xs text-[#1C252E] dark:text-white placeholder:text-[#919EAB] h-6"
              />

              <button
                type="button"
                onClick={() => {
                  setShowBcc(false);
                  setBccRecipients([]);
                  setBccInputValue("");
                }}
                className="text-[11px] text-[#919EAB] hover:text-[#1C252E] dark:hover:text-white ml-auto"
              >
                Remove
              </button>
            </div>
          )}

          {/* SUBJECT ROW (Collapsible or editable) */}
          {showSubject && (
            <div className="px-3 sm:px-3.5 py-1.5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 select-none w-14 shrink-0">
                Subject:
              </span>
              <input
                type="text"
                placeholder="Subject line"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-transparent outline-none text-xs font-semibold text-[#1C252E] dark:text-white placeholder:text-[#919EAB] h-6"
              />
              <button
                type="button"
                onClick={() => setShowSubject(false)}
                className="text-[11px] text-[#919EAB] hover:text-[#1C252E] dark:hover:text-white ml-auto shrink-0"
              >
                Hide
              </button>
            </div>
          )}
        </div>

        {/* ===================================================================== */}
        {/* B. EDITOR BODY: FULL TIPTAP EDITOR                                    */}
        {/* ===================================================================== */}
        <div className="flex-1 min-h-[160px] max-h-[380px] overflow-y-auto flex flex-col p-1 bg-white dark:bg-[#1C252E]">
          <EmailRichEditor
            ref={editorRef}
            initialContent={bodyHtml}
            onChange={(html, text) => {
              setBodyHtml(html);
              setBodyText(text);
            }}
            showToolbar={showFormattingBar}
            placeholder="Write your reply here..."
            onAttachClick={() => fileInputRef.current?.click()}
          />
        </div>

        {/* ===================================================================== */}
        {/* C. ATTACHMENTS LIST CHIPS (If any attached)                           */}
        {/* ===================================================================== */}
        {files.length > 0 && (
          <div className="px-3.5 py-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 space-y-2 shrink-0 max-h-36 overflow-y-auto">
            <div className="flex items-center justify-between text-[11px] text-[#637381] font-medium">
              <span className="flex items-center gap-1.5 text-[#1C252E] dark:text-white font-bold">
                <AttachFileOutlinedIcon sx={{ fontSize: 15, color: "#1877F2" }} />
                <span>
                  Attachments ({files.length}/{MAX_ATTACHMENTS})
                </span>
              </span>
              <span className="text-[10.5px] text-[#919EAB]">Max 15MB each</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {files.map((file, idx) => {
                const meta = getAttachmentMeta(file.name);
                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-2 px-2.5 py-1 rounded-xl border text-xs shadow-2xs ${meta.chipStyle}`}
                  >
                    {meta.icon}
                    <span className="truncate max-w-[160px] text-[11.5px] font-semibold" title={file.name}>
                      {file.name}
                    </span>
                    <span className="text-[10px] opacity-75 font-medium">({formatFileSize(file.size)})</span>
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="p-0.5 hover:text-rose-600 rounded transition-colors"
                      title="Remove attachment"
                    >
                      <CloseIcon sx={{ fontSize: 13 }} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ===================================================================== */}
        {/* D. BOTTOM ACTION BAR: SEND + FORMATTING + ATTACH + SIGNATURE + DISCARD*/}
        {/* ===================================================================== */}
        <div className="px-3 sm:px-4 py-2 sm:py-2.5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-[#1C252E] flex items-center justify-between gap-2 shrink-0 select-none">
          {/* Left Actions: Send button + Tool items */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Primary Send / Submit Button */}
            <Tooltip title="Send reply (Ctrl + Enter)">
              <button
                type="button"
                id="email-reply-submit-button"
                data-testid="email-reply-submit-btn"
                onClick={handleSendReply}
                disabled={isSending}
                className="h-9 px-4 sm:px-5 rounded-xl bg-[#0078D4] hover:bg-[#006abc] active:bg-[#005ea6] text-white font-bold text-xs sm:text-[13px] flex items-center gap-1.5 shadow-sm shadow-[#0078D4]/25 transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer"
              >
                {isSending ? (
                  <>
                    <CircularProgress size={14} color="inherit" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <span>Send</span>
                    <SendIcon sx={{ fontSize: 14 }} />
                  </>
                )}
              </button>
            </Tooltip>

            {/* Toggle Formatting Toolbar */}
            <Tooltip title="Formatting options">
              <IconButton
                size="small"
                onClick={() => setShowFormattingBar((prev) => !prev)}
                sx={{
                  color: showFormattingBar ? "#1877F2" : "#637381",
                  bgcolor: showFormattingBar ? "rgba(24, 119, 242, 0.08)" : "transparent",
                  borderRadius: "10px",
                  "&:hover": { bgcolor: "rgba(24, 119, 242, 0.12)" },
                }}
              >
                <TextFormatOutlinedIcon sx={{ fontSize: 19 }} />
              </IconButton>
            </Tooltip>

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onClick={(e) => {
                (e.target as HTMLInputElement).value = "";
              }}
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleFileSelect(Array.from(e.target.files));
                }
              }}
              multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.rtf,.zip,.rar,.png,.jpg,.jpeg,.gif,.webp,image/*"
              className="hidden"
            />

            {/* Attach Files Button */}
            <Tooltip title="Attach files (Max 5 files, 15MB each)">
              <Badge
                badgeContent={files.length}
                color="primary"
                invisible={files.length === 0}
                sx={{
                  "& .MuiBadge-badge": {
                    fontSize: "10px",
                    height: 16,
                    minWidth: 16,
                    px: 0.5,
                  },
                }}
              >
                <IconButton
                  size="small"
                  onClick={() => fileInputRef.current?.click()}
                  sx={{
                    color: files.length > 0 ? "#1877F2" : "#637381",
                    bgcolor: files.length > 0 ? "rgba(24, 119, 242, 0.08)" : "transparent",
                    borderRadius: "10px",
                    "&:hover": { bgcolor: "rgba(145, 158, 171, 0.08)" },
                  }}
                >
                  <AttachFileOutlinedIcon sx={{ fontSize: 19 }} />
                </IconButton>
              </Badge>
            </Tooltip>

            {/* Signature Selector Button */}
            {signatures.length > 0 && (
              <>
                <Tooltip title="Insert signature">
                  <IconButton
                    size="small"
                    onClick={(e) => setSignatureMenuAnchor(e.currentTarget)}
                    sx={{
                      color: activeSignatureId ? "#1877F2" : "#637381",
                      bgcolor: activeSignatureId ? "rgba(24, 119, 242, 0.08)" : "transparent",
                      borderRadius: "10px",
                      "&:hover": { bgcolor: "rgba(145, 158, 171, 0.08)" },
                    }}
                  >
                    <DriveFileRenameOutlineOutlinedIcon sx={{ fontSize: 19 }} />
                  </IconButton>
                </Tooltip>

                <Menu
                  anchorEl={signatureMenuAnchor}
                  open={Boolean(signatureMenuAnchor)}
                  onClose={() => setSignatureMenuAnchor(null)}
                  slotProps={{
                    paper: {
                      sx: {
                        borderRadius: "12px",
                        boxShadow: "0 8px 24px -4px rgba(145,158,171,0.2)",
                        mt: 0.5,
                        minWidth: 180,
                      },
                    },
                  }}
                >
                  <MenuItem
                    onClick={() => handleSelectSignature(null)}
                    selected={activeSignatureId === null}
                    sx={{ fontSize: "12px" }}
                  >
                    No signature
                  </MenuItem>
                  <Divider sx={{ my: 0.5 }} />
                  {signatures.map((sig) => (
                    <MenuItem
                      key={sig._id || sig.id}
                      onClick={() => handleSelectSignature(sig._id || sig.id || null)}
                      selected={activeSignatureId === (sig._id || sig.id)}
                      sx={{ fontSize: "12px", display: "flex", justifyContent: "space-between" }}
                    >
                      <span className="font-semibold">{sig.name}</span>
                      {sig.isDefault && (
                        <span className="text-[10px] text-blue-600 bg-blue-50 dark:bg-blue-950/40 px-1.5 py-0.5 rounded font-bold">
                          Default
                        </span>
                      )}
                    </MenuItem>
                  ))}
                </Menu>
              </>
            )}
          </div>

          {/* Right Actions: Pop Out & Discard Draft */}
          <div className="flex items-center gap-1">
            {onPopOut && (
              <Tooltip title="Pop out into separate window">
                <IconButton
                  size="small"
                  onClick={handlePopOut}
                  sx={{
                    color: "#637381",
                    borderRadius: "10px",
                    "&:hover": { color: "#1C252E", bgcolor: "rgba(145, 158, 171, 0.08)" },
                  }}
                >
                  <OpenInNewOutlinedIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            )}

            <Tooltip title="Discard draft">
              <IconButton
                size="small"
                onClick={handleDiscard}
                sx={{
                  color: "#637381",
                  borderRadius: "10px",
                  "&:hover": { color: "#E11D48", bgcolor: "rgba(225, 29, 72, 0.08)" },
                }}
              >
                <DeleteOutlineIcon sx={{ fontSize: 19 }} />
              </IconButton>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
}
