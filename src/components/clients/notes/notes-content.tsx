"use client";

import { Button } from "@/components/ui/button";
import { Plus ,StickyNote,Clock, Edit2, Trash2} from "lucide-react";
import { useEffect, useState } from "react";
import { AddNoteDialog } from "./add-note-dialog";
import { NotesList } from "./notes-list";
import { useClientNotes } from "@/hooks/use-clientNotes";
export interface Note {
  id: string;
  content: string;
  author: {
    name: string;
    avatar: string;
  };
  createdAt: string;
  isPrivate: boolean;
}


// Utility to map backend note to frontend note
function mapNote(noteFromApi: any): Note {
  return {
    id: noteFromApi._id || noteFromApi.id,
    content: noteFromApi.content,
    author: noteFromApi.addedBy
      ? {
        name: noteFromApi.addedBy.name || "Unknown",
        avatar: noteFromApi.addedBy.name ? noteFromApi.addedBy.name.substring(0, 2).toUpperCase() : "U"
      }
      : {
        name: "Unknown",
        avatar: "?"
      },
    createdAt: noteFromApi.createdAt,
    isPrivate: false,
  };
}

export function NotesContent({
  clientId,
  candidateId,
  canModify,
}: {
  clientId?: string;
  candidateId?: string;
  canModify?: boolean;
}) {
  // const router = useRouter();

  const entityId = clientId || candidateId;
  const entityType = clientId ? 'client' : 'candidate';

  const { notes: apiNotes, createNote, updateNote, deleteNote, isLoading } = useClientNotes(entityId, entityType);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editNote, setEditNote] = useState<Note | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const notes: Note[] = (apiNotes || []).map(mapNote);

  const handleAddNote = async (note: { content: string }) => {
    try {
      await createNote(note.content);
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error("Failed to add note:", error);
    }
  };

  const handleUpdateNote = async (updated: { content: string }) => {
    if (!editNote) return;
    try {
      await updateNote({ noteId: editNote.id, content: updated.content });
      setEditNote(null);
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Failed to update note:", error);
    }
  };

  const handleDeleteNote = async (noteToDelete: Note) => {
    try {
      await deleteNote(noteToDelete.id);
    } catch (error) {
      console.error("Failed to delete note:", error);
    }
  };

  if (isLoading) {
    return <div className="p-6 text-center text-muted-foreground animate-pulse">Loading notes...</div>;
  }

  return (
<div className="space-y-4 h-full">
  {/* Header Action Bar */}
  <div className="flex items-center justify-between p-4 rounded-xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-sm">
    <div className="flex items-center gap-2.5">
      <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-600 dark:text-emerald-400">
        <StickyNote className="w-4 h-4" />
      </div>
      <div>
        <h2 className="text-sm font-semibold text-foreground">Client Notes</h2>
        <p className="text-[11px] text-muted-foreground">
          Keep track of important client updates and history
        </p>
      </div>
    </div>

    {canModify && (
      <Button
        onClick={() => setIsAddDialogOpen(true)}
        size="sm"
        className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm font-medium transition-all"
      >
        <Plus className="h-4 w-4 mr-1.5" /> Add Note
      </Button>
    )}
  </div>

  {/* Modern Data View Container */}
  {notes.length > 0 ? (
    <div className="space-y-3">
      {/* 
        Notes List wrapper: Subtle Glassmorphism, smooth inner borders, 
        aur hover par card elevation 
      */}
      <div className="rounded-xl border border-border/60 bg-card/40 backdrop-blur-sm p-2 shadow-sm hover:border-emerald-500/30 transition-all">
        <NotesList
          notes={notes}
          canModify={canModify}
          onEdit={(note) => {
            setEditNote(note);
            setTimeout(() => setIsEditDialogOpen(true), 0);
          }}
          onDelete={handleDeleteNote}
        />
      </div>
    </div>
  ) : (
    /* Modern Empty State */
    <div className="flex flex-col items-center justify-center text-center bg-card/40 rounded-xl border border-dashed border-border/80 p-10 min-h-[260px]">
      <div className="w-12 h-12 mb-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center">
        <StickyNote className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-bold text-foreground">No notes recorded yet</h3>
      <p className="text-xs text-muted-foreground max-w-xs mt-1 mb-4">
        Add your first note to keep track of key details, meetings, or preferences.
      </p>
      {canModify && (
        <Button
          onClick={() => setIsAddDialogOpen(true)}
          variant="outline"
          size="sm"
          className="border-emerald-600/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10"
        >
          <Plus className="h-3.5 w-3.5 mr-1" /> Add Note
        </Button>
      )}
    </div>
  )}

  {/* Modals & Dialogs */}
  {canModify && (
    <AddNoteDialog
      open={isAddDialogOpen}
      onOpenChange={setIsAddDialogOpen}
      onSubmit={handleAddNote}
    />
  )}

  {canModify && editNote && (
    <AddNoteDialog
      open={isEditDialogOpen}
      onOpenChange={(open) => {
        setIsEditDialogOpen(open);
        if (!open) setEditNote(null);
      }}
      onSubmit={handleUpdateNote}
      initialContent={editNote.content}
      isEdit
    />
  )}
</div>
  );
}
