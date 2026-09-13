"use client";

import { useEffect, useState } from "react";
import { Plus, StickyNote } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { AddNoteDialog } from "@/components/clients/notes/add-note-dialog";
import { NotesList } from "@/components/clients/notes/notes-list";
import {
  createJobNote,
  getJobNotesByJobId,
  updateJobNote,
  deleteJobNote,
} from "@/services/jobService";
import { JobData } from "../types";

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
    content: noteFromApi.note,
    author: noteFromApi.createdBy || { name: "Unknown", avatar: "?" },
    createdAt: noteFromApi.createdAt,
    isPrivate: false,
  };
}

export function NotesContent({
  jobId,
  jobData,
  canModify,
}: {
  jobId: string;
  jobData: JobData;
  canModify?: boolean;
}) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editNote, setEditNote] = useState<Note | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    if (!jobId) return;
    getJobNotesByJobId(jobId)
      .then((data) => setNotes(data.map(mapNote)))
      .catch((err) => console.error("Failed to fetch notes:", err));
  }, [jobId]);

  const handleAddNote = async (note: { content: string }) => {
    if (!jobId) {
      toast.error("Job ID not found in URL. Cannot create note.");
      return;
    }
    try {
      const res = await createJobNote({
        content: note.content,
        jobId,
        clientId: jobData.client._id,
      });
      setNotes([mapNote(res), ...notes]);
      toast.success("Note added successfully");
    } catch (error) {
      console.error("Failed to add note:", error);
      toast.error("Failed to add note");
    }
  };

  const handleUpdateNote = async (updated: { content: string }) => {
    if (!editNote) return;
    try {
      const res = await updateJobNote(editNote.id, updated.content, jobId);
      const updatedNote = mapNote(res);
      const updatedNotes = notes.map((n) =>
        n.id === updatedNote.id ? updatedNote : n
      );
      setNotes(updatedNotes);
      setEditNote(null);
      setIsEditDialogOpen(false);
      toast.success("Note updated successfully");
    } catch (error) {
      console.error("Failed to update note:", error);
      toast.error("Failed to update note");
    }
  };

  const handleDeleteNote = async (noteToDelete: Note) => {
    try {
      await deleteJobNote(noteToDelete.id);
      setNotes(notes.filter((n) => n.id !== noteToDelete.id));
      toast.success("Note deleted successfully");
    } catch (error) {
      console.error("Failed to delete note:", error);
      toast.error("Failed to delete note");
    }
  };

  return (
    <div className="space-y-2.5 h-full">
      {/* Header Action Bar */}
      <div className="flex items-center justify-between px-3.5 py-2 rounded-xl border border-border/70 bg-card shadow-xs">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-primary/10 rounded-md text-primary shrink-0">
            <StickyNote className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-foreground">Job Notes</h3>
            <p className="text-[10px] text-muted-foreground font-medium">
              Internal notes and position logs ({notes.length})
            </p>
          </div>
        </div>

        {canModify && (
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            size="sm"
            className="h-7 px-2.5 text-xs font-medium"
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> Add Note
          </Button>
        )}
      </div>

      {/* Notes List or Empty State */}
      {notes.length > 0 ? (
        <div className="rounded-xl border border-border/70 bg-card p-3 shadow-xs">
          <NotesList
            notes={notes}
            onEdit={(note) => {
              setEditNote(note);
              setTimeout(() => setIsEditDialogOpen(true), 0);
            }}
            onDelete={handleDeleteNote}
            canModify={canModify}
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center bg-muted/15 rounded-xl border border-dashed border-border/70 p-6 min-h-[180px]">
          <div className="w-10 h-10 mb-2 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
            <StickyNote className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-semibold text-foreground">No notes recorded yet</h4>
          <p className="text-[11px] text-muted-foreground max-w-xs mt-0.5 mb-3">
            Add internal notes to keep track of discussions, hiring decisions, or feedback.
          </p>
          {canModify && (
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              variant="outline"
              size="sm"
              className="h-7 px-2.5 text-xs border-border text-foreground font-medium"
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> Add First Note
            </Button>
          )}
        </div>
      )}

      {/* Add Note Dialog */}
      <AddNoteDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={handleAddNote}
      />

      {/* Edit Note Dialog */}
      {editNote && (
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