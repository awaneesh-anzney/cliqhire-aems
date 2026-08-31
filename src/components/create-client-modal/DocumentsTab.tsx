import { useRef, useState } from "react";
import { toast } from "sonner";
import type { ClientForm } from "@/components/create-client-modal/create-client-modal";
import { Button } from "@/components/ui/button";
import { 
  UploadCloud, 
  FileText, 
  Image as ImageIcon, 
  Camera, 
  FolderOpen, 
  Eye, 
  Trash2, 
  CheckCircle2, 
  ShieldCheck, 
  Receipt, 
  FileCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

const DOC_FIELDS = [
  {
    key:    "profileImage"   as const,
    label:  "Profile Image / Logo",
    sub:    "Company official brand mark or avatar",
    accept: "image/jpeg,image/png,image/webp",
    hint:   "PNG, JPEG, WEBP · Max 5MB",
    icon:   ImageIcon,
  },
  {
    key:    "crCopy"         as const,
    label:  "Commercial Registration (CR)",
    sub:    "Valid CR certificate / license copy",
    accept: ".pdf,image/jpeg,image/png",
    hint:   "PDF, JPEG, PNG · Max 5MB",
    icon:   ShieldCheck,
  },
  {
    key:    "vatCopy"        as const,
    label:  "VAT Registration Copy",
    sub:    "Official VAT registration certificate",
    accept: ".pdf,image/jpeg,image/png",
    hint:   "PDF, JPEG, PNG · Max 5MB",
    icon:   Receipt,
  },
  {
    key:    "gstTinDocument" as const,
    label:  "GST / TIN Identification",
    sub:    "Tax ID or relevant compliance document",
    accept: ".pdf,image/jpeg,image/png",
    hint:   "PDF, JPEG, PNG · Max 5MB",
    icon:   FileCheck,
  },
] as const;

type FileKey = "profileImage" | "crCopy" | "vatCopy" | "gstTinDocument";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/jpg", "image/webp", "application/pdf"];
const MAX_SIZE      = 5 * 1024 * 1024;

interface DocumentsTabProps {
  form:      ClientForm;
  setField:  <K extends keyof ClientForm>(key: K, value: ClientForm[K]) => void;
  onPreview: (file: File | null) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentsTab({ form, setField, onPreview }: DocumentsTabProps) {
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [dragging, setDragging] = useState<FileKey | null>(null);

  const validate = (file: File, key: FileKey): boolean => {
    if (file.size > MAX_SIZE) {
      toast.error(`${file.name} exceeds 5MB limit.`);
      return false;
    }
    const allowed = key === "profileImage"
      ? ["image/jpeg", "image/png", "image/jpg", "image/webp"]
      : ALLOWED_TYPES;

    if (!allowed.includes(file.type)) {
      toast.error(`Invalid file type for ${file.name}. Allowed: ${key === "profileImage" ? "Images" : "PDF/Images"}`);
      return false;
    }
    return true;
  };

  const handleFile = (key: FileKey, file: File | null) => {
    if (!file) return;
    if (validate(file, key)) {
      setField(key, file);
      toast.success(`Attached ${file.name}`);
    }
  };

  const triggerBrowse = (key: FileKey) => inputRefs.current[key]?.click();

  const triggerCamera = (key: FileKey) => {
    const input = inputRefs.current[key];
    if (!input) return;
    input.setAttribute("capture", "environment");
    input.click();
    setTimeout(() => input.removeAttribute("capture"), 500);
  };

  const onDrop = (key: FileKey, e: React.DragEvent) => {
    e.preventDefault();
    setDragging(null);
    const file = e.dataTransfer.files?.[0] ?? null;
    handleFile(key, file);
  };

  return (
    <div className="space-y-4 pb-2">
      <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/70">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold text-foreground">Compliance & Verification Documents</span>
        </div>
        <span className="text-[11px] text-muted-foreground font-medium">All uploads optional · Max 5MB</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {DOC_FIELDS.map(({ key, label, sub, accept, hint, icon: IconComponent }) => {
          const file = form[key] as File | null;
          const isDragOver = dragging === key;

          return (
            <div 
              key={key} 
              className={cn(
                "rounded-2xl border transition-all duration-200 p-4 flex flex-col justify-between gap-3 bg-muted/20 dark:bg-muted/10",
                file ? "border-primary/40 bg-primary/5 dark:bg-primary/10" : "border-border/80 hover:border-primary/30"
              )}
            >
              {/* Header Title */}
              <div className="flex items-start gap-2.5">
                <div className={cn(
                  "p-2 rounded-xl shrink-0 transition-colors",
                  file ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                )}>
                  <IconComponent className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-foreground truncate">{label}</p>
                    {file && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                        <CheckCircle2 className="w-3 h-3" /> Attached
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate">{sub}</p>
                </div>
              </div>

              {/* Upload Drop Zone / Uploaded File Status */}
              {!file ? (
                <div
                  onDragOver={e => { e.preventDefault(); setDragging(key); }}
                  onDragLeave={() => setDragging(null)}
                  onDrop={e => onDrop(key, e)}
                  onClick={() => triggerBrowse(key)}
                  className={cn(
                    "border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-1.5",
                    isDragOver
                      ? "border-primary bg-primary/10 scale-[0.99]"
                      : "border-border/80 hover:border-primary/50 bg-background hover:bg-background/80"
                  )}
                >
                  <div className="p-2 rounded-full bg-muted/50 text-muted-foreground">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-semibold text-foreground">
                    Drop file here, or <span className="text-primary underline">browse</span>
                  </p>
                  <p className="text-[10px] text-muted-foreground">{hint}</p>
                </div>
              ) : (
                <div className="rounded-xl border border-border/80 bg-background p-3 flex items-center justify-between gap-2 shadow-xs">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-foreground truncate">{file.name}</p>
                    <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
                      {formatFileSize(file.size)}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      type="button"
                      onClick={() => onPreview(file)}
                      className="h-8 px-2 text-xs font-bold text-primary hover:text-primary hover:bg-primary/10 rounded-lg"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" /> Preview
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      type="button"
                      onClick={() => setField(key, null)}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => triggerBrowse(key)}
                  className="flex-1 h-8 rounded-lg text-xs font-semibold border-border/80 hover:bg-background"
                >
                  <FolderOpen className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
                  {file ? "Change" : "Browse"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => triggerCamera(key)}
                  className="h-8 px-3 rounded-lg text-xs font-semibold border-border/80 hover:bg-background"
                  title="Capture with camera"
                >
                  <Camera className="w-3.5 h-3.5 text-muted-foreground" />
                </Button>
              </div>

              {/* Hidden file input */}
              <input
                ref={el => { inputRefs.current[key] = el; }}
                type="file"
                accept={accept}
                className="hidden"
                onChange={e => handleFile(key, e.target.files?.[0] ?? null)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}