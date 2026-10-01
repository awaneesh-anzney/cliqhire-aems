"use client";

import React, { useState, useMemo } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { EmailComposerDialog, ComposerInitialData } from "@/components/email";

// Material UI Icons
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import DraftsOutlinedIcon from "@mui/icons-material/DraftsOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import ReportGmailerrorredOutlinedIcon from "@mui/icons-material/ReportGmailerrorredOutlined";
import LabelImportantOutlinedIcon from "@mui/icons-material/LabelImportantOutlined";
import StarBorderOutlinedIcon from "@mui/icons-material/StarBorderOutlined";
import StarIcon from "@mui/icons-material/Star";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import MailOutlineIcon from "@mui/icons-material/MailOutlineOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ReplyIcon from "@mui/icons-material/Reply";
import ReplyAllIcon from "@mui/icons-material/ReplyAll";
import ForwardIcon from "@mui/icons-material/Forward";
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
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SendIcon from "@mui/icons-material/Send";

// Navigation Folders Definition
const FOLDERS = [
  { id: "all", label: "All", icon: MailOutlineIcon, count: 3 },
  { id: "inbox", label: "Inbox", icon: InboxOutlinedIcon, count: 1 },
  { id: "sent", label: "Sent", icon: SendOutlinedIcon },
  { id: "drafts", label: "Drafts", icon: DraftsOutlinedIcon },
  { id: "trash", label: "Trash", icon: DeleteOutlineIcon },
  { id: "spam", label: "Spam", icon: ReportGmailerrorredOutlinedIcon, count: 1 },
  { id: "important", label: "Important", icon: LabelImportantOutlinedIcon, count: 1 },
  { id: "starred", label: "Starred", icon: StarBorderOutlinedIcon, count: 1 },
];

// Navigation Labels Definition
const LABELS = [
  { id: "social", label: "Social", color: "#22C55E" },
  { id: "promotions", label: "Promotions", color: "#F59E0B", count: 2 },
  { id: "forums", label: "Forums", color: "#FF5630", count: 1 },
];

interface EmailItem {
  id: string;
  sender: string;
  email: string;
  to: string;
  subject: string;
  snippet: string;
  time: string;
  date: string;
  avatar?: string;
  avatarLetter?: string;
  avatarColor?: string;
  body: string;
  isStarred?: boolean;
  isImportant?: boolean;
  folder: string;
}

