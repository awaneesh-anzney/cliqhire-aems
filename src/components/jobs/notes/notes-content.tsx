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

// Utility to map backend note to frontend note
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
    <div className="space-y-4 h-full">
      
      {/* Header Action Bar */}
      <div className="flex items-center justify-between p-4 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400">
            <StickyNote className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Job Notes</h2>
            <p className="text-[11px] text-muted-foreground">
              Internal notes and updates for this position
            </p>
          </div>
        </div>

        {canModify && (
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm font-medium transition-all text-xs"
          >
            <Plus className="h-4 w-4 mr-1.5" /> Add Note
          </Button>
        )}
      </div>

      {/* Notes List or Empty State Container */}
      {notes.length > 0 ? (
        <div className="rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm p-4 shadow-sm hover:border-emerald-500/30 transition-all">
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
        /* Modern Clean Empty State */
        <div className="flex flex-col items-center justify-center text-center bg-card/40 rounded-2xl border border-dashed border-border/80 p-10 min-h-[260px]">
          <div className="w-12 h-12 mb-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center">
            <StickyNote className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-foreground">No notes recorded yet</h3>
          <p className="text-xs text-muted-foreground max-w-xs mt-1 mb-4">
            Add your first note to keep track of key details, feedback, or interview history.
          </p>
          {canModify && (
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              variant="outline"
              size="sm"
              className="border-emerald-600/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10 text-xs"
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> Add Note
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