"use client";

import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import { toast } from "sonner";

// MUI Icons
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
import AttachFileOutlinedIcon from "@mui/icons-material/AttachFileOutlined";
import FormatClearOutlinedIcon from "@mui/icons-material/FormatClearOutlined";
import CropFreeOutlinedIcon from "@mui/icons-material/CropFreeOutlined";
import CloseFullscreenOutlinedIcon from "@mui/icons-material/CloseFullscreenOutlined";
import SendIcon from "@mui/icons-material/Send";
import CircularProgress from "@mui/material/CircularProgress";
import CloseIcon from "@mui/icons-material/Close";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";

export interface EmailEditorProps {
  value: string;
  onChange: (val: string) => void;
  onSend?: () => void;
  isSending?: boolean;
  placeholder?: string;
  className?: string;
}

export function EmailEditor({
  value,
  onChange,
  onSend,
  isSending = false,
  placeholder = "Write a message...",
  className,
}: EmailEditorProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showParagraphMenu, setShowParagraphMenu] = useState(false);
  const [linkPopoverOpen, setLinkPopoverOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const linkPopoverRef = useRef<HTMLDivElement>(null);
  const savedSelectionRef = useRef<{ from: number; to: number } | null>(null);

  // Initialize Tiptap editor
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 dark:text-blue-400 underline font-medium hover:underline cursor-pointer",
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),
      TextAlign.configure({
        types: ["paragraph", "heading"],
        alignments: ["left", "center", "right", "justify"],
      }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class: "email-rich-editor tiptap max-w-none leading-relaxed text-[#1C252E] dark:text-white outline-none min-h-[75px] w-full",
        "data-placeholder": placeholder,
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html === "<p></p>" ? "" : html);
    },
  });

  // Sync value when reset from outside (e.g. on send)
  useEffect(() => {
    if (editor) {
      const currentHtml = editor.getHTML();
      if (value !== currentHtml && (value === "" || editor.getText().trim() === "")) {
        editor.commands.setContent(value || "");
      }
    }
  }, [value, editor]);

  // Handle ESC key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowParagraphMenu(false);
      }
      if (linkPopoverRef.current && !linkPopoverRef.current.contains(e.target as Node)) {
        setLinkPopoverOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getCurrentStyleLabel = () => {
    if (!editor) return "Paragraph";
    if (editor.isActive("heading", { level: 1 })) return "Heading 1";
    if (editor.isActive("heading", { level: 2 })) return "Heading 2";
    if (editor.isActive("heading", { level: 3 })) return "Heading 3";
    if (editor.isActive("blockquote")) return "Quote";
    return "Paragraph";
  };

  const handleParagraphSelect = (type: string) => {
    if (!editor) return;
    setShowParagraphMenu(false);

    if (type === "Heading 1") {
      editor.chain().focus().setHeading({ level: 1 }).run();
    } else if (type === "Heading 2") {
      editor.chain().focus().setHeading({ level: 2 }).run();
    } else if (type === "Heading 3") {
      editor.chain().focus().setHeading({ level: 3 }).run();
    } else if (type === "Quote") {
      editor.chain().focus().toggleBlockquote().run();
    } else {
      editor.chain().focus().setParagraph().run();
    }
  };

  const handleOpenLink = () => {
    if (!editor) return;
    const { from, to, empty } = editor.state.selection;
    savedSelectionRef.current = { from, to };
    const selectedText = empty ? "" : editor.state.doc.textBetween(from, to, " ");
    const existingHref = editor.getAttributes("link").href || "";
    setLinkUrl(existingHref);
    setLinkText(selectedText);
    setLinkPopoverOpen(true);
  };

  const handleApplyLink = () => {
    if (!editor) return;
    const url = linkUrl.trim();
    const sel = savedSelectionRef.current || editor.state.selection;
    const { from, to } = sel;

    if (!url) {
      editor.chain().focus().setTextSelection({ from, to }).extendMarkRange("link").unsetLink().run();
      setLinkPopoverOpen(false);
      return;
    }

    const formattedUrl = /^https?:\/\//i.test(url) ? url : `https://${url}`;

    if (from !== to) {
      const docText = editor.state.doc.textBetween(from, to, " ");
      if (linkText.trim() && linkText.trim() !== docText) {
        editor
          .chain()
          .focus()
          .setTextSelection({ from, to })
          .insertContent(`<a href="${formattedUrl}" target="_blank" rel="noopener noreferrer">${linkText.trim()}</a>`)
          .run();
      } else {
        editor
          .chain()
          .focus()
          .setTextSelection({ from, to })
          .extendMarkRange("link")
          .setLink({ href: formattedUrl })
          .run();
      }
    } else {
      const textToDisplay = linkText.trim() || formattedUrl;
      editor
        .chain()
        .focus()
        .setTextSelection({ from, to })
        .insertContent(`<a href="${formattedUrl}" target="_blank" rel="noopener noreferrer">${textToDisplay}</a>&nbsp;`)
        .run();
    }

    setLinkUrl("");
    setLinkText("");
    setLinkPopoverOpen(false);
  };

  const handleRemoveLink = () => {
    if (!editor) return;
    const sel = savedSelectionRef.current || editor.state.selection;
    const { from, to } = sel;
    editor.chain().focus().setTextSelection({ from, to }).extendMarkRange("link").unsetLink().run();
    setLinkUrl("");
    setLinkText("");
    setLinkPopoverOpen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setAttachedFiles((prev) => [...prev, ...newFiles]);
      toast.success(`Attached ${newFiles.length} file${newFiles.length > 1 ? "s" : ""}`);
      e.target.value = "";
    }
  };

  const removeAttachedFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const clearFormatting = () => {
    if (!editor) return;
    editor.chain().focus().unsetAllMarks().clearNodes().run();
  };

  const currentLabel = getCurrentStyleLabel();

  // The Toolbar component reused in both inline and fullscreen views
  const renderToolbar = () => (
    <div className="flex flex-wrap items-center gap-0.5 sm:gap-1 text-[#637381] dark:text-[#919EAB] select-none relative">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        multiple
        accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.rtf,.zip,.rar,.png,.jpg,.jpeg,.gif,.webp,image/*"
        className="hidden"
      />

      {/* Paragraph / Heading Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setShowParagraphMenu((prev) => !prev)}
          className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-colors",
            currentLabel !== "Paragraph"
              ? "bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-bold"
              : "text-[#1C252E] dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          )}
        >
          <span>{currentLabel}</span>
          <KeyboardArrowDownOutlinedIcon sx={{ fontSize: 16 }} />
        </button>

        {showParagraphMenu && (
          <div className="absolute top-full left-0 mt-1 w-36 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-1 z-50 text-xs font-medium animate-in fade-in duration-100">
            {[
              { label: "Paragraph", desc: "Normal text" },
              { label: "Heading 1", desc: "Large heading" },
              { label: "Heading 2", desc: "Medium heading" },
              { label: "Heading 3", desc: "Small heading" },
              { label: "Quote", desc: "Blockquote" },
            ].map(({ label, desc }) => (
              <button
                key={label}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleParagraphSelect(label);
                }}
                onClick={() => handleParagraphSelect(label)}
                className={cn(
                  "w-full text-left px-2.5 py-1.5 rounded-lg transition-colors flex flex-col",
                  currentLabel === label
                    ? "bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-bold"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                )}
              >
                <span>{label}</span>
                <span className="text-[10px] text-slate-400 font-normal">{desc}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1" />

      {/* Bold, Italic, Underline, Strikethrough */}
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => editor?.chain().focus().toggleBold().run()}
        className={cn(
          "h-7 w-7 rounded-lg text-xs font-bold transition-colors flex items-center justify-center",
          editor?.isActive("bold")
            ? "bg-slate-200 text-[#1C252E] dark:bg-slate-700 dark:text-white"
            : "hover:bg-slate-100 dark:hover:bg-slate-800"
        )}
        title="Bold (Ctrl+B)"
      >
        B
      </button>

      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => editor?.chain().focus().toggleItalic().run()}
        className={cn(
          "h-7 w-7 rounded-lg text-xs italic font-serif transition-colors flex items-center justify-center",
          editor?.isActive("italic")
            ? "bg-slate-200 text-[#1C252E] dark:bg-slate-700 dark:text-white"
            : "hover:bg-slate-100 dark:hover:bg-slate-800"
        )}
        title="Italic (Ctrl+I)"
      >
        I
      </button>

      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => editor?.chain().focus().toggleUnderline().run()}
        className={cn(
          "h-7 w-7 rounded-lg text-xs underline transition-colors flex items-center justify-center",
          editor?.isActive("underline")
            ? "bg-slate-200 text-[#1C252E] dark:bg-slate-700 dark:text-white"
            : "hover:bg-slate-100 dark:hover:bg-slate-800"
        )}
        title="Underline (Ctrl+U)"
      >
        U
      </button>

      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => editor?.chain().focus().toggleStrike().run()}
        className={cn(
          "h-7 w-7 rounded-lg text-xs line-through transition-colors flex items-center justify-center",
          editor?.isActive("strike")
            ? "bg-slate-200 text-[#1C252E] dark:bg-slate-700 dark:text-white"
            : "hover:bg-slate-100 dark:hover:bg-slate-800"
        )}
        title="Strikethrough"
      >
        S
      </button>

      <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1" />

      {/* Bulleted & Numbered Lists */}
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => editor?.chain().focus().toggleBulletList().run()}
        className={cn(
          "p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors",
          editor?.isActive("bulletList") && "bg-slate-200 dark:bg-slate-700 text-[#1C252E] dark:text-white"
        )}
        title="Bullet list"
      >
        <FormatListBulletedOutlinedIcon sx={{ fontSize: 17 }} />
      </button>

      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        className={cn(
          "p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors",
          editor?.isActive("orderedList") && "bg-slate-200 dark:bg-slate-700 text-[#1C252E] dark:text-white"
        )}
        title="Numbered list"
      >
        <FormatListNumberedOutlinedIcon sx={{ fontSize: 17 }} />
      </button>

      <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1" />

      {/* Alignment */}
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => editor?.chain().focus().setTextAlign("left").run()}
        className={cn(
          "p-1 rounded-lg transition-colors",
          editor?.isActive({ textAlign: "left" })
            ? "bg-slate-100 text-[#1C252E] dark:bg-slate-800 dark:text-white"
            : "hover:bg-slate-100 dark:hover:bg-slate-800"
        )}
        title="Align left"
      >
        <FormatAlignLeftOutlinedIcon sx={{ fontSize: 17 }} />
      </button>

      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => editor?.chain().focus().setTextAlign("center").run()}
        className={cn(
          "p-1 rounded-lg transition-colors",
          editor?.isActive({ textAlign: "center" })
            ? "bg-slate-100 text-[#1C252E] dark:bg-slate-800 dark:text-white"
            : "hover:bg-slate-100 dark:hover:bg-slate-800"
        )}
        title="Align center"
      >
        <FormatAlignCenterOutlinedIcon sx={{ fontSize: 17 }} />
      </button>

      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => editor?.chain().focus().setTextAlign("right").run()}
        className={cn(
          "p-1 rounded-lg transition-colors",
          editor?.isActive({ textAlign: "right" })
            ? "bg-slate-100 text-[#1C252E] dark:bg-slate-800 dark:text-white"
            : "hover:bg-slate-100 dark:hover:bg-slate-800"
        )}
        title="Align right"
      >
        <FormatAlignRightOutlinedIcon sx={{ fontSize: 17 }} />
      </button>

      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => editor?.chain().focus().setTextAlign("justify").run()}
        className={cn(
          "p-1 rounded-lg transition-colors",
          editor?.isActive({ textAlign: "justify" })
            ? "bg-slate-100 text-[#1C252E] dark:bg-slate-800 dark:text-white"
            : "hover:bg-slate-100 dark:hover:bg-slate-800"
        )}
        title="Justify"
      >
        <FormatAlignJustifyOutlinedIcon sx={{ fontSize: 17 }} />
      </button>

      <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1" />

      {/* Link Button & Popover */}
      <div className="relative" ref={linkPopoverRef}>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleOpenLink}
          className={cn(
            "p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors",
            editor?.isActive("link") && "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
          )}
          title="Insert link"
        >
          <InsertLinkOutlinedIcon sx={{ fontSize: 18 }} />
        </button>

        {linkPopoverOpen && (
          <div className="absolute top-full left-0 mt-1.5 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-3 z-50 text-xs space-y-2.5 animate-in fade-in duration-100">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#1C252E] dark:text-white">Insert Link</span>
              {editor?.isActive("link") && (
                <button
                  type="button"
                  onClick={handleRemoveLink}
                  className="text-[11px] text-rose-600 hover:underline flex items-center gap-0.5"
                >
                  <LinkOffOutlinedIcon sx={{ fontSize: 14 }} />
                  <span>Remove</span>
                </button>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Text to display
              </label>
              <input
                type="text"
                placeholder="Link text..."
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-xs text-[#1C252E] dark:text-white outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Web Address (URL)
              </label>
              <input
                type="text"
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleApplyLink();
                  }
                }}
                autoFocus
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent text-xs text-[#1C252E] dark:text-white outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setLinkPopoverOpen(false)}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyLink}
                disabled={!linkUrl.trim()}
                className="px-3 py-1 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40"
              >
                Apply
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Remove Link Button */}
      {editor?.isActive("link") && (
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleRemoveLink}
          className="p-1 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
          title="Remove link"
        >
          <LinkOffOutlinedIcon sx={{ fontSize: 18 }} />
        </button>
      )}

      {/* Attach File / Document */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors",
          attachedFiles.length > 0 && "text-blue-600 bg-blue-50 dark:bg-blue-950/30"
        )}
        title="Attach document or image"
      >
        <AttachFileOutlinedIcon sx={{ fontSize: 18 }} />
      </button>

      {/* Image Upload */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        title="Attach image"
      >
        <ImageOutlinedIcon sx={{ fontSize: 18 }} />
      </button>

      <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1" />

      {/* Clear Format */}
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={clearFormatting}
        className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        title="Clear formatting"
      >
        <FormatClearOutlinedIcon sx={{ fontSize: 18 }} />
      </button>

      <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1" />

      {/* Fullscreen Button */}
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setIsFullscreen((prev) => !prev)}
        className={cn(
          "p-1.5 rounded-lg transition-colors flex items-center justify-center ml-auto",
          isFullscreen
            ? "bg-slate-200/90 text-[#1C252E] dark:bg-slate-700 dark:text-white"
            : "hover:bg-slate-100 dark:hover:bg-slate-800 text-[#637381] dark:text-[#919EAB]"
        )}
        title={isFullscreen ? "Exit Fullscreen (Esc)" : "Fullscreen"}
      >
        {isFullscreen ? (
          <CloseFullscreenOutlinedIcon sx={{ fontSize: 17 }} />
        ) : (
          <CropFreeOutlinedIcon sx={{ fontSize: 17 }} />
        )}
      </button>
    </div>
  );

  return (
    <>
      {/* ========================================================= */}
      {/* 1. FULLSCREEN OVERLAY                                     */}
      {/* ========================================================= */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-[#F9FAFB] dark:bg-[#161C24] p-5 sm:p-7 flex flex-col animate-in fade-in zoom-in-95 duration-200 font-['Public_Sans',sans-serif]">
          {/* Top Bar with Toolbar and Actions */}
          <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800 shrink-0">
            {renderToolbar()}

            {/* Top Right Fullscreen Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {onSend && (
                <button
                  type="button"
                  onClick={onSend}
                  disabled={isSending}
                  className="px-4 py-1.5 rounded-xl bg-[#1C252E] hover:bg-[#28323D] dark:bg-white dark:hover:bg-slate-100 text-white dark:text-[#1C252E] font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs disabled:opacity-50"
                >
                  {isSending ? (
                    <CircularProgress size={12} color="inherit" />
                  ) : (
                    <>
                      <span>Send</span>
                      <SendIcon sx={{ fontSize: 13 }} />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Fullscreen Canvas Content */}
          <div className="flex-1 min-h-0 pt-4 flex flex-col overflow-y-auto cursor-text">
            <EditorContent editor={editor} className="flex-1" />
          </div>

          {/* Attached Files List */}
          {attachedFiles.length > 0 && (
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap gap-2">
              {attachedFiles.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs shadow-2xs"
                >
                  <InsertDriveFileOutlinedIcon sx={{ fontSize: 15, color: "#2563EB" }} />
                  <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[150px]">
                    {file.name}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    ({Math.round(file.size / 1024)} KB)
                  </span>
                  <button
                    type="button"
                    onClick={() => removeAttachedFile(idx)}
                    className="p-0.5 text-slate-400 hover:text-rose-600 rounded"
                  >
                    <CloseIcon sx={{ fontSize: 13 }} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. INLINE BOX (INSIDE DETAIL VIEW)                        */}
      {/* ========================================================= */}
      <div
        className={cn(
          "rounded-2xl border border-slate-200/90 dark:border-slate-700/80 bg-white dark:bg-slate-900/40 p-3 shadow-2xs focus-within:border-slate-300 dark:focus-within:border-slate-600 transition-all font-['Public_Sans',sans-serif]",
          className
        )}
      >
        {/* Toolbar Row */}
        <div className="pb-2 border-b border-slate-100 dark:border-slate-800">
          {renderToolbar()}
        </div>

        {/* Tiptap Rich Editor Body */}
        <div className="pt-2 flex flex-col gap-2 min-h-[90px] cursor-text" onClick={() => editor?.commands.focus()}>
          <div className="flex-1 min-h-[60px]">
            <EditorContent editor={editor} />
          </div>

          {/* Attached Files in Inline View */}
          {attachedFiles.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              {attachedFiles.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700/70 text-xs shadow-2xs"
                >
                  <InsertDriveFileOutlinedIcon sx={{ fontSize: 14, color: "#2563EB" }} />
                  <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[130px]">
                    {file.name}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    ({Math.round(file.size / 1024)} KB)
                  </span>
                  <button
                    type="button"
                    onClick={() => removeAttachedFile(idx)}
                    className="p-0.5 text-slate-400 hover:text-rose-600 rounded"
                  >
                    <CloseIcon sx={{ fontSize: 13 }} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Bottom Send Action Row */}
          {onSend && (
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={onSend}
                disabled={isSending}
                className="px-3.5 py-1.5 rounded-xl bg-[#1C252E] hover:bg-[#28323D] dark:bg-white dark:hover:bg-slate-100 text-white dark:text-[#1C252E] font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs disabled:opacity-50"
              >
                {isSending ? (
                  <CircularProgress size={12} color="inherit" />
                ) : (
                  <>
                    <span>Reply</span>
                    <SendIcon sx={{ fontSize: 13 }} />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
