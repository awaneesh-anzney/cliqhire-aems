"use client";

import React, { useState, useRef, useEffect, DragEvent } from "react";
import { 
  Send, 
  Paperclip, 
  X, 
  Trash2, 
  Minus, 
  Maximize2, 
  Minimize2, 
  FileIcon, 
  Check, 
  Type, 
  Link2, 
  Sparkles, 
  Save,
  PenTool
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useSendEmail, useSaveDraft, useSendDraft, useUpdateDraft } from "@/hooks/useEmail";
import { useEmailSignatures } from "@/hooks/useEmailSignatures";
import { RecipientInput } from "./RecipientInput";
import { EmailRichEditor, EmailRichEditorRef } from "./EmailRichEditor";
import { EmailSignatureDialog } from "./EmailSignatureDialog";

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

const MAX_ATTACHMENTS = 5;
const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15MB

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

  // Signature state
  const [signatureDialogOpen, setSignatureDialogOpen] = useState(false);
  const [activeSignatureId, setActiveSignatureId] = useState<string | null>(null);

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
  const [showFormattingBar, setShowFormattingBar] = useState(false);
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
          const parsedTo = initialData.to.split(/[\s,;]+/).filter(Boolean);
          setToRecipients(parsedTo);
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

      // If no draft ID and a default signature is configured, append it!
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
      setShowFormattingBar(false);
      setActiveSignatureId(null);
    }
  }, [open, initialData, defaultNewSignature, defaultReplySignature]);

  if (!open) return null;

  // Signature switching & insertion (Gmail style)
  const handleSelectSignature = (sigId: string | null) => {
    setActiveSignatureId(sigId);
    let currentHtml = editorRef.current?.getHTML() || bodyHtml || "";

    // Regex to match existing signature block
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
      // Remove signature
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
        toast.error(`File "${file.name}" exceeds the 15MB limit.`);
      } else {
        validFiles.push(file);
      }
    }

    if (validFiles.length > 0) {
      setFiles((prev) => [...prev, ...validFiles]);
      setDraftStatus("unsaved");
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
      to: toRecipients,
      subject,
      cc: ccRecipients.length > 0 ? ccRecipients : undefined,
      bcc: bccRecipients.length > 0 ? bccRecipients : undefined,
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
      to: toRecipients.length > 0 ? toRecipients : undefined,
      subject,
      cc: ccRecipients.length > 0 ? ccRecipients : undefined,
      bcc: bccRecipients.length > 0 ? bccRecipients : undefined,
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

  // Title display
  const windowTitle = initialData?.draftId
    ? "Edit Draft"
    : subject.trim()
    ? subject
    : "New Message";

  // Minimized Bar (Docked bottom-right slim pill like Gmail)
  if (windowMode === "minimized") {
    return (
      <div className="fixed bottom-0 right-4 sm:right-8 z-50 w-72 sm:w-80 h-11 rounded-t-xl bg-card border border-border/80 shadow-lg flex items-center justify-between px-3.5 transition-transform hover:bg-muted/40 cursor-pointer">
        <div
          onClick={() => setWindowMode("docked")}
          className="flex items-center gap-2 flex-1 min-w-0"
        >
          <span className="w-2 h-2 rounded-full bg-primary" />
          <span className="text-xs font-semibold text-foreground truncate">{windowTitle}</span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setWindowMode("docked")}
            className="h-6 w-6 text-muted-foreground hover:text-foreground rounded-md"
            title="Expand"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDiscard}
            className="h-6 w-6 text-muted-foreground hover:text-foreground rounded-md"
            title="Close"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    );
  }

  // Fullscreen Backdrop Overlay
  const isFullscreen = windowMode === "fullscreen";

  return (
    <>
      {/* Dim backdrop only when in fullscreen modal mode */}
      {isFullscreen && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs transition-opacity"
          onClick={() => setWindowMode("docked")}
        />
      )}

      <div
        onKeyDown={handleKeyDown}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`fixed z-50 bg-card/95 backdrop-blur-md border border-border/70 shadow-2xl flex flex-col overflow-hidden transition-all duration-200 ${
          isFullscreen
            ? "inset-2 sm:inset-6 md:inset-10 lg:inset-14 rounded-2xl"
            : "bottom-0 right-0 sm:right-6 md:right-8 w-full sm:w-[600px] lg:w-[640px] max-w-[calc(100vw-1rem)] h-[90vh] sm:h-[590px] max-h-[calc(100vh-1rem)] rounded-t-2xl sm:rounded-t-2xl border-b-0"
        }`}
      >
        {/* Header Bar */}
        <div className="px-3.5 py-2.5 bg-muted/35 border-b border-border/60 flex items-center justify-between gap-2 select-none shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs font-bold text-foreground truncate">
              {windowTitle}
            </span>
            {draftStatus === "saving" && (
              <span className="text-[10px] text-muted-foreground animate-pulse">Saving...</span>
            )}
            {draftStatus === "saved" && (
              <span className="text-[10px] text-muted-foreground/80 flex items-center gap-0.5">
                <Check className="h-2.5 w-2.5 text-emerald-500" />
                <span>Saved</span>
              </span>
            )}
          </div>

          {/* Window action controls */}
          <div className="flex items-center gap-0.5 shrink-0">
            {/* Minimize button (desktop only) */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setWindowMode("minimized")}
              className="h-6 w-6 text-muted-foreground hover:text-foreground rounded-md hidden sm:inline-flex"
              title="Minimize"
            >
              <Minus className="h-3.5 w-3.5" />
            </Button>

            {/* Maximize / Restore button */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setWindowMode(isFullscreen ? "docked" : "fullscreen")}
              className="h-6 w-6 text-muted-foreground hover:text-foreground rounded-md hidden sm:inline-flex"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            </Button>

            {/* Close button */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleDiscard}
              className="h-6 w-6 text-muted-foreground hover:text-foreground rounded-md"
              title="Close"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Recipients Form Header */}
        <div className="bg-card shrink-0">
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
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                {!showCc && (
                  <button
                    type="button"
                    onClick={() => setShowCc(true)}
                    className="hover:text-primary transition-colors font-medium px-1 py-0.5 rounded hover:bg-muted"
                  >
                    Cc
                  </button>
                )}
                {!showBcc && (
                  <button
                    type="button"
                    onClick={() => setShowBcc(true)}
                    className="hover:text-primary transition-colors font-medium px-1 py-0.5 rounded hover:bg-muted"
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
                  className="text-[10px] text-muted-foreground hover:text-foreground"
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
                  className="text-[10px] text-muted-foreground hover:text-foreground"
                >
                  Remove
                </button>
              }
            />
          )}

          {/* Subject Field */}
          <div className="px-3 py-1.5 border-b border-border/60 flex items-center">
            <input
              type="text"
              placeholder="Subject"
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value);
                setDraftStatus("unsaved");
              }}
              className="w-full bg-transparent outline-none text-xs sm:text-sm font-semibold text-foreground placeholder:text-muted-foreground/60 h-7"
            />
          </div>
        </div>

        {/* Rich Text Editor Body Area */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
          {/* Drag & Drop Visual Overlay */}
          {isDraggingOver && (
            <div className="absolute inset-0 z-20 bg-primary/10 border-2 border-dashed border-primary rounded-xl flex items-center justify-center pointer-events-none backdrop-blur-2xs">
              <div className="flex items-center gap-2 text-xs font-bold text-primary bg-card px-4 py-2 rounded-xl shadow-lg border">
                <Paperclip className="h-4 w-4" />
                <span>Drop files here to attach (up to 15MB each)</span>
              </div>
            </div>
          )}

          {/* Rich Text Editor with imperative ref for signature updates */}
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
          />

          {/* Attachments Chip List */}
          {files.length > 0 && (
            <div className="px-3 py-2 border-t border-border/60 bg-muted/20 space-y-1.5 shrink-0 max-h-32 overflow-y-auto">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground font-medium">
                <span className="flex items-center gap-1">
                  <Paperclip className="h-3 w-3" />
                  Attachments ({files.length}/{MAX_ATTACHMENTS})
                </span>
                <span className="text-[10px]">Max 15MB each</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {files.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-card border border-border/80 text-xs shadow-2xs group"
                  >
                    <FileIcon className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="truncate max-w-[140px] text-[11px] font-medium text-foreground">
                      {file.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground">({formatFileSize(file.size)})</span>
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="p-0.5 text-muted-foreground hover:text-destructive rounded transition-colors"
                      title="Remove attachment"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Action Toolbar (Gmail Style) */}
        <div className="p-2 sm:p-2.5 border-t border-border/70 bg-muted/15 flex items-center justify-between gap-2 shrink-0 select-none">
          {/* Left Actions: Send Button & Quick Tools */}
          <div className="flex items-center gap-1.5">
            {/* Primary Send Button */}
            <Button
              type="button"
              disabled={sendEmailMutation.isPending || sendDraftMutation.isPending}
              onClick={handleSend}
              className="h-8 px-4 gap-1.5 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl shadow-xs"
            >
              {sendEmailMutation.isPending || sendDraftMutation.isPending ? (
                <>
                  <span className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  <span>Send</span>
                </>
              )}
            </Button>

            {/* Formatting Ribbon Toggle (Gmail 'A' icon) */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setShowFormattingBar(!showFormattingBar)}
              className={`h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground ${
                showFormattingBar ? "bg-muted text-primary font-bold shadow-2xs" : ""
              }`}
              title="Formatting options"
            >
              <Type className="h-4 w-4" />
            </Button>

            {/* Attach File Paperclip Button */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                if (e.target.files) {
                  handleFileSelect(Array.from(e.target.files));
                }
              }}
              multiple
              className="hidden"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={files.length >= MAX_ATTACHMENTS}
              className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
              title="Attach files"
            >
              <Paperclip className="h-4 w-4" />
            </Button>

            {/* Signature Management Menu Button (Gmail Style) */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={`h-8 w-8 rounded-lg transition-colors ${
                    activeSignatureId
                      ? "text-primary bg-primary/10 hover:bg-primary/20"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Insert signature"
                >
                  <PenTool className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 rounded-xl p-1.5 shadow-xl border-border/70">
                <DropdownMenuLabel className="text-[10px] font-bold text-muted-foreground uppercase px-2 py-1 flex items-center justify-between">
                  <span>Insert Signature</span>
                  {activeSignatureId && (
                    <span className="text-[9px] text-primary font-semibold lowercase">active</span>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                {signatures.map((sig) => {
                  const sigId = sig._id || sig.id || "";
                  const isSelected = activeSignatureId === sigId;
                  return (
                    <DropdownMenuItem
                      key={sigId}
                      onClick={() => handleSelectSignature(sigId)}
                      className="flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg cursor-pointer"
                    >
                      <span className="truncate font-medium">{sig.name}</span>
                      {isSelected && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                    </DropdownMenuItem>
                  );
                })}

                <DropdownMenuItem
                  onClick={() => handleSelectSignature(null)}
                  className="flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg cursor-pointer text-muted-foreground hover:text-foreground"
                >
                  <span>No signature</span>
                  {!activeSignatureId && <Check className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
                </DropdownMenuItem>

                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setSignatureDialogOpen(true)}
                  className="px-2.5 py-1.5 text-xs font-semibold text-primary hover:text-primary hover:bg-primary/10 rounded-lg cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Manage signatures...</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Right Actions: Save Draft & Discard Trash Button */}
          <div className="flex items-center gap-1">
            {/* Save Draft Button */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={saveDraftMutation.isPending || updateDraftMutation.isPending}
              onClick={handleSaveDraft}
              className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground rounded-lg gap-1"
              title="Save draft"
            >
              <Save className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Save</span>
            </Button>

            {/* Discard Trash Button */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleDiscard}
              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
              title="Discard draft"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
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
