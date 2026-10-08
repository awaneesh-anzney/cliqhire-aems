"use client";

import React, { useState, useRef, useEffect, useCallback, DragEvent } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Email, EmailThread } from "@/types/email";
import { emailService } from "@/services/emailService";
import { useSendEmail, useSaveDraft, useSendDraft, useUpdateDraft } from "@/hooks/useEmail";
import { useEmailSignatures } from "@/hooks/useEmailSignatures";
import { RecipientInput } from "./RecipientInput";
import { EmailRichEditor, EmailRichEditorRef } from "./EmailRichEditor";
import { EmailSignatureDialog } from "./EmailSignatureDialog";
import { EmailAddressSelector } from "./EmailAddressSelector";

// Material UI Components
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import Badge from "@mui/material/Badge";

// Material UI Icons
import SendIcon from "@mui/icons-material/Send";
import AttachFileOutlinedIcon from "@mui/icons-material/AttachFileOutlined";
import CloseIcon from "@mui/icons-material/Close";
import MinimizeIcon from "@mui/icons-material/Minimize";
import CropFreeOutlinedIcon from "@mui/icons-material/CropFreeOutlined";
import CloseFullscreenOutlinedIcon from "@mui/icons-material/CloseFullscreenOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import TextFormatOutlinedIcon from "@mui/icons-material/TextFormatOutlined";
import DriveFileRenameOutlineOutlinedIcon from "@mui/icons-material/DriveFileRenameOutlineOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import TableChartOutlinedIcon from "@mui/icons-material/TableChartOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import FolderZipOutlinedIcon from "@mui/icons-material/FolderZipOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import ReplyIcon from "@mui/icons-material/Reply";
import ReplyAllIcon from "@mui/icons-material/ReplyAll";
import ForwardIcon from "@mui/icons-material/Forward";
import KeyboardArrowDownOutlinedIcon from "@mui/icons-material/KeyboardArrowDownOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";

export type ReplyMode = "reply" | "replyAll" | "forward";

export interface ComposerInitialData {
  to?: string | string[] | any[];
  cc?: string | string[] | any[];
  bcc?: string | string[] | any[];
  subject?: string;
  threadId?: string;
  inReplyTo?: string;
  text?: string;
  html?: string;
  draftId?: string;
  attachments?: File[];
}

export interface EmailComposerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: ComposerInitialData;
  variant?: "floating" | "inline";
  // Specific to inline reply mode
  latestMessage?: Email | null;
  thread?: EmailThread | null;
  fallbackSender?: { name: string; email: string };
  initialReplyMode?: ReplyMode;
  actionTrigger?: { mode: ReplyMode; ts: number } | null;
  onSendReply?: (payload: {
    to: string | string[];
    cc?: string | string[];
    bcc?: string | string[];
    subject: string;
    html: string;
    threadId?: string;
    inReplyTo?: string;
    attachments?: File[];
  }) => Promise<void>;
  isSendingReply?: boolean;
  className?: string;
}

type WindowMode = "docked" | "minimized" | "fullscreen";

const MAX_ATTACHMENTS = 5;
const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15MB
const BLOCKED_EXTENSIONS = [".exe", ".bat", ".cmd", ".sh", ".msi", ".dll", ".scr"];

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

