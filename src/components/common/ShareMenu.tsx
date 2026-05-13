import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Mail, MessageCircle } from "lucide-react";

interface ShareMenuProps {
  shareText: string;
}

export function ShareMenu({ shareText }: ShareMenuProps) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
  const emailUrl = `mailto:?subject=Job Description&body=${encodeURIComponent(shareText)}`;

  return (
    <div className="relative inline-block">
      <Button
        ref={buttonRef}
        variant="ghost"
        size="icon"
        className="ml-2"
        aria-label="Share"
        onClick={() => setOpen((prev) => !prev)}
      >
        <Share2 className="w-5 h-5" />
      </Button>
      {open && (
        <div className="absolute right-0 mt-2 bg-card border rounded shadow-lg min-w-[160px] z-50">
          <button
            className="flex items-center w-full px-4 py-2 text-sm hover:bg-muted"
            onClick={() => {
              window.open(whatsappUrl, "_blank");
              setOpen(false);
            }}
          >
            <MessageCircle className="w-4 h-4 mr-2 text-green-500" /> WhatsApp
          </button>
          <button
            className="flex items-center w-full px-4 py-2 text-sm hover:bg-muted"
            onClick={() => {
              window.open(emailUrl, "_blank");
              setOpen(false);
            }}
          >
            <Mail className="w-4 h-4 mr-2 text-blue-500" /> Email
          </button>
        </div>
      )}
    </div>
  );
} 