// Initial Mock Emails exactly matching reference image
const INITIAL_EMAILS: EmailItem[] = [
  {
    id: "email-1",
    sender: "Jayvion Simon",
    email: "nannie.abernathy70@yahoo.com",
    to: "demo@minimals.cc, tyrel.greenholt@gmail.com,",
    subject: "Re: The Future of Renewable Energy: Innovations and Challenges Ahead",
    snippet: "Occaecati est et ...",
    time: "a few seconds",
    date: "01 Oct 2026 5:22 pm",
    avatar: "https://api-dev-minimal-v510.vercel.app/assets/images/avatar/avatar_1.jpg",
    body: "Occaecati est et illo quibusdam accusamus qui. Incidunt aut et molestiae ut facere aut. Est quidem iusto praesentium excepturi harum nihil tenetur facilis. Ut omnis voluptates nihil accusantium doloribus eaque debitis.",
    isStarred: false,
    isImportant: true,
    folder: "inbox",
  },
  {
    id: "email-2",
    sender: "Lainey Davidson",
    email: "lainey.davidson@example.com",
    to: "demo@minimals.cc",
    subject: "Design System Updates & Component Guidelines",
    snippet: "Non rerum modi. Accus...",
    time: "5 days",
    date: "26 Sep 2026 2:15 pm",
    avatar: "https://api-dev-minimal-v510.vercel.app/assets/images/avatar/avatar_2.jpg",
    body: "Non rerum modi. Accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.",
    isStarred: true,
    isImportant: false,
    folder: "inbox",
  },
  {
    id: "email-3",
    sender: "Cristopher Cardenas",
    email: "cristopher.cardenas@company.org",
    to: "demo@minimals.cc",
    subject: "Candidate Screening Report & Next Steps",
    snippet: "Est enim et sit non imp...",
    time: "6 days",
    date: "25 Sep 2026 11:30 am",
    avatarLetter: "C",
    avatarColor: "#00A76F",
    body: "Est enim et sit non impedit quas. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.",
    isStarred: false,
    isImportant: true,
    folder: "inbox",
  },
  {
    id: "email-4",
    sender: "Melanie Noble",
    email: "melanie.noble@designstudio.io",
    to: "demo@minimals.cc",
    subject: "Weekly Recruitment Metrics & Pipeline Status",
    snippet: "Unde a inventore et. Se...",
    time: "7 days",
    date: "24 Sep 2026 4:45 pm",
    avatar: "https://api-dev-minimal-v510.vercel.app/assets/images/avatar/avatar_4.jpg",
    body: "Unde a inventore et. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam.",
    isStarred: false,
    isImportant: false,
    folder: "inbox",
  },
  {
    id: "email-5",
    sender: "Chase Day",
    email: "chase.day@venturegroup.co",
    to: "demo@minimals.cc",
    subject: "Executive Summary & Placement Projections",
    snippet: "Eaque natus adipisci so...",
    time: "8 days",
    date: "23 Sep 2026 9:10 am",
    avatar: "https://api-dev-minimal-v510.vercel.app/assets/images/avatar/avatar_5.jpg",
    body: "Eaque natus adipisci soluta voluptatem consequatur sit amet lorem ipsum dolor sit amet consectetur adipisicing elit.",
    isStarred: false,
    isImportant: false,
    folder: "inbox",
  },
];

