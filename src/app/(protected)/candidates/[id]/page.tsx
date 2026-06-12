// Remove 'use client' and refactor to server component
import { SlidersHorizontal, RefreshCcw, Plus, FileText, Users, Briefcase, Star, Activity, StickyNote, Paperclip, Clock, User } from "lucide-react";
import dynamicImport from 'next/dynamic';

const TABS = [
  { label: "Summary", icon: <FileText className="w-4 h-4" /> },
  { label: "Jobs", icon: <Briefcase className="w-4 h-4" /> },
  // { label: "Activities", icon: <Activity className="w-4 h-4" /> },
  { label: "Notes", icon: <StickyNote className="w-4 h-4" /> },
  { label: "Attachments", icon: <Paperclip className="w-4 h-4" /> },
  // { label: "Client Team", icon: <Users className="w-4 h-4" /> },
  // { label: "Contacts", icon: <User className="w-4 h-4" /> },
  // { label: "History", icon: <Clock className="w-4 h-4" /> },
];

// Dynamically import the client component for tabs and editing
const ClientCandidateTabs = dynamicImport(() => import('./ClientCandidateTabs'), { ssr: false });

// Force dynamic rendering to prevent caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function CandidatePage({ params }: { params: { id: string } }) {
  const { id } = params;

  return (
    <ClientCandidateTabs candidateId={id} tabs={TABS} />
  );
}
