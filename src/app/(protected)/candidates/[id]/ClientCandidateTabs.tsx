"use client";
import React, { useRef, useState } from "react";
import CandidateSummary from '@/components/candidates/summary/candidate-summary';
import { CandidateNotesContent } from '@/components/candidates/notes/notes-content';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SlidersHorizontal, RefreshCcw, Plus, FileText, Users, Briefcase, Star, Activity, StickyNote, Paperclip, Clock, User, FileIcon, FilePen, Mail, Phone, MapPin, Calendar,Loader  } from "lucide-react";
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

interface Tab {
  label: string;
  icon: React.ReactNode;
}

interface Candidate {
  _id?: string;
  profileId?: string
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  experience?: string;
  skills?: string[];
  resume?: string;
  status?: string;
}

export default function ClientCandidateTabs({ candidateId, tabs }: { candidateId: string, tabs: Tab[] }) {
  // All hooks must be called at the top level
  const [activeTab, setActiveTab] = useState("Summary");
  const jobsContentRef = useRef<JobsContentRef>(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
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
          <div className="text-gray-500 text-lg mb-4">You do not have permission to view this candidate.</div>
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
          <div className="text-gray-500 text-lg mb-4">{(error as any)?.message || 'Candidate not found.'}</div>
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
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
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
      await updateCandidateMutation.mutateAsync({ id, updatedCandidate });
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
    <div className="flex flex-col h-full bg-white">
      {/* Header Section (Matching Jobs ID page) */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{candidate.name || "Untitled Candidate"}</h1>
                  <span className="text-xl text-slate-400 font-medium font-mono">#{candidate.profileId || "—"}</span>
                </div>
                <Badge
                  variant="secondary"
                  className={cn(
                    "border-none px-3 py-1 text-xs font-semibold uppercase tracking-wider",
                    candidate.status === "Placed" ? "bg-green-100 text-green-800" :
                    candidate.status === "Interviewing" ? "bg-orange-100 text-orange-800" :
                    "bg-gray-100 text-gray-800"
                  )}
                >
                  {candidate.status || "New"}
                </Badge>
              </div>
              
              <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm text-slate-500">
                <div className="flex items-center gap-2 group cursor-pointer hover:text-brand transition-colors">
                  <div className="p-1.5 bg-slate-100 rounded-md group-hover:bg-brand/10 transition-colors">
                    <MapPin className="h-4 w-4 text-slate-400 group-hover:text-brand" />
                  </div>
                  <span className="font-medium text-slate-700">{candidate.location || "No location"}</span>
                </div>

                <div className="flex items-center gap-2 group border-l border-slate-200 pl-6">
                  <div className="p-1.5 bg-slate-100 rounded-md">
                    <Briefcase className="h-4 w-4 text-slate-400" />
                  </div>
                  <span>{candidate.experience || "No experience info"}</span>
                </div>

                <div className="flex items-center gap-2 border-l border-slate-200 pl-6">
                  <div className="p-1.5 bg-slate-100 rounded-md">
                    <Loader className="h-4 w-4 text-brand" />
                  </div>
                  <span className="text-slate-400">Last updated: Just now</span>
                </div>
              </div>

              {/* Quick Contact Links */}
              <div className="flex items-center gap-4 mt-2">
                {candidate.email && (
                  <a href={`mailto:${candidate.email}`} className="group flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-brand transition-colors">
                    <div className="h-7 w-7 rounded-lg bg-slate-50 group-hover:bg-brand/10 flex items-center justify-center transition-all">
                      <Mail className="h-3.5 w-3.5" />
                    </div>
                    {candidate.email}
                  </a>
                )}
                {candidate.phone && (
                  <a href={`tel:${candidate.phone}`} className="group flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-brand transition-colors">
                    <div className="h-7 w-7 rounded-lg bg-slate-50 group-hover:bg-brand/10 flex items-center justify-center transition-all">
                      <Phone className="h-3.5 w-3.5" />
                    </div>
                    {formatPhoneNumber(candidate.phone, (candidate as any).countryCode)}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

     

      {/* Modern Segmented Control Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="bg-white border-b border-slate-200/60 sticky top-0 z-20 px-6 py-3">
          <TabsList className="inline-flex items-center h-12 p-1 bg-slate-100/80 rounded-2xl border border-slate-200/50 shadow-inner">
            <TabsTrigger
              value="Summary"
              className="data-[state=active]:bg-white data-[state=active]:text-brand data-[state=active]:shadow-md rounded-xl flex items-center gap-2.5 h-10 px-6 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-700 transition-all duration-300"
            >
              <FileIcon className="h-4 w-4" />
              Summary
            </TabsTrigger>

            <TabsTrigger
              value="Jobs"
              className="data-[state=active]:bg-white data-[state=active]:text-brand data-[state=active]:shadow-md rounded-xl flex items-center gap-2.5 h-10 px-6 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-700 transition-all duration-300"
            >
              <Briefcase className="h-4 w-4" />
              Jobs
            </TabsTrigger>

            <TabsTrigger
              value="Notes"
              className="data-[state=active]:bg-white data-[state=active]:text-brand data-[state=active]:shadow-md rounded-xl flex items-center gap-2.5 h-10 px-6 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-700 transition-all duration-300"
            >
              <StickyNote className="h-4 w-4" />
              Notes
            </TabsTrigger>

            <TabsTrigger
              value="Attachments"
              className="data-[state=active]:bg-white data-[state=active]:text-brand data-[state=active]:shadow-md rounded-xl flex items-center gap-2.5 h-10 px-6 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-700 transition-all duration-300"
            >
              <Paperclip className="h-4 w-4" />
              Attachments
            </TabsTrigger>
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
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="font-medium">Phone call scheduled</p>
                  <p className="text-sm text-gray-600">Scheduled for tomorrow at 2:00 PM</p>
                </div>
                <span className="text-xs text-gray-500 ml-auto">2 hours ago</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <p className="font-medium">Resume uploaded</p>
                  <p className="text-sm text-gray-600">Updated resume received</p>
                </div>
                <span className="text-xs text-gray-500 ml-auto">1 day ago</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div>
                  <p className="font-medium">Initial contact</p>
                  <p className="text-sm text-gray-600">First email sent</p>
                </div>
                <span className="text-xs text-gray-500 ml-auto">3 days ago</span>
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
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium">Recruiter</p>
                  <p className="text-sm text-gray-600">Assigned to: {user?.name || 'Unassigned'}</p>
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
                <Mail className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-sm text-gray-600">{candidate.email || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Phone className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium">Phone</p>
                  <p className="text-sm text-gray-600">{formatPhoneNumber(candidate.phone, (candidate as any).countryCode) || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <MapPin className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium">Location</p>
                  <p className="text-sm text-gray-600">{candidate.location || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="History" className="p-4">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Candidate History</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Calendar className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium">Added to system</p>
                  <p className="text-sm text-gray-600">Candidate profile created</p>
                </div>
                <span className="text-xs text-gray-500 ml-auto">Jan 10, 2024</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Calendar className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium">Status updated</p>
                  <p className="text-sm text-gray-600">Changed to {candidate.status || 'Unknown'}</p>
                </div>
                <span className="text-xs text-gray-500 ml-auto">Jan 12, 2024</span>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 