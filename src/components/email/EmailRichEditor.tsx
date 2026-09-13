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
  Pilcrow,
  Baseline,
  Highlighter,
  Ban,
  Check,
  Pipette
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

interface EmailRichEditorProps {
  initialContent?: string;
  onChange?: (html: string, text: string) => void;
  showToolbar?: boolean;
  placeholder?: string;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  className?: string;
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
  showToolbar = false,
  placeholder = "Write your message here...",
  onKeyDown,
  className = "",
}, ref) => {
  const [linkUrl, setLinkUrl] = useState("");
  const [linkPopoverOpen, setLinkPopoverOpen] = useState(false);
  const [colorPopoverOpen, setColorPopoverOpen] = useState(false);
  const [activeColorTab, setActiveColorTab] = useState<"text" | "highlight">("text");
  const [customTextColor, setCustomTextColor] = useState("#1a73e8");
  const [customHighlightColor, setCustomHighlightColor] = useState("#fef08a");

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
          class: "text-primary underline hover:text-primary/80 font-medium",
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
        class: `prose dark:prose-invert max-w-none text-xs sm:text-sm p-3 sm:p-4 min-h-[220px] focus:outline-none leading-relaxed select-text ${className}`,
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

  const setLink = () => {
    if (!linkUrl.trim()) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      setLinkPopoverOpen(false);
      return;
    }

    const formattedUrl = /^https?:\/\//i.test(linkUrl) ? linkUrl : `https://${linkUrl}`;
    editor.chain().focus().extendMarkRange("link").setLink({ href: formattedUrl }).run();
    setLinkUrl("");
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

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden" onKeyDown={onKeyDown}>
      {/* Editor Content Area */}
      <div className="flex-1 overflow-y-auto cursor-text overscroll-contain">
        <EditorContent editor={editor} />
      </div>

      {/* Optional Rich Text Formatting Ribbon (Gmail-style toggleable ribbon) */}
      {showToolbar && (
        <div className="border-t border-border/60 bg-muted/30 px-2 py-1.5 flex items-center flex-wrap gap-0.5 text-muted-foreground animate-in slide-in-from-bottom-2 duration-150 shrink-0">
          {/* Undo / Redo */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
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
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="h-7 w-7 rounded-md hover:bg-muted"
            title="Redo (Ctrl+Y)"
          >
            <Redo className="h-3.5 w-3.5" />
          </Button>

          <span className="w-px h-4 bg-border/80 mx-1" />

          {/* Heading / Style Toggles */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().setParagraph().run()}
            className={`h-7 w-7 rounded-md hover:bg-muted ${
              editor.isActive("paragraph") ? "bg-muted text-foreground font-bold" : ""
            }`}
            title="Normal Text"
          >
            <Pilcrow className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`h-7 w-7 rounded-md hover:bg-muted ${
              editor.isActive("heading", { level: 1 }) ? "bg-muted text-foreground font-bold" : ""
            }`}
            title="Large Heading"
          >
            <Heading1 className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`h-7 w-7 rounded-md hover:bg-muted ${
              editor.isActive("heading", { level: 2 }) ? "bg-muted text-foreground font-bold" : ""
            }`}
            title="Medium Heading"
          >
            <Heading2 className="h-3.5 w-3.5" />
          </Button>

          <span className="w-px h-4 bg-border/80 mx-1" />

          {/* Basic Text Formats: Bold, Italic, Underline, Strikethrough */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`h-7 w-7 rounded-md hover:bg-muted ${
              editor.isActive("bold") ? "bg-muted text-foreground font-bold" : ""
            }`}
            title="Bold (Ctrl+B)"
          >
            <Bold className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`h-7 w-7 rounded-md hover:bg-muted ${
              editor.isActive("italic") ? "bg-muted text-foreground font-bold" : ""
            }`}
            title="Italic (Ctrl+I)"
          >
            <Italic className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`h-7 w-7 rounded-md hover:bg-muted ${
              editor.isActive("underline") ? "bg-muted text-foreground font-bold" : ""
            }`}
            title="Underline (Ctrl+U)"
          >
            <UnderlineIcon className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`h-7 w-7 rounded-md hover:bg-muted ${
              editor.isActive("strike") ? "bg-muted text-foreground font-bold" : ""
            }`}
            title="Strikethrough"
          >
            <Strikethrough className="h-3.5 w-3.5" />
          </Button>

          {/* Gmail-Style Text Color & Background / Highlight Color Picker */}
          <Popover open={colorPopoverOpen} onOpenChange={setColorPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 px-1.5 gap-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
                title="Text color & Highlight color"
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
                {/* Tabs for Background Color vs Text Color */}
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
                    <Baseline className="h-3.5 w-3.5 text-primary" />
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
                    <Highlighter className="h-3.5 w-3.5 text-amber-500" />
                    <span>Highlight</span>
                  </button>
                </div>

                {/* Content based on Active Tab */}
                {activeColorTab === "text" ? (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="font-medium">Text Palette</span>
                      <button
                        type="button"
                        onClick={handleClearTextColor}
                        className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Ban className="h-3 w-3" />
                        <span>Default Color</span>
                      </button>
                    </div>

                    {/* Swatches Grid */}
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

                    {/* Custom Hex Color Picker */}
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
                      <span className="font-medium">Background Marker</span>
                      <button
                        type="button"
                        onClick={handleClearHighlightColor}
                        className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Ban className="h-3 w-3" />
                        <span>No Highlight</span>
                      </button>
                    </div>

                    {/* Swatches Grid */}
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

                    {/* Custom Hex Color Picker */}
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
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            className={`h-7 w-7 rounded-md hover:bg-muted ${
              editor.isActive({ textAlign: "justify" }) ? "bg-muted text-foreground" : ""
            }`}
            title="Justify"
          >
            <AlignJustify className="h-3.5 w-3.5" />
          </Button>

          <span className="w-px h-4 bg-border/80 mx-1" />

          {/* Lists */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`h-7 w-7 rounded-md hover:bg-muted ${
              editor.isActive("bulletList") ? "bg-muted text-foreground" : ""
            }`}
            title="Bulleted List"
          >
            <List className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`h-7 w-7 rounded-md hover:bg-muted ${
              editor.isActive("orderedList") ? "bg-muted text-foreground" : ""
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
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`h-7 w-7 rounded-md hover:bg-muted ${
              editor.isActive("blockquote") ? "bg-muted text-foreground" : ""
            }`}
            title="Quote"
          >
            <Quote className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`h-7 w-7 rounded-md hover:bg-muted ${
              editor.isActive("codeBlock") ? "bg-muted text-foreground" : ""
            }`}
            title="Code Block"
          >
            <Code className="h-3.5 w-3.5" />
          </Button>

          {/* Link Popover */}
          <Popover open={linkPopoverOpen} onOpenChange={setLinkPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={`h-7 w-7 rounded-md hover:bg-muted ${
                  editor.isActive("link") ? "bg-muted text-primary" : ""
                }`}
                title="Insert Link"
              >
                <Link2 className="h-3.5 w-3.5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-2.5 text-xs rounded-xl" align="start">
              <div className="space-y-2">
                <p className="font-semibold text-foreground">Insert Hyperlink</p>
                <Input
                  placeholder="https://example.com"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      setLink();
                    }
                  }}
                  className="h-8 text-xs rounded-lg"
                />
                <div className="flex items-center justify-end gap-1.5 pt-1">
                  {editor.isActive("link") && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        editor.chain().focus().unsetLink().run();
                        setLinkPopoverOpen(false);
                      }}
                      className="h-7 text-xs text-destructive hover:text-destructive"
                    >
                      <Unlink className="h-3 w-3 mr-1" />
                      Remove
                    </Button>
                  )}
                  <Button
                    type="button"
                    size="sm"
                    onClick={setLink}
                    className="h-7 px-3 text-xs bg-primary text-primary-foreground rounded-lg"
                  >
                    Apply
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Clear Formatting */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
            className="h-7 w-7 rounded-md hover:bg-muted ml-auto"
            title="Clear Formatting"
          >
            <RemoveFormatting className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
});

EmailRichEditor.displayName = "EmailRichEditor";
