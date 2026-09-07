"use client";

import React, { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
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
  Pilcrow
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

export const EmailRichEditor: React.FC<EmailRichEditorProps> = ({
  initialContent = "",
  onChange,
  showToolbar = false,
  placeholder = "Write your message here...",
  onKeyDown,
  className = "",
}) => {
  const [linkUrl, setLinkUrl] = useState("");
  const [linkPopoverOpen, setLinkPopoverOpen] = useState(false);

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
};
