"use client";

import React, { useState, useRef } from 'react';
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { CountrySelect } from "@/components/ui/country-select";
import { Upload } from "lucide-react";
import { subDays } from "date-fns";
import { candidateService } from "@/services/candidateService";
import { useCreateCandidate } from "@/hooks/useCandidate";
import { headhunterCandidatesService } from "@/services/headhunterCandidatesService";
import { convertTempCandidateToReal, type ConvertTempCandidateRequest } from "@/services/recruitmentPipelineService";
import { toast } from "sonner";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import "@/styles/phone-input-override.css";
import { CONTINENTS } from '@/lib/constants';

interface CreateCandidateFormProps {
  onCandidateCreated?: (candidate: any) => void;
  showAdvanced: boolean;
  setShowAdvanced: (value: boolean) => void;
  onClose: () => void; // for dialog close (X)
  goBack: () => void; // for Cancel button
  tempCandidateData?: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    description?: string;
    gender?: string;
    dateOfBirth?: string;
    country?: string;
    nationality?: string;
    educationDegree?: string;
    willingToRelocate?: string;
    linkedin?: string;
    continent?: string;
  };
  // Props for temp candidate conversion
  isTempCandidateConversion?: boolean;
  pipelineId?: string;
  tempCandidateId?: string;
  isHeadhunterCreate?: boolean;
}

