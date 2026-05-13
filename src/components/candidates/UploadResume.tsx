"use client";

import React, { useRef, useState, useEffect } from "react";
import { X, CloudUpload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { api } from "@/lib/axios-config";
import { initializeAuth } from "@/lib/axios-config";
import { candidateService } from "@/services/candidateService";
import { toast } from "sonner";
import PhoneInput from "@/components/phone/Phoneinput";
import { subDays } from "date-fns";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface UploadResumeProps {
  open: boolean;
  onUploaded?: (url: string) => void;
  onClose?: () => void;
  goBack: () => void;
  candidateId?: string;
  onCandidateCreated?: (candidate: any) => void;
  useDialog?: boolean;
}

interface ParsedResumeData {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  dateOfBirth?: string;
  country?: string;
  experience?: string;
  technicalSkills?: string[];
  softSkills?: string[];
  education?: string[];
}

export const UploadResume: React.FC<UploadResumeProps> = ({ 
  open, 
  onUploaded, 
  onClose, 
  goBack, 
  candidateId,
  onCandidateCreated,
  useDialog = true,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<ParsedResumeData | null>(null);
  const [parseId, setParseId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Form state
  const [form, setForm] = useState({
    name: "",
    phone: "",
    countryCode: "SA",
    email: "",
    location: "",
    dateOfBirth: null as Date | null,
    country: "",
    experience: "",
    // legacy single skills input for backward compatibility (not shown)
    skills: "",
    technicalSkill: "",
    softSkill: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dobOpen, setDobOpen] = useState(false);
  const yesterday = subDays(new Date(), 1);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
      }
    };
  }, []);

  // Update form when parsed data arrives
  useEffect(() => {
    if (parsedData) {
      setForm(prev => ({
        ...prev,
        name: parsedData.name || prev.name,
        email: parsedData.email || prev.email,
        phone: parsedData.phone || prev.phone,
        location: parsedData.location || prev.location,
        dateOfBirth: parsedData.dateOfBirth ? new Date(parsedData.dateOfBirth) : prev.dateOfBirth,
        country: parsedData.country || prev.country,
        experience: parsedData.experience || prev.experience,
        technicalSkill: parsedData.technicalSkills && parsedData.technicalSkills.length
          ? parsedData.technicalSkills.join(", ")
          : prev.technicalSkill,
        softSkill: parsedData.softSkills && parsedData.softSkills.length
          ? parsedData.softSkills.join(", ")
          : prev.softSkill,
      }));
    }
  }, [parsedData]);

  const handleDialogOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      goBack();
      if (onClose) {
        onClose();
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setError(null);
      setParsedData(null);
      setProgress(0);
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setError(null);
      setParsedData(null);
      setProgress(0);
      handleFileUpload(file);
    }
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    setError(null);
    setParsedData(null);
    setProgress(0);
    setIsUploading(false);
    setIsParsing(false);
    // Reset form fields when resume is removed
    setForm({
      name: "",
      phone: "",
      countryCode: "SA",
      email: "",
      location: "",
      dateOfBirth: null,
      country: "",
      experience: "",
      skills: "",
      technicalSkill: "",
      softSkill: "",
    });
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current);
      pollingTimeoutRef.current = null;
    }
  };

  // Poll for parsed resume data
  const pollParsedData = async (parseId: string) => {
    try {
      await initializeAuth();
      const response = await api.get(`/api/resume-parser/${parseId}`);
      
      const responseData = response.data?.data || response.data;
      const status = response.data?.status || responseData?.status;
      
      if (status === 'completed' || (responseData && !status && (responseData.name || responseData.email || responseData.phone))) {
        setIsParsing(false);
        setProgress(100);
        
        const data = responseData || response.data;
        
        // Extract ONLY technical and soft skills (ignore generic 'skills')
        let technicalSkills: string[] = Array.isArray(data?.technicalSkills) ? data.technicalSkills : [];
        let softSkills: string[] = Array.isArray(data?.softSkills) ? data.softSkills : [];
        
        const mappedData: ParsedResumeData = {
          name: data?.name || data?.fullName || data?.firstName || "",
          email: data?.email || "",
          phone: data?.phone || data?.phoneNumber || data?.mobile || "",
          location: data?.location || data?.address || data?.city || "",
          dateOfBirth: data?.dateOfBirth || data?.birthDate || data?.dob || "",
          country: data?.country || "",
          experience: data?.experience || data?.totalExperience || data?.yearsOfExperience || "",
          technicalSkills,
          softSkills,
          education: Array.isArray((data as any)?.education)
            ? (data as any).education
            : Array.isArray((response.data?.data?.preview as any)?.education)
              ? (response.data.data.preview as any).education
              : [],
        };
        
        setParsedData(mappedData);
        
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
        if (pollingTimeoutRef.current) {
          clearTimeout(pollingTimeoutRef.current);
          pollingTimeoutRef.current = null;
        }
      } else if (status === 'processing' || status === 'pending') {
        setProgress(prev => Math.min(prev + 10, 90));
      } else if (status === 'failed') {
        setIsParsing(false);
        setError("Failed to parse resume. Please fill the form manually.");
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
        if (pollingTimeoutRef.current) {
          clearTimeout(pollingTimeoutRef.current);
          pollingTimeoutRef.current = null;
        }
      } else if (responseData && Object.keys(responseData).length > 0) {
        setIsParsing(false);
        setProgress(100);
        
        // Extract ONLY technical and soft skills (ignore generic 'skills')
        let technicalSkills: string[] = Array.isArray(responseData?.technicalSkills) ? responseData.technicalSkills : [];
        let softSkills: string[] = Array.isArray(responseData?.softSkills) ? responseData.softSkills : [];
        
        const mappedData: ParsedResumeData = {
          name: responseData?.name || responseData?.fullName || responseData?.firstName || "",
          email: responseData?.email || "",
          phone: responseData?.phone || responseData?.phoneNumber || responseData?.mobile || "",
          location: responseData?.location || responseData?.address || responseData?.city || "",
          dateOfBirth: responseData?.dateOfBirth || responseData?.birthDate || responseData?.dob || "",
          country: responseData?.country || "",
          experience: responseData?.experience || responseData?.totalExperience || responseData?.yearsOfExperience || "",
          technicalSkills,
          softSkills,
          education: Array.isArray((responseData as any)?.education)
            ? (responseData as any).education
            : Array.isArray((response.data?.data?.preview as any)?.education)
              ? (response.data.data.preview as any).education
              : [],
        };
        
        setParsedData(mappedData);
        
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
        if (pollingTimeoutRef.current) {
          clearTimeout(pollingTimeoutRef.current);
          pollingTimeoutRef.current = null;
        }
      }
    } catch (err: any) {
      console.error('Error polling parsed data:', err);
      
      if (err.response?.status === 404) {
        setProgress(prev => Math.min(prev + 5, 90));
        return;
      }
      
      setIsParsing(false);
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
        pollingTimeoutRef.current = null;
      }
    }
  };

  // Handle file upload and parsing
  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setIsParsing(true);
    setError(null);
    setProgress(10);
    
    try {
      await initializeAuth();
      
      const formData = new FormData();
      formData.append("resume", file);
      
      const response = await api.post("/api/resume-parser/parse", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      const parseIdFromResponse = response.data.parseId || response.data.data?.parseId || response.data.id;
      
      if (!parseIdFromResponse) {
        throw new Error("No parse ID returned from server");
      }
      
      setParseId(parseIdFromResponse);
      setProgress(30);
      setIsUploading(false);
      
      await pollParsedData(parseIdFromResponse);
      
      pollingIntervalRef.current = setInterval(() => {
        pollParsedData(parseIdFromResponse);
      }, 2000);
      
      pollingTimeoutRef.current = setTimeout(() => {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
        if (isParsing) {
          setIsParsing(false);
          setError("Parsing is taking longer than expected. Please fill the form manually.");
        }
      }, 60000);
      
    } catch (err: any) {
      console.error('Error uploading/parsing resume:', err);
      setIsUploading(false);
      setIsParsing(false);
      
      if (err.code === 'ERR_NETWORK' || err.message?.includes('ERR_CONNECTION_REFUSED')) {
        setError("Cannot connect to server. Please ensure the backend server is running and try again.");
      } else if (err.response?.status === 401) {
        setError("Authentication failed. Please log in again.");
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      } else {
        setError(err.response?.data?.message || err.message || "Failed to upload and parse resume. Please fill the form manually.");
      }
      
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
        pollingTimeoutRef.current = null;
      }
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    

    try {
      if (!form.name || !form.phone || !form.email) {
        toast.error("Please fill in all required fields (Name, Phone, Email)");
        setIsSubmitting(false);

        return;
      }

      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('phone', form.phone);
      formData.append('email', form.email);
      if (form.location) formData.append('location', form.location);
      if (form.dateOfBirth) formData.append('dateOfBirth', form.dateOfBirth.toISOString());
      if (form.country) formData.append('country', form.country);
      if (form.experience) formData.append('experience', form.experience);
      // map separate skills
      const technicalArr = (form.technicalSkill || "").split(',').map(s => s.trim()).filter(Boolean);
      const softArr = (form.softSkill || "").split(',').map(s => s.trim()).filter(Boolean);
      technicalArr.forEach((s) => formData.append('technicalSkill', s));
      softArr.forEach((s) => formData.append('softSkill', s));
      // also send combined generic skills for Details section
      const mergedSkills = Array.from(new Map([...technicalArr, ...softArr].map((s) => [s.toLowerCase(), s])).values());
      mergedSkills.forEach((s) => formData.append('skills', s));
      // education from parsed data -> educationDegree
      if (parsedData?.education && parsedData.education.length) {
        formData.append('educationDegree', parsedData.education.join('\n'));
      }
      if (selectedFile) formData.append('resume', selectedFile);

      const createdCandidate = await candidateService.createCandidate(formData);
      
      toast.success("Candidate created successfully!");
      // window.location.reload();
      
      if (onCandidateCreated) {
        onCandidateCreated(createdCandidate);
      }
      
      if (onClose) onClose();
      
    } catch (error: any) {
      console.error('Error creating candidate:', error);
      toast.error(error.message || "Failed to create candidate. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const header = (
    <DialogHeader className="px-6 pt-6 pb-4 border-b">
      <DialogTitle>Complete Candidate Form</DialogTitle>
      <DialogDescription>
        Upload a resume to autofill details, then complete the candidate form before submitting.
      </DialogDescription>
    </DialogHeader>
  );

  const body = (
    <div className="flex-1 min-h-0 px-2 pb-2 flex flex-col">
      {/* Drag and Drop Section - Small at top */}
      <div className="flex-shrink-0 mb-2 pr-2 pl-2">
        <div
          className={`w-full border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-2 ${
            dragActive ? "border-blue-500 bg-blue-50" : "border-border bg-muted"
          } ${isUploading || isParsing ? "opacity-50 pointer-events-none" : ""}`}
          onClick={() => !isUploading && !isParsing && fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          aria-disabled={isUploading || isParsing}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.rtf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
            className="hidden"
            disabled={isUploading || isParsing}
          />
          {selectedFile ? (
            <div className="flex items-center gap-2 w-full justify-center">
              <CloudUpload className="w-4 h-4 text-blue-500" />
              <span className="font-medium text-blue-700 truncate max-w-[200px] text-sm">{selectedFile.name}</span>
              {!isUploading && !isParsing && (
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="ml-2 p-1 rounded hover:bg-red-100 text-red-600"
                  aria-label="Remove file"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <CloudUpload className="w-5 h-5 text-blue-400" />
              <span className="text-sm text-muted-foreground">
                Drag & drop your resume here, or <span className="text-blue-600 underline">browse</span>
              </span>
            </div>
          )}
        </div>
        {error && <div className="text-red-500 text-xs w-full text-center mt-2">{error}</div>}
      </div>

      {/* Progress Bar - Show while uploading/parsing */}
      {(isUploading || isParsing) && (
        <div className="flex-shrink-0 w-full space-y-2 mb-2">
          <div className="flex justify-between text-sm text-foreground">
            <span>{isUploading ? "Uploading resume..." : "Parsing resume..."}</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>
      )}

      {/* Form Section - Scrollable */}
      <form onSubmit={handleSubmit} className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <div className="flex-1 min-h-0 overflow-y-auto pr-2 pl-2">
          <div className="space-y-4">
            {/* Candidate Name - Required */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium leading-none">
                Candidate Name<span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                value={form.name}
                onChange={handleFormChange}
                required
                placeholder="Enter full name"
                className="w-full"
              />
            </div>

            {/* Phone Number - Required */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium leading-none">
                Phone Number<span className="text-red-500 ml-1">*</span>
              </Label>
              <PhoneInput
                countryCode={form.countryCode}
                onCountryCodeChange={(val) => setForm((prev) => ({ ...prev, countryCode: val }))}
                phoneNumber={form.phone}
                onPhoneNumberChange={(value) => setForm((prev) => ({ ...prev, phone: value || "" }))}
              />
            </div>

            {/* Email - Required */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium leading-none">
                Email<span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleFormChange}
                required
                placeholder="Enter email address"
                className="w-full"
              />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-medium leading-none">
                Location
              </Label>
              <Input
                id="location"
                name="location"
                value={form.location}
                onChange={handleFormChange}
                placeholder="Enter location"
                className="w-full"
              />
            </div>

            {/* Date of Birth */}
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth" className="text-sm font-medium leading-none">
                Date of Birth
              </Label>
              <Popover open={dobOpen} onOpenChange={setDobOpen} modal={true}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal h-9"
                    onClick={() => setDobOpen(true)}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.dateOfBirth ? format(form.dateOfBirth, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    captionLayout="dropdown"
                    selected={form.dateOfBirth ?? undefined}
                    onSelect={(date) => {
                      setForm((prev) => ({ ...prev, dateOfBirth: date ?? null }));
                      setDobOpen(false);
                    }}
                    fromDate={new Date(1900, 0, 1)}
                    toDate={yesterday}
                    initialFocus
                    disabled={[{ from: new Date(), to: undefined }]}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Country */}
            <div className="space-y-2">
              <Label htmlFor="country" className="text-sm font-medium leading-none">
                Country
              </Label>
              <Input
                id="country"
                name="country"
                value={form.country}
                onChange={handleFormChange}
                placeholder="Enter country"
                className="w-full"
              />
            </div>

            {/* Experience */}
            <div className="space-y-2">
              <Label htmlFor="experience" className="text-sm font-medium leading-none">
                Experience
              </Label>
              <Input
                id="experience"
                name="experience"
                value={form.experience}
                onChange={handleFormChange}
                placeholder="Enter years of experience (e.g., 5 years)"
                className="w-full"
              />
            </div>

            {/* Technical Skill */}
            <div className="space-y-2">
              <Label htmlFor="technicalSkill" className="text-sm font-medium leading-none">
                Technical Skill
              </Label>
              <textarea
                id="technicalSkill"
                name="technicalSkill"
                value={form.technicalSkill}
                onChange={handleFormChange}
                rows={3}
                className="w-full px-3 py-2 border border-border rounded-md text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                placeholder="Comma separated (e.g., JavaScript, React, Node.js)"
              />
            </div>

            {/* Soft Skill */}
            <div className="space-y-2">
              <Label htmlFor="softSkill" className="text-sm font-medium leading-none">
                Soft Skill
              </Label>
              <textarea
                id="softSkill"
                name="softSkill"
                value={form.softSkill}
                onChange={handleFormChange}
                rows={3}
                className="w-full px-3 py-2 border border-border rounded-md text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                placeholder="Comma separated (e.g., Leadership, Communication)"
              />
            </div>
          </div>
        </div>

        {/* Submit Button - Fixed at bottom */}
        <div className="flex-shrink-0 flex justify-end gap-3 mt-2 pt-2 border-t">
          <Button type="button" variant="outline" onClick={goBack} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting || isUploading || isParsing}>
            {isSubmitting ? "Creating..." : "Submit"}
          </Button>
        </div>
      </form>
    </div>
  );

  if (!useDialog) {
    return (
      <div className="h-full w-full flex flex-col overflow-hidden">
        {body}
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="sm:max-w-3xl w-full h-[80vh] max-h-[80vh] p-0 overflow-hidden">
        <div className="flex flex-col h-full w-full min-h-0">
          {header}
          {body}
        </div>
      </DialogContent>
    </Dialog>
  );
};
