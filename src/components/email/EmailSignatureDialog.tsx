"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  PenTool,
  Plus,
  Trash2,
  Check,
  Sparkles,
  LayoutTemplate,
  HelpCircle,
  Eye,
  Code2,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Link2,
  Unlink,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Palette,
  RotateCcw,
  Info,
  ExternalLink,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";

import { useEmailSignatures } from "@/hooks/useEmailSignatures";
import {
  EmailSignature,
  SIGNATURE_TEMPLATE_PRESETS,
} from "@/types/emailSignature";

interface EmailSignatureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialSelectedId?: string;
}

const PALETTE_COLORS = [
  "#0f172a", // Slate 900
  "#334155", // Slate 700
  "#64748b", // Slate 500
  "#2563eb", // Blue 600
  "#0284c7", // Sky 600
  "#059669", // Emerald 600
  "#d97706", // Amber 600
  "#dc2626", // Red 600
  "#7c3aed", // Violet 600
];

export const EmailSignatureDialog: React.FC<EmailSignatureDialogProps> = ({
  open,
  onOpenChange,
  initialSelectedId,
}) => {
  const {
    signatures,
    createMutation,
    updateMutation,
    deleteMutation,
    setDefaultMutation,
    defaultSignature,
    defaultUserName,
    defaultUserEmail,
  } = useEmailSignatures();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [newSigNameInput, setNewSigNameInput] = useState("");
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [linkInputOpen, setLinkInputOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  // Sync initial or fallback selected signature
  useEffect(() => {
    if (open) {
      if (initialSelectedId && signatures.some((s) => (s._id || s.id) === initialSelectedId)) {
        setSelectedId(initialSelectedId);
      } else if (signatures.length > 0 && (!selectedId || !signatures.some((s) => (s._id || s.id) === selectedId))) {
        setSelectedId(signatures[0]._id || signatures[0].id || null);
      }
    }
  }, [open, signatures, initialSelectedId, selectedId]);

  const activeSignature = signatures.find((s) => (s._id || s.id) === selectedId) || null;

  // TipTap editor instance for rich signature formatting
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 dark:text-blue-400 underline font-medium",
        },
      }),
      TextAlign.configure({
        types: ["paragraph", "heading"],
        alignments: ["left", "center", "right"],
      }),
    ],
    content: activeSignature?.contentHtml || "",
    editorProps: {
      attributes: {
        class:
          "prose dark:prose-invert max-w-none text-xs sm:text-sm p-4 min-h-[170px] focus:outline-none leading-relaxed select-text",
      },
    },
    onUpdate: ({ editor }) => {
      if (selectedId) {
        const html = editor.getHTML();
        const text = editor.getText();
        updateMutation.mutate({
          id: selectedId,
          payload: { contentHtml: html, contentText: text },
        });
      }
    },
  });

  // Sync editor content whenever selectedId changes
  useEffect(() => {
    if (editor && activeSignature) {
      const currentHtml = editor.getHTML();
      if (activeSignature.contentHtml !== currentHtml) {
        editor.commands.setContent(activeSignature.contentHtml);
      }
    }
  }, [selectedId, editor]); // intentionally trigger on selectedId change

  // Create signature handler
  const handleConfirmCreate = () => {
    const trimmed = newSigNameInput.trim();
    createMutation.mutate(
      { name: trimmed || `Signature ${signatures.length + 1}` },
      {
        onSuccess: (res) => {
          setSelectedId(res.data._id || res.data.id || null);
          setNewSigNameInput("");
          setIsCreatingNew(false);
          toast.success(`Signature "${res.data.name}" created`);
        },
      }
    );
  };

  // Delete signature handler
  const handleDelete = (id: string, name: string) => {
    if (signatures.length <= 1) {
      toast.error("You must keep at least one signature template.");
      return;
    }
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.info(`Deleted signature "${name}"`);
        const remaining = signatures.filter((s) => (s._id || s.id) !== id);
        if (remaining.length > 0) {
          setSelectedId(remaining[0]._id || remaining[0].id || null);
        }
      },
    });
  };

  // Apply template preset
  const handleApplyTemplate = (presetId: string) => {
    const preset = SIGNATURE_TEMPLATE_PRESETS.find((p) => p.id === presetId);
    if (!preset || !selectedId || !editor) return;

    const html = preset.generateHtml({
      name: defaultUserName,
      title: "Senior Talent Partner",
      email: defaultUserEmail,
      phone: "+1 (555) 234-5678",
    });

    editor.commands.setContent(html);
    updateMutation.mutate({ id: selectedId, payload: { contentHtml: html } });
    toast.success(`Applied "${preset.name}" preset`);
  };

  // Link helper
  const handleApplyLink = () => {
    if (!editor) return;
    if (!linkUrl.trim()) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      setLinkInputOpen(false);
      return;
    }
    const formatted = /^https?:\/\//i.test(linkUrl) ? linkUrl : `https://${linkUrl}`;
    editor.chain().focus().extendMarkRange("link").setLink({ href: formatted }).run();
    setLinkUrl("");
    setLinkInputOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 gap-0 overflow-hidden rounded-2xl border border-border/70 shadow-2xl bg-card">
        {/* Modal Header with subtle brand styling */}
        <div className="px-5 py-4 bg-muted/25 border-b border-border/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-2xs">
              <PenTool className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground tracking-tight">
                Email Signatures
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Create and manage personalized signatures for new messages and replies.
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Dual Panel Body */}
        <div className="flex flex-col md:flex-row h-[560px] max-h-[75vh]">
          {/* Left Panel: Signatures List */}
          <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-border/60 bg-muted/15 flex flex-col shrink-0 p-3">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/50">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Signatures ({signatures.length})
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsCreatingNew(true)}
                className="h-7 px-2 text-xs text-primary hover:text-primary hover:bg-primary/10 font-semibold rounded-lg gap-1"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>New</span>
              </Button>
            </div>

            {/* Inline creation input */}
            {isCreatingNew && (
              <div className="p-2.5 mb-2 bg-card rounded-xl border border-primary/30 shadow-xs space-y-2 animate-in fade-in zoom-in-95 duration-150">
                <span className="text-[11px] font-semibold text-foreground">Signature Name</span>
                <Input
                  placeholder="e.g. Sales, Formal, Quick..."
                  value={newSigNameInput}
                  onChange={(e) => setNewSigNameInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleConfirmCreate();
                    if (e.key === "Escape") setIsCreatingNew(false);
                  }}
                  autoFocus
                  className="h-7 text-xs rounded-lg"
                />
                <div className="flex items-center justify-end gap-1 pt-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsCreatingNew(false)}
                    className="h-6 px-2 text-[11px] rounded-md text-muted-foreground"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleConfirmCreate}
                    className="h-6 px-2.5 text-[11px] rounded-md bg-primary text-primary-foreground font-medium"
                  >
                    Create
                  </Button>
                </div>
              </div>
            )}

            {/* List of signatures */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-0.5">
              {signatures.map((sig) => {
                const sigId = sig._id || sig.id || "";
                const isSelected = sigId === selectedId;
                const isDefault = sig.isDefault;

                return (
                  <div
                    key={sigId}
                    onClick={() => setSelectedId(sigId)}
                    className={`group relative flex items-center justify-between p-2.5 rounded-xl text-xs cursor-pointer transition-all ${
                      isSelected
                        ? "bg-card shadow-xs border border-primary/30 text-foreground font-medium"
                        : "hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="truncate font-semibold">{sig.name}</span>
                        {isSelected && (
                          <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                        )}
                      </div>

                      {/* Default indicator pills */}
                      <div className="flex flex-wrap gap-1 mt-1">
                        {isDefault && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            Default
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Delete button (shows on hover or when selected, if > 1 signature) */}
                    {signatures.length > 1 && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(sigId, sig.name);
                        }}
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md shrink-0 transition-opacity"
                        title="Delete signature"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-border/50 text-[11px] text-muted-foreground flex items-center gap-1.5 px-1">
              <Info className="h-3.5 w-3.5 shrink-0 text-primary/70" />
              <span>Applied in real time to your mail composer.</span>
            </div>
          </div>

          {/* Right Panel: Editor & Defaults Settings */}
          <div className="flex-1 flex flex-col min-w-0 bg-card overflow-hidden">
            {activeSignature ? (
              <>
                {/* Editor Top Bar: Name + Template Presets + Tab Switch */}
                <div className="p-3 border-b border-border/60 bg-muted/10 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
                  {/* Signature Name Input */}
                  <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                    <span className="text-xs font-semibold text-muted-foreground shrink-0">Name:</span>
                    <Input
                      value={activeSignature.name}
                      onChange={(e) => updateMutation.mutate({ id: activeSignature._id || activeSignature.id || "", payload: { name: e.target.value } })}
                      className="h-8 text-xs font-semibold rounded-lg max-w-[240px] bg-background"
                      placeholder="Signature Name"
                    />
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Template presets dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-2.5 gap-1.5 text-xs rounded-lg border-border/70 text-foreground shadow-2xs"
                        >
                          <LayoutTemplate className="h-3.5 w-3.5 text-primary" />
                          <span>Load Template</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-64 rounded-xl p-1.5">
                        <DropdownMenuLabel className="text-[11px] font-bold text-muted-foreground uppercase px-2 py-1">
                          Starter Templates
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {SIGNATURE_TEMPLATE_PRESETS.map((preset) => (
                          <DropdownMenuItem
                            key={preset.id}
                            onClick={() => handleApplyTemplate(preset.id)}
                            className="p-2 cursor-pointer rounded-lg flex flex-col items-start gap-0.5"
                          >
                            <div className="flex items-center justify-between w-full">
                              <span className="text-xs font-bold text-foreground">{preset.name}</span>
                              <Badge variant="outline" className="text-[9px] h-4 px-1 bg-muted/40">
                                {preset.badge}
                              </Badge>
                            </div>
                            <span className="text-[10px] text-muted-foreground leading-tight">
                              {preset.description}
                            </span>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Editor / Preview Toggle */}
                    <div className="flex items-center p-0.5 rounded-lg bg-muted/60 border border-border/60 text-xs">
                      <button
                        type="button"
                        onClick={() => setActiveTab("edit")}
                        className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                          activeTab === "edit"
                            ? "bg-card text-foreground shadow-2xs font-semibold"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab("preview")}
                        className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                          activeTab === "preview"
                            ? "bg-card text-foreground shadow-2xs font-semibold"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Preview
                      </button>
                    </div>
                  </div>
                </div>

                {/* Editor Content Area */}
                <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-background/50">
                  {activeTab === "edit" ? (
                    <div className="flex-1 flex flex-col min-h-0">
                      {/* Editor Formatting Toolbar */}
                      <div className="border-b border-border/60 bg-muted/30 px-3 py-1.5 flex items-center flex-wrap gap-1 text-muted-foreground shrink-0">
                        {/* Bold */}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => editor?.chain().focus().toggleBold().run()}
                          className={`h-7 w-7 rounded-md ${
                            editor?.isActive("bold") ? "bg-muted text-foreground font-bold" : ""
                          }`}
                          title="Bold (Ctrl+B)"
                        >
                          <Bold className="h-3.5 w-3.5" />
                        </Button>

                        {/* Italic */}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => editor?.chain().focus().toggleItalic().run()}
                          className={`h-7 w-7 rounded-md ${
                            editor?.isActive("italic") ? "bg-muted text-foreground font-bold" : ""
                          }`}
                          title="Italic (Ctrl+I)"
                        >
                          <Italic className="h-3.5 w-3.5" />
                        </Button>

                        {/* Underline */}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => editor?.chain().focus().toggleUnderline().run()}
                          className={`h-7 w-7 rounded-md ${
                            editor?.isActive("underline") ? "bg-muted text-foreground font-bold" : ""
                          }`}
                          title="Underline (Ctrl+U)"
                        >
                          <UnderlineIcon className="h-3.5 w-3.5" />
                        </Button>

                        <span className="w-px h-4 bg-border/80 mx-1" />

                        {/* Align Left */}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => editor?.chain().focus().setTextAlign("left").run()}
                          className={`h-7 w-7 rounded-md ${
                            editor?.isActive({ textAlign: "left" }) ? "bg-muted text-foreground" : ""
                          }`}
                          title="Align Left"
                        >
                          <AlignLeft className="h-3.5 w-3.5" />
                        </Button>

                        {/* Align Center */}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => editor?.chain().focus().setTextAlign("center").run()}
                          className={`h-7 w-7 rounded-md ${
                            editor?.isActive({ textAlign: "center" }) ? "bg-muted text-foreground" : ""
                          }`}
                          title="Align Center"
                        >
                          <AlignCenter className="h-3.5 w-3.5" />
                        </Button>

                        <span className="w-px h-4 bg-border/80 mx-1" />

                        {/* Color Picker Dropdown */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 rounded-md"
                              title="Text Color"
                            >
                              <Palette className="h-3.5 w-3.5 text-primary" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="p-2 rounded-xl grid grid-cols-5 gap-1.5 w-40">
                            {PALETTE_COLORS.map((hex) => (
                              <button
                                key={hex}
                                type="button"
                                onClick={() => editor?.chain().focus().setColor(hex).run()}
                                className="h-5 w-5 rounded-full border border-border shadow-2xs hover:scale-110 transition-transform"
                                style={{ backgroundColor: hex }}
                                title={hex}
                              />
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Link Insertion */}
                        <DropdownMenu open={linkInputOpen} onOpenChange={setLinkInputOpen}>
                          <DropdownMenuTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className={`h-7 w-7 rounded-md ${
                                editor?.isActive("link") ? "bg-muted text-primary" : ""
                              }`}
                              title="Hyperlink"
                            >
                              <Link2 className="h-3.5 w-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="p-2.5 rounded-xl w-64 space-y-2">
                            <span className="text-xs font-semibold text-foreground">Insert Link</span>
                            <Input
                              placeholder="https://example.com"
                              value={linkUrl}
                              onChange={(e) => setLinkUrl(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleApplyLink();
                              }}
                              className="h-7 text-xs rounded-lg"
                            />
                            <div className="flex items-center justify-between pt-1">
                              {editor?.isActive("link") && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    editor?.chain().focus().unsetLink().run();
                                    setLinkInputOpen(false);
                                  }}
                                  className="text-[11px] text-destructive hover:underline"
                                >
                                  Remove
                                </button>
                              )}
                              <Button
                                size="sm"
                                onClick={handleApplyLink}
                                className="h-6 px-2.5 text-xs bg-primary text-primary-foreground ml-auto rounded-md"
                              >
                                Apply
                              </Button>
                            </div>
                          </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Clear formatting */}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => editor?.chain().focus().unsetAllMarks().clearNodes().run()}
                          className="h-7 w-7 rounded-md ml-auto text-muted-foreground hover:text-foreground"
                          title="Reset Formatting"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                        </Button>
                      </div>

                      {/* Active Editor Canvas */}
                      <div className="flex-1 overflow-y-auto p-2 cursor-text">
                        <EditorContent editor={editor} />
                      </div>
                    </div>
                  ) : (
                    /* Real-time Rendered HTML Preview */
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-card">
                      <div className="text-xs text-muted-foreground mb-3 flex items-center gap-1.5 pb-2 border-b border-border/50">
                        <Eye className="h-3.5 w-3.5 text-primary" />
                        <span>Visual representation as it will appear at the footer of outgoing emails:</span>
                      </div>
                      <div
                        className="p-4 rounded-xl border border-border/70 bg-muted/10 shadow-2xs"
                        dangerouslySetInnerHTML={{ __html: activeSignature.contentHtml }}
                      />
                    </div>
                  )}
                </div>

                {/* Signature Defaults Section (Gmail Style) */}
                <div className="p-3.5 border-t border-border/60 bg-muted/20 space-y-3 shrink-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">Signature Defaults</span>
                    <span className="text-[11px] text-muted-foreground">
                      Configure your default signature for all outgoing emails.
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {/* Default for emails */}
                    <div className="space-y-1 max-w-sm">
                      <Label className="text-[11px] font-medium text-muted-foreground">
                        Default Signature
                      </Label>
                      <Select
                        value={defaultSignature?._id || defaultSignature?.id || "none"}
                        onValueChange={(val) => {
                          if (val !== "none") {
                            setDefaultMutation.mutate(val);
                          }
                        }}
                      >
                        <SelectTrigger className="h-8 text-xs rounded-xl bg-card border-border/70">
                          <SelectValue placeholder="Select signature..." />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="none">No signature</SelectItem>
                          {signatures.map((s) => (
                            <SelectItem key={s._id || s.id} value={s._id || s.id || ""}>
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
                <PenTool className="h-10 w-10 text-muted-foreground/40 mb-2" />
                <p className="text-sm font-semibold text-foreground">No signature selected</p>
                <p className="text-xs max-w-xs mt-1">
                  Select a signature from the list on the left or create a new one to begin editing.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-muted/20 border-t border-border/60 flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">
            Changes are saved automatically to your workspace.
          </span>
          <Button
            onClick={() => {
              onOpenChange(false);
              toast.success("Signature preferences saved successfully");
            }}
            className="h-8 px-4 text-xs font-semibold rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs"
          >
            Save &amp; Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