export const EmailComposerDialog: React.FC<EmailComposerDialogProps> = ({
  open,
  onOpenChange,
  initialData,
  variant = "floating",
  latestMessage,
  thread,
  fallbackSender,
  initialReplyMode = "reply",
  actionTrigger,
  onSendReply,
  isSendingReply = false,
  className,
}) => {
  const isInline = variant === "inline";

  // Mutations for floating compose mode
  const sendEmailMutation = useSendEmail();
  const saveDraftMutation = useSaveDraft();
  const updateDraftMutation = useUpdateDraft();
  const sendDraftMutation = useSendDraft();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<EmailRichEditorRef>(null);

  // Signatures
  const {
    signatures,
    defaultNewSignature,
    defaultReplySignature,
    getSignatureById,
  } = useEmailSignatures();

  const [signatureDialogOpen, setSignatureDialogOpen] = useState(false);
  const [activeSignatureId, setActiveSignatureId] = useState<string | null>(null);
  const [signatureMenuAnchor, setSignatureMenuAnchor] = useState<null | HTMLElement>(null);

  // Display states
  const [windowMode, setWindowMode] = useState<WindowMode>("docked");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(isInline);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Mode state for inline reply
  const [replyMode, setReplyMode] = useState<ReplyMode>(initialReplyMode);
  const [modeMenuAnchor, setModeMenuAnchor] = useState<null | HTMLElement>(null);
  const [loadingInfo, setLoadingInfo] = useState(false);
  const lastLoadedKeyRef = useRef<string | null>(null);

  // Form states
  const [toRecipients, setToRecipients] = useState<string[]>([]);
  const [showCc, setShowCc] = useState(false);
  const [ccRecipients, setCcRecipients] = useState<string[]>([]);
  const [showBcc, setShowBcc] = useState(false);
  const [bccRecipients, setBccRecipients] = useState<string[]>([]);
  const [showSubject, setShowSubject] = useState(isInline ? false : true);
  const [subject, setSubject] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [bodyText, setBodyText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [showFormattingBar, setShowFormattingBar] = useState(true);
  const [draftStatus, setDraftStatus] = useState<"saved" | "unsaved" | "saving">("saved");

  // Determine optimistic recipient for reply mode
  const computeDefaultRecipient = useCallback((): string => {
    if (latestMessage?.direction === "sent") {
      if (latestMessage.toRecipients && latestMessage.toRecipients.length > 0) {
        const r = latestMessage.toRecipients[0];
        return r.name ? `${r.name} <${r.email}>` : r.email;
      }
      if (latestMessage.to && latestMessage.to.length > 0) {
        return latestMessage.to[0];
      }
      if (fallbackSender?.email) {
        return fallbackSender.name ? `${fallbackSender.name} <${fallbackSender.email}>` : fallbackSender.email;
      }
    }

    if (latestMessage) {
      if (latestMessage.fromName && latestMessage.fromEmail) {
        return `${latestMessage.fromName} <${latestMessage.fromEmail}>`;
      }
      if (latestMessage.from) {
        return latestMessage.from;
      }
      if (latestMessage.fromEmail) {
        return latestMessage.fromEmail;
      }
    }

    if (fallbackSender?.email) {
      return fallbackSender.name ? `${fallbackSender.name} <${fallbackSender.email}>` : fallbackSender.email;
    }

    return "";
  }, [latestMessage, fallbackSender]);

  // Load reply information for inline reply mode
  const loadInlineReplyInfo = useCallback(
    async (targetMode: ReplyMode) => {
      if (!isInline || (!latestMessage && !fallbackSender)) return;

      const cleanSubject = latestMessage?.subject?.replace(/^(Re:\s*|Fwd:\s*)+/i, "") || "";
      const subjectPrefix = targetMode === "forward" ? "Fwd: " : "Re: ";
      const fallbackSubjectStr = `${subjectPrefix}${cleanSubject}`;

      if (targetMode === "forward") {
        setToRecipients([]);
        setCcRecipients([]);
        setBccRecipients([]);
        setShowCc(false);
        setShowBcc(false);
        setSubject(fallbackSubjectStr);
        setShowSubject(true);

        if (latestMessage) {
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

          const initialForwardHtml = (latestMessage.bodyHtml || `<p>${latestMessage.bodyText || ""}</p>`) + forwardedHeader;

          setBodyHtml(initialForwardHtml);
          editorRef.current?.setContent(initialForwardHtml);
        }
        return;
      }

      // Reply / Reply All mode
      const defaultTo = computeDefaultRecipient();
      setToRecipients(defaultTo ? [defaultTo] : []);
      setSubject(fallbackSubjectStr);

      if (latestMessage?._id) {
        try {
          setLoadingInfo(true);
          const res = await emailService.getReplyInfo(latestMessage._id, targetMode);
          if (res.success && res.data) {
            const info = res.data;
            if (info.to && info.to.length > 0) {
              setToRecipients(info.to.map((r) => r.address || (r.name ? `${r.name} <${r.email}>` : r.email)));
            }

            const ccList = (info.cc || []).map((r) => r.address || (r.name ? `${r.name} <${r.email}>` : r.email));
            setCcRecipients(ccList);
            if (ccList.length > 0) setShowCc(true);

            const bccList = (info.bcc || []).map((r) => r.address || (r.name ? `${r.name} <${r.email}>` : r.email));
            setBccRecipients(bccList);
            if (bccList.length > 0) setShowBcc(true);

            if (info.subject) {
              setSubject(info.subject);
            }
          }
        } catch (err: any) {
          console.warn("Could not fetch reply-info from server, fallback to computed recipient:", err);
        } finally {
          setLoadingInfo(false);
        }
      }

      // Inject default reply signature if configured and not present
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
    },
    [isInline, latestMessage, fallbackSender, computeDefaultRecipient, defaultReplySignature]
  );

  // Reset inline composer to collapsed state when thread/message changes
  useEffect(() => {
    if (isInline) {
      setIsCollapsed(true);
      setIsFullscreen(false);
      lastLoadedKeyRef.current = null;
    }
  }, [isInline, thread?._id, latestMessage?._id]);

  // Respond to top action triggers from EmailDetailPane (Open directly in Fullscreen)
  useEffect(() => {
    if (isInline && actionTrigger?.ts) {
      setReplyMode(actionTrigger.mode);
      setIsCollapsed(false);
      setIsFullscreen(true);
      loadInlineReplyInfo(actionTrigger.mode);
    }
  }, [actionTrigger, isInline, loadInlineReplyInfo]);

  // Sync initialData when opened in floating mode
  useEffect(() => {
    if (!isInline && open) {
      let initialHtml = "";
      let initialTxt = "";
      const isReply = !!initialData?.threadId;
      const targetDefaultSig = isReply ? defaultReplySignature : defaultNewSignature;

      if (initialData) {
        if (initialData.to) {
          if (Array.isArray(initialData.to)) {
            const parsed = initialData.to
              .map((e: any) => (typeof e === "string" ? e : e.address || (e.name ? `${e.name} <${e.email}>` : e.email)))
              .filter(Boolean);
            setToRecipients(parsed);
          } else {
            const parsedTo = initialData.to.split(/[\s,;]+/).filter(Boolean);
            setToRecipients(parsedTo);
          }
        }
        if (initialData.cc) {
          if (Array.isArray(initialData.cc)) {
            const parsed = initialData.cc
              .map((e: any) => (typeof e === "string" ? e : e.address || (e.name ? `${e.name} <${e.email}>` : e.email)))
              .filter(Boolean);
            setCcRecipients(parsed);
            if (parsed.length > 0) setShowCc(true);
          } else {
            const parsedCc = initialData.cc.split(/[\s,;]+/).filter(Boolean);
            setCcRecipients(parsedCc);
            if (parsedCc.length > 0) setShowCc(true);
          }
        }
        if (initialData.bcc) {
          if (Array.isArray(initialData.bcc)) {
            const parsed = initialData.bcc
              .map((e: any) => (typeof e === "string" ? e : e.address || (e.name ? `${e.name} <${e.email}>` : e.email)))
              .filter(Boolean);
            setBccRecipients(parsed);
            if (parsed.length > 0) setShowBcc(true);
          } else {
            const parsedBcc = initialData.bcc.split(/[\s,;]+/).filter(Boolean);
            setBccRecipients(parsedBcc);
            if (parsedBcc.length > 0) setShowBcc(true);
          }
        }
        if (initialData.subject) setSubject(initialData.subject);
        if (initialData.attachments) setFiles(initialData.attachments);
        if (initialData.html) {
          initialHtml = initialData.html;
          initialTxt = initialData.text || "";
        } else if (initialData.text) {
          initialTxt = initialData.text;
          initialHtml = `<p>${initialData.text.replace(/\n/g, "<br/>")}</p>`;
        }
      }

      // Check if signature already present to prevent duplicate signatures
      const hasExistingSignature = /class="gmail_signature"|data-signature-block/i.test(initialHtml);

      if (!initialData?.draftId && targetDefaultSig && !hasExistingSignature) {
        const sigBlock = `<div class="gmail_signature" data-signature-block="true">${targetDefaultSig.contentHtml}</div>`;
        if (initialHtml) {
          initialHtml = `${initialHtml}<p><br/></p>${sigBlock}`;
        } else {
          initialHtml = `<p><br/></p>${sigBlock}`;
        }
        setActiveSignatureId(targetDefaultSig._id || targetDefaultSig.id || "");
      } else if (hasExistingSignature && targetDefaultSig) {
        setActiveSignatureId(targetDefaultSig._id || targetDefaultSig.id || "");
      } else {
        setActiveSignatureId(null);
      }

      setBodyText(initialTxt);
      setBodyHtml(initialHtml);
      setWindowMode("docked");
      setIsFullscreen(false);
      setDraftStatus("saved");
      setShowFormattingBar(true);
    } else if (!isInline && !open) {
      setToRecipients([]);
      setCcRecipients([]);
      setBccRecipients([]);
      setShowCc(false);
      setShowBcc(false);
      setSubject("");
      setBodyHtml("");
      setBodyText("");
      setFiles([]);
      setShowFormattingBar(true);
      setActiveSignatureId(null);
      setSignatureMenuAnchor(null);
    }
  }, [open, isInline, initialData, defaultNewSignature, defaultReplySignature]);

  if (!isInline && !open) return null;

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
    setDraftStatus("unsaved");
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
      setDraftStatus("unsaved");
      toast.success(`Attached ${validFiles.length} file${validFiles.length > 1 ? "s" : ""}`);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setDraftStatus("unsaved");
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

  // Dispatch Send action (dynamic for inline reply or floating compose)
  const handleSend = async () => {
    if (toRecipients.length === 0 && (!isInline || replyMode !== "forward")) {
      toast.error("Please add at least one recipient email address.");
      return;
    }
    if (!subject.trim()) {
      toast.error("Please enter a subject line.");
      setShowSubject(true);
      return;
    }

    const currentEditorHtml = editorRef.current?.getHTML() || bodyHtml;
    const finalHtml = currentEditorHtml.trim() || (bodyText ? `<p>${bodyText.replace(/\n/g, "<br/>")}</p>` : "<p></p>");

    const formattedTo = toRecipients.length === 1 ? formatRecipient(toRecipients[0]) : toRecipients.map(formatRecipient);
    const formattedCc = ccRecipients.length > 0 ? (ccRecipients.length === 1 ? formatRecipient(ccRecipients[0]) : ccRecipients.map(formatRecipient)) : undefined;
    const formattedBcc = bccRecipients.length > 0 ? (bccRecipients.length === 1 ? formatRecipient(bccRecipients[0]) : bccRecipients.map(formatRecipient)) : undefined;

    if (isInline && onSendReply) {
      try {
        await onSendReply({
          to: formattedTo,
          cc: formattedCc,
          bcc: formattedBcc,
          subject,
          html: finalHtml,
          threadId: replyMode === "forward" ? undefined : thread?._id || latestMessage?.threadId,
          inReplyTo: replyMode === "forward" ? undefined : latestMessage?._id,
          attachments: files.length > 0 ? files : undefined,
        });

        // SUCCESS: Reset form and close fullscreen if open
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
        setIsFullscreen(false);
        setIsCollapsed(true);
        lastLoadedKeyRef.current = null;
      } catch {
        // Keep open on error so user's draft is preserved
      }
      return;
    }

    // Floating compose mode dispatch
    try {
      if (initialData?.draftId) {
        await updateDraftMutation.mutateAsync({
          draftId: initialData.draftId,
          payload: {
            to: formattedTo,
            cc: formattedCc,
            bcc: formattedBcc,
            subject,
            html: finalHtml,
            attachments: files.length > 0 ? files : undefined,
          },
        });
        await sendDraftMutation.mutateAsync(initialData.draftId);
      } else {
        await sendEmailMutation.mutateAsync({
          to: formattedTo,
          cc: formattedCc,
          bcc: formattedBcc,
          subject,
          html: finalHtml,
          threadId: initialData?.threadId,
          inReplyTo: initialData?.inReplyTo,
          attachments: files.length > 0 ? files : undefined,
        });
      }

      onOpenChange(false);
    } catch {
      // Keep open on error so user's draft is preserved
    }
  };

  // Discard draft
  const handleDiscard = () => {
    if (bodyText.trim() || files.length > 0) {
      if (!window.confirm("Discard unsent changes?")) return;
    }

    if (isInline) {
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
      setIsFullscreen(false);
      setIsCollapsed(true);
      lastLoadedKeyRef.current = null;
    } else {
      onOpenChange(false);
    }
  };

  // Global Ctrl+Enter shortcut in composer
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  // Drag and drop files onto composer
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

  const isSending = isInline ? isSendingReply : (sendEmailMutation.isPending || sendDraftMutation.isPending);

  // Helper for inline mode label & icon
  const getInlineModeInfo = () => {
    switch (replyMode) {
      case "replyAll":
        return { label: "Reply all", icon: <ReplyAllIcon sx={{ fontSize: 16 }} /> };
      case "forward":
        return { label: "Forward", icon: <ForwardIcon sx={{ fontSize: 16 }} /> };
      default:
        return { label: "Reply", icon: <ReplyIcon sx={{ fontSize: 16 }} /> };
    }
  };

  const modeInfo = getInlineModeInfo();
  const senderDisplayName =
    latestMessage?.direction === "sent"
      ? (latestMessage.toRecipients?.[0]?.name || latestMessage.to?.[0] || fallbackSender?.name || "Recipient")
      : (latestMessage?.fromName?.trim() || latestMessage?.fromEmail || latestMessage?.from || fallbackSender?.name || "Sender");

  // =========================================================================
  // 1. COLLAPSED VIEW FOR INLINE MODE (When user collapses the reply box)
  // =========================================================================
  if (isInline && isCollapsed && !isFullscreen) {
    const hasMultiple =
      (latestMessage?.toRecipients?.length || latestMessage?.to?.length || 0) +
        (latestMessage?.ccRecipients?.length || latestMessage?.cc?.length || 0) >
        1 || (thread?.participants?.length || 0) > 2;

    const handleOpenInFullscreen = (targetMode: ReplyMode) => {
      setReplyMode(targetMode);
      setIsCollapsed(false);
      setIsFullscreen(true);
      loadInlineReplyInfo(targetMode);
    };

    return (
      <div className={cn("p-3 sm:p-4 bg-white dark:bg-[#1C252E]", className)}>
        <div className="rounded-xl border border-slate-200/90 dark:border-slate-700/80 bg-white dark:bg-[#1C252E] shadow-2xs p-2 flex flex-wrap items-center justify-between gap-2">
          <div
            onClick={() => handleOpenInFullscreen("reply")}
            className="flex-1 min-w-[200px] h-9 px-3 rounded-lg bg-slate-50/80 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2 cursor-pointer transition-all"
          >
            <ReplyIcon sx={{ fontSize: 16, color: "#1877F2" }} />
            <span className="truncate">Reply to <strong className="text-slate-700 dark:text-slate-200">{senderDisplayName}</strong>...</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleOpenInFullscreen("reply")}
              className="h-8 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1C252E] hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <ReplyIcon sx={{ fontSize: 15, color: "#1877F2" }} />
              <span>Reply</span>
            </button>

            {hasMultiple && (
              <button
                type="button"
                onClick={() => handleOpenInFullscreen("replyAll")}
                className="h-8 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1C252E] hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <ReplyAllIcon sx={{ fontSize: 15, color: "#1877F2" }} />
                <span>Reply all</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => handleOpenInFullscreen("forward")}
              className="h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1C252E] hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 shadow-2xs cursor-pointer"
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
  // 2. UNIFIED COMPOSER CORE CONTENT (Recipients, Editor, Attachments, Actions)
  // =========================================================================
  const composerContent = (
    <div
      onKeyDown={handleKeyDown}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "flex flex-col bg-white dark:bg-[#1C252E] font-['Public_Sans',sans-serif] relative",
        isInline && !isFullscreen ? "w-full" : "h-full min-h-0 overflow-hidden"
      )}
    >
      {/* Drag & Drop Visual Overlay */}
      {isDraggingOver && (
        <div className="absolute inset-0 z-30 bg-blue-500/10 border-2 border-dashed border-[#1877F2] rounded-2xl flex items-center justify-center pointer-events-none backdrop-blur-[2px]">
          <div className="flex items-center gap-2 text-xs font-bold text-[#1877F2] bg-white dark:bg-slate-900 px-4 py-2.5 rounded-xl shadow-lg border border-blue-200 dark:border-blue-800">
            <AttachFileOutlinedIcon sx={{ fontSize: 18 }} />
            <span>Drop files here to attach (up to 15MB each)</span>
          </div>
        </div>
      )}

      {/* TOP HEADER BAR (Floating mode or Fullscreen mode) */}
      {(!isInline || isFullscreen) && (
        <div className="px-4 py-2 bg-slate-50/70 dark:bg-slate-850/50 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2 select-none shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-[13px] font-bold text-[#1C252E] dark:text-white truncate">
              {isInline ? (replyMode === "forward" ? `Forward: ${subject}` : `Reply: ${subject}`) : (subject ? `Draft: ${subject}` : "New Message")}
            </span>
          </div>

          <div className="flex items-center gap-0.5 shrink-0">
            {/* Fullscreen / Restore Toggle */}
            <Tooltip title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
              <IconButton
                size="small"
                onClick={() => setIsFullscreen((prev) => !prev)}
                sx={{ color: "#637381", "&:hover": { color: "#1C252E" } }}
              >
                {isFullscreen ? (
                  <CloseFullscreenOutlinedIcon sx={{ fontSize: 16 }} />
                ) : (
                  <CropFreeOutlinedIcon sx={{ fontSize: 16 }} />
                )}
              </IconButton>
            </Tooltip>

            {/* Close / Discard */}
            <Tooltip title="Close">
              <IconButton
                size="small"
                onClick={() => {
                  if (isInline) {
                    setIsFullscreen(false);
                    setIsCollapsed(true);
                  } else {
                    handleDiscard();
                  }
                }}
                sx={{ color: "#637381", "&:hover": { color: "#E11D48" } }}
              >
                <CloseIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          </div>
        </div>
      )}

      {/* RECIPIENTS & HEADER CHASSIS */}
      <div className="bg-slate-50/60 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-800 shrink-0">
        {/* Inline mode mode switcher header */}
        {isInline && !isFullscreen && (
          <div className="px-3.5 py-1.5 flex items-center justify-between gap-2 border-b border-slate-100/80 dark:border-slate-800/80">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={(e) => setModeMenuAnchor(e.currentTarget)}
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-bold text-[#1C252E] dark:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs hover:bg-slate-50 dark:hover:bg-slate-700/80 transition-colors"
              >
                <span className="text-[#1877F2]">{modeInfo.icon}</span>
                <span>{modeInfo.label}</span>
                <KeyboardArrowDownOutlinedIcon sx={{ fontSize: 15, color: "#637381" }} />
              </button>

              {loadingInfo && (
                <span className="text-[11px] text-[#919EAB] flex items-center gap-1">
                  <CircularProgress size={11} color="inherit" />
                  <span>Loading...</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <Tooltip title="Fullscreen">
                <IconButton
                  size="small"
                  onClick={() => setIsFullscreen(true)}
                  sx={{ color: "#637381", "&:hover": { color: "#1C252E" } }}
                >
                  <CropFreeOutlinedIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Collapse">
                <IconButton
                  size="small"
                  onClick={() => setIsCollapsed(true)}
                  sx={{ color: "#637381", "&:hover": { color: "#E11D48" } }}
                >
                  <CloseIcon sx={{ fontSize: 17 }} />
                </IconButton>
              </Tooltip>
            </div>

            {/* Mode Dropdown Menu */}
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
                onClick={() => {
                  setReplyMode("reply");
                  setModeMenuAnchor(null);
                  loadInlineReplyInfo("reply");
                }}
                selected={replyMode === "reply"}
                sx={{ fontSize: "12.5px", fontWeight: 600, gap: 1.5 }}
              >
                <ReplyIcon sx={{ fontSize: 17, color: "#1877F2" }} />
                <span>Reply</span>
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setReplyMode("replyAll");
                  setModeMenuAnchor(null);
                  loadInlineReplyInfo("replyAll");
                }}
                selected={replyMode === "replyAll"}
                sx={{ fontSize: "12.5px", fontWeight: 600, gap: 1.5 }}
              >
                <ReplyAllIcon sx={{ fontSize: 17, color: "#1877F2" }} />
                <span>Reply all</span>
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setReplyMode("forward");
                  setModeMenuAnchor(null);
                  loadInlineReplyInfo("forward");
                }}
                selected={replyMode === "forward"}
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
        )}

        {/* TO RECIPIENTS FIELD */}
        <RecipientInput
          label="To"
          recipients={toRecipients}
          onChange={(newTo) => {
            setToRecipients(newTo);
            setDraftStatus("unsaved");
          }}
          placeholder="Recipients..."
          autoFocus={!isInline}
          rightAction={
            <div className="flex items-center gap-1.5 text-[11px] text-[#637381]">
              <div className="hidden sm:flex items-center gap-1 mr-1">
                <EmailAddressSelector
                  initialType="client"
                  align="end"
                  title="Select Client Email"
                  onSelect={(email, contact) => {
                    const formatted = contact?.name ? `${contact.name} <${email}>` : email;
                    if (!toRecipients.includes(formatted)) {
                      setToRecipients((prev) => [...prev, formatted]);
                      setDraftStatus("unsaved");
                    }
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
                    if (!toRecipients.includes(formatted)) {
                      setToRecipients((prev) => [...prev, formatted]);
                      setDraftStatus("unsaved");
                    }
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
                    if (!toRecipients.includes(formatted)) {
                      setToRecipients((prev) => [...prev, formatted]);
                      setDraftStatus("unsaved");
                    }
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
                  onClick={() => setShowCc(true)}
                  className="hover:text-primary transition-colors font-bold px-1.5 py-0.5 rounded hover:bg-slate-200/60 dark:hover:bg-slate-800"
                >
                  Cc
                </button>
              )}
              {!showBcc && (
                <button
                  type="button"
                  onClick={() => setShowBcc(true)}
                  className="hover:text-primary transition-colors font-bold px-1.5 py-0.5 rounded hover:bg-slate-200/60 dark:hover:bg-slate-800"
                >
                  Bcc
                </button>
              )}
              {isInline && !showSubject && (
                <button
                  type="button"
                  onClick={() => setShowSubject(true)}
                  className="hover:text-primary transition-colors font-bold px-1.5 py-0.5 rounded hover:bg-slate-200/60 dark:hover:bg-slate-800"
                >
                  Subject
                </button>
              )}
            </div>
          }
        />

        {/* CC RECIPIENTS FIELD */}
        {showCc && (
          <RecipientInput
            label="Cc"
            recipients={ccRecipients}
            onChange={(newCc) => {
              setCcRecipients(newCc);
              setDraftStatus("unsaved");
            }}
            placeholder="Cc recipients..."
            rightAction={
              <button
                type="button"
                onClick={() => {
                  setShowCc(false);
                  setCcRecipients([]);
                }}
                className="text-[11px] text-[#919EAB] hover:text-[#1C252E] dark:hover:text-white"
              >
                Remove
              </button>
            }
          />
        )}

        {/* BCC RECIPIENTS FIELD */}
        {showBcc && (
          <RecipientInput
            label="Bcc"
            recipients={bccRecipients}
            onChange={(newBcc) => {
              setBccRecipients(newBcc);
              setDraftStatus("unsaved");
            }}
            placeholder="Bcc recipients..."
            rightAction={
              <button
                type="button"
                onClick={() => {
                  setShowBcc(false);
                  setBccRecipients([]);
                }}
                className="text-[11px] text-[#919EAB] hover:text-[#1C252E] dark:hover:text-white"
              >
                Remove
              </button>
            }
          />
        )}

        {/* SUBJECT FIELD */}
        {showSubject && (
          <div className="px-3 sm:px-3.5 py-1.5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 select-none w-14 shrink-0">
              Subject:
            </span>
            <input
              type="text"
              placeholder="Subject"
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value);
                setDraftStatus("unsaved");
              }}
              className="w-full bg-transparent outline-none text-xs sm:text-[13px] font-semibold text-[#1C252E] dark:text-white placeholder:text-[#919EAB] h-6"
            />
            {isInline && (
              <button
                type="button"
                onClick={() => setShowSubject(false)}
                className="text-[11px] text-[#919EAB] hover:text-[#1C252E] dark:hover:text-white shrink-0 ml-auto"
              >
                Hide
              </button>
            )}
          </div>
        )}
      </div>

      {/* RICH TEXT EDITOR BODY CANVAS */}
      <div
        className={cn(
          "flex flex-col min-h-0 bg-white dark:bg-[#1C252E] p-1",
          isInline && !isFullscreen ? "min-h-[140px] max-h-[260px] overflow-y-auto" : "flex-1 overflow-y-auto"
        )}
      >
        <EmailRichEditor
          ref={editorRef}
          initialContent={bodyHtml || bodyText}
          onChange={(html, text) => {
            setBodyHtml(html);
            setBodyText(text);
            setDraftStatus("unsaved");
          }}
          showToolbar={showFormattingBar}
          placeholder="Write your message here..."
          onAttachClick={() => fileInputRef.current?.click()}
        />
      </div>

      {/* ATTACHMENTS PREVIEW CHIPS */}
      {files.length > 0 && (
        <div className="px-3.5 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 space-y-1.5 shrink-0 max-h-32 overflow-y-auto">
          <div className="flex items-center justify-between text-[11px] text-[#637381] font-medium">
            <span className="flex items-center gap-1.5 text-[#1C252E] dark:text-white font-bold">
              <AttachFileOutlinedIcon sx={{ fontSize: 15, color: "#1877F2" }} />
              <span>
                Attachments ({files.length}/{MAX_ATTACHMENTS})
              </span>
            </span>
            <span className="text-[10px] text-[#919EAB]">Max 15MB each</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {files.map((file, idx) => {
              const meta = getAttachmentMeta(file.name);
              return (
                <div
                  key={idx}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs shadow-2xs ${meta.chipStyle}`}
                >
                  {meta.icon}
                  <span className="truncate max-w-[150px] text-[11px] font-semibold" title={file.name}>
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

      {/* BOTTOM ACTION TOOLBAR */}
      <div className="px-3 sm:px-4 py-2 border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#1C252E] flex items-center justify-between gap-2 shrink-0 select-none">
        {/* Left Actions: Send Button & Format controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Primary Send Button */}
          <Tooltip title="Send (Ctrl + Enter)">
            <button
              type="button"
              id="email-reply-submit-button"
              data-testid="email-reply-submit-btn"
              onClick={handleSend}
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

          {/* Formatting Ribbon Toggle */}
          <Tooltip title="Formatting options">
            <IconButton
              size="small"
              onClick={() => setShowFormattingBar(!showFormattingBar)}
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

        {/* Right Actions: Fullscreen & Discard */}
        <div className="flex items-center gap-1">
          {isInline && (
            <Tooltip title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
              <IconButton
                size="small"
                onClick={() => setIsFullscreen((prev) => !prev)}
                sx={{
                  color: "#637381",
                  borderRadius: "10px",
                  "&:hover": { color: "#1C252E", bgcolor: "rgba(145, 158, 171, 0.08)" },
                }}
              >
                {isFullscreen ? (
                  <CloseFullscreenOutlinedIcon sx={{ fontSize: 17 }} />
                ) : (
                  <CropFreeOutlinedIcon sx={{ fontSize: 17 }} />
                )}
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
              <DeleteOutlineOutlinedIcon sx={{ fontSize: 19 }} />
            </IconButton>
          </Tooltip>
        </div>
      </div>
    </div>
  );

  // If inline and NOT in fullscreen mode, render pinned right in place
  if (isInline && !isFullscreen) {
    return composerContent;
  }

  // Floating mode OR Fullscreen mode: Render with backdrop overlay
  return (
    <>
      {/* Backdrop overlay when in fullscreen mode */}
      {isFullscreen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] transition-opacity"
          onClick={() => setIsFullscreen(false)}
        />
      )}

      {/* Floating or Fullscreen Composer Dialog */}
      <div
        className={cn(
          "fixed z-50 bg-white dark:bg-[#1C252E] border border-slate-200/90 dark:border-slate-800 shadow-[0_8px_32px_rgba(0,0,0,0.18)] flex flex-col overflow-hidden transition-all duration-200 font-['Public_Sans',sans-serif]",
          isFullscreen
            ? "inset-4 sm:inset-10 md:inset-14 lg:inset-20 max-w-5xl m-auto h-[85vh] max-h-[750px] rounded-2xl shadow-2xl"
            : "bottom-0 right-2 sm:right-6 md:right-8 w-[calc(100vw-1rem)] sm:w-[560px] md:w-[580px] max-w-[580px] h-[520px] max-h-[82vh] rounded-t-2xl border-b-0"
        )}
      >
        {composerContent}
      </div>
    </>
  );
};
