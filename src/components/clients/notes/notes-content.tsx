"use client";

import { Button } from "@/components/ui/button";
import { Plus, StickyNote } from "lucide-react";
import { useState } from "react";
import { AddNoteDialog } from "./add-note-dialog";
import { NotesList } from "./notes-list";
import { useClientNotes } from "@/hooks/use-clientNotes";
import { Badge } from "@/components/ui/badge";

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

function mapNote(noteFromApi: any): Note {
  return {
    id: noteFromApi._id || noteFromApi.id,
    content: noteFromApi.content,
    author: noteFromApi.addedBy
      ? {
          name: noteFromApi.addedBy.name || "Unknown",
          avatar: noteFromApi.addedBy.name ? noteFromApi.addedBy.name.substring(0, 2).toUpperCase() : "U",
        }
      : {
          name: "Unknown",
          avatar: "?",
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
  const entityId = clientId || candidateId;
  const entityType = clientId ? "client" : "candidate";

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
    return (
      <div className="p-12 text-center text-muted-foreground animate-pulse text-xs uppercase tracking-wider font-semibold">
        Loading notes...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Action Bar */}
      <div className="flex items-center justify-between p-4 rounded-xl border border-border/70 bg-card shadow-2xs">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <StickyNote className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-foreground">Client Notes</h3>
              <Badge variant="outline" className="h-5 px-1.5 text-xs font-bold bg-primary/10 text-primary border-primary/20">
                {notes.length}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">Keep track of discussions, key requirements, and updates</p>
          </div>
        </div>

        {canModify && (
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            size="sm"
            className="h-8 px-3 text-xs font-bold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> Add Note
          </Button>
        )}
      </div>

      {/* Notes List */}
      {notes.length > 0 ? (
        <div className="rounded-xl border border-border/70 bg-card p-3 shadow-2xs">
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
      ) : (
        <div className="flex flex-col items-center justify-center text-center bg-card rounded-xl border border-dashed border-border/80 p-12">
          <div className="w-12 h-12 mb-3 bg-muted text-muted-foreground rounded-2xl flex items-center justify-center">
            <StickyNote className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-foreground">No notes recorded yet</h4>
          <p className="text-xs text-muted-foreground max-w-xs mt-1 mb-4">
            Add notes to preserve context, meeting takeaways, and internal client comments.
          </p>
          {canModify && (
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              variant="outline"
              size="sm"
              className="text-xs font-semibold"
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> Add First Note
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
