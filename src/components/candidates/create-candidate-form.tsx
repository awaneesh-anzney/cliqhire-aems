"use client";

import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { 
  CalendarIcon, 
  User, 
  Mail, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  FileText, 
  Upload, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft,
  Info,
  Building2,
  Linkedin,
  Globe,
  Plus,
  X,
  CreditCard,
  Loader2
} from "lucide-react";
import { format, subDays } from "date-fns";
import { useRouter } from "next/navigation";
import { CountrySelect } from "@/components/ui/country-select";
import { useCreateCandidate } from "@/hooks/useCandidate";
import { headhunterCandidatesService } from "@/services/headhunterCandidatesService";
import { convertTempCandidateToReal, type ConvertTempCandidateRequest } from "@/services/recruitmentPipelineService";
import { toast } from "sonner";
import PhoneInput from "@/components/phone/Phoneinput";
import { cn } from "@/lib/utils";

interface CreateCandidateFormProps {
  onCandidateCreated?: (candidate: any) => void;
  onClose: () => void;
  goBack: () => void;
  tempCandidateData?: any;
  isTempCandidateConversion?: boolean;
  pipelineId?: string;
  tempCandidateId?: string;
  isHeadhunterCreate?: boolean;
}

const TABS = ["Identity", "Experience", "Background", "Summary"] as const;

