import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { $generateHtmlFromNodes } from "@lexical/html";
import { ToolbarPlugin } from "./toolbar-plugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { Bold, Italic, Underline, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, X } from "lucide-react";
import { ListNode, ListItemNode } from "@lexical/list";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { ShareMenu } from "@/components/common/ShareMenu";
import { Label } from "@/components/ui/label";

interface JobDiscriptionIProps {
  value: string;
  onSave: (val: string) => void;
  disabled?: boolean;
}

const editorConfig = {
  namespace: "JobDiscriptionIEditor",
  theme: {
    paragraph: "prose prose-sm dark:prose-invert",
    text: {
      bold: "font-bold",
      italic: "italic",
      underline: "underline",
    },
  },
  onError(error: Error) {
    throw error;
  },
  nodes: [
    ListNode,
    ListItemNode,
    // ...add other nodes if needed
  ],
};

function FakeToolbar() {
  return (
    <div className="flex gap-2 border-b pb-1 mb-2">
      <Button type="button" size="icon" variant="outline" disabled><Bold className="w-4 h-4" /></Button>
      <Button type="button" size="icon" variant="outline" disabled><Italic className="w-4 h-4" /></Button>
      <Button type="button" size="icon" variant="outline" disabled><Underline className="w-4 h-4" /></Button>
      <Button type="button" size="icon" variant="outline" disabled><AlignLeft className="w-4 h-4" /></Button>
      <Button type="button" size="icon" variant="outline" disabled><AlignCenter className="w-4 h-4" /></Button>
      <Button type="button" size="icon" variant="outline" disabled><AlignRight className="w-4 h-4" /></Button>
      <Button type="button" size="icon" variant="outline" disabled><List className="w-4 h-4" /></Button>
      <Button type="button" size="icon" variant="outline" disabled><ListOrdered className="w-4 h-4" /></Button>
      <Button type="button" size="icon" variant="outline" disabled><X className="w-4 h-4" /></Button>
    </div>
  );
}

export function JobDescriptionInternal({ value, onSave, disabled }: JobDiscriptionIProps) {
  const [editing, setEditing] = useState(false);
  const [editorState, setEditorState] = useState<string>(value);

  const handleSave = useCallback(() => {
    onSave(editorState);
    setEditing(false);
  }, [editorState, onSave]);

  const handleCancel = () => {
    setEditorState(value);
    setEditing(false);
  };

  return (
    <Card className="border border-input p-4 mt-4">
      <div className="flex items-center justify-between mb-2">
        <Label className="text-sm tracking-tight">Create new job description</Label>
        <div className="flex items-center gap-2">
          <ShareMenu shareText={value ? value.replace(/<[^>]+>/g, '') : 'No internal description'} />
          {!editing && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-black"
              onClick={() => setEditing(true)}
              disabled={disabled}
            >
              Edit
            </Button>
          )}
        </div>
      </div>
      {editing ? (
        <div className="space-y-2">
          <LexicalComposer initialConfig={editorConfig}>
            <ToolbarPlugin disabled={false} />
            <RichTextPlugin
              contentEditable={
                <ContentEditable className="min-h-[120px] w-full border border-input rounded-md px-3 py-2 text-base focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
              }
              placeholder={<span className="text-muted-foreground">Write internal job description...</span>}
              ErrorBoundary={LexicalErrorBoundary}
            />
            <ListPlugin />
            <HistoryPlugin />
            <OnChangePlugin
              onChange={(_editorState, editor) => {
                let html = "";
                editor.update(() => {
                  html = $generateHtmlFromNodes(editor, null);
                });
                setEditorState(html);
              }}
            />
          </LexicalComposer>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave} disabled={disabled}>
              Save
            </Button>
            <Button size="sm" variant="secondary" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <>
          <FakeToolbar />
          <div className="text-sm prose prose-sm dark:prose-invert min-h-[48px] border border-input rounded-md px-3 py-2 bg-card">
            {value ? (
              <div dangerouslySetInnerHTML={{ __html: value }} />
            ) : (
              <span className="text-muted-foreground">No internal description</span>
            )}
          </div>
        </>
      )}
    </Card>
  );
} 