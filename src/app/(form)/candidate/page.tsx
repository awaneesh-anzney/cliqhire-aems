"use client";

import  React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { z } from "zod";
import { User, Mail, Phone, Globe, MapPin, Calendar, FileText, Badge as BadgeIcon, Upload } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { TagsInput } from "@/components/tags-input";
import { candidateService } from "@/services/candidateService";
import { SubmissionSuccessDialog } from "@/components/common/submission-success-dialog";
import PhoneInput from "@/components/phone/Phoneinput";

const Schema = z.object({
  name: z.string().min(1, "Name is required"),
  location: z.string().min(1, "Location is required"),
  skills: z.array(z.string()).default([]),
  // Resume must be provided: accept File or string but disallow empty at validation time
  resume: z
    .union([z.instanceof(File), z.string()])
    .refine(
      (val) => val instanceof File || (typeof val === "string" && val.trim().length > 0),
      { message: "Resume is required" }
    ),
  status: z.enum(["Active", "Inactive"]).default("Active"),
  gender: z.enum(["male", "female", "other"]).optional(),
  // Date of Birth required (non-empty string or Date)
  dateOfBirth: z.union([z.string().min(1, "Date of Birth is required"), z.date()]),
  country: z.string().optional(),
  nationality: z.string().optional(),
  willingToRelocate: z.enum(["yes", "no"]).optional(),
  description: z.string().optional(),
  phone: z.string().min(1, "Phone is required"),
  countryCode: z.string().default("SA"),
  email: z.string().min(1, "Email is required").email("Invalid email"),
  softSkill: z.array(z.string()).default([]),
  technicalSkill: z.array(z.string()).default([]),
});

type FormValues = z.infer<typeof Schema>;

const initialData: FormValues = {
  name: "",
  location: "",
  skills: [],
  resume: "",
  status: "Active",
  gender: undefined,
  dateOfBirth: "",
  country: "",
  nationality: "",
  willingToRelocate: undefined,
  description: "",
  phone: "",
  countryCode: "SA",
  email: "",
  softSkill: [],
  technicalSkill: [],
};