export default function CreateCandidateForm({
  onCandidateCreated,
  showAdvanced,
  setShowAdvanced,
  onClose,
  goBack,
  tempCandidateData,
  isTempCandidateConversion = false,
  pipelineId,
  tempCandidateId,
  isHeadhunterCreate,
}: CreateCandidateFormProps) {
  const [form, setForm] = useState({
    name: tempCandidateData?.name || "",
    phone: tempCandidateData?.phone || "",
    email: tempCandidateData?.email || "",
    location: tempCandidateData?.location || "",
    description: tempCandidateData?.description || "",
    gender: tempCandidateData?.gender || "",
    dateOfBirth: tempCandidateData?.dateOfBirth ? new Date(tempCandidateData.dateOfBirth) : null as Date | null,
    country: tempCandidateData?.country || "",
    nationality: tempCandidateData?.nationality || "",
    educationDegree: tempCandidateData?.educationDegree || "",
    willingToRelocate: tempCandidateData?.willingToRelocate || "",
    linkedin: tempCandidateData?.linkedin || "",
    continent: tempCandidateData?.continent || "",
    // New fields from API spec
    experience: "",
    totalRelevantExperience: "",
    noticePeriod: "",
    currentJobTitle: "",
    previousCompanyName: "",
    currentSalary: "",
    currentSalaryCurrency: "INR",
    expectedSalary: "",
    expectedSalaryCurrency: "INR",
    universityName: "",
    skills: [] as string[],
    cv: null as File | null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const router = useRouter();
  const { mutateAsync: createCandidateMutation } = useCreateCandidate();
  const [dobOpen, setDobOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset form when tempCandidateData changes
  React.useEffect(() => {
    if (tempCandidateData) {
      setForm({
        name: tempCandidateData.name || "",
        phone: tempCandidateData.phone || "",
        email: tempCandidateData.email || "",
        location: tempCandidateData.location || "",
        description: tempCandidateData.description || "",
        gender: tempCandidateData.gender || "",
        dateOfBirth: tempCandidateData.dateOfBirth ? new Date(tempCandidateData.dateOfBirth) : null,
        country: tempCandidateData.country || "",
        nationality: tempCandidateData.nationality || "",
        educationDegree: tempCandidateData.educationDegree || "",
        willingToRelocate: tempCandidateData.willingToRelocate || "",
        linkedin: tempCandidateData.linkedin || "",
        continent: tempCandidateData.continent || "",
        experience: "",
        totalRelevantExperience: "",
        noticePeriod: "",
        currentJobTitle: "",
        previousCompanyName: "",
        currentSalary: "",
        currentSalaryCurrency: "INR",
        expectedSalary: "",
        expectedSalaryCurrency: "INR",
        universityName: "",
        skills: [],
        cv: null,
      });
    }
  }, [tempCandidateData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      if (!form.skills.includes(skillInput.trim())) {
        setForm(prev => ({ ...prev, skills: [...prev.skills, skillInput.trim()] }));
      }
      setSkillInput("");
    }
  };

  const removeSkill = (skill: string) => {
    setForm(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file type
      const allowedTypes = [
        'application/pdf', 
        'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/png',
        'image/jpeg',
        'image/jpg',
        'text/plain'
      ];
      
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      const allowedExtensions = ['pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg', 'txt'];

      if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension || "")) {
        alert('Please select a valid file type (PDF, DOC, DOCX, PNG, JPG, JPEG, TXT)');
        return;
      }
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      setForm((prev) => ({ ...prev, cv: file }));
    }
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!form.name) {
        alert("Please enter candidate name");
        setIsSubmitting(false);
        return;
      }

      if (!form.phone || !form.email) {
        alert("Please fill in all required fields (Phone, Email)");
        setIsSubmitting(false);
        return;
      }

      if (isTempCandidateConversion) {
        // Handle temp candidate conversion
        if (!pipelineId || !tempCandidateId) {
          alert("Missing pipeline or temp candidate information");
          setIsSubmitting(false);
          return;
        }

        const candidateData: ConvertTempCandidateRequest = {
          name: form.name,
          email: form.email,
          phone: form.phone,
          location: form.location,
          description: form.description,
          gender: form.gender,
          dateOfBirth: form.dateOfBirth ? form.dateOfBirth.toISOString() : undefined,
          country: form.country,
          nationality: form.nationality,
          educationDegree: form.educationDegree,
          willingToRelocate: form.willingToRelocate,
          linkedin: form.linkedin,
          continent: form.continent,
        };

        const result = await convertTempCandidateToReal(pipelineId, tempCandidateId, candidateData);

        if (result.success) {
          // Show success toast message
          toast.success("Temp candidate converted to real candidate successfully!");

          // Call the callback with the converted candidate
          if (onCandidateCreated) {
            onCandidateCreated(result.data);
          }

          // Close the modal
          onClose();
        } else {
          throw new Error(result.error || result.message);
        }
      } else {
        // Handle regular candidate creation
        const formData = new FormData();
        // Add all form fields to FormData
        Object.keys(form).forEach(key => {
          if (key === 'cv' && form.cv) {
            formData.append('resume', form.cv);
          } else if (key === 'dateOfBirth' && form.dateOfBirth) {
            formData.append('dateOfBirth', form.dateOfBirth.toISOString());
          } else if (key === 'skills' && form.skills.length > 0) {
            // Append each skill or the whole array as JSON if needed
            // Based on common practice, we append each one
            form.skills.forEach(skill => formData.append('skills[]', skill));
          } else if (key !== 'cv' && key !== 'dateOfBirth' && key !== 'skills') {
            const value = (form as any)[key];
            if (value !== null && value !== undefined && value !== "") {
              formData.append(key, value);
            }
          }
        });

        // Send data to backend
        const createdCandidate = isHeadhunterCreate
          ? await headhunterCandidatesService.createCandidate(formData)
          : await createCandidateMutation(formData);

        // Call the callback with the created candidate
        if (onCandidateCreated) {
          onCandidateCreated(createdCandidate);
        }

        // Close the modal
        onClose();

        if (!isHeadhunterCreate) {
          const candidateId = createdCandidate._id;
          router.push(`/candidates/${candidateId}`);
        }
      }

    } catch (error: any) {
      console.error('Error creating/converting candidate:', error);

      // Show error toast message
      if (error.message) {
        toast.error(`Failed to ${isTempCandidateConversion ? 'convert' : 'create'} candidate: ${error.message}`);
      } else {
        toast.error(`Failed to ${isTempCandidateConversion ? 'convert' : 'create'} candidate. Please try again.`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form state when canceling
  const handleCancel = () => {
    // Reset form to initial state
    setForm({
      name: "",
      phone: "",
      email: "",
      location: "",
      description: "",
      gender: "",
      dateOfBirth: null,
      country: "",
      nationality: "",
      educationDegree: "",
      willingToRelocate: "",
      linkedin: "",
      continent: "",
      experience: "",
      totalRelevantExperience: "",
      noticePeriod: "",
      currentJobTitle: "",
      previousCompanyName: "",
      currentSalary: "",
      currentSalaryCurrency: "INR",
      expectedSalary: "",
      expectedSalaryCurrency: "INR",
      universityName: "",
      skills: [],
      cv: null,
    });

    // Reset advanced options to hidden
    setShowAdvanced(false);

    // Reset date picker state
    setDobOpen(false);

    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // Call the original goBack function
    goBack();
  };

  const yesterday = subDays(new Date(), 1);

  return (
    <>
      <form onSubmit={handleSubmit} id="candidate-form" className="overflow-y-auto flex flex-col flex-1 min-h-0 p-2">
        <p className="text-gray-500 text-sm mb-4">Creating candidates will allow you to fill in their details, upload resumes to their profiles, add them to jobs and much more.</p>
        <div className="flex-1 min-h-0 flex flex-col gap-4 pr-1">

          {/* Candidate Name - Required */}
          <div className="space-y-2">
            <Label htmlFor="name">Candidate Name<span className="text-red-500">*</span></Label>
            <div className="relative">
              <Input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                maxLength={255}
                placeholder="Enter full name"
                className="pr-16"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none bg-white px-0 py-1">
                {form.name.length} / 255
              </span>
            </div>
          </div>

          {/* Phone Number - Required */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number<span className="text-red-500">*</span></Label>
            <PhoneInput
              country={"sa"}
              value={form.phone || ""}
              onChange={(value) => setForm(prev => ({ ...prev, phone: value || "" }))}
              inputClass="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm w-full"
              enableSearch={true}
              preferredCountries={["sa", "us", "gb", "in"]}
              countryCodeEditable={false}
              autoFormat={true}
              inputProps={{ id: "phone", name: "phone", placeholder: "Enter phone number", required: true }}
            />
          </div>

          {/* Email - Required */}
          <div className="space-y-2">
            <Label htmlFor="email">Email<span className="text-red-500">*</span></Label>
            <div className="relative">
              <Input
                id="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter email address"
                maxLength={255}
                className="pr-16"
                required
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none bg-white px-0 py-1">
                {form.email.length} / 255
              </span>
            </div>
          </div>

          {/* LinkedIn Profile - Optional */}
          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn Profile URL</Label>
            <Input
              id="linkedin"
              name="linkedin"
              value={form.linkedin}
              onChange={handleChange}
              placeholder="Enter LinkedIn profile URL"
              maxLength={255}
            />
          </div>

          {showAdvanced && (
            <>
              {/* Experience Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="experience">Total Experience</Label>
                  <Input
                    id="experience"
                    name="experience"
                    value={form.experience}
                    onChange={handleChange}
                    placeholder="e.g. 5 years"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="totalRelevantExperience">Relevant Experience</Label>
                  <Input
                    id="totalRelevantExperience"
                    name="totalRelevantExperience"
                    value={form.totalRelevantExperience}
                    onChange={handleChange}
                    placeholder="e.g. 3 years"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currentJobTitle">Current Job Title</Label>
                  <Input
                    id="currentJobTitle"
                    name="currentJobTitle"
                    value={form.currentJobTitle}
                    onChange={handleChange}
                    placeholder="e.g. Senior Developer"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="previousCompanyName">Previous Company</Label>
                  <Input
                    id="previousCompanyName"
                    name="previousCompanyName"
                    value={form.previousCompanyName}
                    onChange={handleChange}
                    placeholder="e.g. TechCorp"
                  />
                </div>
              </div>

              {/* Salary Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currentSalary">Current Salary</Label>
                  <div className="flex gap-2">
                    <Input
                      id="currentSalary"
                      name="currentSalary"
                      type="number"
                      value={form.currentSalary}
                      onChange={handleChange}
                      placeholder="Amount"
                    />
                    <Select value={form.currentSalaryCurrency} onValueChange={(v) => handleSelectChange('currentSalaryCurrency', v)}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INR">INR</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="SAR">SAR</SelectItem>
                        <SelectItem value="AED">AED</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expectedSalary">Expected Salary</Label>
                  <div className="flex gap-2">
                    <Input
                      id="expectedSalary"
                      name="expectedSalary"
                      type="number"
                      value={form.expectedSalary}
                      onChange={handleChange}
                      placeholder="Amount"
                    />
                    <Select value={form.expectedSalaryCurrency} onValueChange={(v) => handleSelectChange('expectedSalaryCurrency', v)}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INR">INR</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="SAR">SAR</SelectItem>
                        <SelectItem value="AED">AED</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="noticePeriod">Notice Period</Label>
                  <Input
                    id="noticePeriod"
                    name="noticePeriod"
                    value={form.noticePeriod}
                    onChange={handleChange}
                    placeholder="e.g. 30 days"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="universityName">University Name</Label>
                  <Input
                    id="universityName"
                    name="universityName"
                    value={form.universityName}
                    onChange={handleChange}
                    placeholder="e.g. Delhi University"
                  />
                </div>
              </div>

              {/* Skills Tag Input */}
              <div className="space-y-2">
                <Label htmlFor="skills">Skills (Press Enter to add)</Label>
                <Input
                  id="skills"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleAddSkill}
                  placeholder="Type a skill and press Enter"
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {form.skills.map((skill) => (
                    <div
                      key={skill}
                      className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs border border-blue-200"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="hover:text-blue-900 font-bold"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select onValueChange={(value) => handleSelectChange('gender', value)}>
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

              {/* Date of Birth */}
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Popover open={dobOpen} onOpenChange={setDobOpen} modal={true}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
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
                <Label htmlFor="country">Country</Label>
                <CountrySelect
                  value={form.country}
                  onChange={(val, nationality) =>
                    setForm((prev) => ({
                      ...prev,
                      country: val,
                      ...(nationality ? { nationality } : {})
                    }))
                  }
                  type="country"
                  placeholder="Select country..."
                />
              </div>

              {/* Nationality */}
              <div className="space-y-2">
                <Label htmlFor="nationality">Nationality</Label>
                <CountrySelect
                  value={form.nationality}
                  onChange={(val) => setForm((prev) => ({ ...prev, nationality: val }))}
                  type="nationality"
                  placeholder="Select nationality..."
                />
                <div className="flex justify-between items-center">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, nationality: "Open" }))}
                    className={`text-xs h-8 px-2 border rounded-md ${form.nationality === "Open" ? "bg-blue-50 border-blue-200 text-blue-700 font-medium" : ""}`}
                  >
                    Set as &quot;Open&quot;
                  </Button>
                </div>
              </div>

              {/* Continent */}
              <div className="space-y-2">
                <Label htmlFor="continent">Continent</Label>
                <CountrySelect
                  value={form.continent}
                  onChange={(val) => setForm((prev) => ({ ...prev, continent: val }))}
                  type="continent"
                  placeholder="Select continent..."
                />
              </div>

              {/* Education Degree/Certificate */}
              <div className="space-y-2">
                <Label htmlFor="educationDegree">Education Degree/Certificate</Label>
                <Input
                  id="educationDegree"
                  name="educationDegree"
                  value={form.educationDegree || ""}
                  onChange={handleChange}
                  placeholder="e.g. Bachelor's in Computer Science"
                  maxLength={255}
                />
              </div>

              {/* Willing to Relocate */}
              <div className="space-y-2">
                <Label htmlFor="willingToRelocate">Are you willing to relocate?</Label>
                <Select onValueChange={(value) => handleSelectChange('willingToRelocate', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Location - Optional */}
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="Enter location"
                />
              </div>

              {/* Description - Optional */}
              <div className="space-y-2">
                <Label htmlFor="description">Description (Headhunter Summary)</Label>
                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  placeholder="Additional details about the candidate"
                ></textarea>
              </div>

              {/* Upload CV */}
              <div className="space-y-2">
                <Label htmlFor="cv">Upload CV (Resume)<span className="text-red-500">*</span></Label>
                <div
                  className="relative border-2 border-dashed border-gray-300 rounded-md p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
                  onClick={handleFileClick}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    id="cv"
                    name="cv"
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <div className="text-sm text-gray-600">
                    {form.cv ? (
                      <span className="text-green-600 font-medium">{form.cv.name}</span>
                    ) : (
                      <>
                        <span className="font-medium text-gray-900">Click to upload</span>
                        <br />
                        <span className="text-gray-500">PDF, DOC, DOCX, TXT, JPG, PNG (max 5MB)</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          <button
            type="button"
            className="text-blue-600 text-sm font-medium flex items-center gap-1 focus:outline-none"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            {showAdvanced ? "- Hide Advanced Options" : "+ Show Advanced Options"}
          </button>
        </div>
      </form>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" form="candidate-form" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Continue"}
        </Button>
      </DialogFooter>
    </>
  );
}
