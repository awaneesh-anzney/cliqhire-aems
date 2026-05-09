"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ConfirmDeleteDialog } from "@/components/ui/ConfirmDeleteDialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Lock, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState, useEffect } from "react";
import type { Note } from "./notes-content";

interface NotesListProps {
  notes: Note[];
  onEdit: (note: Note) => void;
  onDelete: (note: Note) => void;
  canModify?: boolean;
}

export function NotesList({ notes, onEdit, onDelete, canModify }: NotesListProps) {
  const [expandNotes, setExpandNotes] = useState<string[]>([]);
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);
  const [isPointerDisabled, setIsPointerDisabled] = useState(false);

  const toggleExpand = (noteId: string) => {
    setExpandNotes((prev) =>
      prev.includes(noteId) ? prev.filter((id) => id !== noteId) : [...prev, noteId],
    );
  };

  return (
    <div className="space-y-6 overflow-x-hidden">
      {notes.map((note) => (
        <div key={note.id} className="bg-card rounded-lg border p-4 overflow-x-hidden">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Created By: {note.author.name}</span>
                  {note.isPrivate && <Lock className="h-4 w-4 text-muted-foreground" />}
                </div>
                <span className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(note.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                aria-label={expandNotes.includes(note.id) ? "Collapse note" : "Expand note"}
                onClick={() => toggleExpand(note.id)}
              >
                {expandNotes.includes(note.id) ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </Button>
              {canModify && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem onClick={() => onEdit(note)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setIsPointerDisabled(true);
                        setTimeout(() => {
                          setNoteToDelete(note); // ✅ Delay set for modal open
                        }, 0);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
          <div
            className={`text-sm break-words whitespace-pre-wrap transition-all duration-200 max-w-[100%] ${
              expandNotes.includes(note.id) ? "" : "line-clamp-2"
            }`}
            style={{
              // ✅ Word break karne ke liye yeh properties lagayi
              wordBreak: "break-word",
              overflowWrap: "break-word",
              whiteSpace: "pre-wrap", // ✅ Enter dabane par line break maintain karega
              maxWidth: "100%", // ✅ container overflow se bachaata hai
            }}
            dangerouslySetInnerHTML={{ __html: note.content }}
          />
        </div>
      ))}

      {/* Universal Delete Confirmation Dialog */}
      {canModify && (
        <ConfirmDeleteDialog
          open={!!noteToDelete}
          onOpenChange={(open) => {
            if (!open) {
              setNoteToDelete(null);
              setTimeout(() => {
                setIsPointerDisabled(false);
              }, 200);
            }
          }}
          onConfirm={() => {
            if (noteToDelete) {
              onDelete(noteToDelete);
              setNoteToDelete(null);
            }
          }}
          title="Delete Note"
          description="Are you sure you want to delete this note?"
        />
      )}
    </div>
  );
}
