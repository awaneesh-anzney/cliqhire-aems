"use client";

import React, { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  Strikethrough, 
  List, 
  ListOrdered, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  Link2, 
  Unlink, 
  Quote, 
  Code, 
  Undo, 
  Redo, 
  RemoveFormatting,
  Heading1,
  Heading2,
  Heading3,
  Pilcrow,
  Highlighter,
  Ban,
  Check,
  Pipette,
  Paperclip,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface EmailRichEditorProps {
  initialContent?: string;
  onChange?: (html: string, text: string) => void;
  showToolbar?: boolean;
  placeholder?: string;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  className?: string;
  onAttachClick?: () => void;
}

const TEXT_COLORS = [
  "#000000", "#434343", "#666666", "#999999", "#b7b7b7", "#ffffff",
  "#d93025", "#ea4335", "#e37400", "#fbbc04", "#137333", "#1a73e8",
  "#9334e6", "#c2185b", "#00838f", "#2e7d32", "#1565c0", "#6a1b9a",
  "#741b47", "#a61c1c", "#b45f06", "#274e13", "#0b5394", "#351c75",
];

const HIGHLIGHT_COLORS = [
  "#ffffff", "#f3f4f6", "#e5e7eb", "#d1d5db", "#9ca3af", "#4b5563",
  "#fee2e2", "#ffedd5", "#fef9c3", "#dcfce7", "#e0f2fe", "#f3e8ff",
  "#fecaca", "#fed7aa", "#fef08a", "#bbf7d0", "#bae6fd", "#e9d5ff",
  "#fca5a5", "#fdba74", "#fde047", "#86efac", "#7dd3fc", "#d8b4fe",
];

export interface EmailRichEditorRef {
  setContent: (html: string) => void;
  insertContent: (html: string) => void;
  getHTML: () => string;
  getText: () => string;
  focus: () => void;
}

export const EmailRichEditor = React.forwardRef<EmailRichEditorRef, EmailRichEditorProps>(({
  initialContent = "",
  onChange,
  showToolbar = true,
  placeholder = "Write your message here...",
  onKeyDown,
  className = "",
  onAttachClick,
}, ref) => {
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [linkPopoverOpen, setLinkPopoverOpen] = useState(false);
  const [colorPopoverOpen, setColorPopoverOpen] = useState(false);
  const [activeColorTab, setActiveColorTab] = useState<"text" | "highlight">("text");
  const [customTextColor, setCustomTextColor] = useState("#1a73e8");
  const [customHighlightColor, setCustomHighlightColor] = useState("#fef08a");
  const [showParagraphMenu, setShowParagraphMenu] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const savedSelectionRef = React.useRef<{ from: number; to: number } | null>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowParagraphMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
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
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: cn(
          "email-rich-editor tiptap max-w-none p-3 sm:p-4 min-h-[220px] focus:outline-none leading-relaxed select-text",
          className
        ),
        "data-placeholder": placeholder,
      },
    },
    onUpdate: ({ editor }) => {
      if (onChange) {
        onChange(editor.getHTML(), editor.getText());
      }
    },
  });

  React.useImperativeHandle(ref, () => ({
    setContent: (html: string) => {
      if (editor) {
        editor.commands.setContent(html);
        if (onChange) {
          onChange(html, editor.getText());
        }
      }
    },
    insertContent: (html: string) => {
      if (editor) {
        editor.commands.insertContent(html);
        if (onChange) {
          onChange(editor.getHTML(), editor.getText());
        }
      }
    },
    getHTML: () => editor?.getHTML() || "",
    getText: () => editor?.getText() || "",
    focus: () => editor?.commands.focus(),
  }), [editor, onChange]);

  // Keep editor content in sync when initialContent changes externally
  useEffect(() => {
    if (editor && initialContent !== undefined) {
      const currentHtml = editor.getHTML();
      if (initialContent !== currentHtml && editor.getText().trim() === "") {
        editor.commands.setContent(initialContent);
      }
    }
  }, [editor, initialContent]);

  if (!editor) {
    return null;
  }

  const handleOpenLinkPopover = () => {
    const { from, to, empty } = editor.state.selection;
    savedSelectionRef.current = { from, to };
    const selectedText = empty ? "" : editor.state.doc.textBetween(from, to, " ");
    const existingHref = editor.getAttributes("link").href || "";
    setLinkUrl(existingHref);
    setLinkText(selectedText);
    setLinkPopoverOpen(true);
  };

  const handleApplyLink = () => {
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
        // User customized display text for highlighted range
        editor
          .chain()
          .focus()
          .setTextSelection({ from, to })
          .insertContent(`<a href="${formattedUrl}" target="_blank" rel="noopener noreferrer">${linkText.trim()}</a>`)
          .run();
      } else {
        // Turn selected text into link
        editor
          .chain()
          .focus()
          .setTextSelection({ from, to })
          .extendMarkRange("link")
          .setLink({ href: formattedUrl })
          .run();
      }
    } else {
      // Insert new link node with text
      const displayText = linkText.trim() || formattedUrl;
      editor
        .chain()
        .focus()
        .setTextSelection({ from, to })
        .insertContent(`<a href="${formattedUrl}" target="_blank" rel="noopener noreferrer">${displayText}</a>&nbsp;`)
        .run();
    }

    setLinkUrl("");
    setLinkText("");
    setLinkPopoverOpen(false);
  };

  const handleRemoveLink = () => {
    const sel = savedSelectionRef.current || editor.state.selection;
    const { from, to } = sel;
    editor.chain().focus().setTextSelection({ from, to }).extendMarkRange("link").unsetLink().run();
    setLinkUrl("");
    setLinkText("");
    setLinkPopoverOpen(false);
  };

  const handleApplyTextColor = (hex: string) => {
    editor.chain().focus().setColor(hex).run();
  };

  const handleClearTextColor = () => {
    editor.chain().focus().unsetColor().run();
  };

  const handleApplyHighlightColor = (hex: string) => {
    editor.chain().focus().toggleHighlight({ color: hex }).run();
  };

  const handleClearHighlightColor = () => {
    editor.chain().focus().unsetHighlight().run();
  };

  const getCurrentStyleLabel = () => {
    if (!editor) return "Paragraph";
    if (editor.isActive("heading", { level: 1 })) return "Heading 1";
    if (editor.isActive("heading", { level: 2 })) return "Heading 2";
    if (editor.isActive("heading", { level: 3 })) return "Heading 3";
    if (editor.isActive("blockquote")) return "Quote";
    return "Paragraph";
  };

  const handleParagraphSelect = (type: string) => {
    setShowParagraphMenu(false);
    if (!editor) return;
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

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden" onKeyDown={onKeyDown}>
      {/* Top Rich Text Formatting Ribbon (Natural word processor placement) */}
      {showToolbar && (
        <div className="border-b border-border/60 bg-muted/25 px-2.5 py-1.5 flex items-center flex-wrap gap-0.5 text-muted-foreground select-none shrink-0 transition-all">
          {/* Undo / Redo */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="h-7 w-7 rounded-md hover:bg-muted"
            title="Undo (Ctrl+Z)"
          >
            <Undo className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="h-7 w-7 rounded-md hover:bg-muted"
            title="Redo (Ctrl+Y)"
          >
            <Redo className="h-3.5 w-3.5" />
          </Button>

          <span className="w-px h-4 bg-border/80 mx-1" />

          {/* Paragraph / Heading Style Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setShowParagraphMenu((prev) => !prev)}
              className={cn(
                "h-7 px-2 gap-1 rounded-md text-xs font-semibold hover:bg-muted transition-colors",
                getCurrentStyleLabel() !== "Paragraph"
                  ? "bg-muted text-primary font-bold shadow-2xs"
                  : "text-foreground"
              )}
            >
              <span>{getCurrentStyleLabel()}</span>
              <ChevronDown className="h-3 w-3 opacity-60" />
            </Button>

            {showParagraphMenu && (
              <div className="absolute top-full left-0 mt-1 w-36 bg-popover border border-border/70 rounded-xl shadow-xl p-1 z-50 text-xs font-medium animate-in fade-in duration-100">
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
                      getCurrentStyleLabel() === label
                        ? "bg-muted text-primary font-bold"
                        : "text-foreground hover:bg-muted/70"
                    )}
                  >
                    <span>{label}</span>
                    <span className="text-[10px] text-muted-foreground font-normal">{desc}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Heading / Paragraph Style Toggles */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onMouseDown={(e) => {
              e.preventDefault();
              editor.chain().focus().setParagraph().run();
            }}
            className={`h-7 px-2 rounded-md hover:bg-muted text-xs font-semibold ${
              editor.isActive("paragraph") ? "bg-muted text-foreground font-bold shadow-2xs" : ""
            }`}
            title="Normal Paragraph"
          >
            <Pilcrow className="h-3.5 w-3.5 mr-1" />
            <span>P</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onMouseDown={(e) => {
              e.preventDefault();
              if (editor.isActive("heading", { level: 1 })) {
                editor.chain().focus().setParagraph().run();
              } else {
                editor.chain().focus().setHeading({ level: 1 }).run();
              }
            }}
            className={`h-7 px-2 rounded-md hover:bg-muted text-xs font-bold ${
              editor.isActive("heading", { level: 1 }) ? "bg-muted text-primary font-bold shadow-2xs" : ""
            }`}
            title="Heading 1 (Large)"
          >
            <Heading1 className="h-3.5 w-3.5 mr-0.5" />
            <span>H1</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onMouseDown={(e) => {
              e.preventDefault();
              if (editor.isActive("heading", { level: 2 })) {
                editor.chain().focus().setParagraph().run();
              } else {
                editor.chain().focus().setHeading({ level: 2 }).run();
              }
            }}
            className={`h-7 px-2 rounded-md hover:bg-muted text-xs font-bold ${
              editor.isActive("heading", { level: 2 }) ? "bg-muted text-primary font-bold shadow-2xs" : ""
            }`}
            title="Heading 2 (Medium)"
          >
            <Heading2 className="h-3.5 w-3.5 mr-0.5" />
            <span>H2</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onMouseDown={(e) => {
              e.preventDefault();
              if (editor.isActive("heading", { level: 3 })) {
                editor.chain().focus().setParagraph().run();
              } else {
                editor.chain().focus().setHeading({ level: 3 }).run();
              }
            }}
            className={`h-7 px-2 rounded-md hover:bg-muted text-xs font-bold ${
              editor.isActive("heading", { level: 3 }) ? "bg-muted text-primary font-bold shadow-2xs" : ""
            }`}
            title="Heading 3 (Small)"
          >
            <Heading3 className="h-3.5 w-3.5 mr-0.5" />
            <span>H3</span>
          </Button>

          <span className="w-px h-4 bg-border/80 mx-1" />

          {/* Basic Text Formats: Bold, Italic, Underline, Strikethrough */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`h-7 w-7 rounded-md hover:bg-muted ${
              editor.isActive("bold") ? "bg-muted text-foreground font-bold shadow-2xs" : ""
            }`}
            title="Bold (Ctrl+B)"
          >
            <Bold className="h-3.5 w-3.5" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`h-7 w-7 rounded-md hover:bg-muted ${
              editor.isActive("italic") ? "bg-muted text-foreground font-bold shadow-2xs" : ""
            }`}
            title="Italic (Ctrl+I)"
          >
            <Italic className="h-3.5 w-3.5" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`h-7 w-7 rounded-md hover:bg-muted ${
              editor.isActive("underline") ? "bg-muted text-foreground font-bold shadow-2xs" : ""
            }`}
            title="Underline (Ctrl+U)"
          >
            <UnderlineIcon className="h-3.5 w-3.5" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`h-7 w-7 rounded-md hover:bg-muted ${
              editor.isActive("strike") ? "bg-muted text-foreground font-bold shadow-2xs" : ""
            }`}
            title="Strikethrough"
          >
            <Strikethrough className="h-3.5 w-3.5" />
          </Button>

          {/* Text Color & Highlight Popover */}
          <Popover open={colorPopoverOpen} onOpenChange={setColorPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onMouseDown={(e) => e.preventDefault()}
                className="h-7 px-1.5 gap-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
                title="Text Color & Highlight"
              >
                <div className="flex items-center">
                  <span className="font-bold font-serif text-sm leading-none border-b-2 border-primary pb-0.5 px-0.5">
                    A
                  </span>
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] sm:w-[320px] p-3 text-xs rounded-2xl shadow-xl" align="start">
              <div className="space-y-3">
                <div className="grid grid-cols-2 p-1 bg-muted/60 rounded-xl gap-1">
                  <button
                    type="button"
                    onClick={() => setActiveColorTab("text")}
                    className={`flex items-center justify-center gap-1.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                      activeColorTab === "text"
                        ? "bg-card text-foreground shadow-2xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span>Text Color</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveColorTab("highlight")}
                    className={`flex items-center justify-center gap-1.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                      activeColorTab === "highlight"
                        ? "bg-card text-foreground shadow-2xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span>Highlight</span>
                  </button>
                </div>

                {activeColorTab === "text" ? (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="font-medium">Theme Colors</span>
                      <button
                        type="button"
                        onClick={handleClearTextColor}
                        className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Ban className="h-3 w-3" />
                        <span>Default</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-6 gap-1.5 p-1 rounded-xl bg-muted/20 border border-border/60">
                      {TEXT_COLORS.map((hex) => {
                        const isActive = editor.isActive("textStyle", { color: hex });
                        return (
                          <button
                            key={hex}
                            type="button"
                            onClick={() => handleApplyTextColor(hex)}
                            className={`h-6 w-full rounded-md border border-black/10 dark:border-white/10 flex items-center justify-center transition-transform hover:scale-110 relative ${
                              isActive ? "ring-2 ring-primary ring-offset-1" : ""
                            }`}
                            style={{ backgroundColor: hex }}
                            title={hex}
                          >
                            {isActive && (
                              <Check
                                className={`h-3 w-3 ${
                                  hex === "#ffffff" || hex === "#fef9c3" ? "text-black" : "text-white"
                                }`}
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-border/60 text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <Pipette className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-muted-foreground font-medium">Custom:</span>
                        <input
                          type="color"
                          value={customTextColor}
                          onChange={(e) => {
                            setCustomTextColor(e.target.value);
                            handleApplyTextColor(e.target.value);
                          }}
                          className="w-6 h-6 p-0 border-0 rounded cursor-pointer bg-transparent"
                        />
                      </div>
                      <span className="font-mono text-[10px] text-muted-foreground uppercase">
                        {customTextColor}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="font-medium">Marker Colors</span>
                      <button
                        type="button"
                        onClick={handleClearHighlightColor}
                        className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Ban className="h-3 w-3" />
                        <span>No Highlight</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-6 gap-1.5 p-1 rounded-xl bg-muted/20 border border-border/60">
                      {HIGHLIGHT_COLORS.map((hex) => {
                        const isActive = editor.isActive("highlight", { color: hex });
                        return (
                          <button
                            key={hex}
                            type="button"
                            onClick={() => handleApplyHighlightColor(hex)}
                            className={`h-6 w-full rounded-md border border-black/10 dark:border-white/10 flex items-center justify-center transition-transform hover:scale-110 relative ${
                              isActive ? "ring-2 ring-primary ring-offset-1" : ""
                            }`}
                            style={{ backgroundColor: hex }}
                            title={hex}
                          >
                            {isActive && <Check className="h-3 w-3 text-black/70" />}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-border/60 text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <Pipette className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-muted-foreground font-medium">Custom:</span>
                        <input
                          type="color"
                          value={customHighlightColor}
                          onChange={(e) => {
                            setCustomHighlightColor(e.target.value);
                            handleApplyHighlightColor(e.target.value);
                          }}
                          className="w-6 h-6 p-0 border-0 rounded cursor-pointer bg-transparent"
                        />
                      </div>
                      <span className="font-mono text-[10px] text-muted-foreground uppercase">
                        {customHighlightColor}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>

          <span className="w-px h-4 bg-border/80 mx-1" />

          {/* Text Alignment */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            className={`h-7 w-7 rounded-md hover:bg-muted ${
              editor.isActive({ textAlign: "left" }) ? "bg-muted text-foreground" : ""
            }`}
            title="Align Left"
          >
            <AlignLeft className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            className={`h-7 w-7 rounded-md hover:bg-muted ${
              editor.isActive({ textAlign: "center" }) ? "bg-muted text-foreground" : ""
            }`}
            title="Align Center"
          >
            <AlignCenter className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            className={`h-7 w-7 rounded-md hover:bg-muted ${
              editor.isActive({ textAlign: "right" }) ? "bg-muted text-foreground" : ""
            }`}
            title="Align Right"
          >
            <AlignRight className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            className={`h-7 w-7 rounded-md hover:bg-muted ${
              editor.isActive({ textAlign: "justify" }) ? "bg-muted text-foreground" : ""
            }`}
            title="Justify"
          >
            <AlignJustify className="h-3.5 w-3.5" />
          </Button>

          <span className="w-px h-4 bg-border/80 mx-1" />

          {/* Bulleted & Numbered Lists */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`h-7 w-7 rounded-md hover:bg-muted ${
              editor.isActive("bulletList") ? "bg-muted text-foreground font-bold shadow-2xs" : ""
            }`}
            title="Bulleted List"
          >
            <List className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`h-7 w-7 rounded-md hover:bg-muted ${
              editor.isActive("orderedList") ? "bg-muted text-foreground font-bold shadow-2xs" : ""
            }`}
            title="Numbered List"
          >
            <ListOrdered className="h-3.5 w-3.5" />
          </Button>

          <span className="w-px h-4 bg-border/80 mx-1" />

          {/* Blockquote & Code */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`h-7 w-7 rounded-md hover:bg-muted ${
              editor.isActive("blockquote") ? "bg-muted text-foreground font-bold shadow-2xs" : ""
            }`}
            title="Quote"
          >
            <Quote className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`h-7 w-7 rounded-md hover:bg-muted ${
              editor.isActive("codeBlock") ? "bg-muted text-foreground font-bold shadow-2xs" : ""
            }`}
            title="Code Block"
          >
            <Code className="h-3.5 w-3.5" />
          </Button>

          {/* Hyperlink Dialog Popover */}
          <Popover open={linkPopoverOpen} onOpenChange={setLinkPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleOpenLinkPopover}
                className={`h-7 w-7 rounded-md hover:bg-muted ${
                  editor.isActive("link") ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-bold" : ""
                }`}
                title="Insert Link (Ctrl+K)"
              >
                <Link2 className="h-3.5 w-3.5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-3 text-xs rounded-xl shadow-xl" align="start">
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">Insert Hyperlink</span>
                  {editor.isActive("link") && (
                    <button
                      type="button"
                      onClick={handleRemoveLink}
                      className="text-[11px] text-destructive hover:underline flex items-center gap-1"
                    >
                      <Unlink className="h-3 w-3" />
                      <span>Remove Link</span>
                    </button>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10.5px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Text to display
                  </label>
                  <Input
                    placeholder="Link text..."
                    value={linkText}
                    onChange={(e) => setLinkText(e.target.value)}
                    className="h-8 text-xs rounded-lg"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10.5px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Web Address (URL)
                  </label>
                  <Input
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
                    className="h-8 text-xs rounded-lg"
                  />
                </div>

                <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-border/50">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setLinkPopoverOpen(false)}
                    className="h-7 text-xs rounded-lg"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleApplyLink}
                    disabled={!linkUrl.trim()}
                    className="h-7 px-3 text-xs bg-primary text-primary-foreground font-semibold rounded-lg"
                  >
                    Apply
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Quick Attach Document from Toolbar */}
          {onAttachClick && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onAttachClick}
              className="h-7 w-7 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
              title="Attach Document"
            >
              <Paperclip className="h-3.5 w-3.5" />
            </Button>
          )}

          {/* Clear Formatting */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
            className="h-7 w-7 rounded-md hover:bg-muted ml-auto"
            title="Clear Formatting"
          >
            <RemoveFormatting className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      {/* Editor Content Area */}
      <div className="flex-1 overflow-y-auto cursor-text overscroll-contain">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
});

EmailRichEditor.displayName = "EmailRichEditor";
