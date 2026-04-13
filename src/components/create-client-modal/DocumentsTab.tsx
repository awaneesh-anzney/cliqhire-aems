import { useRef, useState } from "react";
import { toast } from "sonner";
import type { ClientForm } from "@/components/create-client-modal/create-client-modal";

const DOC_FIELDS = [
  {
    key:    "profileImage"   as const,
    label:  "Profile image",
    sub:    "Company logo or photo",
    accept: "image/jpeg,image/png",
    hint:   "JPEG · PNG · max 5MB",
  },
  {
    key:    "crCopy"         as const,
    label:  "CR copy",
    sub:    "Commercial registration",
    accept: ".pdf,image/jpeg,image/png",
    hint:   "PDF · JPEG · PNG · max 5MB",
  },
  {
    key:    "vatCopy"        as const,
    label:  "VAT copy",
    sub:    "VAT registration certificate",
    accept: ".pdf,image/jpeg,image/png",
    hint:   "PDF · JPEG · PNG · max 5MB",
  },
  {
    key:    "gstTinDocument" as const,
    label:  "GST / TIN document",
    sub:    "Tax identification document",
    accept: ".pdf,image/jpeg,image/png",
    hint:   "PDF · JPEG · PNG · max 5MB",
  },
] as const;

type FileKey = "profileImage" | "crCopy" | "vatCopy" | "gstTinDocument";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
const MAX_SIZE      = 5 * 1024 * 1024;

interface DocumentsTabProps {
  form:      ClientForm;
  setField:  <K extends keyof ClientForm>(key: K, value: ClientForm[K]) => void;
  onPreview: (file: File | null) => void;
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
      ? ["image/jpeg", "image/png", "image/jpg"]
      : ALLOWED_TYPES;

    if (!allowed.includes(file.type)) {
      toast.error(`Invalid file type for ${file.name}.`);
      return false;
    }
    return true;
  };

  const handleFile = (key: FileKey, file: File | null) => {
    if (!file) return;
    if (validate(file, key)) setField(key, file);
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
    <div className="p-1">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium mb-3">
        Documents
        <span className="normal-case tracking-normal ml-1 font-normal">
          — all optional, max 5MB each
        </span>
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {DOC_FIELDS.map(({ key, label, sub, accept, hint }) => {
          const file = form[key] as File | null;

          return (
            <div key={key} className="border border-border rounded-lg p-3 flex flex-col gap-2">
              <div>
                <p className="text-xs font-medium text-foreground">{label}</p>
                <p className="text-[11px] text-muted-foreground">{sub}</p>
              </div>

              {/* Drop zone */}
              <div
                onDragOver={e => { e.preventDefault(); setDragging(key); }}
                onDragLeave={() => setDragging(null)}
                onDrop={e => onDrop(key, e)}
                onClick={() => triggerBrowse(key)}
                className={`border border-dashed rounded-md p-3 text-center cursor-pointer transition-colors
                  ${dragging === key
                    ? "border-blue-500 bg-blue-50"
                    : "border-border hover:border-blue-400 bg-muted/40"
                  }`}
              >
                <p className="text-lg mb-1">{key === "profileImage" ? "🖼" : "📄"}</p>
                <p className="text-[11px] text-muted-foreground">Drop file here or click to browse</p>
                <p className="text-[10px] text-muted-foreground/60 mt-0.5">{hint}</p>
              </div>

              {/* Buttons */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => triggerBrowse(key)}
                  className="flex-1 h-7 text-[11px] border border-border rounded-md hover:bg-muted flex items-center justify-center gap-1"
                >
                  📁 Browse
                </button>
                <button
                  type="button"
                  onClick={() => triggerCamera(key)}
                  className="flex-1 h-7 text-[11px] border border-border rounded-md hover:bg-muted flex items-center justify-center gap-1"
                >
                  📷 Camera
                </button>
              </div>

              {/* File pill */}
              {file && (
                <div className="flex items-center gap-2 bg-muted rounded-md px-2 py-1">
                  <span className="text-[11px] flex-1 truncate text-foreground">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => onPreview(file)}
                    className="text-[10px] text-blue-500 hover:underline"
                  >
                    Preview
                  </button>
                  <button
                    type="button"
                    onClick={() => setField(key, null)}
                    className="w-4 h-4 rounded-full bg-muted-foreground/20 text-[10px] flex items-center justify-center hover:bg-muted-foreground/40"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Hidden input */}
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