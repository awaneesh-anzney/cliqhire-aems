import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"

interface CreateCandidateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export function CreateCandidateDialog({ open, onOpenChange, children }: CreateCandidateDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden border-none shadow-2xl rounded-2xl">
        {children}
      </DialogContent>
    </Dialog>
  )
}
