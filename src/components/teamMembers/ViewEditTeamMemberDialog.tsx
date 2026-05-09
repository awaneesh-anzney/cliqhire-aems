"use client";

import React, { useEffect, useState } from "react";
import { TeamMember, TeamMemberStatus } from "@/types/teamMember";
import { updateTeamMember, uploadResume } from "@/services/teamMembersService";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { UserCog, Pencil, Check, Upload, Link as LinkIcon } from "lucide-react";
import { ConfirmFieldUpdateDialog } from "@/components/ui/ConfirmFieldUpdateDialog";
import { EditResumeDialog } from "@/components/teamMembers/EditResumeDialog";
import { EditSpecializationDialog } from "@/components/teamMembers/EditSpecializationDialog";
import { EditSkillsDialog } from "@/components/teamMembers/EditSkillsDialog";
import { CountrySelect } from "@/components/ui/country-select";
import { toast } from "sonner";


interface ViewEditTeamMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamMember: TeamMember | null;
  onUpdated?: (updated: TeamMember) => void;
}

type EditableForm = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  experience: string;
  status: TeamMemberStatus;
  department?: string;
  teamRole?: string;
};

export function ViewEditTeamMemberDialog({ open, onOpenChange, teamMember, onUpdated }: ViewEditTeamMemberDialogProps) {
  const [form, setForm] = useState<EditableForm>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    location: "",
    experience: "",
    status: "Active",
    department: "",
    teamRole: "",
  });
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Record<string, boolean>>({});
  const [uploadingResume, setUploadingResume] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [initialForm, setInitialForm] = useState<EditableForm | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    fieldName: string;
    fieldKey: keyof EditableForm;
    oldValue: string | string[];
    newValue: string | string[];
  }>({
    open: false,
    fieldName: "",
    fieldKey: "firstName",
    oldValue: "",
    newValue: "",
  });
  const [editResumeDialogOpen, setEditResumeDialogOpen] = useState(false);
  const [editSpecializationDialogOpen, setEditSpecializationDialogOpen] = useState(false);
  const [editSkillsDialogOpen, setEditSkillsDialogOpen] = useState(false);

  useEffect(() => {
    if (open && teamMember) {
      const next: EditableForm = {
        firstName: teamMember.firstName || "",
        lastName: teamMember.lastName || "",
        email: teamMember.email || "",
        phone: teamMember.phone || "",
        location: teamMember.location || "",
        experience: teamMember.experience || "",
        status: teamMember.status || "Active",
        department: teamMember.department || "",
        teamRole: teamMember.teamRole || "",
      };
      setForm(next);
      setInitialForm(next);
      setEditing({});
    }
  }, [open, teamMember]);

  const handleChange = (key: keyof EditableForm, value: string | string[]) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const toggleEdit = (key: keyof EditableForm, toState?: boolean) => {
    const newState = typeof toState === 'boolean' ? toState : !editing[key];

    if (editing[key] && !newState) {
      // User is clicking the check mark to save changes
      const oldValue = initialForm?.[key] ?? (Array.isArray(form[key]) ? [] : "");
      const newValue = form[key] as string | string[];

      // Check if there are actual changes
      const hasChanges = JSON.stringify(oldValue) !== JSON.stringify(newValue);

      if (hasChanges) {
        setConfirmDialog({
          open: true,
          fieldName: getFieldLabel(key),
          fieldKey: key,
          oldValue,
          newValue,
        });
        return;
      }
    }

    setEditing(prev => ({ ...prev, [key]: newState }));
  };

  const getFieldLabel = (key: keyof EditableForm): string => {
    const labels: Record<keyof EditableForm, string> = {
      firstName: "First Name",
      lastName: "Last Name",
      email: "Email",
      phone: "Phone",
      location: "Location",
      experience: "Experience",
      status: "Status",
      department: "Department",
      teamRole: "Team Role",
    };
    return labels[key];
  };







  const handleConfirmUpdate = async () => {
    if (!teamMember?._id) return;

    try {
      setSaving(true);

      let updated: TeamMember;

      // Prepare the payload with only the field being updated
      const payload = {
        _id: teamMember._id,
        [confirmDialog.fieldKey]: confirmDialog.newValue,
      };

      updated = await updateTeamMember(payload);

      // Update the form and initial form with the new value
      setForm(prev => ({ ...prev, [confirmDialog.fieldKey]: confirmDialog.newValue }));
      setInitialForm(prev => prev ? { ...prev, [confirmDialog.fieldKey]: confirmDialog.newValue } : null);

      // Call the onUpdated callback
      onUpdated?.(updated);

      // Show success toast immediately
      toast.success(`${confirmDialog.fieldName} updated successfully`);

      // Close the confirmation dialog and stop editing
      setConfirmDialog(prev => ({ ...prev, open: false }));
      setEditing(prev => ({ ...prev, [confirmDialog.fieldKey]: false }));
    } catch (error: any) {
      console.error('Error updating team member:', error);

      // Show error toast with specific message
      const errorMessage = error instanceof Error ? error.message : 'Failed to update team member';
      toast.error(errorMessage);

      // Reset the form value to the original value on error
      setForm(prev => ({ ...prev, [confirmDialog.fieldKey]: confirmDialog.oldValue }));

      // Close the confirmation dialog on error as well
      setConfirmDialog(prev => ({ ...prev, open: false }));
      setEditing(prev => ({ ...prev, [confirmDialog.fieldKey]: false }));
    } finally {
      setSaving(false);
    }
  };

  const handleCancelUpdate = () => {
    // Reset the form value to the original value
    setForm(prev => ({ ...prev, [confirmDialog.fieldKey]: confirmDialog.oldValue }));

    // Close the confirmation dialog and stop editing
    setConfirmDialog(prev => ({ ...prev, open: false }));
    setEditing(prev => ({ ...prev, [confirmDialog.fieldKey]: false }));
  };

  const renderField = (key: keyof EditableForm, label: string, value: any, type: 'text' | 'select' = 'text', options?: { value: string; label: string }[]) => {
    const isEditing = editing[key];

    return (
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-2 flex-1">
          <span className="text-sm font-medium text-muted-foreground min-w-0">{label}:</span>
          {isEditing ? (
            <div className="flex-1">
              {type === 'text' && (
                key === 'location' ? (
                  <CountrySelect
                    value={value || ""}
                    onChange={(val: string) => handleChange(key, val)}
                    type="country"
                    placeholder="Search location..."
                  />
                ) : (
                  <Input
                    value={value || ""}
                    onChange={e => handleChange(key, e.target.value)}
                    className="h-8"
                  />
                )
              )}
              {type === 'select' && options && (
                <Select value={value || ""} onValueChange={value => handleChange(key, value)}>
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {options.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          ) : (
            <div className="flex-1 border-b border-border pb-1">
              <span className="text-sm text-black break-words">
                {value || "—"}
              </span>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => toggleEdit(key)}
          className="ml-2 h-8 w-8 p-0"
        >
          {isEditing ? <Check className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
        </Button>
      </div>
    );
  };

  if (!teamMember) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={teamMember?.avatar || ""} alt={teamMember?.firstName + " " + teamMember?.lastName || "User"} />
                <AvatarFallback>{(teamMember?.firstName || "").substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="flex items-center gap-2">
                  <UserCog className="h-5 w-5" />
                  {teamMember?.firstName + " " + teamMember?.lastName}
                </DialogTitle>
                <DialogDescription className="flex items-center gap-2">
                  {teamMember?.email && (
                    <a href={`mailto:${teamMember.email}`} className="hover:underline">{teamMember.email}</a>
                  )}
                  {form.teamRole && (
                    <Badge variant="secondary" className="text-xs">{form.teamRole}</Badge>
                  )}
                  <Badge className="text-xs" variant={form.status === 'Active' ? 'default' : 'outline'}>
                    {form.status}
                  </Badge>
                </DialogDescription>
              </div>
            </div>

          </div>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto pr-1">
          {/* Row 1: Name, Email, Phone */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            {renderField("firstName", "First Name", form.firstName)}
            {renderField("lastName", "Last Name", form.lastName)}
            {renderField("email", "Email", form.email)}
            {renderField("phone", "Phone", form.phone)}
          </div>

          {/* Row 2: Location, Experience, Status */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            {renderField("location", "Location", form.location)}
            {renderField("experience", "Experience", form.experience)}
            {renderField("status", "Status", form.status, "select", [
              { value: "Active", label: "Active" },
              { value: "Inactive", label: "Inactive" },
              { value: "On Leave", label: "On Leave" },
              { value: "Terminated", label: "Terminated" }
            ])}
          </div>

          {/* Row 3: Team Role, Department, Resume */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            {renderField("teamRole", "Team Role", form.teamRole, "select", [
              { value: "ADMIN", label: "ADMIN" },
              { value: "HIRING_MANAGER", label: "HIRING_MANAGER" },
              { value: "TEAM_LEAD", label: "TEAM_LEAD" },
              { value: "RECRUITER", label: "RECRUITER" },
              { value: "HEAD_HUNTER", label: "HEAD_HUNTER" }
            ])}
            {renderField("department", "Department", form.department, "select", [
              { value: "Technical Recruiting", label: "Technical Recruiting" },
              { value: "Executive Search", label: "Executive Search" },
              { value: "Talent Acquisition", label: "Talent Acquisition" },
              { value: "HR", label: "HR" },
              { value: "Sales", label: "Sales" },
              { value: "Marketing", label: "Marketing" },
              { value: "Operations", label: "Operations" }
            ])}
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2 flex-1">
                <span className="text-sm font-medium text-muted-foreground">Resume:</span>
                <div className="flex-1 border-b border-border pb-1">
                  <span className="text-sm text-black">
                    {teamMember?.resume ? (
                      <a
                        href={teamMember.resume}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                      >
                        <LinkIcon className="h-4 w-4" />
                        View Resume
                      </a>
                    ) : "—"}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditResumeDialogOpen(true)}
                className="ml-2 h-8 w-8 p-0"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Row 4: Specialization */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2 flex-1">
                <span className="text-sm font-medium text-muted-foreground">Specialization:</span>
                <div className="flex-1 border-b border-border pb-1">
                  <span className="text-sm text-black">
                    {teamMember?.specialization || "—"}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditSpecializationDialogOpen(true)}
                className="ml-2 h-8 w-8 p-0"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
            <div></div>
            <div></div>
          </div>

          {/* Row 5: Skills */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2 flex-1">
                <span className="text-sm font-medium text-muted-foreground">Skills:</span>
                <div className="flex-1 border-b border-border pb-1">
                  <span className="text-sm text-black">
                    {Array.isArray(teamMember?.skills) && teamMember.skills.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {teamMember.skills.filter(item => item.trim() !== "").map((item, idx) => (
                          <Badge key={`${item}-${idx}`} variant="secondary" className="text-xs">{item}</Badge>
                        ))}
                      </div>
                    ) : "—"}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditSkillsDialogOpen(true)}
                className="ml-2 h-8 w-8 p-0"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </div>
            <div></div>
            <div></div>
          </div>

          {/* Read-only fields */}
        </div>

        <ConfirmFieldUpdateDialog
          open={confirmDialog.open}
          onOpenChange={(open) => {
            if (!open) {
              // If dialog is being closed, also stop editing
              setEditing(prev => ({ ...prev, [confirmDialog.fieldKey]: false }));
            }
            setConfirmDialog(prev => ({ ...prev, open }));
          }}
          fieldName={confirmDialog.fieldName}
          oldValue={confirmDialog.oldValue}
          newValue={confirmDialog.newValue}
          onConfirm={handleConfirmUpdate}
          onCancel={handleCancelUpdate}
          isLoading={saving}
        />

        <EditResumeDialog
          open={editResumeDialogOpen}
          onOpenChange={setEditResumeDialogOpen}
          teamMember={teamMember}
          onUpdated={onUpdated}
        />

        <EditSpecializationDialog
          open={editSpecializationDialogOpen}
          onOpenChange={setEditSpecializationDialogOpen}
          teamMember={teamMember}
          onUpdated={onUpdated}
        />

        <EditSkillsDialog
          open={editSkillsDialogOpen}
          onOpenChange={setEditSkillsDialogOpen}
          teamMember={teamMember}
          onUpdated={onUpdated}
        />
      </DialogContent>
    </Dialog>
  );
}

export default ViewEditTeamMemberDialog;


