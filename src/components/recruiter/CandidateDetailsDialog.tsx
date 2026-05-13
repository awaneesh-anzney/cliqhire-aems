import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { RecruiterCandidate } from "./types"
import { Mail, Phone, FileText, XCircle, Calendar, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

interface CandidateDetailsDialogProps {
    candidate: RecruiterCandidate | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function CandidateDetailsDialog({
    candidate,
    open,
    onOpenChange,
}: CandidateDetailsDialogProps) {
    if (!candidate) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange} modal={true}>
            <DialogContent className="sm:max-w-[600px] h-[500px] flex flex-col p-0 gap-0">
                <DialogHeader className="px-6 py-4 border-b">
                    <DialogTitle className="text-xl flex items-center gap-2">
                        <User className="h-5 w-5 text-muted-foreground" />
                        {candidate.name}
                    </DialogTitle>
                </DialogHeader>

                <ScrollArea className="flex-1 p-6">
                    <div className="space-y-6">
                        {/* Contact Information */}
                        <div className="grid gap-4">
                            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                                Contact Information
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-3 p-3 rounded-lg border bg-card text-card-foreground shadow-sm">
                                    <div className="p-2 bg-primary/10 rounded-full">
                                        <Mail className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs text-muted-foreground">Email</span>
                                        <span className="text-sm font-medium truncate" title={candidate.email}>
                                            {candidate.email || "—"}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-lg border bg-card text-card-foreground shadow-sm">
                                    <div className="p-2 bg-primary/10 rounded-full">
                                        <Phone className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs text-muted-foreground">Phone</span>
                                        <span className="text-sm font-medium">
                                            {candidate.phone || "—"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Status & Resume */}
                        <div className="grid gap-4">
                            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                                Application Details
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <span className="text-sm text-muted-foreground">Current Status</span>
                                    <div>
                                        <Badge
                                            variant={
                                                candidate.status?.toLowerCase() === 'accepted' ? 'default' :
                                                    candidate.status?.toLowerCase() === 'rejected' ? 'destructive' :
                                                        'secondary'
                                            }
                                            className="capitalize"
                                        >
                                            {candidate.status || "Pending"}
                                        </Badge>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <span className="text-sm text-muted-foreground">Resume</span>
                                    <div>
                                        {candidate.resume ? (
                                            <a
                                                href={candidate.resume}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
                                            >
                                                <FileText className="h-4 w-4" />
                                                View Resume
                                            </a>
                                        ) : (
                                            <span className="text-sm text-muted-foreground italic">No resume attached</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Rejection Details - Only show if rejected */}
                        {(candidate.status?.toLowerCase() === 'rejected' || candidate.rejectionReason) && (
                            <>
                                <Separator />
                                <div className="grid gap-4">
                                    <h3 className="font-semibold text-sm text-red-500 uppercase tracking-wider flex items-center gap-2">
                                        <XCircle className="h-4 w-4" />
                                        Rejection Details
                                    </h3>
                                    <div className="grid gap-4 rounded-lg border border-red-100 bg-red-50/50 p-4">
                                        {candidate.rejectedDate && (
                                            <div className="flex items-center gap-2 text-sm">
                                                <Calendar className="h-4 w-4 text-red-500" />
                                                <span className="text-muted-foreground">Date:</span>
                                                <span className="font-medium">{candidate.rejectedDate}</span>
                                            </div>
                                        )}
                                        {candidate.rejectionReason && (
                                            <div className="space-y-1">
                                                <span className="text-sm text-muted-foreground">Reason:</span>
                                                <p className="text-sm font-medium text-foreground">
                                                    {candidate.rejectionReason}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}
