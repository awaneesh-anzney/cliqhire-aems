"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmailTemplate } from "@/components/clients/email-templates/types";
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify, Link2, Image as ImageIcon, RotateCcw } from "lucide-react";

interface AddTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (template: {
    name: string;
    subject: string;
    content: string;
    category: string;
    isDefault: boolean;
  }) => void;
  initialTemplate?: EmailTemplate;
  clientData?: any;
  isEdit?: boolean;
}

const TEMPLATE_CATEGORIES = [
  "General",
  "Welcome",
  "Follow-up",
  "Proposal",
  "Contract",
  "Invoice",
  "Meeting",
  "Reminder",
  "Thank You",
  "Rejection",
  "Other"
];

export function AddTemplateDialog({
  open,
  onOpenChange,
  onSubmit,
  initialTemplate,
  clientData,
  isEdit = false,
}: AddTemplateDialogProps) {
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("General");
  const [isDefault, setIsDefault] = useState(false);
  
  const editorRef = useRef<HTMLDivElement>(null);

  const executeCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
  };

  const formatText = (command: string) => {
    executeCommand(command);
  };

  const setAlignment = (alignment: string) => {
    executeCommand(`justify${alignment}`);
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      executeCommand('createLink', url);
    }
  };

  const insertImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      executeCommand('insertImage', url);
    }
  };

  useEffect(() => {
    if (initialTemplate) {
      setName(initialTemplate.name);
      setSubject(initialTemplate.subject);
      setContent(initialTemplate.content);
      setCategory(initialTemplate.category);
      setIsDefault(initialTemplate.isDefault);
      
      // Update editor content
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.innerHTML = initialTemplate.content;
        }
      }, 0);
    } else {
      setName("");
      setSubject("");
      setContent("");
      setCategory("General");
      setIsDefault(false);
      
      // Clear editor content
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.innerHTML = "";
        }
      }, 0);
    }
  }, [initialTemplate, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !subject.trim() || !content.trim()) {
      alert("Please fill in all required fields");
      return;
    }

    onSubmit({
      name: name.trim(),
      subject: subject.trim(),
      content: content.trim(),
      category,
      isDefault,
    });

    // Reset form
    setName("");
    setSubject("");
    setContent("");
    setCategory("General");
    setIsDefault(false);
    onOpenChange(false);
  };

  const insertVariable = (variable: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        const textNode = document.createTextNode(variable);
        range.insertNode(textNode);
        range.setStartAfter(textNode);
        range.setEndAfter(textNode);
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        // If no selection, just append to the end
        editorRef.current.innerHTML += variable;
      }
      setContent(editorRef.current.innerHTML);
    }
  };

  const commonVariables = [
    { label: "Client Name", value: "{{clientName}}" },
    { label: "Client Company", value: "{{clientCompany}}" },
    { label: "Client Email", value: "{{clientEmail}}" },
    { label: "Client Phone", value: "{{clientPhone}}" },
    { label: "Today's Date", value: "{{todayDate}}" },
    { label: "Current Time", value: "{{currentTime}}" },
    { label: "Your Name", value: "{{senderName}}" },
    { label: "Your Title", value: "{{senderTitle}}" },
    { label: "Company Name", value: "{{companyName}}" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Email Template" : "Create New Email Template"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Template Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Welcome Email, Follow-up Template"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {TEMPLATE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Email Subject *</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g., Welcome to our partnership, [Client Name]!"
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="content">Email Content *</Label>
              {/* <div className="text-sm text-muted-foreground">
                Use variables like {`{{clientName}}`} for personalization
              </div> */}
            </div>
            
            {/* Formatting Toolbar */}
            <div className="flex items-center gap-1 bg-muted border border-border rounded-lg px-3 py-2 mb-3 flex-shrink-0 overflow-x-auto">
              <button 
                type="button"
                onClick={() => executeCommand('undo')}
                className="p-1.5 hover:bg-muted rounded transition-colors flex-shrink-0"
                title="Undo"
              >
                <RotateCcw className="w-4 h-4 text-foreground" />
              </button>
              
              <div className="w-px h-5 bg-muted mx-1 flex-shrink-0" />
              
              <button 
                type="button"
                onClick={() => formatText('bold')}
                className="p-1.5 hover:bg-muted rounded transition-colors flex-shrink-0"
                title="Bold"
              >
                <Bold className="w-4 h-4 text-foreground" />
              </button>
              <button 
                type="button"
                onClick={() => formatText('italic')}
                className="p-1.5 hover:bg-muted rounded transition-colors flex-shrink-0"
                title="Italic"
              >
                <Italic className="w-4 h-4 text-foreground" />
              </button>
              <button 
                type="button"
                onClick={() => formatText('underline')}
                className="p-1.5 hover:bg-muted rounded transition-colors flex-shrink-0"
                title="Underline"
              >
                <Underline className="w-4 h-4 text-foreground" />
              </button>
              
              <div className="w-px h-5 bg-muted mx-1 flex-shrink-0" />
              
              <button 
                type="button"
                onClick={() => setAlignment('Left')}
                className="p-1.5 hover:bg-muted rounded transition-colors flex-shrink-0"
                title="Align Left"
              >
                <AlignLeft className="w-4 h-4 text-foreground" />
              </button>
              <button 
                type="button"
                onClick={() => setAlignment('Center')}
                className="p-1.5 hover:bg-muted rounded transition-colors flex-shrink-0"
                title="Align Center"
              >
                <AlignCenter className="w-4 h-4 text-foreground" />
              </button>
              <button 
                type="button"
                onClick={() => setAlignment('Right')}
                className="p-1.5 hover:bg-muted rounded transition-colors flex-shrink-0"
                title="Align Right"
              >
                <AlignRight className="w-4 h-4 text-foreground" />
              </button>
              <button 
                type="button"
                onClick={() => setAlignment('Full')}
                className="p-1.5 hover:bg-muted rounded transition-colors flex-shrink-0"
                title="Justify"
              >
                <AlignJustify className="w-4 h-4 text-foreground" />
              </button>
              
              
              <div className="w-px h-5 bg-muted mx-1 flex-shrink-0" />
              
              <button 
                type="button"
                onClick={insertLink}
                className="p-1.5 hover:bg-muted rounded transition-colors flex-shrink-0"
                title="Insert Link"
              >
                <Link2 className="w-4 h-4 text-foreground" />
              </button>
              <button 
                type="button"
                onClick={insertImage}
                className="p-1.5 hover:bg-muted rounded transition-colors flex-shrink-0"
                title="Insert Image"
              >
                <ImageIcon className="w-4 h-4 text-foreground" />
              </button>
              
              <span className="ml-auto text-xs text-muted-foreground font-medium flex-shrink-0">HTML</span>
            </div>

            {/* Rich Text Editor */}
            <div className="border border-border rounded-lg bg-card min-h-[200px] relative">
              <div 
                ref={editorRef}
                contentEditable
                className="outline-none text-foreground leading-relaxed p-4 min-h-[200px]"
                suppressContentEditableWarning={true}
                onInput={(e) => {
                  setContent(e.currentTarget.innerHTML);
                }}
              />
              {/* Placeholder overlay */}
              {(!content || content.trim() === '') && (
                <div className="absolute top-4 left-4 text-muted-foreground pointer-events-none">
                  Dear {`{{clientName}}`}, <br /><br />
                  Thank you for your interest in working with us. We are excited about the opportunity to partner with {`{{clientCompany}}`}.<br /><br />
                  Best regards<br />
                  {`{{senderName}}`}
                </div>
              )}
            </div>
          </div>

          

          {/* Variable insertion buttons */}
          <div className="flex items-center gap-1 p-1 bg-muted rounded-md overflow-x-auto">
            <span className="text-sm font-medium text-foreground whitespace-nowrap">Quick Insert:</span>
            {commonVariables.slice(0, 6).map((variable) => (
              <Button
                key={variable.value}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => insertVariable(variable.value)}
                className="text-xs whitespace-nowrap flex-shrink-0"
              >
                {variable.label}
              </Button>
            ))}
          </div>

          {/* <div className="flex items-center space-x-2">
            <Switch
              id="isDefault"
              checked={isDefault}
              onCheckedChange={setIsDefault}
            />
            <Label htmlFor="isDefault" className="text-sm">
              Set as default template for this category
            </Label>
          </div> */}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {isEdit ? "Update Template" : "Create Template"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