export default function ProtectedCandidateFormPage() {
  const searchParams = useSearchParams();
  const jobFromQuery = searchParams?.get("job") || "";
  const headingTitle = `${jobFromQuery ? jobFromQuery : "Candidate"} Form`;
  const [formData, setFormData] = useState<FormValues>(initialData);
  const [resumeName, setResumeName] = useState<string>("");
  const [dobOpen, setDobOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Initialize from localStorage so reloads show submitted message
  useEffect(() => {
    try {
      const submitted = typeof window !== "undefined" && localStorage.getItem("candidateFormSubmitted") === "true";
      if (submitted) {
        setFormSubmitted(true);
        setSuccessOpen(false);
      }
    } catch {}
  }, []);

  const toDateInputValue = (d?: string | Date) => {
    if (!d) return "";
    const dt = typeof d === "string" ? new Date(d) : d;
    if (isNaN(dt.getTime())) return "";
    return dt.toISOString().slice(0, 10);
  };

  const onSubmit = async () => {
    // Validate using Zod
    const parsed = Schema.safeParse(formData);
    if (!parsed.success) {
      const firstErr = parsed.error.issues[0];
      toast.error("Validation error", {
        description: (
          <span className="text-red-600 !opacity-100">
            {`${firstErr.path.join(".")}: ${firstErr.message}`}
          </span>
        ),
      });
      return;
    }

    const values = parsed.data;
    setSubmitting(true);
    try {
      // Normalize dateOfBirth
      let payload: any = { ...values };
      if (values.dateOfBirth) {
        const d = typeof values.dateOfBirth === "string" ? new Date(values.dateOfBirth) : values.dateOfBirth;
        if (!isNaN(d.getTime())) payload.dateOfBirth = d.toISOString();
      }

      // If resume is a File, send multipart/form-data
      let result;
      if (payload.resume && payload.resume instanceof File) {
        const fd = new FormData();
        // Append scalar/string fields
        Object.entries(payload).forEach(([key, val]) => {
          if (val === undefined || val === null) return;
          if (key === "resume" && val instanceof File) {
            fd.append("resume", val);
          } else if (Array.isArray(val)) {
            // append arrays as repeated fields
            val.forEach((v) => fd.append(key, String(v)));
          } else {
            fd.append(key, String(val));
          }
        });
        result = await candidateService.createCandidatePublic(fd);
      } else {
        // send JSON (exclude resume if empty string)
        if (payload.resume === "") delete payload.resume;
        result = await candidateService.createCandidatePublic(payload);
      }

      // Do not show a toast on successful submission (per requirement)
      setFormData(initialData);
      setResumeName("");
      // Immediately persist submission so refresh while dialog is open still shows the success message
      setFormSubmitted(true);
      try {
        if (typeof window !== "undefined") {
          localStorage.setItem("candidateFormSubmitted", "true");
        }
      } catch {}
      setSuccessOpen(true);
    } catch (err: any) {
      console.error("[CandidateForm] API error", err);
      const backendStatus = err?.response?.data?.status;
      const backendMessage: string | undefined = err?.response?.data?.message;
      const httpStatus: number | undefined = err?.response?.status;
      let displayMessage = err?.message || backendMessage || "Failed to submit candidate";

      // Map duplicate email/phone message to friendly text
      const dupMsgPattern = /same email or phone already exists|already exists/i;
      if (
        (backendStatus === "fail" || httpStatus === 409) &&
        (dupMsgPattern.test(backendMessage || "") || dupMsgPattern.test(displayMessage))
      ) {
        displayMessage = "Congratulations! You are already registered.";
      }

      toast.error(displayMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const { softSkill, technicalSkill, gender, willingToRelocate, } = formData;

  return (
    <div className="w-full bg-gradient-to-b from-purple-50 via-sky-50 to-emerald-50">
      <div className="container mx-auto max-w-5xl px-6">
        {formSubmitted ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <h2 className="text-3xl font-bold">Form Submitted Successfully!</h2>
            <p className="mt-2 text-muted-foreground">Thank you. We will be in touch with next steps.</p>
          </div>
        ) : (
          <Card className="border-primary/10">
            <CardHeader className="border-b items-center">
                
                  <CardTitle className="text-2xl">{headingTitle}</CardTitle>
                  <CardDescription >Manage candidate profile details</CardDescription>
            
            </CardHeader>
            <CardContent>
              <div className="space-y-10">
              <div>
                <h4 className="text-sm font-medium text-neutral-500 mb-3">Personal Information</h4>
                <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center gap-2"><User className="h-4 w-4" /> Full Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="name"
                      placeholder="Enter full name"
                      value={formData.name || ""}
                      onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2"><Mail className="h-4 w-4" /> Email <span className="text-red-500">*</span></Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={formData.email || ""}
                      onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2"><Phone className="h-4 w-4" /> Phone <span className="text-red-500">*</span></Label>
                    <PhoneInput
                      countryCode={formData.countryCode}
                      onCountryCodeChange={(val) => setFormData((p) => ({ ...p, countryCode: val }))}
                      phoneNumber={formData.phone}
                      onPhoneNumberChange={(val) => setFormData((p) => ({ ...p, phone: val || "" }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location" className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Location <span className="text-red-500">*</span></Label>
                    <Input
                      id="location"
                      placeholder="City, State"
                      value={formData.location || ""}
                      onChange={(e) => setFormData((p) => ({ ...p, location: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country" className="flex items-center gap-2"><Globe className="h-4 w-4" /> Country</Label>
                    <Input
                      id="country"
                      placeholder="Country"
                      value={formData.country || ""}
                      onChange={(e) => setFormData((p) => ({ ...p, country: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nationality" className="flex items-center gap-2"><BadgeIcon className="h-4 w-4" /> Nationality</Label>
                    <Input
                      id="nationality"
                      placeholder="Nationality"
                      value={formData.nationality || ""}
                      onChange={(e) => setFormData((p) => ({ ...p, nationality: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth" className="flex items-center gap-2"><Calendar className="h-4 w-4" /> Date of Birth <span className="text-red-500">*</span></Label>
                    <Popover open={dobOpen} onOpenChange={setDobOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          id="dateOfBirth"
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          {(() => {
                            const d = typeof formData.dateOfBirth === "string"
                              ? new Date(formData.dateOfBirth)
                              : formData.dateOfBirth;
                            return d && !isNaN(d.getTime())
                              ? d.toLocaleDateString()
                              : "Pick a date";
                          })()}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarUI
                          mode="single"
                          selected={(() => {
                            const d = typeof formData.dateOfBirth === "string"
                              ? new Date(formData.dateOfBirth)
                              : formData.dateOfBirth;
                            return d && !isNaN(d.getTime()) ? d : undefined;
                          })()}
                          onSelect={(date) => {
                            if (date && !isNaN(date.getTime())) {
                              setFormData((p) => ({ ...p, dateOfBirth: date }));
                              setDobOpen(false);
                            } else {
                              setFormData((p) => ({ ...p, dateOfBirth: "" }));
                            }
                          }}
                          captionLayout="dropdown"
                          fromYear={1950}
                          toYear={new Date().getFullYear()}
                          initialFocus
                        />
                      </PopoverContent>
                      </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label className="block">Gender</Label>
                    <Select
                      value={gender}
                      onValueChange={(v: "male" | "female" | "other") =>
                        setFormData((p) => ({ ...p, gender: v }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="block">Willing to Relocate</Label>
                    <Select
                      value={willingToRelocate}
                      onValueChange={(v: "yes" | "no") =>
                        setFormData((p) => ({ ...p, willingToRelocate: v }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="resume" className="flex items-center gap-2"><FileText className="h-4 w-4" /> Upload Resume <span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <Upload
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                        aria-hidden="true"
                      />
                      <Input
                        id="resume"
                        name="resume"
                        className="pl-9"
                        onChange={(e) => {
                          const file = e.target.files && e.target.files[0];
                          setResumeName(file ? file.name : "");
                          if (file) {
                            setFormData((p) => ({ ...p, resume: file }));
                          } else {
                            setFormData((p) => ({ ...p, resume: "" }));
                          }
                        }}
                        type="file"
                        accept=".pdf,.doc,.docx"
                        required
                      />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">Only document files up to 5 MB are allowed.</p>
                  </div>

                </section>
              </div>

              <div>
                <h4 className="text-sm font-medium text-neutral-500 mb-3">Skills & Summary</h4>
                <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 
                  <div className="space-y-2">
                    <Label>Soft Skills</Label>
                    <TagsInput
                      name="softSkill"
                      value={softSkill}
                      onChange={(v) => setFormData((p) => ({ ...p, softSkill: v }))}
                      placeholder="Type a soft skill and press Enter"
                    />
                  </div>

                  <div className="space-y-2 ">
                    <Label>Technical Skills</Label>
                    <TagsInput
                      name="technicalSkill"
                      value={technicalSkill}
                      onChange={(v) => setFormData((p) => ({ ...p, technicalSkill: v }))}
                      placeholder="Type a technical skill and press Enter"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      rows={5}
                      placeholder="About the candidate"
                      value={formData.description || ""}
                      onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                    />
                  </div>
                </section>
              </div>

                <CardFooter className="flex items-center justify-end gap-3 p-0">
                  <Button type="button" variant="secondary" onClick={() => setFormData(initialData)}>
                    Reset
                  </Button>
                  <Button className="w-full sm:w-auto rounded-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 font-medium" type="button" onClick={onSubmit} disabled={submitting}>
                    {submitting ? "Submitting..." : "Submit Form"}
                  </Button>
                </CardFooter>
              </div>
            </CardContent>
          </Card>
        )}
        <SubmissionSuccessDialog
          open={successOpen}
          onOpenChange={(open) => {
            setSuccessOpen(open);
            if (!open) {
              setFormSubmitted(true);
              try {
                if (typeof window !== "undefined") {
                  localStorage.setItem("candidateFormSubmitted", "true");
                }
              } catch {}
            }
          }}
          title="Congratulations!"
        />
      </div>
    </div>
  );
}
