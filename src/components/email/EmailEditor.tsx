"use client";

import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

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
import FormatIndentIncreaseOutlinedIcon from "@mui/icons-material/FormatIndentIncreaseOutlined";
import FormatClearOutlinedIcon from "@mui/icons-material/FormatClearOutlined";
import CropFreeOutlinedIcon from "@mui/icons-material/CropFreeOutlined";
import SendIcon from "@mui/icons-material/Send";
import CircularProgress from "@mui/material/CircularProgress";

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
  placeholder = "Write something awesome...",
  className,
}: EmailEditorProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [paragraphType, setParagraphType] = useState<string>("Paragraph");
  const [showParagraphMenu, setShowParagraphMenu] = useState(false);
  const [activeFormats, setActiveFormats] = useState<{
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strike?: boolean;
    align?: "left" | "center" | "right" | "justify";
  }>({ align: "left" });

  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const toggleFormat = (formatKey: "bold" | "italic" | "underline" | "strike") => {
    setActiveFormats((prev) => ({ ...prev, [formatKey]: !prev[formatKey] }));
  };

  const handleParagraphSelect = (type: string) => {
    setParagraphType(type);
    setShowParagraphMenu(false);
  };

  const clearFormatting = () => {
    setActiveFormats({ align: "left" });
    setParagraphType("Paragraph");
  };

  // The Toolbar component reused in both inline and fullscreen views
  const renderToolbar = () => (
    <div className="flex flex-wrap items-center gap-1 text-[#637381] dark:text-[#919EAB] select-none">
      {/* Paragraph Dropdown */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowParagraphMenu((prev) => !prev)}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-[#1C252E] dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <span>{paragraphType}</span>
          <KeyboardArrowDownOutlinedIcon sx={{ fontSize: 16 }} />
        </button>

        {showParagraphMenu && (
          <div className="absolute top-full left-0 mt-1 w-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg p-1 z-50 text-xs font-medium">
            {["Paragraph", "Heading 1", "Heading 2", "Heading 3", "Quote"].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => handleParagraphSelect(type)}
                className={cn(
                  "w-full text-left px-2.5 py-1.5 rounded-lg transition-colors",
                  paragraphType === type
                    ? "bg-slate-100 dark:bg-slate-800 text-[#1C252E] dark:text-white font-semibold"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                )}
              >
                {type}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1" />

      {/* B, I, U, S */}
      <button
        type="button"
        onClick={() => toggleFormat("bold")}
        className={cn(
          "h-7 w-7 rounded-lg text-xs font-bold transition-colors flex items-center justify-center",
          activeFormats.bold
            ? "bg-slate-200 text-[#1C252E] dark:bg-slate-700 dark:text-white"
            : "hover:bg-slate-100 dark:hover:bg-slate-800"
        )}
        title="Bold"
      >
        B
      </button>

      <button
        type="button"
        onClick={() => toggleFormat("italic")}
        className={cn(
          "h-7 w-7 rounded-lg text-xs italic font-serif transition-colors flex items-center justify-center",
          activeFormats.italic
            ? "bg-slate-200 text-[#1C252E] dark:bg-slate-700 dark:text-white"
            : "hover:bg-slate-100 dark:hover:bg-slate-800"
        )}
        title="Italic"
      >
        I
      </button>

      <button
        type="button"
        onClick={() => toggleFormat("underline")}
        className={cn(
          "h-7 w-7 rounded-lg text-xs underline transition-colors flex items-center justify-center",
          activeFormats.underline
            ? "bg-slate-200 text-[#1C252E] dark:bg-slate-700 dark:text-white"
            : "hover:bg-slate-100 dark:hover:bg-slate-800"
        )}
        title="Underline"
      >
        U
      </button>

      <button
        type="button"
        onClick={() => toggleFormat("strike")}
        className={cn(
          "h-7 w-7 rounded-lg text-xs line-through transition-colors flex items-center justify-center",
          activeFormats.strike
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
        className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        title="Bullet list"
      >
        <FormatListBulletedOutlinedIcon sx={{ fontSize: 17 }} />
      </button>

      <button
        type="button"
        className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        title="Numbered list"
      >
        <FormatListNumberedOutlinedIcon sx={{ fontSize: 17 }} />
      </button>

      <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1" />

      {/* Alignment */}
      <button
        type="button"
        onClick={() => setActiveFormats((p) => ({ ...p, align: "left" }))}
        className={cn(
          "p-1 rounded transition-colors",
          activeFormats.align === "left" && "bg-slate-100 text-[#1C252E] dark:bg-slate-800 dark:text-white"
        )}
        title="Align left"
      >
        <FormatAlignLeftOutlinedIcon sx={{ fontSize: 17 }} />
      </button>

      <button
        type="button"
        onClick={() => setActiveFormats((p) => ({ ...p, align: "center" }))}
        className={cn(
          "p-1 rounded transition-colors",
          activeFormats.align === "center" && "bg-slate-100 text-[#1C252E] dark:bg-slate-800 dark:text-white"
        )}
        title="Align center"
      >
        <FormatAlignCenterOutlinedIcon sx={{ fontSize: 17 }} />
      </button>

      <button
        type="button"
        onClick={() => setActiveFormats((p) => ({ ...p, align: "right" }))}
        className={cn(
          "p-1 rounded transition-colors",
          activeFormats.align === "right" && "bg-slate-100 text-[#1C252E] dark:bg-slate-800 dark:text-white"
        )}
        title="Align right"
      >
        <FormatAlignRightOutlinedIcon sx={{ fontSize: 17 }} />
      </button>

      <button
        type="button"
        onClick={() => setActiveFormats((p) => ({ ...p, align: "justify" }))}
        className={cn(
          "p-1 rounded transition-colors",
          activeFormats.align === "justify" && "bg-slate-100 text-[#1C252E] dark:bg-slate-800 dark:text-white"
        )}
        title="Justify"
      >
        <FormatAlignJustifyOutlinedIcon sx={{ fontSize: 17 }} />
      </button>

      <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1" />

      {/* Link, Unlink, Image */}
      <button
        type="button"
        className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        title="Insert link"
      >
        <InsertLinkOutlinedIcon sx={{ fontSize: 18 }} />
      </button>

      <button
        type="button"
        className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        title="Remove link"
      >
        <LinkOffOutlinedIcon sx={{ fontSize: 18 }} />
      </button>

      <button
        type="button"
        className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        title="Attach image"
      >
        <ImageOutlinedIcon sx={{ fontSize: 18 }} />
      </button>

      <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1" />

      {/* Indent, Clear Format */}
      <button
        type="button"
        className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        title="Indent"
      >
        <FormatIndentIncreaseOutlinedIcon sx={{ fontSize: 18 }} />
      </button>

      <button
        type="button"
        onClick={clearFormatting}
        className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        title="Clear formatting"
      >
        <FormatClearOutlinedIcon sx={{ fontSize: 18 }} />
      </button>

      <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1" />

      {/* Fullscreen Button matching reference image */}
      <button
        type="button"
        onClick={() => setIsFullscreen((prev) => !prev)}
        className={cn(
          "p-1.5 rounded-lg transition-colors flex items-center justify-center",
          isFullscreen
            ? "bg-slate-200/90 text-[#1C252E] dark:bg-slate-700 dark:text-white"
            : "hover:bg-slate-100 dark:hover:bg-slate-800 text-[#637381] dark:text-[#919EAB]"
        )}
        title={isFullscreen ? "Exit Fullscreen (Esc)" : "Fullscreen"}
      >
        <CropFreeOutlinedIcon sx={{ fontSize: 17 }} />
      </button>
    </div>
  );

  return (
    <>
      {/* ========================================================= */}
      {/* 1. FULLSCREEN OVERLAY (EXACTLY MATCHING REFERENCE IMAGE)  */}
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
          <div className="flex-1 min-h-0 pt-4 flex flex-col">
            <textarea
              ref={textareaRef}
              autoFocus
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="Write something awesome..."
              className={cn(
                "w-full h-full flex-1 bg-transparent border-none outline-none text-[15px] sm:text-[16px] text-[#1C252E] dark:text-white placeholder:text-[#919EAB] resize-none font-normal leading-relaxed",
                activeFormats.bold && "font-bold",
                activeFormats.italic && "italic",
                activeFormats.underline && "underline",
                activeFormats.strike && "line-through",
                activeFormats.align === "center" && "text-center",
                activeFormats.align === "right" && "text-right",
                activeFormats.align === "justify" && "text-justify"
              )}
            />
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. INLINE BOX (INSIDE DETAIL VIEW)                        */}
      {/* ========================================================= */}
      <div
        className={cn(
          "rounded-2xl border border-slate-200/90 dark:border-slate-700/80 bg-white dark:bg-slate-900/40 p-3 shadow-2xs focus-within:border-slate-300 dark:focus-within:border-slate-600 transition-all",
          className
        )}
      >
        {/* Toolbar Row */}
        <div className="pb-2 border-b border-slate-100 dark:border-slate-800">
          {renderToolbar()}
        </div>

        {/* Textarea Area & Send Button */}
        <div className="pt-2 flex flex-col gap-2">
          <textarea
            rows={2}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={cn(
              "w-full bg-transparent border-none outline-none text-xs sm:text-[13px] text-[#1C252E] dark:text-white placeholder:text-[#919EAB] resize-none font-normal",
              activeFormats.bold && "font-bold",
              activeFormats.italic && "italic",
              activeFormats.underline && "underline",
              activeFormats.strike && "line-through",
              activeFormats.align === "center" && "text-center",
              activeFormats.align === "right" && "text-right",
              activeFormats.align === "justify" && "text-justify"
            )}
          />

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
