"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Plus, StickyNote } from "lucide-react";
import { AddNoteDialog } from "@/components/clients/notes/add-note-dialog";
import { NotesList } from "@/components/clients/notes/notes-list";

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
    id: noteFromApi?._id || noteFromApi?.id,
    content: noteFromApi?.content || "",
    author: noteFromApi?.createdBy || { name: "Unknown", avatar: "?" },
    createdAt: noteFromApi?.createdAt || noteFromApi?.updatedAt || new Date().toISOString(),
    isPrivate: false,
  };
}

export function CandidateNotesContent({
  candidateId,
  canModify,
}: {
  candidateId: string;
  canModify?: boolean;
}) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editNote, setEditNote] = useState<Note | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    if (!candidateId) return;
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/candidate-notes?candidate_id=${encodeURIComponent(
      candidateId
    )}`;
    axios
      .get(url)
      .then((res) => {
        const items = (res?.data?.data || []) as any[];
        setNotes(items.map(mapNote));
      })
      .catch((err) => console.error("Failed to fetch candidate notes:", err));
  }, [candidateId]);

  const handleAddNote = async (note: { content: string }) => {
    if (!candidateId) {
      toast.error("Candidate ID not found. Cannot create note.");
      return;
    }
    if (!canModify) return;

    const payload = {
      content: note.content,
      candidate_id: candidateId,
    };
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/candidate-notes`,
        payload
      );
      setNotes([mapNote(res?.data?.data), ...notes]);
      toast.success("Note added successfully");
    } catch (error) {
      console.error("Failed to add candidate note:", error);
      toast.error("Failed to add note");
    }
  };

  const handleUpdateNote = async (updated: { content: string }) => {
    if (!editNote) return;
    if (!canModify) return;
    try {
      const res = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/candidate-notes/${editNote.id}`,
        { content: updated.content }
      );
      const updatedNote = mapNote(res?.data?.data);
      const updatedNotes = notes.map((n) => (n.id === updatedNote.id ? updatedNote : n));
      setNotes(updatedNotes);
      setEditNote(null);
      setIsEditDialogOpen(false);
      toast.success("Note updated successfully");
    } catch (error) {
      console.error("Failed to update candidate note:", error);
      toast.error("Failed to update note");
    }
  };

  const handleDeleteNote = async (noteToDelete: Note) => {
    if (!canModify) return;
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/candidate-notes/${noteToDelete.id}`
      );
      setNotes(notes.filter((n) => n.id !== noteToDelete.id));
      toast.success("Note deleted successfully");
    } catch (error) {
      console.error("Failed to delete candidate note:", error);
      toast.error("Failed to delete note");
    }
  };

  return (
    <section className="space-y-2.5 h-full">
      {/* Header Action Bar */}
      <header className="flex items-center justify-between px-3.5 py-2 rounded-xl border border-border/70 bg-card shadow-xs">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-primary/10 rounded-md text-primary shrink-0 inline-flex items-center justify-center">
            <StickyNote className="w-3.5 h-3.5" />
          </span>
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-foreground">Candidate Notes</h3>
            <p className="text-[10px] text-muted-foreground font-medium">
              Internal logs and candidate interview feedback ({notes.length})
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
      </header>

      {/* Notes List or Empty State */}
      {notes.length > 0 ? (
        <div className="rounded-xl border border-border/70 bg-card p-3 shadow-xs">
          <NotesList
            notes={notes}
            onEdit={(note) => {
              setEditNote(note);
              setTimeout(() => {
                setIsEditDialogOpen(true);
              }, 0);
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
            Add notes to keep track of interviews, background checks, or recruiter observations.
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

      <AddNoteDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={handleAddNote}
      />

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
    </section>
  );
}
