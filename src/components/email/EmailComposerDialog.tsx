"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
  Send, 
  Paperclip, 
  X, 
  Trash2, 
  FileText, 
  Sparkles, 
  AlertCircle,
  Bold,
  Italic,
  Underline,
  List,
  CheckCircle2,
  FileIcon
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useSendEmail, useSaveDraft, useSendDraft, useUpdateDraft } from "@/hooks/useEmail";

interface EmailComposerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: {
    to?: string;
    cc?: string;
    bcc?: string;
    subject?: string;
    threadId?: string;
    inReplyTo?: string;
    text?: string;
    draftId?: string;
  };
}

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

  const [to, setTo] = useState("");
  const [showCc, setShowCc] = useState(false);
  const [cc, setCc] = useState("");
  const [showBcc, setShowBcc] = useState(false);
  const [bcc, setBcc] = useState("");
  const [subject, setSubject] = useState("");
  const [bodyText, setBodyText] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  // Sync initial data when opened
  useEffect(() => {
    if (open && initialData) {
      if (initialData.to) setTo(initialData.to);
      if (initialData.cc) { setCc(initialData.cc); setShowCc(true); }
      if (initialData.bcc) { setBcc(initialData.bcc); setShowBcc(true); }
      if (initialData.subject) setSubject(initialData.subject);
      if (initialData.text) setBodyText(initialData.text);
    } else if (!open) {
      // reset
      setTo("");
      setCc("");
      setBcc("");
      setShowCc(false);
      setShowBcc(false);
      setSubject("");
      setBodyText("");
      setFiles([]);
    }
  }, [open, initialData]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);

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

    setFiles((prev) => [...prev, ...validFiles]);
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

  const handleSend = () => {
    if (!to.trim()) {
      toast.error("Please provide at least one recipient email.");
      return;
    }
    if (!subject.trim()) {
      toast.error("Please enter a subject line.");
      return;
    }

    const toArray = to.split(",").map((s) => s.trim()).filter(Boolean);
    const ccArray = cc ? cc.split(",").map((s) => s.trim()).filter(Boolean) : undefined;
    const bccArray = bcc ? bcc.split(",").map((s) => s.trim()).filter(Boolean) : undefined;

    const htmlBody = `<div style="font-family: sans-serif; line-height: 1.5; color: #333;">${bodyText.replace(
      /\n/g,
      "<br/>"
    )}</div>`;

    if (initialData?.draftId) {
      sendDraftMutation.mutate(initialData.draftId, {
        onSuccess: () => onOpenChange(false),
      });
      return;
    }

    sendEmailMutation.mutate(
      {
        to: toArray,
        subject,
        cc: ccArray,
        bcc: bccArray,
        text: bodyText,
        html: htmlBody,
        threadId: initialData?.threadId,
        inReplyTo: initialData?.inReplyTo,
        attachments: files.length > 0 ? files : undefined,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  const handleSaveDraft = () => {
    const toArray = to ? to.split(",").map((s) => s.trim()).filter(Boolean) : undefined;
    const ccArray = cc ? cc.split(",").map((s) => s.trim()).filter(Boolean) : undefined;
    const bccArray = bcc ? bcc.split(",").map((s) => s.trim()).filter(Boolean) : undefined;

    const htmlBody = bodyText ? `<div style="font-family: sans-serif; line-height: 1.5; color: #333;">${bodyText.replace(/\n/g,"<br/>")}</div>` : undefined;

    const payload = {
      to: toArray,
      subject,
      cc: ccArray,
      bcc: bccArray,
      text: bodyText,
      html: htmlBody,
      threadId: initialData?.threadId,
      inReplyTo: initialData?.inReplyTo,
      attachments: files.length > 0 ? files : undefined,
    };

    if (initialData?.draftId) {
      updateDraftMutation.mutate({ draftId: initialData.draftId, payload }, {
        onSuccess: () => {
          toast.success("Draft updated");
          onOpenChange(false);
        }
      });
    } else {
      saveDraftMutation.mutate(payload, {
        onSuccess: () => {
          toast.success("Draft saved");
          onOpenChange(false);
        }
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px] max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="p-4 border-b bg-muted/20">
          <DialogTitle className="text-sm sm:text-base font-bold flex items-center gap-2">
            <Send className="h-4 w-4 text-primary" />
            {initialData?.draftId ? "Edit Draft" : initialData?.threadId ? "Reply to Conversation" : "Compose New Email"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Dispatches through your connected organization mailbox and SMTP gateway.
          </DialogDescription>
        </DialogHeader>

        {/* Composer Form Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* To Field */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold">To</Label>
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                {!showCc && (
                  <button
                    type="button"
                    onClick={() => setShowCc(true)}
                    className="hover:text-primary transition-colors"
                  >
                    + Cc
                  </button>
                )}
                {!showBcc && (
                  <button
                    type="button"
                    onClick={() => setShowBcc(true)}
                    className="hover:text-primary transition-colors"
                  >
                    + Bcc
                  </button>
                )}
              </div>
            </div>
            <Input
              type="text"
              placeholder="candidate@example.com, client@example.com"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="text-xs h-8.5"
            />
          </div>

          {/* Optional Cc Field */}
          {showCc && (
            <div className="space-y-1 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">Cc</Label>
                <button
                  type="button"
                  onClick={() => setShowCc(false)}
                  className="text-muted-foreground hover:text-foreground text-[10px]"
                >
                  Remove
                </button>
              </div>
              <Input
                type="text"
                placeholder="colleague@yourcompany.com"
                value={cc}
                onChange={(e) => setCc(e.target.value)}
                className="text-xs h-8.5"
              />
            </div>
          )}

          {/* Optional Bcc Field */}
          {showBcc && (
            <div className="space-y-1 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">Bcc</Label>
                <button
                  type="button"
                  onClick={() => setShowBcc(false)}
                  className="text-muted-foreground hover:text-foreground text-[10px]"
                >
                  Remove
                </button>
              </div>
              <Input
                type="text"
                placeholder="archive@yourcompany.com"
                value={bcc}
                onChange={(e) => setBcc(e.target.value)}
                className="text-xs h-8.5"
              />
            </div>
          )}

          {/* Subject Field */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold">Subject</Label>
            <Input
              type="text"
              placeholder="Interview slot confirmation / Offer letter..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="text-xs h-8.5"
            />
          </div>

          {/* Message Body Field */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold">Message</Label>
            <Textarea
              placeholder="Type your message here..."
              value={bodyText}
              onChange={(e) => setBodyText(e.target.value)}
              rows={8}
              className="text-xs resize-none"
            />
          </div>

          {/* Attachments Section */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold flex items-center gap-1.5">
                <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
                Attachments ({files.length}/{MAX_ATTACHMENTS})
              </Label>
              <span className="text-[10px] text-muted-foreground">Max 15MB each</span>
            </div>

            {/* Attached files list */}
            {files.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {files.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg border bg-muted/30 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileIcon className="h-4 w-4 text-primary shrink-0" />
                      <div className="truncate">
                        <p className="font-medium text-foreground truncate">{file.name}</p>
                        <p className="text-[10px] text-muted-foreground">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="p-1 text-muted-foreground hover:text-destructive rounded transition-colors ml-1"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add attachment trigger */}
            {files.length < MAX_ATTACHMENTS && (
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  multiple
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-8 text-xs gap-1.5 w-full sm:w-auto"
                >
                  <Paperclip className="h-3.5 w-3.5" />
                  Attach File
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <DialogFooter className="p-3.5 border-t bg-muted/10 flex items-center justify-between sm:justify-between w-full">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs h-8 text-muted-foreground hover:text-foreground"
          >
            Discard
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={saveDraftMutation.isPending || updateDraftMutation.isPending || sendDraftMutation.isPending || sendEmailMutation.isPending}
              onClick={handleSaveDraft}
              className="text-xs h-8"
            >
              {saveDraftMutation.isPending || updateDraftMutation.isPending ? "Saving..." : "Save Draft"}
            </Button>

            <Button
              type="button"
              disabled={sendEmailMutation.isPending || sendDraftMutation.isPending}
              onClick={handleSend}
              className="text-xs h-8 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-sm"
            >
              {sendEmailMutation.isPending || sendDraftMutation.isPending ? (
                <>
                  <span className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Sending email...
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  Send Email
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