export default function CreateCandidateForm({
  onCandidateCreated,
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
    countryCode: tempCandidateData?.countryCode || "SA",
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
    experience: "",
    totalRelevantExperience: "",
    noticePeriod: "",
    currentJobTitle: "",
    previousCompanyName: "",
    currentSalary: "",
    currentSalaryCurrency: "SAR",
    expectedSalary: "",
    expectedSalaryCurrency: "SAR",
    universityName: "",
    skills: [] as string[],
    cv: null as File | null,
  });

  const [currentTab, setCurrentTab] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const [dobOpen, setDobOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { mutateAsync: createCandidateMutation } = useCreateCandidate();

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
      setForm((prev) => ({ ...prev, cv: file }));
    }
  };

  const validateCurrentStep = () => {
    if (currentTab === 0) {
      if (!form.name || !form.email || !form.phone) {
        toast.error("Please fill in required fields (Name, Email, Phone)");
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentTab(prev => Math.min(prev + 1, TABS.length - 1));
    }
  };

  const handlePrevious = () => setCurrentTab(prev => Math.max(prev - 1, 0));

  const handleSubmit = async () => {
    if (!form.cv && !isTempCandidateConversion) {
      toast.error("Resume upload is required");
      return;
    }

    setIsSubmitting(true);
    try {
      if (isTempCandidateConversion) {
        const candidateData: ConvertTempCandidateRequest = {
          ...form,
          dateOfBirth: form.dateOfBirth?.toISOString(),
        };
        const result = await convertTempCandidateToReal(pipelineId!, tempCandidateId!, candidateData);
        if (result.success) {
          toast.success("Candidate converted successfully!");
          onCandidateCreated?.(result.data);
          onClose();
        }
      } else {
        const formData = new FormData();
        Object.keys(form).forEach(key => {
          if (key === 'cv' && form.cv) {
            formData.append('resume', form.cv);
          } else if (key === 'dateOfBirth' && form.dateOfBirth) {
            formData.append('dateOfBirth', form.dateOfBirth.toISOString());
          } else if (key === 'skills') {
            form.skills.forEach(s => formData.append('skills[]', s));
          } else {
            const val = (form as any)[key];
            if (val) formData.append(key, val);
          }
        });

        const created = isHeadhunterCreate 
          ? await headhunterCandidatesService.createCandidate(formData)
          : await createCandidateMutation(formData);

        toast.success("Candidate profile created!");
        onCandidateCreated?.(created);
        onClose();
        if (!isHeadhunterCreate) router.push(`/candidates/${created._id}`);
      }
    } catch (error: any) {
      toast.error(error.message || "Action failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-full lg:h-[620px] min-h-[500px]">
      {/* Sidebar - Step Indicator */}
      <div className="hidden md:flex flex-col w-52 bg-slate-50 border-r border-slate-200 p-8 shrink-0">
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <User className="w-5 h-5 text-primary" />
            </div>
            <span className="font-bold text-slate-800 text-lg tracking-tight">CliqHire</span>
          </div>
          <p className="text-[10px] text-slate-400 font-black tracking-widest uppercase">Talent Acquisition</p>
        </div>

        <div className="space-y-8">
          {TABS.map((tab, index) => (
            <div key={tab} className="flex items-start gap-4">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
                ${currentTab === index 
                  ? "bg-primary text-white shadow-lg shadow-primary/30 scale-110" 
                  : (index < currentTab ? "bg-green-500 text-white" : "bg-slate-200 text-slate-500")}
              `}>
                {index < currentTab ? <CheckCircle2 className="w-5 h-5" /> : index + 1}
              </div>
              <div className="flex flex-col">
                <span className={`text-sm font-bold ${currentTab === index ? "text-slate-900" : "text-slate-400"}`}>
                  {tab}
                </span>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Section {index + 1}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-auto bg-white/60 p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-500 leading-relaxed font-bold">
              Profiles with detailed experience and skills get matched 3x faster.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-white overflow-hidden">
        <div className="p-8 pb-4">
          <div className="flex justify-between items-center mb-1">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              {currentTab === 0 ? "Identity Details" : currentTab === 1 ? "Professional Path" : currentTab === 2 ? "Candidate Background" : "Final Submission"}
            </h2>
            <span className="text-xs font-black text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-widest border border-primary/20">
              Step {currentTab + 1} of 4
            </span>
          </div>
          <p className="text-slate-400 font-semibold text-sm">
            {isTempCandidateConversion ? "Complete profile to finalize candidate onboarding." : "Onboard top talent to your specialized pipeline."}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 pt-4 min-h-0">
          <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {currentTab === 0 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                    <Label className="text-sm font-bold text-slate-700">Full Name <span className="text-primary">*</span></Label>
                    <div className="relative group">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-primary transition-colors" />
                      <Input name="name" value={form.name} onChange={handleChange} placeholder="John Doe" className="pl-10 h-11 border-slate-200 focus:border-primary font-bold" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-slate-700">Email Address <span className="text-primary">*</span></Label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-primary transition-colors" />
                      <Input name="email" value={form.email} onChange={handleChange} placeholder="candidate@email.com" className="pl-10 h-11 border-slate-200 focus:border-primary font-bold" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700">Phone Number <span className="text-primary">*</span></Label>
                  <PhoneInput
                    countryCode={form.countryCode}
                    onCountryCodeChange={v => handleSelectChange('countryCode', v)}
                    phoneNumber={form.phone}
                    onPhoneNumberChange={v => handleSelectChange('phone', v)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                    <Label className="text-sm font-bold text-slate-700">LinkedIn Profile</Label>
                    <div className="relative group">
                      <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-primary transition-colors" />
                      <Input name="linkedin" value={form.linkedin} onChange={handleChange} placeholder="linkedin.com/in/..." className="pl-10 h-11 border-slate-200 font-bold" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-slate-700">Gender</Label>
                    <Select value={form.gender} onValueChange={v => handleSelectChange('gender', v)}>
                      <SelectTrigger className="h-11 border-slate-200 font-bold">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male" className="font-bold">Male</SelectItem>
                        <SelectItem value="female" className="font-bold">Female</SelectItem>
                        <SelectItem value="other" className="font-bold">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700">Date of Birth</Label>
                  <Popover open={dobOpen} onOpenChange={setDobOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full h-11 justify-start text-left font-bold border-slate-200 px-4">
                        <CalendarIcon className="mr-3 h-4 w-4 text-slate-300" />
                        {form.dateOfBirth ? format(form.dateOfBirth, "PPP") : <span className="text-slate-400">Select Date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-[100]" align="start">
                      <Calendar
                        mode="single"
                        captionLayout="dropdown"
                        selected={form.dateOfBirth ?? undefined}
                        onSelect={d => { setForm(p => ({...p, dateOfBirth: d ?? null})); setDobOpen(false); }}
                        fromDate={new Date(1950, 0, 1)}
                        toDate={subDays(new Date(), 1)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}

            {currentTab === 1 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700">Current Job Title</Label>
                  <div className="relative group">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-primary transition-colors" />
                    <Input name="currentJobTitle" value={form.currentJobTitle} onChange={handleChange} placeholder="e.g. Senior Project Manager" className="pl-10 h-11 border-slate-200 font-bold" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-slate-700">Total Experience</Label>
                    <Input name="experience" value={form.experience} onChange={handleChange} placeholder="e.g. 8 years" className="h-11 border-slate-200 font-bold" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-slate-700">Relevant Experience</Label>
                    <Input name="totalRelevantExperience" value={form.totalRelevantExperience} onChange={handleChange} placeholder="e.g. 5 years" className="h-11 border-slate-200 font-bold" />
                  </div>
                </div>

                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                   <Label className="text-[10px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-primary" /> Salary Expectation
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex gap-2">
                      <Select value={form.expectedSalaryCurrency} onValueChange={v => handleSelectChange('expectedSalaryCurrency', v)}>
                        <SelectTrigger className="w-20 h-11 border-slate-200 bg-white font-bold"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {["SAR", "INR", "USD", "AED", "GBP", "EUR"].map(c => <SelectItem key={c} value={c} className="font-bold">{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Input name="expectedSalary" type="number" value={form.expectedSalary} onChange={handleChange} placeholder="Expected Salary" className="h-11 border-slate-200 bg-white font-bold" />
                    </div>
                    <div className="flex gap-2">
                       <Input name="noticePeriod" value={form.noticePeriod} onChange={handleChange} placeholder="Notice Period (e.g. 30 days)" className="h-11 border-slate-200 bg-white font-bold" />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700">Key Skills <span className="text-[10px] text-slate-400 font-bold ml-2">Press Enter</span></Label>
                  <div className="relative group">
                    <Plus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <Input value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={handleAddSkill} placeholder="Type skill and press Enter" className="pl-10 h-11 border-slate-200 font-bold focus:border-primary" />
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {form.skills.map(s => (
                      <span key={s} className="px-3 py-1 bg-primary/5 text-primary text-xs font-black rounded-full border border-primary/20 flex items-center gap-2">
                        {s} <X className="w-3 h-3 cursor-pointer hover:text-red-500" onClick={() => removeSkill(s)} />
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {currentTab === 2 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2 flex flex-col">
                    <Label className="text-sm font-bold text-slate-700 mb-1">Current Country</Label>
                    <CountrySelect value={form.country} onChange={v => handleSelectChange('country', v)} type="country" placeholder="Lives in..." />
                  </div>
                   <div className="space-y-2 flex flex-col">
                    <Label className="text-sm font-bold text-slate-700 mb-1">Nationality</Label>
                    <CountrySelect value={form.nationality} onChange={v => handleSelectChange('nationality', v)} type="nationality" placeholder="Passport from..." />
                    <Button variant="ghost" size="sm" onClick={() => handleSelectChange('nationality', "Open")} className="text-[10px] font-black text-primary px-0 w-fit h-fit uppercase">Mark as Open</Button>
                  </div>
                </div>

                <div className="space-y-2">
                   <Label className="text-sm font-bold text-slate-700">Education Background</Label>
                   <div className="relative group">
                    <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <Input name="educationDegree" value={form.educationDegree} onChange={handleChange} placeholder="e.g. Master's in Computer Science" className="pl-10 h-11 border-slate-200 font-bold" />
                  </div>
                  <Input name="universityName" value={form.universityName} onChange={handleChange} placeholder="University Name" className="h-11 border-slate-200 font-bold" />
                </div>

                <div className="grid grid-cols-2 gap-6 p-6 bg-slate-50 border border-slate-200 rounded-2xl">
                  <div className="space-y-2 flex flex-col">
                    <Label className="text-sm font-bold text-slate-700 mb-1">Continent</Label>
                    <CountrySelect value={form.continent} onChange={v => handleSelectChange('continent', v)} type="continent" placeholder="Select..." />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-slate-700">Willing to Relocate?</Label>
                    <Select value={form.willingToRelocate} onValueChange={v => handleSelectChange('willingToRelocate', v)}>
                      <SelectTrigger className="h-11 border-slate-200 bg-white font-bold"><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes" className="font-bold">Yes, Global</SelectItem>
                        <SelectItem value="no" className="font-bold">No, Static</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700">Candidate Summary</Label>
                  <div className="relative">
                    <FileText className="absolute right-4 top-4 w-4 h-4 text-slate-100" />
                    <textarea name="description" value={form.description} onChange={handleChange} rows={4} className="w-full p-4 border border-slate-200 rounded-xl font-medium text-sm focus:border-primary outline-none transition-all custom-scrollbar" placeholder="Briefly describe the candidate's main strengths..." />
                  </div>
                </div>
              </div>
            )}

            {currentTab === 3 && (
              <div className="space-y-8 h-full flex flex-col justify-center py-10">
                <div className="text-center space-y-2 mb-8">
                  <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-10 h-10 text-primary animate-bounce" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Final Step: Attach Resume</h3>
                  <p className="text-slate-400 font-semibold max-w-sm mx-auto">Upload the official CV to complete the professional profile.</p>
                </div>

                <div 
                  onClick={() => fileInputRef.current?.click()} 
                  className={cn(
                    "border-4 border-dashed rounded-[32px] p-12 text-center transition-all cursor-pointer group relative overflow-hidden",
                    form.cv ? "border-green-400 bg-green-50" : "border-slate-100 hover:border-primary hover:bg-primary/5 shadow-inner"
                  )}
                >
                  <input ref={fileInputRef} type="file" className="hidden" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.txt" onChange={handleFileChange} />
                  
                  {form.cv ? (
                    <div className="space-y-2">
                       <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto" />
                       <p className="text-lg font-black text-green-900 truncate px-4">{form.cv.name}</p>
                       <p className="text-sm font-bold text-green-600">File uploaded successfully! Click to change.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-center -space-x-2">
                        <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm group-hover:-translate-y-1 transition-transform"><FileText className="w-5 h-5 text-slate-400" /></div>
                        <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm z-10 group-hover:-translate-y-2 transition-transform duration-300"><FileText className="w-5 h-5 text-primary" /></div>
                        <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm group-hover:-translate-y-1 transition-transform"><FileText className="w-5 h-5 text-slate-400" /></div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xl font-black text-slate-800">Drop resume here</p>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">or click to browse library</p>
                      </div>
                      <div className="bg-white px-4 py-2 rounded-full inline-block text-[10px] font-black text-slate-400 border border-slate-100 shadow-sm uppercase tracking-tighter">
                        PDF, DOCX, TXT • Max 5MB
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-8 bg-slate-50 border-t flex flex-row items-center mt-auto shrink-0 transition-all">
          <div className="flex justify-between w-full h-11 items-center">
            <div className="flex gap-3">
              <Button variant="ghost" onClick={isSubmitting ? undefined : goBack} className="text-slate-500 font-bold hover:bg-slate-100">
                Cancel
              </Button>
              {currentTab > 0 && (
                <Button variant="outline" onClick={handlePrevious} className="border-slate-200 font-bold bg-white px-5 shadow-sm">
                  <ChevronLeft className="w-4 h-4 mr-2" /> Back
                </Button>
              )}
            </div>

            <div className="flex gap-3">
              {currentTab === TABS.length - 1 ? (
                <Button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting}
                  className="bg-primary hover:bg-primary/90 text-white px-10 font-black shadow-xl shadow-primary/30 h-11"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                  {isSubmitting ? "Onboarding..." : "Finalize Profile"}
                </Button>
              ) : (
                <Button 
                  onClick={handleNext} 
                  className="bg-primary hover:bg-primary/90 text-white px-8 font-black shadow-xl shadow-primary/30 h-11"
                >
                  Continue <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
