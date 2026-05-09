import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import { useState } from "react"
import { Bold, Italic, Underline as UnderlineIcon, Strikethrough, Link2, List, AlignLeft, AlignCenter, AlignRight, Undo, Redo, Type } from 'lucide-react'

interface AddNoteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (note: { title: string; content: string }) => void
}

export function AddNoteDialog({ open, onOpenChange, onSubmit }: AddNoteDialogProps) {
  const [isSharedWithGuest, setIsSharedWithGuest] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link,
      TextAlign.configure({
        types: ['paragraph', 'heading'],
        alignments: ['left', 'center', 'right'],
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'min-h-[300px] p-4 focus:outline-none',
      },
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editor) {
      onSubmit({ 
        title: "", 
        content: editor.getHTML() 
      })
      editor.commands.setContent('')
    }
    onOpenChange(false)
  }

  if (!editor) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] p-0">
        <div className="flex items-center justify-between bg-blue-600 text-white p-4">
          <h2 className="text-xl">New note</h2>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-blue-700 rounded">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 3h6v6M14 10l6.1-6.1M9 21H3v-6M10 14l-6.1 6.1"/>
              </svg>
            </button>
            <button className="p-2 hover:bg-blue-700 rounded" onClick={() => onOpenChange(false)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="p-4">
          <div className="mb-4">
            <div className="text-foreground mb-2">Related To</div>
            <div className="flex items-center gap-2">
              <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center">
                A
              </div>
              <span className="text-blue-600">Anzney</span>
            </div>
          </div>

          <div className="border rounded-md">
            <div className="flex flex-wrap gap-1 border-b p-2">
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 w-8 p-0 ${editor.isActive('bold') ? 'bg-muted' : ''}`}
                onClick={() => editor.chain().focus().toggleBold().run()}
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 w-8 p-0 ${editor.isActive('italic') ? 'bg-muted' : ''}`}
                onClick={() => editor.chain().focus().toggleItalic().run()}
              >
                <Italic className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 w-8 p-0 ${editor.isActive('underline') ? 'bg-muted' : ''}`}
                onClick={() => editor.chain().focus().toggleUnderline().run()}
              >
                <UnderlineIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 w-8 p-0 ${editor.isActive('strike') ? 'bg-muted' : ''}`}
                onClick={() => editor.chain().focus().toggleStrike().run()}
              >
                <Strikethrough className="h-4 w-4" />
              </Button>
              <div className="w-px h-8 bg-muted mx-1" />
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => {
                  const url = window.prompt('Enter the URL')
                  if (url) {
                    editor.chain().focus().setLink({ href: url }).run()
                  }
                }}
              >
                <Link2 className="h-4 w-4" />
              </Button>
              <div className="w-px h-8 bg-muted mx-1" />
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 w-8 p-0 ${editor.isActive('bulletList') ? 'bg-muted' : ''}`}
                onClick={() => editor.chain().focus().toggleBulletList().run()}
              >
                <List className="h-4 w-4" />
              </Button>
              <div className="w-px h-8 bg-muted mx-1" />
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 w-8 p-0 ${editor.isActive({ textAlign: 'left' }) ? 'bg-muted' : ''}`}
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
              >
                <AlignLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 w-8 p-0 ${editor.isActive({ textAlign: 'center' }) ? 'bg-muted' : ''}`}
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
              >
                <AlignCenter className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 w-8 p-0 ${editor.isActive({ textAlign: 'right' }) ? 'bg-muted' : ''}`}
                onClick={() => editor.chain().focus().setTextAlign('right').run()}
              >
                <AlignRight className="h-4 w-4" />
              </Button>
              <div className="w-px h-8 bg-muted mx-1" />
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => editor.chain().focus().undo().run()}
              >
                <Undo className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => editor.chain().focus().redo().run()}
              >
                <Redo className="h-4 w-4" />
              </Button>
              <div className="w-px h-8 bg-muted mx-1" />
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => {
                  const level = editor.isActive('heading', { level: 1 }) ? 1 : 2
                  editor.chain().focus().toggleHeading({ level }).run()
                }}
              >
                <Type className="h-4 w-4" />
              </Button>
            </div>
            <EditorContent editor={editor} className="min-h-[300px] border-0 focus-visible:ring-0" />
          </div>
        </div>

        <div className="flex items-center justify-between p-4 border-t bg-muted">
          <div className="flex items-center gap-4">
            <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 text-white">
              Save
            </Button>
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="share-guest"
              checked={isSharedWithGuest}
              onChange={(e) => setIsSharedWithGuest(e.target.checked)}
              className="rounded border-border"
            />
            <label htmlFor="share-guest" className="text-sm text-foreground">Share with guest</label>
            <button className="ml-2 text-muted-foreground hover:text-foreground">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 16v-4M12 8h.01"/>
              </svg>
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}