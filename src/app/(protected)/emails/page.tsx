"use client";

import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { TemplateDialog } from "@/components/TemplateDialog";
import { Paperclip, Send, User, Mail, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify, List, ListOrdered, Link2, Image as ImageIcon, RotateCcw, X, FileText } from "lucide-react";

// Type definitions
interface EmailContact {
  id: number;
  email: string;
  name: string;
}

interface AttachedFile {
  id: number;
  file: File;
  name: string;
  size: number;
  type: string;
}

// Dummy email suggestions from backend
// Contacts state, fetched from backend
// (moved inside EmailsPage component)


export default function EmailsPage() {
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [contacts, setContacts] = useState<EmailContact[]>([]);
  useEffect(() => {
    axios.get("http://localhost:5000/api/emails/contacts").then(res => {
      setContacts(res.data);
    });
  }, []);
  const [emailContent, setEmailContent] = useState<string>("");
  const [subject, setSubject] = useState<string>("");
  const [selectedEmails, setSelectedEmails] = useState<EmailContact[]>([
    { id: 1, email: "hannah@gmail.com", name: "Hannah Smith" },
    { id: 2, email: "alex@gmail.com", name: "Alex Johnson" }
  ]);
  const [emailInput, setEmailInput] = useState<string>("");
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [filteredEmails, setFilteredEmails] = useState<EmailContact[]>([]);
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const executeCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      setEmailContent(editorRef.current.innerHTML);
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

  const handleEmailInputChange = (value: string) => {
    setEmailInput(value);
    if (value.trim()) {
      const filtered = contacts.filter(email => 
        !selectedEmails.some(selected => selected.id === email.id) &&
        (email.email.toLowerCase().includes(value.toLowerCase()) || 
         email.name.toLowerCase().includes(value.toLowerCase()))
      );
      setFilteredEmails(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const addEmail = (email: EmailContact) => {
    setSelectedEmails([...selectedEmails, email]);
    setEmailInput("");
    setShowSuggestions(false);
  };

  const addCustomEmail = () => {
    if (emailInput.trim() && emailInput.includes('@')) {
      const customEmail: EmailContact = {
        id: Date.now(),
        email: emailInput.trim(),
        name: emailInput.trim()
      };
      addEmail(customEmail);
    }
  };

  const removeEmail = (emailId: number) => {
    setSelectedEmails(selectedEmails.filter(email => email.id !== emailId));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredEmails.length > 0) {
        addEmail(filteredEmails[0]);
      } else {
        addCustomEmail();
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setEmailInput("");
    }
  };

  const getAvatarColor = (email: string) => {
    const colors = [
      'bg-blue-500', 'bg-yellow-500', 'bg-green-500', 'bg-purple-500', 
      'bg-red-500', 'bg-indigo-500', 'bg-pink-500', 'bg-teal-500'
    ];
    const index = email.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is 10MB.`);
        return false;
      }
      return true;
    });

    const newFiles: AttachedFile[] = validFiles.map((file, index) => ({
      id: Date.now() + index,
      file,
      name: file.name,
      size: file.size,
      type: file.type
    }));

    setAttachedFiles(prev => [...prev, ...newFiles]);
    // Clear the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (fileId: number) => {
    setAttachedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // --- SEND EMAIL FUNCTION ---
  const sendEmail = async () => {
    if (selectedEmails.length === 0) {
      alert("Please select at least one recipient.");
      return;
    }
    if (!subject.trim()) {
      alert("Please enter a subject.");
      return;
    }
    if (!emailContent.trim()) {
      alert("Please enter email content.");
      return;
    }
    const formData = new FormData();
    formData.append("to", JSON.stringify(selectedEmails));
    formData.append("subject", subject);
    formData.append("content", emailContent);
    attachedFiles.forEach((fileObj) => {
      formData.append("attachments", fileObj.file);
    });
    try {
      await axios.post("http://localhost:5000/api/emails/send", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Email sent!");
      setEmailContent("");
      setAttachedFiles([]);
      // Optionally clear subject and recipients
      // setSubject("");
      // setSelectedEmails([]);
    } catch (err: any) {
      alert(
        err?.response?.data?.error || "Failed to send email. Please try again."
      );
    }
  };

  // --- FETCH CONTACTS FUNCTION (optional, for real backend) ---
  // useEffect(() => {
  //   axios.get("http://localhost:5000/api/emails/contacts").then(res => {
  //     // setDummyEmails(res.data); // convert dummyEmails to state if needed
  //   });
  // }, []);

  return (
    <>
      <TemplateDialog
        open={templateDialogOpen}
        onOpenChange={setTemplateDialogOpen}
        onUseTemplate={(content, subject) => {
          // Convert plain text with line breaks to HTML
          const htmlContent = content
            .replace(/\n\n/g, '</p><p>')  // Double line breaks become paragraph breaks
            .replace(/\n/g, '<br>')       // Single line breaks become <br> tags
            .replace(/^/, '<p>')          // Add opening <p> tag at start
            .replace(/$/, '</p>');        // Add closing <p> tag at end
          
          setEmailContent(htmlContent);
          setSubject(subject); // Set the subject from template
          setTemplateDialogOpen(false);
          setTimeout(() => {
            if (editorRef.current) {
              editorRef.current.innerHTML = htmlContent;
            }
          }, 0);
        }}
      />
      <div className="h-[calc(100vh-5rem)] flex flex-col bg-card overflow-hidden">
      <div className="p-4 flex-shrink-0">
        {/* Dashboard Header */}
        <div className="flex items-center mb-4">
          <span className="bg-blue-100 text-blue-600 rounded-lg p-2 mr-3">
            <Mail className="w-6 h-6" />
          </span>
          <h1 className="text-2xl font-semibold text-foreground">Email</h1>
        </div>
      </div>
      
      {/* Full Width Email Container */}
      <div className="flex-1 flex flex-col overflow-hidden px-4 pb-4">
        {/* To and Subject */}
        <div className="mb-3 border border-border rounded-lg bg-card flex-shrink-0">
          <div className="px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-muted-foreground text-sm">To:</span>
              
              {/* Show email chips if emails are selected */}
              {selectedEmails.length > 0 && selectedEmails.map((email) => (
                <span key={email.id} className="flex items-center bg-blue-50 rounded-full px-2 py-1 border border-blue-100">
                  <div className={`w-6 h-6 ${getAvatarColor(email.email)} rounded-full mr-1 flex items-center justify-center text-white text-xs font-semibold`}>
                    {getInitials(email.name)}
                  </div>
                  <span className="text-blue-700 text-sm font-medium">{email.email}</span>
                  <button 
                    onClick={() => removeEmail(email.id)}
                    className="ml-1 text-blue-400 hover:text-blue-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              
              {/* Input field */}
              <div className="relative flex-1">
                <input
                  type="text"
                  value={emailInput}
                  onChange={(e) => handleEmailInputChange(e.target.value)}
                  onKeyDown={handleKeyPress}
                  onFocus={() => emailInput.trim() && setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder={selectedEmails.length === 0 ? "Type email address or name..." : ""}
                  className="w-full bg-transparent border-none outline-none text-sm text-black placeholder-black"
                />
                
                {/* Suggestions Dropdown */}
                {showSuggestions && filteredEmails.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-card border border-border rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                    {filteredEmails.map((email) => (
                      <button
                        key={email.id}
                        onClick={() => addEmail(email)}
                        onMouseDown={(e) => e.preventDefault()}
                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted text-left"
                      >
                        <div className={`w-8 h-8 ${getAvatarColor(email.email)} rounded-full flex items-center justify-center text-white text-xs font-semibold`}>
                          {getInitials(email.name)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-foreground">{email.name}</div>
                          <div className="text-xs text-muted-foreground">{email.email}</div>
                        </div>
                      </button>
                    ))}
                    
                    {/* Add custom email option */}
                    {emailInput.includes('@') && !filteredEmails.some(e => e.email === emailInput.trim()) && (
                      <button
                        onClick={addCustomEmail}
                        onMouseDown={(e) => e.preventDefault()}
                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-muted text-left border-t border-border"
                      >
                        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                          +
                        </div>
                        <div>
                          <div className="text-sm font-medium text-foreground">Add &quot;{emailInput}&quot;</div>
                          <div className="text-xs text-muted-foreground">Press Enter to add</div>
                        </div>
                      </button>
                    )}
                  </div>
                )}
              </div>
              
             
            </div>
            
            {/* Email Input with Autocomplete */}
           
          </div>
          
          <div className="flex items-center gap-2 px-4 py-2">
            <span className="text-muted-foreground text-sm">Subject:</span>
            <input
              type="text"
              placeholder="Type subject..."
              className="bg-transparent font-semibold text-foreground text-base outline-none border-none px-2 py-1 flex-1"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
        </div>
        
        

        {/* Formatting Toolbar */}
        <div className="flex items-center gap-1 bg-muted border border-border rounded-lg px-3 py-2 mb-3 flex-shrink-0 overflow-x-auto">
          <button 
            onClick={() => executeCommand('undo')}
            className="p-1.5 hover:bg-muted rounded transition-colors flex-shrink-0"
            title="Undo"
          >
            <RotateCcw className="w-4 h-4 text-foreground" />
          </button>
          
          <div className="w-px h-5 bg-muted mx-1 flex-shrink-0" />
          
          <button 
            onClick={() => formatText('bold')}
            className="p-1.5 hover:bg-muted rounded transition-colors flex-shrink-0"
            title="Bold"
          >
            <Bold className="w-4 h-4 text-foreground" />
          </button>
          <button 
            onClick={() => formatText('italic')}
            className="p-1.5 hover:bg-muted rounded transition-colors flex-shrink-0"
            title="Italic"
          >
            <Italic className="w-4 h-4 text-foreground" />
          </button>
          <button 
            onClick={() => formatText('underline')}
            className="p-1.5 hover:bg-muted rounded transition-colors flex-shrink-0"
            title="Underline"
          >
            <Underline className="w-4 h-4 text-foreground" />
          </button>
          
          <div className="w-px h-5 bg-muted mx-1 flex-shrink-0" />
          
          <button 
            onClick={() => setAlignment('Left')}
            className="p-1.5 hover:bg-muted rounded transition-colors flex-shrink-0"
            title="Align Left"
          >
            <AlignLeft className="w-4 h-4 text-foreground" />
          </button>
          <button 
            onClick={() => setAlignment('Center')}
            className="p-1.5 hover:bg-muted rounded transition-colors flex-shrink-0"
            title="Align Center"
          >
            <AlignCenter className="w-4 h-4 text-foreground" />
          </button>
          <button 
            onClick={() => setAlignment('Right')}
            className="p-1.5 hover:bg-muted rounded transition-colors flex-shrink-0"
            title="Align Right"
          >
            <AlignRight className="w-4 h-4 text-foreground" />
          </button>
          <button 
            onClick={() => setAlignment('Full')}
            className="p-1.5 hover:bg-muted rounded transition-colors flex-shrink-0"
            title="Justify"
          >
            <AlignJustify className="w-4 h-4 text-foreground" />
          </button>
          
          
          <div className="w-px h-5 bg-muted mx-1 flex-shrink-0" />
          
          <button 
            onClick={insertLink}
            className="p-1.5 hover:bg-muted rounded transition-colors flex-shrink-0"
            title="Insert Link"
          >
            <Link2 className="w-4 h-4 text-foreground" />
          </button>
          <button 
            onClick={insertImage}
            className="p-1.5 hover:bg-muted rounded transition-colors flex-shrink-0"
            title="Insert Image"
          >
            <ImageIcon className="w-4 h-4 text-foreground" />
          </button>
          
          <span className="ml-auto text-xs text-muted-foreground font-medium flex-shrink-0">HTML</span>
        </div>
        
        {/* Rich Text Editor Area - Flexible Height */}
        <div className="border border-border rounded-lg bg-card flex-1 flex flex-col overflow-hidden max-h-[calc(100vh-21rem)] relative">
          <div 
            ref={editorRef}
            contentEditable
            className="flex-1 outline-none text-foreground leading-relaxed p-4 overflow-y-auto min-h-0"
            suppressContentEditableWarning={true}
            onInput={(e) => {
              setEmailContent(e.currentTarget.innerHTML);
            }}
          />
          {/* Placeholder overlay */}
          {(!emailContent || emailContent.trim() === '') && (
            <div className="absolute top-4 left-4 text-muted-foreground pointer-events-none">
              Compose your email here or use a template to get started...
            </div>
          )}
          
          {/* Attached Files Display - Bottom Left */}
          {attachedFiles.length > 0 && (
            <div className="absolute bottom-4 left-4 max-w-md">
              <div className="text-xs text-muted-foreground mb-2">{attachedFiles.length} attachment{attachedFiles.length > 1 ? 's' : ''}</div>
              <div className="flex flex-wrap gap-2">
                {attachedFiles.map((file) => (
                  <div key={file.id} className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2 border border-border min-w-0">
                    <div className="flex-shrink-0">
                      {file.type.startsWith('image/') ? (
                        <div className="w-8 h-8 bg-orange-100 rounded flex items-center justify-center">
                          <ImageIcon className="w-4 h-4 text-orange-600" />
                        </div>
                      ) : file.type === 'application/pdf' ? (
                        <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center">
                          <FileText className="w-4 h-4 text-red-600" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                          <FileText className="w-4 h-4 text-blue-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">{file.name}</div>
                      <div className="text-xs text-muted-foreground">{formatFileSize(file.size)}</div>
                    </div>
                    <button 
                      onClick={() => removeFile(file.id)}
                      className="flex-shrink-0 text-muted-foreground hover:text-foreground p-1"
                      title="Remove file"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Footer Actions */}
        <div className="flex justify-between items-center mt-4 flex-shrink-0">
          <div className="flex gap-2">
            <div className="relative group">
              <button 
                className="bg-muted hover:bg-muted rounded-lg p-2 transition-colors"
                title="Attach file"
                onClick={triggerFileUpload}
              >
                <Paperclip className="w-5 h-5 text-foreground" />
              </button>
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-foreground text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Attach file
              </div>
            </div>
            <div className="relative group">
              <button 
                className="bg-muted hover:bg-muted rounded-lg p-2 transition-colors"
                title="Use template"
                onClick={() => setTemplateDialogOpen(true)}
              >
                <FileText className="w-5 h-5 text-foreground" />
              </button>
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-foreground text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Use template
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              className="bg-foreground text-white rounded-lg px-6 py-2 text-sm font-medium flex items-center gap-2 hover:bg-foreground transition"
              onClick={sendEmail}
            >
              <Send className="w-4 h-4" /> Send
            </button>
          </div>
        </div>
        <input 
          type="file" 
          multiple 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
          className="hidden" 
        />
      </div>
    </div>
    </>
  );
}