export default function EmailPage() {
  const [activeFolder, setActiveFolder] = useState<string>("inbox");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmailId, setSelectedEmailId] = useState<string>("email-1");
  const [emails, setEmails] = useState<EmailItem[]>(INITIAL_EMAILS);
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerInitialData, setComposerInitialData] = useState<ComposerInitialData | undefined>(undefined);

  // Reply box state
  const [replyText, setReplyText] = useState("");
  const [activeFormats, setActiveFormats] = useState<{
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strike?: boolean;
    align?: "left" | "center" | "right" | "justify";
  }>({ align: "left" });

  // Mobile navigation state
  const [mobileView, setMobileView] = useState<"folders" | "list" | "detail">("list");

  // Filter emails based on folder and search query
  const filteredEmails = useMemo(() => {
    return emails.filter((item) => {
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          item.sender.toLowerCase().includes(q) ||
          item.subject.toLowerCase().includes(q) ||
          item.snippet.toLowerCase().includes(q) ||
          item.email.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Folder filter
      if (activeFolder === "all") return true;
      if (activeFolder === "starred") return !!item.isStarred;
      if (activeFolder === "important") return !!item.isImportant;
      if (activeFolder === "inbox") return item.folder === "inbox";
      if (activeFolder === "social" || activeFolder === "promotions" || activeFolder === "forums") return true;
      return item.folder === activeFolder;
    });
  }, [emails, activeFolder, searchQuery]);

  // Selected email detail
  const currentEmail = useMemo(() => {
    return emails.find((e) => e.id === selectedEmailId) || emails[0] || null;
  }, [emails, selectedEmailId]);

  const toggleStar = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEmails((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isStarred: !item.isStarred } : item
      )
    );
    toast.success("Star status updated");
  };

  const handleDelete = (id: string) => {
    setEmails((prev) => prev.filter((item) => item.id !== id));
    toast.success("Conversation moved to trash");
    if (selectedEmailId === id && emails.length > 1) {
      const remaining = emails.filter((item) => item.id !== id);
      setSelectedEmailId(remaining[0]?.id || "");
    }
  };

  const handleSendReply = () => {
    if (!replyText.trim()) {
      toast.error("Please enter a reply message");
      return;
    }
    toast.success("Reply sent successfully");
    setReplyText("");
  };

  const handleCompose = (prefill?: ComposerInitialData) => {
    setComposerInitialData(prefill);
    setComposerOpen(true);
  };

  const toggleFormat = (format: "bold" | "italic" | "underline" | "strike") => {
    setActiveFormats((prev) => ({ ...prev, [format]: !prev[format] }));
  };

  return (
    <div className="h-full min-h-0 w-full p-2 sm:p-3 md:p-4 flex flex-col overflow-hidden font-['Public_Sans',sans-serif]">
      {/* Outer Card Chassis matching the exact Minimals/Material UI Reference */}
      <div className="flex-1 min-h-0 w-full bg-white dark:bg-[#1C252E] border border-slate-200/80 dark:border-slate-800 rounded-2xl md:rounded-[20px] shadow-[0_0_2px_0_rgba(145,158,171,0.2),0_12px_24px_-4px_rgba(145,158,171,0.08)] flex overflow-hidden">
        
        {/* ========================================================= */}
        {/* COLUMN 1: LEFT NAVIGATION (FOLDERS & LABELS)             */}
        {/* ========================================================= */}
        <div
          className={cn(
            "w-full md:w-[210px] lg:w-[220px] shrink-0 p-4 sm:p-5 flex flex-col gap-4 overflow-y-auto bg-transparent border-r border-slate-100 dark:border-slate-800/80 transition-all",
            mobileView !== "folders" && "hidden md:flex"
          )}
        >
          {/* Compose Button */}
          <button
            type="button"
            onClick={() => handleCompose()}
            className="w-full h-10 px-4 rounded-xl bg-[#1C252E] hover:bg-[#28323D] dark:bg-white dark:hover:bg-slate-100 text-white dark:text-[#1C252E] font-bold text-[13px] flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.98] outline-none"
          >
            <EditOutlinedIcon sx={{ fontSize: 17 }} />
            <span>Compose</span>
          </button>

          {/* Folders List */}
          <div className="flex flex-col space-y-0.5">
            {FOLDERS.map((f) => {
              const Icon = f.icon;
              const isActive = activeFolder === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => {
                    setActiveFolder(f.id);
                    setMobileView("list");
                  }}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 rounded-xl text-[13px] transition-colors outline-none",
                    isActive
                      ? "bg-slate-100/90 dark:bg-slate-800 font-bold text-[#1C252E] dark:text-white"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/40 font-medium"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      sx={{
                        fontSize: 19,
                        color: isActive ? "#1C252E" : "#637381",
                      }}
                      className={isActive ? "dark:!text-white" : "dark:!text-slate-400"}
                    />
                    <span className="capitalize">{f.label}</span>
                  </div>
                  {f.count !== undefined && (
                    <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 tabular-nums">
                      {f.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Labels Section */}
          <div className="flex flex-col space-y-1 pt-3">
            {LABELS.map((lbl) => {
              const isActive = activeFolder === lbl.id;
              return (
                <button
                  key={lbl.id}
                  type="button"
                  onClick={() => {
                    setActiveFolder(lbl.id);
                    setMobileView("list");
                  }}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 rounded-xl text-[13px] transition-colors outline-none",
                    isActive
                      ? "bg-slate-100/90 dark:bg-slate-800 font-bold text-[#1C252E] dark:text-white"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/40 font-medium"
                  )}
                >
                  <div className="flex items-center gap-3">
                    {/* Vertical Pill Tag exactly like reference image */}
                    <span
                      className="w-1.5 h-3.5 rounded-full shrink-0"
                      style={{ backgroundColor: lbl.color }}
                    />
                    <span>{lbl.label}</span>
                  </div>
                  {lbl.count !== undefined && (
                    <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 tabular-nums">
                      {lbl.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ========================================================= */}
        {/* COLUMN 2: EMAIL CONVERSATION LIST                        */}
        {/* ========================================================= */}
        <div
          className={cn(
            "w-full md:w-[280px] lg:w-[320px] shrink-0 p-3.5 sm:p-4 flex flex-col gap-3 overflow-hidden border-r border-slate-100 dark:border-slate-800/80 bg-transparent transition-all",
            mobileView !== "list" && "hidden md:flex"
          )}
        >
          {/* Mobile Back to Folders */}
          <div className="flex md:hidden items-center justify-between pb-1">
            <button
              type="button"
              onClick={() => setMobileView("folders")}
              className="flex items-center gap-1 text-xs font-bold text-slate-600 dark:text-slate-300"
            >
              <ArrowBackIcon sx={{ fontSize: 16 }} />
              <span>Folders</span>
            </button>
            <span className="text-xs font-bold text-[#1C252E] dark:text-white capitalize">
              {activeFolder}
            </span>
          </div>

          {/* Search Bar Input */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-900/60 shadow-2xs focus-within:border-slate-400 dark:focus-within:border-slate-500 transition-all">
            <SearchOutlinedIcon sx={{ fontSize: 19, color: "#919EAB" }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full bg-transparent border-none outline-none text-xs sm:text-[13px] text-[#1C252E] dark:text-white placeholder:text-[#919EAB] font-normal"
            />
          </div>

          {/* Emails Conversation List */}
          <div className="flex-1 min-h-0 overflow-y-auto space-y-1 pr-0.5 custom-scrollbar">
            {filteredEmails.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
                <MailOutlineIcon sx={{ fontSize: 36, color: "#919EAB", opacity: 0.6 }} />
                <p className="text-xs font-medium mt-2 text-slate-500">No emails found</p>
              </div>
            ) : (
              filteredEmails.map((item) => {
                const isSelected = item.id === selectedEmailId;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedEmailId(item.id);
                      setMobileView("detail");
                    }}
                    className={cn(
                      "group p-3 rounded-xl cursor-pointer transition-all flex items-center gap-3 select-none",
                      isSelected
                        ? "bg-[#F4F6F8] dark:bg-slate-800/80 shadow-2xs"
                        : "hover:bg-[#F4F6F8]/60 dark:hover:bg-slate-800/40"
                    )}
                  >
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      {item.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.avatar}
                          alt={item.sender}
                          className="w-10 h-10 rounded-full object-cover shadow-2xs"
                        />
                      ) : (
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-2xs"
                          style={{ backgroundColor: item.avatarColor || "#00A76F" }}
                        >
                          {item.avatarLetter || item.sender.charAt(0)}
                        </div>
                      )}
                    </div>

                    {/* Sender, Subject snippet & time */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 leading-tight">
                        <span className="text-[13px] font-bold text-[#1C252E] dark:text-white truncate">
                          {item.sender}
                        </span>
                        <span className="text-[11px] font-medium text-[#919EAB] shrink-0">
                          {item.time}
                        </span>
                      </div>
                      <p className="text-[12px] text-[#919EAB] truncate mt-1">
                        {item.snippet}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* COLUMN 3: EMAIL DETAIL & COMPOSER                        */}
        {/* ========================================================= */}
        <div
          className={cn(
            "flex-1 min-w-0 flex flex-col overflow-hidden bg-transparent",
            mobileView !== "detail" && "hidden md:flex"
          )}
        >
          {currentEmail ? (
            <>
              {/* Top Action Bar */}
              <div className="h-12 px-4 sm:px-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 shrink-0">
                {/* Mobile Back Button */}
                <button
                  type="button"
                  onClick={() => setMobileView("list")}
                  className="flex md:hidden items-center gap-1 text-xs font-bold text-slate-600 dark:text-slate-300"
                >
                  <ArrowBackIcon sx={{ fontSize: 16 }} />
                  <span>List</span>
                </button>

                {/* Right Header Action Icons */}
                <div className="flex items-center gap-1 sm:gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => toggleStar(currentEmail.id)}
                    className="p-1.5 rounded-lg text-[#637381] hover:text-[#1C252E] dark:text-[#919EAB] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Star"
                  >
                    {currentEmail.isStarred ? (
                      <StarIcon sx={{ fontSize: 19, color: "#F59E0B" }} />
                    ) : (
                      <StarBorderOutlinedIcon sx={{ fontSize: 19 }} />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => toast.success("Marked as important")}
                    className="p-1.5 rounded-lg text-[#637381] hover:text-[#1C252E] dark:text-[#919EAB] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Important"
                  >
                    <LabelImportantOutlinedIcon sx={{ fontSize: 19 }} />
                  </button>

                  <button
                    type="button"
                    onClick={() => toast.success("Archived conversation")}
                    className="p-1.5 rounded-lg text-[#637381] hover:text-[#1C252E] dark:text-[#919EAB] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Archive"
                  >
                    <ArchiveOutlinedIcon sx={{ fontSize: 19 }} />
                  </button>

                  <button
                    type="button"
                    onClick={() => toast.success("Marked as unread")}
                    className="p-1.5 rounded-lg text-[#637381] hover:text-[#1C252E] dark:text-[#919EAB] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Mark unread"
                  >
                    <MailOutlineIcon sx={{ fontSize: 19 }} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(currentEmail.id)}
                    className="p-1.5 rounded-lg text-[#637381] hover:text-rose-600 dark:text-[#919EAB] dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Delete"
                  >
                    <DeleteOutlineIcon sx={{ fontSize: 19 }} />
                  </button>

                  <button
                    type="button"
                    onClick={() => toast.info("More actions")}
                    className="p-1.5 rounded-lg text-[#637381] hover:text-[#1C252E] dark:text-[#919EAB] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="More"
                  >
                    <MoreVertIcon sx={{ fontSize: 19 }} />
                  </button>
                </div>
              </div>

              {/* Subject Header & Quick Reply Actions */}
              <div className="px-5 sm:px-7 pt-4 pb-1 shrink-0">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <h1 className="text-[15px] sm:text-[16px] font-bold text-[#1C252E] dark:text-white tracking-tight leading-snug">
                    {currentEmail.subject}
                  </h1>

                  <div className="flex flex-col items-end shrink-0">
                    <div className="flex items-center gap-1 text-[#637381] dark:text-[#919EAB]">
                      <button
                        type="button"
                        onClick={() => handleCompose({ inReplyTo: currentEmail.id, subject: `Re: ${currentEmail.subject}` })}
                        className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Reply"
                      >
                        <ReplyIcon sx={{ fontSize: 18 }} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCompose({ inReplyTo: currentEmail.id, subject: `Re: ${currentEmail.subject}` })}
                        className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Reply all"
                      >
                        <ReplyAllIcon sx={{ fontSize: 18 }} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCompose({ subject: `Fwd: ${currentEmail.subject}` })}
                        className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Forward"
                      >
                        <ForwardIcon sx={{ fontSize: 18 }} />
                      </button>
                    </div>
                    <span className="text-[11px] text-[#919EAB] font-normal mt-0.5">
                      {currentEmail.date}
                    </span>
                  </div>
                </div>
              </div>

              {/* Subtle Dashed Divider */}
              <div className="border-b border-dashed border-slate-200 dark:border-slate-800 mx-5 sm:mx-7 my-3" />

              {/* Sender Info Row */}
              <div className="px-5 sm:px-7 py-1 flex items-start gap-3 shrink-0">
                {currentEmail.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={currentEmail.avatar}
                    alt={currentEmail.sender}
                    className="w-9 h-9 rounded-full object-cover shrink-0 mt-0.5 shadow-2xs"
                  />
                ) : (
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 mt-0.5 shadow-2xs"
                    style={{ backgroundColor: currentEmail.avatarColor || "#00A76F" }}
                  >
                    {currentEmail.avatarLetter || currentEmail.sender.charAt(0)}
                  </div>
                )}

                <div className="flex flex-col min-w-0">
                  <div className="flex flex-wrap items-baseline gap-1.5 leading-snug">
                    <span className="text-[13.5px] font-bold text-[#1C252E] dark:text-white">
                      {currentEmail.sender}
                    </span>
                    <span className="text-[12px] text-[#637381] dark:text-[#919EAB]">
                      &lt;{currentEmail.email}&gt;
                    </span>
                  </div>
                  <span className="text-[11.5px] text-[#919EAB] mt-0.5">
                    To: {currentEmail.to}
                  </span>
                </div>
              </div>

              {/* Email Content Body */}
              <div className="flex-1 min-h-0 overflow-y-auto px-5 sm:px-7 py-4 text-[13.5px] text-[#212B36] dark:text-slate-200 leading-relaxed font-normal">
                <p>{currentEmail.body}</p>
              </div>

              {/* Bottom Rich-Text Reply Composer */}
              <div className="p-4 sm:p-6 pt-2 shrink-0">
                <div className="rounded-2xl border border-slate-200/90 dark:border-slate-700/80 bg-white dark:bg-slate-900/40 p-3 shadow-2xs focus-within:border-slate-300 dark:focus-within:border-slate-600 transition-all">
                  {/* Toolbar Row 1: Formatting options */}
                  <div className="flex flex-wrap items-center gap-1 pb-2 border-b border-slate-100 dark:border-slate-800 text-[#637381] dark:text-[#919EAB]">
                    {/* Paragraph Dropdown */}
                    <button
                      type="button"
                      className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold text-[#1C252E] dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <span>Paragraph</span>
                      <KeyboardArrowDownOutlinedIcon sx={{ fontSize: 16 }} />
                    </button>

                    <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1" />

                    {/* Text Styling: B, I, U, S */}
                    <button
                      type="button"
                      onClick={() => toggleFormat("bold")}
                      className={cn(
                        "h-7 w-7 rounded-lg text-xs font-bold transition-colors flex items-center justify-center",
                        activeFormats.bold
                          ? "bg-slate-200 text-[#1C252E] dark:bg-slate-700 dark:text-white"
                          : "hover:bg-slate-100 dark:hover:bg-slate-800"
                      )}
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
                    >
                      S
                    </button>

                    <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1" />

                    {/* Lists & Alignment */}
                    <button
                      type="button"
                      className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Bulleted list"
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
                  </div>

                  {/* Toolbar Row 2: Secondary media & tools */}
                  <div className="flex items-center justify-between pt-1 text-[#637381] dark:text-[#919EAB]">
                    <div className="flex items-center gap-1">
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
                        title="Add image"
                      >
                        <ImageOutlinedIcon sx={{ fontSize: 18 }} />
                      </button>

                      <button
                        type="button"
                        className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Indent"
                      >
                        <FormatIndentIncreaseOutlinedIcon sx={{ fontSize: 18 }} />
                      </button>

                      <button
                        type="button"
                        className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Clear formatting"
                      >
                        <FormatClearOutlinedIcon sx={{ fontSize: 18 }} />
                      </button>

                      <button
                        type="button"
                        className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Fullscreen"
                      >
                        <CropFreeOutlinedIcon sx={{ fontSize: 17 }} />
                      </button>
                    </div>

                    {/* Send Reply Button */}
                    <button
                      type="button"
                      onClick={handleSendReply}
                      className="px-3.5 py-1.5 rounded-xl bg-[#1C252E] hover:bg-[#28323D] dark:bg-white dark:hover:bg-slate-100 text-white dark:text-[#1C252E] font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
                    >
                      <span>Reply</span>
                      <SendIcon sx={{ fontSize: 13 }} />
                    </button>
                  </div>

                  {/* Typing Textarea */}
                  <textarea
                    rows={2}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write a message..."
                    className={cn(
                      "w-full bg-transparent border-none outline-none text-xs sm:text-[13px] text-[#1C252E] dark:text-white placeholder:text-[#919EAB] resize-none pt-2 font-normal",
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
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <MailOutlineIcon sx={{ fontSize: 44, color: "#919EAB", opacity: 0.5 }} />
              <p className="text-sm font-semibold mt-3 text-slate-600 dark:text-slate-300">
                Select an email to view details
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Compose Dialog */}
      <EmailComposerDialog
        open={composerOpen}
        onOpenChange={setComposerOpen}
        initialData={composerInitialData}
      />
    </div>
  );
}
