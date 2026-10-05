"use client";

import React, { useState, useRef, useEffect, DragEvent } from "react";
import { toast } from "sonner";
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
import Chip from "@mui/material/Chip";
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
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import TextFormatOutlinedIcon from "@mui/icons-material/TextFormatOutlined";
import DriveFileRenameOutlineOutlinedIcon from "@mui/icons-material/DriveFileRenameOutlineOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import TableChartOutlinedIcon from "@mui/icons-material/TableChartOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import FolderZipOutlinedIcon from "@mui/icons-material/FolderZipOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import CheckIcon from "@mui/icons-material/Check";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";

export interface ComposerInitialData {
  to?: string;
  cc?: string;
  bcc?: string;
  subject?: string;
  threadId?: string;
  inReplyTo?: string;
  text?: string;
  draftId?: string;
}

interface EmailComposerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: ComposerInitialData;
}

type WindowMode = "docked" | "minimized" | "fullscreen";

const MAX_ATTACHMENTS = 10;
const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25MB

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
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }
  
  namePart = namePart.replace(/[<>"]/g, "").trim();
  return `${namePart} <${email}>`;
}

export const EmailComposerDialog: React.FC<EmailComposerDialogProps> = ({
  open,
  onOpenChange,
  initialData,
}) => {
  const sendEmailMutation = useSendEmail();
  const saveDraftMutation = useSaveDraft();
  const updateDraftMutation = useUpdateDraft();
  const sendDraftMutation = useSendDraft();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<EmailRichEditorRef>(null);

  const {
    signatures,
    defaultNewSignature,
    defaultReplySignature,
    getSignatureById,
  } = useEmailSignatures();

  // Signature state & MUI Menu anchor
  const [signatureDialogOpen, setSignatureDialogOpen] = useState(false);
  const [activeSignatureId, setActiveSignatureId] = useState<string | null>(null);
  const [signatureMenuAnchor, setSignatureMenuAnchor] = useState<null | HTMLElement>(null);

  // Window display state
  const [windowMode, setWindowMode] = useState<WindowMode>("docked");
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Form states
  const [toRecipients, setToRecipients] = useState<string[]>([]);
  const [showCc, setShowCc] = useState(false);
  const [ccRecipients, setCcRecipients] = useState<string[]>([]);
  const [showBcc, setShowBcc] = useState(false);
  const [bccRecipients, setBccRecipients] = useState<string[]>([]);
  const [subject, setSubject] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [bodyText, setBodyText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [showFormattingBar, setShowFormattingBar] = useState(true);
  const [draftStatus, setDraftStatus] = useState<"saved" | "unsaved" | "saving">("saved");

  // Sync initial data when opened
  useEffect(() => {
    if (open) {
      let initialHtml = "";
      let initialTxt = "";
      const isReply = !!initialData?.threadId;

      // Determine default signature to inject
      const targetDefaultSig = isReply ? defaultReplySignature : defaultNewSignature;

      if (initialData) {
        if (initialData.to) {
          const rawTo = initialData.to;
          const match = rawTo.match(/<([^>]+)>/);
          const emailOnly = match ? match[1] : rawTo;
          const parsedTo = emailOnly.split(/[,;]+/).map((e) => e.trim()).filter(Boolean);
          setToRecipients(parsedTo.length > 0 ? parsedTo : [rawTo]);
        }
        if (initialData.cc) {
          const parsedCc = initialData.cc.split(/[\s,;]+/).filter(Boolean);
          setCcRecipients(parsedCc);
          setShowCc(true);
        }
        if (initialData.bcc) {
          const parsedBcc = initialData.bcc.split(/[\s,;]+/).filter(Boolean);
          setBccRecipients(parsedBcc);
          setShowBcc(true);
        }
        if (initialData.subject) setSubject(initialData.subject);
        if (initialData.text) {
          initialTxt = initialData.text;
          initialHtml = `<p>${initialData.text.replace(/\n/g, "<br/>")}</p>`;
        }
      }

      // If no draft ID and a default signature is configured, append it
      if (!initialData?.draftId && targetDefaultSig) {
        const sigBlock = `<div class="gmail_signature" data-signature-block="true">${targetDefaultSig.contentHtml}</div>`;
        if (initialHtml) {
          initialHtml = `${initialHtml}<p><br/></p>${sigBlock}`;
        } else {
          initialHtml = `<p><br/></p>${sigBlock}`;
        }
        setActiveSignatureId(targetDefaultSig._id || targetDefaultSig.id || "");
      } else {
        setActiveSignatureId(null);
      }

      setBodyText(initialTxt);
      setBodyHtml(initialHtml);
      setWindowMode("docked");
      setDraftStatus("saved");
      setShowFormattingBar(true);
    } else {
      // Reset state on close
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
  }, [open, initialData, defaultNewSignature, defaultReplySignature]);

  if (!open) return null;

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
      toast.info("Signature removed from message");
    }

    setBodyHtml(currentHtml);
    editorRef.current?.setContent(currentHtml);
    setDraftStatus("unsaved");
  };

  // File Handling
  const handleFileSelect = (selectedFiles: File[]) => {
    if (files.length + selectedFiles.length > MAX_ATTACHMENTS) {
      toast.error(`You can attach up to ${MAX_ATTACHMENTS} files maximum.`);
      return;
    }

    const validFiles: File[] = [];
    for (const file of selectedFiles) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast.error(`File "${file.name}" exceeds the 25MB limit.`);
      } else {
        validFiles.push(file);
      }
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

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files) {
      handleFileSelect(Array.from(e.dataTransfer.files));
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
        icon: <PictureAsPdfOutlinedIcon sx={{ fontSize: 16, color: "#E11D48" }} />,
        badge: "PDF",
        chipStyle: "border-rose-200 dark:border-rose-900/50 bg-rose-50/70 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300",
      };
    }
    if (lower.endsWith(".png") || lower.endsWith(".jpg") || lower.endsWith(".jpeg") || lower.endsWith(".webp") || lower.endsWith(".gif")) {
      return {
        icon: <ImageOutlinedIcon sx={{ fontSize: 16, color: "#8E33FF" }} />,
        badge: "IMG",
        chipStyle: "border-purple-200 dark:border-purple-900/50 bg-purple-50/70 dark:bg-purple-950/20 text-purple-700 dark:text-purple-300",
      };
    }
    if (lower.endsWith(".xls") || lower.endsWith(".xlsx") || lower.endsWith(".csv")) {
      return {
        icon: <TableChartOutlinedIcon sx={{ fontSize: 16, color: "#00A76F" }} />,
        badge: "XLS",
        chipStyle: "border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/70 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300",
      };
    }
    if (lower.endsWith(".doc") || lower.endsWith(".docx")) {
      return {
        icon: <DescriptionOutlinedIcon sx={{ fontSize: 16, color: "#1877F2" }} />,
        badge: "DOC",
        chipStyle: "border-blue-200 dark:border-blue-900/50 bg-blue-50/70 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300",
      };
    }
    if (lower.endsWith(".zip") || lower.endsWith(".rar") || lower.endsWith(".tar") || lower.endsWith(".gz")) {
      return {
        icon: <FolderZipOutlinedIcon sx={{ fontSize: 16, color: "#F59E0B" }} />,
        badge: "ZIP",
        chipStyle: "border-amber-200 dark:border-amber-900/50 bg-amber-50/70 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300",
      };
    }
    return {
      icon: <InsertDriveFileOutlinedIcon sx={{ fontSize: 16, color: "#637381" }} />,
      badge: "FILE",
      chipStyle: "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300",
    };
  };

  // Dispatch Email
  const handleSend = () => {
    if (toRecipients.length === 0) {
      toast.error("Please add at least one recipient email address.");
      return;
    }
    if (!subject.trim()) {
      toast.error("Please enter a subject line.");
      return;
    }

    const payload = {
      to: toRecipients.length > 0 ? toRecipients.map(formatRecipient) : undefined,
      subject,
      cc: ccRecipients.length > 0 ? ccRecipients.map(formatRecipient) : undefined,
      bcc: bccRecipients.length > 0 ? bccRecipients.map(formatRecipient) : undefined,
      text: bodyText,
      html: bodyHtml || `<p>${bodyText.replace(/\n/g, "<br/>")}</p>`,
      threadId: initialData?.threadId,
      inReplyTo: initialData?.inReplyTo,
      attachments: files.length > 0 ? files : undefined,
    };

    if (initialData?.draftId) {
      sendDraftMutation.mutate(initialData.draftId, {
        onSuccess: () => onOpenChange(false),
      });
      return;
    }

    sendEmailMutation.mutate(payload, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  // Draft Preservation
  const handleSaveDraft = () => {
    const payload = {
      to: toRecipients.length > 0 ? toRecipients.map(formatRecipient) : undefined,
      subject,
      cc: ccRecipients.length > 0 ? ccRecipients.map(formatRecipient) : undefined,
      bcc: bccRecipients.length > 0 ? bccRecipients.map(formatRecipient) : undefined,
      text: bodyText,
      html: bodyHtml || (bodyText ? `<p>${bodyText.replace(/\n/g, "<br/>")}</p>` : undefined),
      threadId: initialData?.threadId,
      inReplyTo: initialData?.inReplyTo,
      attachments: files.length > 0 ? files : undefined,
    };

    setDraftStatus("saving");

    if (initialData?.draftId) {
      updateDraftMutation.mutate(
        { draftId: initialData.draftId, payload },
        {
          onSuccess: () => {
            setDraftStatus("saved");
            toast.success("Draft updated");
          },
          onError: () => setDraftStatus("unsaved"),
        }
      );
    } else {
      saveDraftMutation.mutate(payload, {
        onSuccess: () => {
          setDraftStatus("saved");
          toast.success("Draft saved");
        },
        onError: () => setDraftStatus("unsaved"),
      });
    }
  };

  const handleDiscard = () => {
    onOpenChange(false);
  };

  // Keydown shortcut (Ctrl+Enter to Send)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  const isSending = sendEmailMutation.isPending || sendDraftMutation.isPending;
  const isSaving = saveDraftMutation.isPending || updateDraftMutation.isPending;

  // Title display
  const windowTitle = initialData?.draftId
    ? "Edit Draft"
    : subject.trim()
    ? subject
    : "New Message";

  // Minimized Bar (Docked bottom-right slim pill)
  if (windowMode === "minimized") {
    return (
      <div
        className="fixed bottom-0 right-4 sm:right-8 z-50 w-72 sm:w-80 h-11 rounded-t-xl bg-white dark:bg-[#1C252E] border border-slate-200/90 dark:border-slate-800 shadow-[0_0_2px_0_rgba(145,158,171,0.2),0_12px_24px_-4px_rgba(145,158,171,0.12)] flex items-center justify-between px-3.5 transition-all hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer font-['Public_Sans',sans-serif]"
      >
        <div
          onClick={() => setWindowMode("docked")}
          className="flex items-center gap-2 flex-1 min-w-0"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#1877F2]" />
          <span className="text-xs font-bold text-[#1C252E] dark:text-white truncate">
            {windowTitle}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Tooltip title="Expand">
            <IconButton
              size="small"
              onClick={() => setWindowMode("docked")}
              sx={{ color: "#637381", "&:hover": { color: "#1C252E" } }}
            >
              <CropFreeOutlinedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Close">
            <IconButton
              size="small"
              onClick={handleDiscard}
              sx={{ color: "#637381", "&:hover": { color: "#E11D48" } }}
            >
              <CloseIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </div>
      </div>
    );
  }

  // Fullscreen Backdrop Overlay
  const isFullscreen = windowMode === "fullscreen";

  return (
    <>
      {/* Dim backdrop when in fullscreen mode */}
      {isFullscreen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] transition-opacity"
          onClick={() => setWindowMode("docked")}
        />
      )}

      {/* Main Material UI Composer Container */}
      <div
        onKeyDown={handleKeyDown}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`fixed z-50 bg-white dark:bg-[#1C252E] border border-slate-200/90 dark:border-slate-800 shadow-[0_0_2px_0_rgba(145,158,171,0.2),0_16px_32px_-4px_rgba(145,158,171,0.14)] flex flex-col overflow-hidden transition-all duration-200 font-['Public_Sans',sans-serif] ${
          isFullscreen
            ? "inset-2 sm:inset-6 md:inset-10 lg:inset-12 rounded-2xl"
            : "bottom-0 right-0 sm:right-6 md:right-8 w-full sm:w-[620px] lg:w-[660px] max-w-[calc(100vw-1rem)] h-[92vh] sm:h-[620px] max-h-[calc(100vh-1rem)] rounded-t-2xl sm:rounded-t-2xl border-b-0"
        }`}
      >
        {/* ========================================================= */}
        {/* 1. TOP HEADER BAR                                         */}
        {/* ========================================================= */}
        <div className="px-4 py-2.5 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2 select-none shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-[13px] font-bold text-[#1C252E] dark:text-white truncate">
              {windowTitle}
            </span>

            {draftStatus === "saving" && (
              <span className="text-[11px] text-[#919EAB] flex items-center gap-1">
                <CircularProgress size={10} color="inherit" />
                <span>Saving...</span>
              </span>
            )}
            {draftStatus === "saved" && (
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircleOutlinedIcon sx={{ fontSize: 13 }} />
                <span>Saved</span>
              </span>
            )}
          </div>

          {/* Window action controls */}
          <div className="flex items-center gap-0.5 shrink-0">
            {/* Minimize button (desktop) */}
            <Tooltip title="Minimize">
              <IconButton
                size="small"
                onClick={() => setWindowMode("minimized")}
                sx={{
                  color: "#637381",
                  "&:hover": { color: "#1C252E", bgcolor: "rgba(145, 158, 171, 0.08)" },
                  display: { xs: "none", sm: "inline-flex" },
                }}
              >
                <MinimizeIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>

            {/* Maximize / Restore button */}
            <Tooltip title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
              <IconButton
                size="small"
                onClick={() => setWindowMode(isFullscreen ? "docked" : "fullscreen")}
                sx={{
                  color: "#637381",
                  "&:hover": { color: "#1C252E", bgcolor: "rgba(145, 158, 171, 0.08)" },
                  display: { xs: "none", sm: "inline-flex" },
                }}
              >
                {isFullscreen ? (
                  <CloseFullscreenOutlinedIcon sx={{ fontSize: 16 }} />
                ) : (
                  <CropFreeOutlinedIcon sx={{ fontSize: 16 }} />
                )}
              </IconButton>
            </Tooltip>

            {/* Close button */}
            <Tooltip title="Close">
              <IconButton
                size="small"
                onClick={handleDiscard}
                sx={{
                  color: "#637381",
                  "&:hover": { color: "#E11D48", bgcolor: "rgba(225, 29, 72, 0.08)" },
                }}
              >
                <CloseIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. RECIPIENTS & SUBJECT SECTION                           */}
        {/* ========================================================= */}
        <div className="bg-white dark:bg-[#1C252E] shrink-0">
          {/* Quick Stakeholder Address Selector Bar */}
          <div className="px-3.5 py-1.5 bg-slate-50/40 dark:bg-slate-800/20 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 overflow-x-auto">
            <span className="text-[11px] font-semibold text-[#637381] dark:text-[#919EAB] flex items-center gap-1.5 shrink-0 select-none">
              <GroupsOutlinedIcon sx={{ fontSize: 15, color: "#1877F2" }} />
              <span>Quick Add:</span>
            </span>

            <div className="flex items-center gap-1.5 shrink-0">
              <EmailAddressSelector
                initialType="client"
                align="start"
                title="Select Client Email Address"
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
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-blue-500/10 text-blue-700 dark:text-blue-300 hover:bg-blue-500/20 border border-blue-200/70 dark:border-blue-800/50 transition-colors"
                  >
                    <BusinessOutlinedIcon sx={{ fontSize: 13 }} />
                    <span>Client</span>
                  </button>
                }
              />

              <EmailAddressSelector
                initialType="candidate"
                align="start"
                title="Select Candidate Email Address"
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
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-rose-500/10 text-rose-700 dark:text-rose-300 hover:bg-rose-500/20 border border-rose-200/70 dark:border-rose-800/50 transition-colors"
                  >
                    <PersonOutlineOutlinedIcon sx={{ fontSize: 13 }} />
                    <span>Candidate</span>
                  </button>
                }
              />

              <EmailAddressSelector
                initialType="team"
                align="start"
                title="Select Team Member Email Address"
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
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-bold bg-purple-500/10 text-purple-700 dark:text-purple-300 hover:bg-purple-500/20 border border-purple-200/70 dark:border-purple-800/50 transition-colors"
                  >
                    <GroupsOutlinedIcon sx={{ fontSize: 13 }} />
                    <span>Team</span>
                  </button>
                }
              />
            </div>
          </div>

          {/* TO Field */}
          <RecipientInput
            label="To"
            recipients={toRecipients}
            onChange={(newTo) => {
              setToRecipients(newTo);
              setDraftStatus("unsaved");
            }}
            placeholder="Recipients..."
            autoFocus
            rightAction={
              <div className="flex items-center gap-1 text-[11px] text-[#637381]">
                {!showCc && (
                  <button
                    type="button"
                    onClick={() => setShowCc(true)}
                    className="hover:text-primary transition-colors font-bold px-1.5 py-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Cc
                  </button>
                )}
                {!showBcc && (
                  <button
                    type="button"
                    onClick={() => setShowBcc(true)}
                    className="hover:text-primary transition-colors font-bold px-1.5 py-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Bcc
                  </button>
                )}
              </div>
            }
          />

          {/* CC Field (Collapsible) */}
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

          {/* BCC Field (Collapsible) */}
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

          {/* Subject Field */}
          <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center">
            <input
              type="text"
              placeholder="Subject"
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value);
                setDraftStatus("unsaved");
              }}
              className="w-full bg-transparent outline-none text-xs sm:text-[13.5px] font-semibold text-[#1C252E] dark:text-white placeholder:text-[#919EAB] h-7"
            />
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. RICH TEXT EDITOR BODY CANVAS                          */}
        {/* ========================================================= */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
          {/* Drag & Drop Visual Overlay */}
          {isDraggingOver && (
            <div className="absolute inset-0 z-20 bg-blue-500/10 border-2 border-dashed border-[#1877F2] rounded-xl flex items-center justify-center pointer-events-none backdrop-blur-[2px]">
              <div className="flex items-center gap-2 text-xs font-bold text-[#1877F2] bg-white dark:bg-slate-900 px-4 py-2.5 rounded-xl shadow-lg border border-blue-200 dark:border-blue-800">
                <AttachFileOutlinedIcon sx={{ fontSize: 18 }} />
                <span>Drop files here to attach (up to 25MB each)</span>
              </div>
            </div>
          )}

          {/* Rich Text Editor with Ref for Signature Injection */}
          <EmailRichEditor
            ref={editorRef}
            initialContent={bodyHtml || bodyText}
            onChange={(html, text) => {
              setBodyHtml(html);
              setBodyText(text);
              setDraftStatus("unsaved");
            }}
            showToolbar={showFormattingBar}
            placeholder="Write your email message here..."
            onAttachClick={() => fileInputRef.current?.click()}
          />

          {/* Attachments Section */}
          {files.length > 0 && (
            <div className="px-3.5 py-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 space-y-2 shrink-0 max-h-40 overflow-y-auto">
              <div className="flex items-center justify-between text-[11px] text-[#637381] font-medium">
                <span className="flex items-center gap-1.5 text-[#1C252E] dark:text-white font-bold">
                  <AttachFileOutlinedIcon sx={{ fontSize: 15, color: "#1877F2" }} />
                  <span>Attachments ({files.length}/{MAX_ATTACHMENTS})</span>
                </span>
                <span className="text-[10px] text-[#919EAB]">Max 25MB each</span>
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
                      <span className="text-[10px] opacity-75 font-medium">
                        ({formatFileSize(file.size)})
                      </span>
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
        </div>

        {/* ========================================================= */}
        {/* 4. BOTTOM ACTION TOOLBAR (MATERIAL UI GMAIL STYLE)        */}
        {/* ========================================================= */}
        <div className="p-2.5 sm:px-4 sm:py-3 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-between gap-2 shrink-0 select-none">
          {/* Left Actions: Send Button & Quick Format Icons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Primary Material UI Send Button */}
            <Button
              variant="contained"
              disabled={isSending}
              onClick={handleSend}
              startIcon={
                isSending ? (
                  <CircularProgress size={14} color="inherit" />
                ) : (
                  <SendIcon sx={{ fontSize: 15 }} />
                )
              }
              sx={{
                bgcolor: "var(--color-primary, #2563EB)",
                color: "#FFFFFF",
                "&:hover": {
                  bgcolor: "var(--color-primary-hover, #1D4ED8)",
                  boxShadow: "0 4px 12px rgba(37, 99, 235, 0.35)",
                },
                "&:active": {
                  bgcolor: "var(--color-primary-hover, #1D4ED8)",
                  transform: "scale(0.98)",
                },
                "&:focus-visible": {
                  outline: "2px solid var(--color-primary, #2563EB)",
                  outlineOffset: "2px",
                },
                "&.Mui-disabled": {
                  bgcolor: "var(--color-primary, #2563EB)",
                  color: "rgba(255, 255, 255, 0.7)",
                  opacity: 0.6,
                },
                borderRadius: "12px",
                textTransform: "none",
                fontWeight: 700,
                fontSize: "12.5px",
                px: 2.5,
                py: 0.75,
                boxShadow: "0 2px 8px rgba(37, 99, 235, 0.28)",
                transition: "all 0.15s ease-in-out",
              }}
            >
              {isSending ? "Sending..." : "Send"}
            </Button>

            {/* Formatting Ribbon Toggle */}
            <Tooltip title="Formatting options">
              <IconButton
                size="small"
                onClick={() => setShowFormattingBar(!showFormattingBar)}
                sx={{
                  color: showFormattingBar ? "var(--color-primary, #2563EB)" : "#637381",
                  bgcolor: showFormattingBar ? "rgba(37, 99, 235, 0.08)" : "transparent",
                  borderRadius: "10px",
                  "&:hover": { bgcolor: "rgba(37, 99, 235, 0.12)", color: "var(--color-primary, #2563EB)" },
                }}
              >
                <TextFormatOutlinedIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>

            {/* Attach File Button */}
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
              accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.rtf,.zip,.rar,.png,.jpg,.jpeg,.gif,.webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain,image/*"
              className="hidden"
            />
            <Tooltip title="Attach files (PDF, Word, Excel, Images, etc.)">
              <Badge
                badgeContent={files.length}
                color="primary"
                invisible={files.length === 0}
                sx={{
                  "& .MuiBadge-badge": {
                    fontSize: 9,
                    height: 16,
                    minWidth: 16,
                    bgcolor: "var(--color-primary, #2563EB)",
                  },
                }}
              >
                <IconButton
                  size="small"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={files.length >= MAX_ATTACHMENTS}
                  sx={{
                    color: files.length > 0 ? "var(--color-primary, #2563EB)" : "#637381",
                    bgcolor: files.length > 0 ? "rgba(37, 99, 235, 0.08)" : "transparent",
                    borderRadius: "10px",
                    "&:hover": { bgcolor: "rgba(37, 99, 235, 0.12)", color: "var(--color-primary, #2563EB)" },
                  }}
                >
                  <AttachFileOutlinedIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </Badge>
            </Tooltip>

            {/* Signature Management Menu Button (MUI Menu) */}
            <Tooltip title="Insert signature">
              <IconButton
                size="small"
                onClick={(e) => setSignatureMenuAnchor(e.currentTarget)}
                sx={{
                  color: activeSignatureId ? "var(--color-primary, #2563EB)" : "#637381",
                  bgcolor: activeSignatureId ? "rgba(37, 99, 235, 0.08)" : "transparent",
                  borderRadius: "10px",
                  "&:hover": { bgcolor: "rgba(37, 99, 235, 0.12)", color: "var(--color-primary, #2563EB)" },
                }}
              >
                <DriveFileRenameOutlineOutlinedIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>

            <Menu
              anchorEl={signatureMenuAnchor}
              open={Boolean(signatureMenuAnchor)}
              onClose={() => setSignatureMenuAnchor(null)}
              anchorOrigin={{ vertical: "top", horizontal: "left" }}
              transformOrigin={{ vertical: "bottom", horizontal: "left" }}
              slotProps={{
                paper: {
                  sx: {
                    borderRadius: "14px",
                    minWidth: 200,
                    p: 0.5,
                    boxShadow: "0 8px 24px rgba(145, 158, 171, 0.16)",
                    border: "1px solid rgba(145, 158, 171, 0.2)",
                  },
                },
              }}
            >
              <div className="px-3 py-1.5 text-[10px] font-bold text-[#919EAB] uppercase tracking-wider flex items-center justify-between">
                <span>Signatures</span>
                {activeSignatureId && (
                  <span className="text-[9px] text-primary font-semibold lowercase">active</span>
                )}
              </div>
              <Divider sx={{ my: 0.5 }} />

              {signatures.map((sig) => {
                const sigId = sig._id || sig.id || "";
                const isSelected = activeSignatureId === sigId;
                return (
                  <MenuItem
                    key={sigId}
                    onClick={() => handleSelectSignature(sigId)}
                    sx={{
                      borderRadius: "8px",
                      fontSize: "12.5px",
                      display: "flex",
                      justifyContent: "space-between",
                      py: 0.8,
                    }}
                  >
                    <span className="truncate font-medium">{sig.name}</span>
                    {isSelected && <CheckIcon sx={{ fontSize: 16, color: "var(--color-primary, #2563EB)" }} />}
                  </MenuItem>
                );
              })}

              <MenuItem
                onClick={() => handleSelectSignature(null)}
                sx={{
                  borderRadius: "8px",
                  fontSize: "12.5px",
                  display: "flex",
                  justifyContent: "space-between",
                  py: 0.8,
                  color: "#637381",
                }}
              >
                <span>No signature</span>
                {!activeSignatureId && <CheckIcon sx={{ fontSize: 16, color: "#919EAB" }} />}
              </MenuItem>

              <Divider sx={{ my: 0.5 }} />

              <MenuItem
                onClick={() => {
                  setSignatureMenuAnchor(null);
                  setSignatureDialogOpen(true);
                }}
                sx={{
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "var(--color-primary, #2563EB)",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  py: 0.8,
                  "&:hover": { bgcolor: "rgba(37, 99, 235, 0.08)" },
                }}
              >
                <AutoAwesomeOutlinedIcon sx={{ fontSize: 16 }} />
                <span>Manage signatures...</span>
              </MenuItem>
            </Menu>
          </div>

          {/* Right Actions: Save Draft & Discard */}
          <div className="flex items-center gap-1">
            {/* Save Draft Button */}
            <Tooltip title="Save draft">
              <Button
                variant="text"
                disabled={isSaving}
                onClick={handleSaveDraft}
                startIcon={<SaveOutlinedIcon sx={{ fontSize: 16 }} />}
                sx={{
                  color: "#637381",
                  borderRadius: "10px",
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "12px",
                  py: 0.5,
                  px: 1.5,
                  "&:hover": { 
                    color: "var(--color-primary, #2563EB)", 
                    bgcolor: "rgba(37, 99, 235, 0.08)" 
                  },
                  "&:active": {
                    transform: "scale(0.97)",
                  },
                  display: { xs: "none", sm: "inline-flex" },
                }}
              >
                Save
              </Button>
            </Tooltip>

            {/* Discard Trash Button */}
            <Tooltip title="Discard draft">
              <IconButton
                size="small"
                onClick={handleDiscard}
                sx={{
                  color: "#637381",
                  borderRadius: "10px",
                  "&:hover": {
                    color: "#E11D48",
                    bgcolor: "rgba(225, 29, 72, 0.08)",
                  },
                }}
              >
                <DeleteOutlineOutlinedIcon sx={{ fontSize: 19 }} />
              </IconButton>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Email Signature Management Dialog */}
      <EmailSignatureDialog
        open={signatureDialogOpen}
        onOpenChange={setSignatureDialogOpen}
        initialSelectedId={activeSignatureId || undefined}
      />
    </>
  );
};
