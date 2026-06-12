"use client";
import React, { useRef, useState } from "react";
import CandidateSummary from '@/components/candidates/summary/candidate-summary';
import { CandidateNotesContent } from '@/components/candidates/notes/notes-content';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SlidersHorizontal, RefreshCcw, Plus, FileText, Users, Briefcase, Star, Activity, StickyNote, Paperclip, Clock, User, FileIcon, FilePen, Mail, Phone, MapPin, Calendar, Check, Loader, ArrowLeft } from "lucide-react";
import { AttachmentsContent } from '@/components/candidates/attachments/attachments-content';
import { JobsContent, JobsContentRef } from '@/components/candidates/jobs/jobs-content';
import { AddToJobDialog } from '@/components/candidates/add-to-job-dialog';
import { candidateService } from '@/services/candidateService';
import { toast } from "sonner";
import { initializeAuth } from '@/lib/axios-config';
import { formatPhoneNumber } from "@/lib/countryCodes";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/contexts/PermissionContext";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

// Generate initials for candidate avatar
function getInitials(name: string = "") {
  const parts = name.trim().split(" ");
  if (parts.length === 0 || !parts[0]) return "?";
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Generate premium gradient based on candidate name
function getAvatarGradient(name: string = "") {
  const colors = [
    "from-[#4776E6] to-[#8E54E9]", // Royal Purple
    "from-[#8A2387] via-[#E94057] to-[#F27121]", // Sunset Magenta
    "from-[#00c6ff] to-[#0072ff]", // Cool Blue
    "from-[#ED5C6B] to-[#F57C59]", // Coral Orange (Matches "jjk" avatar in the design image)
    "from-[#11998e] to-[#38ef7d]", // Emerald Mint
    "from-[#FF416C] to-[#FF4B2B]", // Vibrant Rose
    "from-[#f12711] to-[#f5af19]", // Sunny Orange
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

interface Tab {
  label: string;
  icon: React.ReactNode;
}

interface Candidate {
  _id?: string;
  profileId?: string;
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  experience?: string;
  skills?: string[];
  resume?: string;
  status?: string;
  highestDegree?: string;
  graduation?: string;
  certification?: string;
  noticePeriod?: string;
}

export default function ClientCandidateTabs({ candidateId, tabs }: { candidateId: string, tabs: Tab[] }) {
  // All hooks must be called at the top level
  const [activeTab, setActiveTab] = useState("Summary");
  const jobsContentRef = useRef<JobsContentRef>(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const router = useRouter();
  
  const { data: candidate, isLoading, isError, error, refetch } = useQuery<Candidate | null, any>({
    queryKey: ["candidate", candidateId],
    enabled: !!candidateId,
    queryFn: async () => {
      await initializeAuth();
      return candidateService.getCandidateById(candidateId);
    },
  });

  // Mutation for updating candidate with optimistic cache update
  const updateCandidateMutation = useMutation({
    mutationFn: async ({ id, updatedCandidate }: { id: string; updatedCandidate: any }) => {
      await initializeAuth();
      return candidateService.updateCandidate(id, updatedCandidate);
    },
    onMutate: async ({ updatedCandidate }) => {
      await queryClient.cancelQueries({ queryKey: ["candidate", candidateId] });
      const previous = queryClient.getQueryData(["candidate", candidateId]);
      queryClient.setQueryData(["candidate", candidateId], (old: any) => ({ ...(old || {}), ...(updatedCandidate || {}) }));
      return { previous } as { previous: any };
    },
    onError: (err: any, _vars, context) => {
      if ((context as any)?.previous) {
        queryClient.setQueryData(["candidate", candidateId], (context as any).previous);
      }
      if (err?.response?.status === 401) {
        toast.error("Authentication failed. Please log in again.");
      } else {
        toast.error("Failed to update candidate");
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["candidate", candidateId] });
    },
  });

  // Permission checks after hooks
  const { hasPermission } = usePermissions();
  const isAdmin = user?.role === 'ADMIN';

  const canViewCandidates = isAdmin || hasPermission('candidates', 'view');
  const canModifyCandidates = isAdmin || hasPermission('candidates', 'create') || hasPermission('candidates', 'edit');
  const canDeleteCandidates = isAdmin || hasPermission('candidates', 'delete');

  if (!canViewCandidates) {
    return (
      <div className="min-h-[400px] font-sans w-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-muted-foreground text-lg mb-4">You do not have permission to view this candidate.</div>
        </div>
      </div>
    );
  }

  const handleRefresh = async () => {
    try {
      await initializeAuth();
      await refetch();
      toast.success("Data refreshed successfully");
    } catch (error) {
      console.error('Error refreshing candidate data:', error);
      toast.error("Failed to refresh data");
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center justify-center gap-2 flex-col">
          <RefreshCcw className="size-6 animate-spin" />
          <div className="text-center">Loading candidate data...</div>
        </div>
      </div>
    );
  }

  // Show error state
  if (isError || !candidate) {
    return (
      <div className="min-h-[400px] font-sans w-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-muted-foreground text-lg mb-4">{(error as any)?.message || 'Candidate not found.'}</div>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCcw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'interviewing':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      case 'offer':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-100';
      case 'rejected':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      default:
        return 'bg-muted text-foreground hover:bg-muted';
    }
  };

  const handleCandidateUpdate = async (updatedCandidate: any, fieldKey?: string) => {
    if (!canModifyCandidates) {
      toast.error('You do not have permission to modify candidate details.');
      return;
    }
    try {
      const id = candidate?._id;
      if (!id) throw new Error('Missing candidate id');

      let payload: any = {};
      if (fieldKey) {
        if (fieldKey === "phone") {
          payload.phone = updatedCandidate.phone;
          payload.countryCode = updatedCandidate.countryCode;
        } else if (fieldKey === "otherPhone") {
          payload.otherPhone = updatedCandidate.otherPhone;
          payload.otherCountryCode = updatedCandidate.otherCountryCode;
        } else {
          payload[fieldKey] = updatedCandidate[fieldKey];
        }
      } else {
        payload = updatedCandidate;
      }

      await updateCandidateMutation.mutateAsync({ id, updatedCandidate: payload });
      if (fieldKey) {
        const allFields = [
          { key: "name", label: "Candidate Name" },
          { key: "location", label: "Location" },
          { key: "experience", label: "Experience" },
          { key: "referredBy", label: "Referred By" },
          { key: "totalRelevantExperience", label: "Total Relevant Years of Experience" },
          { key: "noticePeriod", label: "Notice Period" },
          { key: "skills", label: "Skills" },
          { key: "resume", label: "Resume" },
          { key: "status", label: "Status" },
          { key: "gender", label: "Gender" },
          { key: "dateOfBirth", label: "Date of Birth" },
          { key: "maritalStatus", label: "Marital Status" },
          { key: "country", label: "Country" },
          { key: "nationality", label: "Nationality" },
          { key: "universityName", label: "University Name" },
          { key: "educationDegree", label: "Education Degree/Certificate" },
          { key: "highestDegree", label: "Highest Degree" },
          { key: "graduation", label: "Graduation Details" },
          { key: "certification", label: "Professional Certifications" },
          { key: "primaryLanguage", label: "Primary Language" },
          { key: "willingToRelocate", label: "Are you willing to relocate?" },
          { key: "iqama", label: "Iqama is transferable ?" },
          { key: "phone", label: "Phone Number" },
          { key: "email", label: "Email" },
          { key: "otherPhone", label: "Other Phone Number" },
          { key: "linkedin", label: "LinkedIn" },
          { key: "previousCompanyName", label: "Previous Company Name" },
          { key: "currentJobTitle", label: "Current Job Title" },
          { key: "reportingTo", label: "Reporting To" },
          { key: "totalStaffReporting", label: "Total Number of Staff Reporting to You" },
          { key: "softSkill", label: "Soft Skill" },
          { key: "technicalSkill", label: "Technical Skill" }
        ];
        const fieldLabel = allFields.find(field => field.key === fieldKey)?.label || fieldKey || 'Field';
        toast.success(`${fieldLabel} updated successfully`);
      }
    } catch (error) {
      console.error('Error updating candidate:', error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background font-sans">
      {/* Redesigned Premium Header Card Wrapper */}
      <div className="max-w-[1600px] mx-auto w-full px-6 pt-6">
        <div className="bg-card border border-border/60 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] relative overflow-hidden p-6">
          {/* Subtle decorative background gradient accent */}
          <div className="absolute top-0 right-0 w-80 h-32 bg-brand/5 blur-[80px] pointer-events-none rounded-full" />
          
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
            {/* Left Column: Avatar + Basic Info */}
            <div className="flex items-start gap-4 sm:gap-5 min-w-0">
              <div className={cn(
                "w-16 h-16 sm:w-20 sm:h-20 rounded-[20px] sm:rounded-[24px] flex items-center justify-center text-xl sm:text-2xl font-bold text-white shrink-0 bg-gradient-to-tr shadow-md select-none",
                getAvatarGradient(candidate.name)
              )}>
                {getInitials(candidate.name)}
              </div>
              
              <div className="space-y-3 min-w-0 flex-1">
                <div className="space-y-1">
                  {/* Name + Badges */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight leading-none truncate max-w-[280px] sm:max-w-[450px]">
                      {candidate.name || "Untitled Candidate"}
                    </h1>
                    
                    {candidate.profileId && (
                      <span className="bg-[#EEEDFC] text-[#553C9A] border border-[#D6D3F8] rounded-full px-3.5 py-0.5 text-xs font-bold font-mono leading-none">
                        # {candidate.profileId}
                      </span>
                    )}
                    
                    <span className={cn(
                      "border rounded-full px-2.5 py-0.5 text-xs font-semibold flex items-center gap-1 leading-none shrink-0",
                      candidate.status === "Placed" || candidate.status === "Active" || !candidate.status
                        ? "bg-[#EAF7EC] text-[#2E7D32] border-[#CEEAD6]"
                        : candidate.status === "Interviewing"
                        ? "bg-[#EBF3FC] text-[#0288D1] border-[#B3E5FC]"
                        : candidate.status === "Offer"
                        ? "bg-[#F3E5F5] text-[#7B1FA2] border-[#E1BEE7]"
                        : "bg-[#FDEDEC] text-[#D32F2F] border-[#FADBD8]"
                    )}>
                      <span className="w-3.5 h-3.5 rounded-full border border-current flex items-center justify-center shrink-0">
                        <Check className="w-2 h-2 stroke-[3]" />
                      </span>
                      {candidate.status || "Active"}
                    </span>
                  </div>

                  {/* Metadata Row */}
                  <div className="flex flex-wrap items-center gap-y-1 text-xs sm:text-sm font-medium text-muted-foreground">
                    <div className="flex items-center gap-1.5 hover:text-brand transition-colors cursor-pointer">
                      <MapPin className="h-4 w-4 text-muted-foreground/60" />
                      <span>{candidate.location || "Global"}</span>
                    </div>

                    <span className="text-muted-foreground/30 mx-2.5 select-none">|</span>

                    <div className="flex items-center gap-1.5">
                      <Briefcase className="h-4 w-4 text-muted-foreground/60" />
                      <span>{candidate.experience || "No experience info"}</span>
                    </div>

                    <span className="text-muted-foreground/30 mx-2.5 select-none">|</span>

                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-muted-foreground/60" />
                      <span>Updated just now</span>
                    </div>
                  </div>
                </div>

                {/* Quick Contact Links */}
                <div className="flex flex-wrap items-center gap-3">
                  {candidate.email && (
                    <a 
                      href={`mailto:${candidate.email}`} 
                      className="group flex items-center gap-2 text-xs sm:text-sm font-medium bg-[#F6F5EE] dark:bg-muted/30 border border-[#E9E7DC] dark:border-border/60 hover:border-slate-400/50 text-[#333] dark:text-foreground/90 rounded-xl px-4 py-2 transition-colors cursor-pointer"
                    >
                      <Mail className="h-4 w-4 text-[#555] dark:text-muted-foreground group-hover:text-foreground transition-colors" />
                      {candidate.email}
                    </a>
                  )}
                  {candidate.phone && (
                    <a 
                      href={`tel:${candidate.phone}`} 
                      className="group flex items-center gap-2 text-xs sm:text-sm font-medium bg-[#F6F5EE] dark:bg-muted/30 border border-[#E9E7DC] dark:border-border/60 hover:border-slate-400/50 text-[#333] dark:text-foreground/90 rounded-xl px-4 py-2 transition-colors cursor-pointer"
                    >
                      <Phone className="h-4 w-4 text-[#555] dark:text-muted-foreground group-hover:text-foreground transition-colors" />
                      {formatPhoneNumber(candidate.phone, (candidate as any).countryCode)}
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Actions */}
            <div className="flex items-center shrink-0 self-start md:self-center mt-2 md:mt-0">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={handleRefresh} 
                className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl border border-[#E2E8F0] dark:border-border bg-white dark:bg-background text-[#555] dark:text-muted-foreground hover:bg-muted shadow-sm flex items-center justify-center transition-all"
              >
                <RefreshCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Segmented Control Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="bg-card border-b border-border/60 sticky top-0 z-20 px-6 py-3">
          <TabsList className="inline-flex items-center h-11 p-1 bg-muted/80 rounded-2xl border border-border/50 shadow-inner max-w-full overflow-x-auto custom-scrollbar gap-1">
            {tabs.map((tab) => {
              const value = tab.label.replace(/\s+/g, "");
              return (
                <TabsTrigger
                  key={tab.label}
                  value={value}
                  className="data-[state=active]:bg-card data-[state=active]:text-brand data-[state=active]:shadow-md rounded-xl flex items-center gap-2 h-9 px-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-all duration-300 shrink-0"
                >
                  {tab.icon}
                  {tab.label}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        <TabsContent value="Summary" className="p-4">
          <CandidateSummary 
            candidate={candidate} 
            onCandidateUpdate={handleCandidateUpdate}
            canModify={canModifyCandidates}
          />
        </TabsContent>

        <TabsContent value="Jobs">
          <JobsContent 
            ref={jobsContentRef}
            candidateId={candidateId} 
            candidateName={candidate.name || "Unknown Candidate"} 
          />
        </TabsContent>

        <TabsContent value="Activities" className="p-4">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Recent Activities</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="font-medium">Phone call scheduled</p>
                  <p className="text-sm text-foreground">Scheduled for tomorrow at 2:00 PM</p>
                </div>
                <span className="text-xs text-muted-foreground ml-auto">2 hours ago</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <p className="font-medium">Resume uploaded</p>
                  <p className="text-sm text-foreground">Updated resume received</p>
                </div>
                <span className="text-xs text-muted-foreground ml-auto">1 day ago</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div>
                  <p className="font-medium">Initial contact</p>
                  <p className="text-sm text-foreground">First email sent</p>
                </div>
                <span className="text-xs text-muted-foreground ml-auto">3 days ago</span>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="Notes" className="p-4">
          <CandidateNotesContent candidateId={candidateId} canModify={canModifyCandidates}/>
        </TabsContent>

        <TabsContent value="Attachments" className="p-4">
          <AttachmentsContent candidateId={candidateId} canModify={canModifyCandidates} />
        </TabsContent>

        <TabsContent value="ClientTeam" className="p-4">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Assigned Team Members</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-foreground" />
                </div>
                <div>
                  <p className="font-medium">Recruiter</p>
                  <p className="text-sm text-foreground">Assigned to: {user?.name || 'Unassigned'}</p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="Contacts" className="p-4">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Information</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Mail className="w-5 h-5 text-foreground" />
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-sm text-foreground">{candidate.email || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Phone className="w-5 h-5 text-foreground" />
                <div>
                  <p className="font-medium">Phone</p>
                  <p className="text-sm text-foreground">{formatPhoneNumber(candidate.phone, (candidate as any).countryCode) || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <MapPin className="w-5 h-5 text-foreground" />
                <div>
                  <p className="font-medium">Location</p>
                  <p className="text-sm text-foreground">{candidate.location || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="History" className="p-4">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Candidate History</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Calendar className="w-5 h-5 text-foreground" />
                <div>
                  <p className="font-medium">Added to system</p>
                  <p className="text-sm text-foreground">Candidate profile created</p>
                </div>
                <span className="text-xs text-muted-foreground ml-auto">Jan 10, 2024</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Calendar className="w-5 h-5 text-foreground" />
                <div>
                  <p className="font-medium">Status updated</p>
                  <p className="text-sm text-foreground">Changed to {candidate.status || 'Unknown'}</p>
                </div>
                <span className="text-xs text-muted-foreground ml-auto">Jan 12, 2024</span>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 