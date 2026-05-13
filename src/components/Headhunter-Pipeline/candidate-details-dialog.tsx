import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { HeadhunterCandidate } from "./headhunter-candidates-table";
import { ScrollArea } from "@/components/ui/scroll-area";
// removed inline editors; editing occurs via EditFieldDialog
import { DeleteConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { headhunterCandidatesService } from "@/services/headhunterCandidatesService";
import { toast } from "sonner";
import { EditFieldDialog } from "@/components/jobs/summary/edit-field-dialog";
import { ResumeUploadDialog } from "@/components/Headhunter-Pipeline/resume-upload-dialog";

interface CandidateDetailsDialogProps {
    candidate: HeadhunterCandidate | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const CandidateDetailsDialog: React.FC<CandidateDetailsDialogProps> = ({
    candidate,
    open,
    onOpenChange,
}) => {
    const [localCandidate, setLocalCandidate] = React.useState<HeadhunterCandidate | null>(candidate);
    const [pendingField, setPendingField] = React.useState<string | null>(null);
    const [editedValue, setEditedValue] = React.useState<string>("");
    const [confirmOpen, setConfirmOpen] = React.useState(false);
    const [editDialogOpen, setEditDialogOpen] = React.useState(false);
    const [pendingFieldLabel, setPendingFieldLabel] = React.useState<string>("");
    const [resumeDialogOpen, setResumeDialogOpen] = React.useState(false);
    const [selectedResumeFile, setSelectedResumeFile] = React.useState<File | null>(null);

const [submissionJobs, setSubmissionJobs] = React.useState<any[]>([]);
    const [loadingJobs, setLoadingJobs] = React.useState(false);

    React.useEffect(() => {
        setLocalCandidate(candidate);
        setEditedValue("");
        setPendingField(null);
        setEditDialogOpen(false);

        if (candidate?.id && open) {
            setLoadingJobs(true);
            headhunterCandidatesService.getCandidateSubmissionJobs(candidate.id)
                .then(jobs => setSubmissionJobs(jobs))
                .finally(() => setLoadingJobs(false));
        } else {
            setSubmissionJobs([]);
        }
    }, [candidate, open]);

    if (!localCandidate) return null;

    const DetailItem = ({ label, fieldKey, value, isLink = false, fullWidth = false }: { label: string; fieldKey: string; value: string | undefined | number; isLink?: boolean; fullWidth?: boolean }) => (
        <div className={`flex items-center justify-between p-3 border border-border rounded-lg bg-muted/50 ${fullWidth ? 'col-span-2' : 'col-span-1'}`}>
            <div className="flex flex-col gap-1 overflow-hidden">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
                {isLink && typeof value === 'string' ? (
                    <a href={value} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-600 hover:underline truncate">
                        View Resume
                    </a>
                ) : (
                    <span className="text-sm font-medium text-foreground truncate block" title={typeof value === 'string' ? value : undefined}>
                        {value || "N/A"}
                    </span>
                )}
            </div>
            <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 transition-colors flex-shrink-0 ml-2"
                onClick={() => {
                    setPendingField(fieldKey);
                    setPendingFieldLabel(label);
                    const currentValue = (localCandidate as any)[fieldKey];
                    const currentAsString = Array.isArray(currentValue) ? currentValue.join(', ') : (currentValue ?? '');
                    setEditedValue(String(currentAsString));
                    if (fieldKey === 'resumeUrl') {
                        setResumeDialogOpen(true);
                    } else {
                        setEditDialogOpen(true);
                    }
                }}
            >
                <Pencil className="h-3 w-3" />
            </Button>
        </div>
    );

    const formatDate = (dateString?: string) => {
        if (!dateString) return undefined;
        return new Date(dateString).toLocaleDateString();
    };

    const formatArray = (arr?: string[]) => {
        if (!arr || arr.length === 0) return undefined;
        return arr.join(", ");
    };

    return (
        <>
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[750px] bg-card p-0 overflow-hidden gap-0 max-h-[90vh] flex flex-col">
                <DialogHeader className="px-6 py-4 border-b border-border bg-muted/50 flex-shrink-0">
                    <DialogTitle className="text-lg font-semibold text-foreground">Candidate Details & Submissions</DialogTitle>
                </DialogHeader>

                <ScrollArea className="flex-1 overflow-y-auto">
                    <div className="p-6 space-y-6">
                        <section>
                            <h3 className="text-sm font-semibold text-foreground mb-4 px-1">Basic Information</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <DetailItem label="Name" fieldKey="name" value={localCandidate.name} />
                                <DetailItem label="Email" fieldKey="email" value={localCandidate.email} />
                                <DetailItem label="Phone" fieldKey="phone" value={localCandidate.phone} />
                                <DetailItem label="Status" fieldKey="status" value={localCandidate.status} />
                            </div>
                        </section>

                        <section>
                            <h3 className="text-sm font-semibold text-foreground mb-4 px-1">Professional Details</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <DetailItem label="Total Experience" fieldKey="experience" value={localCandidate.experience} />
                                <DetailItem label="Current Job Title" fieldKey="currentJobTitle" value={(localCandidate as any).currentJobTitle} />
                                <DetailItem label="Expected Salary" fieldKey="expectedSalary" value={localCandidate.expectedSalary ? `${localCandidate.expectedSalary} ${(localCandidate as any).expectedSalaryCurrency || ""}` : "N/A"} />
                                <DetailItem label="Resume" fieldKey="resumeUrl" value={localCandidate.resumeUrl} isLink={true} />
                                <DetailItem label="Skills" fieldKey="skills" value={formatArray((localCandidate as any).skills)} fullWidth />
                            </div>
                        </section>

                        <section>
                            <h3 className="text-sm font-semibold text-foreground mb-4 px-1">Submission History</h3>
                            <div className="border rounded-lg overflow-hidden">
                                {loadingJobs ? (
                                    <div className="p-4 text-center text-sm text-muted-foreground font-medium">Loading submissions...</div>
                                ) : submissionJobs.length === 0 ? (
                                    <div className="p-4 text-center text-sm text-muted-foreground font-medium">No job submissions found</div>
                                ) : (
                                    <table className="w-full text-sm">
                                        <thead className="bg-muted border-b">
                                            <tr>
                                                <th className="px-4 py-2 text-left font-medium text-muted-foreground">Job Title</th>
                                                <th className="px-4 py-2 text-left font-medium text-muted-foreground">Status</th>
                                                <th className="px-4 py-2 text-left font-medium text-muted-foreground">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {submissionJobs.map((sub, idx) => (
                                                <tr key={idx}>
                                                    <td className="px-4 py-2">{sub.jobTitle}</td>
                                                    <td className="px-4 py-2">
                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                            sub.submissionStatus === 'ACCEPTED' ? 'bg-green-100 text-green-700' :
                                                            sub.submissionStatus === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                                            'bg-amber-100 text-amber-700'
                                                        }`}>
                                                            {sub.submissionStatus}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-2 text-muted-foreground">{formatDate(sub.submittedAt)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </section>
                    </div>
                </ScrollArea>

                <div className="bg-muted px-6 py-4 flex justify-end border-t border-border flex-shrink-0">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
                </div>
            </DialogContent>
        </Dialog>
        <EditFieldDialog
            open={editDialogOpen}
            onClose={() => setEditDialogOpen(false)}
            fieldName={pendingFieldLabel}
            currentValue={editedValue}
            onSave={(val) => {
                setEditedValue(val);
                setEditDialogOpen(false);
                setConfirmOpen(true);
            }}
            isDate={pendingField === 'dateOfBirth'}
            isTextArea={pendingField === 'description'}
        />
        <ResumeUploadDialog
            open={resumeDialogOpen}
            onClose={() => setResumeDialogOpen(false)}
            candidateName={localCandidate?.name}
            onSelect={(file) => {
                setSelectedResumeFile(file);
                setResumeDialogOpen(false);
                setConfirmOpen(true);
            }}
        />
        <DeleteConfirmationDialog
            isOpen={confirmOpen}
            onClose={() => { setConfirmOpen(false); setPendingField(null); }}
            onConfirm={() => {
                if (pendingField) {
                    setConfirmOpen(false);
                    const doUpdate = async () => {
                      try {
                        let nextVal: any = editedValue;
                        if (pendingField === 'softSkill' || pendingField === 'technicalSkill') {
                          const arr = editedValue.split(',').map((s) => s.trim()).filter(Boolean);
                          nextVal = arr;
                          const payload: Record<string, any> = { [pendingField]: arr };
                          await headhunterCandidatesService.updateCandidate(localCandidate.id, payload);
                        } else if (pendingField === 'resumeUrl' && selectedResumeFile) {
                          const form = new FormData();
                          form.append('resume', selectedResumeFile);
                          await headhunterCandidatesService.updateCandidate(localCandidate.id, form);
                          nextVal = localCandidate.resumeUrl; // keep existing until backend returns URL
                        } else {
                          const payload: Record<string, any> = { [pendingField]: editedValue };
                          await headhunterCandidatesService.updateCandidate(localCandidate.id, payload);
                        }
                        setLocalCandidate({ ...localCandidate, [pendingField]: nextVal } as any);
                        setEditedValue('');
                        setPendingField(null);
                        setSelectedResumeFile(null);
                        toast.success(`${pendingFieldLabel} updated`);
                      } catch (err) {
                        toast.error(`Failed to update ${pendingFieldLabel}`);
                      }
                    };
                    void doUpdate();
                }
            }}
            title="Confirm Edit"
            description="Do you want to save the changes?"
            confirmText="Save"
            cancelText="Cancel"
        />
        </>
    );
};
