"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
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
    <div className="bg-muted/50 rounded-2xl p-6 flex flex-col h-full">
      {canModify && (
        <div className="mb-6 flex justify-between items-center bg-card p-4 rounded-xl border border-border shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand/10 rounded-lg">
              <Plus className="w-4 h-4 text-brand" />
            </div>
            <h2 className="text-base font-semibold text-foreground">Client Notes</h2>
          </div>
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="hover:bg-brand/90 transition-colors bg-brand text-white"
          >
            <Plus className="h-4 w-4 mr-2" /> Add Note
          </Button>
        </div>
      )}

      {notes.length > 0 ? (
        <div className="bg-card rounded-xl border border-border shadow-sm transition-all p-5">
          <NotesList
            notes={notes}
            canModify={canModify}
            onEdit={(note) => {
              setEditNote(note);
              setTimeout(() => {
                setIsEditDialogOpen(true);
              }, 0);
            }}
            onDelete={handleDeleteNote}
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center bg-card rounded-xl border border-border shadow-sm p-12">
          <div className="w-24 h-24 mb-6 bg-muted rounded-full flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-12 h-12 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No notes yet</h3>
          <p className="text-muted-foreground text-center max-w-sm mb-6">
            Add your first note to keep track of important information.
          </p>
        </div>
      )}

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
