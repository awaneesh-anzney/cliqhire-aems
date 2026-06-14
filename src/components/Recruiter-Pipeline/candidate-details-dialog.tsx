"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MapPin, 
  Mail, 
  Phone, 
  Briefcase, 
  Building2, 
  DollarSign, 
  Calendar,
  GraduationCap,
  Languages,
  Award,
  FileText,
  Globe,
  Check
} from "lucide-react";
import { type Candidate, pipelineStages } from "./dummy-data";
import { candidateService, type Candidate as ApiCandidate } from "@/services/candidateService";
import { PipelineStageDetails } from "./pipeline-stage-details/PipelineStageDetails";
import { CandidateProgressCard } from "./candidate-details/CandidateProgressCard";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/contexts/PermissionContext";

interface CandidateDetailsDialogProps {
  candidate: Candidate | null;
  isOpen: boolean;
  onClose: () => void;
  pipelineId?: string;
  onCandidateUpdate?: (updatedCandidate: Candidate) => void;
}

export function CandidateDetailsDialog({ 
  candidate, 
  isOpen, 
  onClose,
  pipelineId,
  onCandidateUpdate
}: CandidateDetailsDialogProps) {
  const { user } = useAuth();
  const { hasPermission } = usePermissions();
  const isAdmin = user?.role === 'ADMIN';
  const canModifyPipeline = isAdmin || hasPermission('pipeline', 'edit');
  const [selectedStage, setSelectedStage] = useState<string | undefined>(undefined);
  const [localCandidate, setLocalCandidate] = useState<any>(candidate);
  
  // Reset state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedStage(undefined);
    }
  }, [isOpen]);

  // Update local candidate when prop changes
  useEffect(() => {
    setLocalCandidate(candidate);
  }, [candidate]);

  const handleUpdateCandidate = (updatedCandidate: any) => {
    setLocalCandidate(updatedCandidate);
    // Notify parent component about the update
    onCandidateUpdate?.(updatedCandidate);
  };

  if (!localCandidate) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-50 to-white">
        <DialogHeader className="pb-6">
                      <div className="flex items-center space-x-6 mb-8">
              <div className="relative">
                <Avatar className="h-20 w-20 ring-4 ring-blue-100 shadow-lg">
                  <AvatarImage src={localCandidate.avatar} />
                  <AvatarFallback className="text-xl font-semibold bg-gradient-to-br from-blue-100 to-blue-200 text-white">
                    {localCandidate.name ? localCandidate.name.split(' ').map((n: string) => n[0]).join('') : 'NA'}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                  <div className="w-2 h-2 bg-card rounded-full"></div>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <DialogTitle className="text-2xl font-bold text-foreground">
                    {localCandidate.name || 'Unknown Candidate'}
                  </DialogTitle>
                  {localCandidate.isTempCandidate && (
                    <Badge variant="destructive" className="text-xs px-2 py-0.5">
                      TEMP
                    </Badge>
                  )}
                </div>
                <DialogDescription className="text-lg text-foreground font-medium">
                  {localCandidate.currentJobTitle || "Professional"}
                </DialogDescription>
                <div className="flex items-center space-x-4 mt-2">
                  <Badge 
                    variant="outline" 
                    className={`font-medium ${
                      localCandidate.status === 'Disqualified'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}
                  >
                    {localCandidate.status === 'Disqualified' 
                      ? (localCandidate.disqualified?.disqualificationStage || localCandidate.currentStage)
                      : localCandidate.currentStage
                    }
                  </Badge>
                  <span className="text-sm text-muted-foreground">•</span>
                  <span className="text-sm text-muted-foreground">{localCandidate.source}</span>
                </div>
              </div>
            </div>
          
                   {/* Pipeline Progress Bar */}
            <CandidateProgressCard
              candidate={localCandidate}
              selectedStage={selectedStage}
              setSelectedStage={setSelectedStage}
              stages={pipelineStages}
            />

           {/* Disqualification Details - Show for all disqualified candidates */}
           {(() => {
             if (localCandidate.status === 'Disqualified') {
               return (
             <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-6">
               <div className="flex items-center mb-4">
                 <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                   <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                   </svg>
                 </div>
                 <h4 className="text-lg font-semibold text-red-900">Disqualification Details</h4>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* Row 1 */}
                 <div className="flex items-start space-x-3">
                   <div className="w-6 h-6 bg-red-100 rounded-md flex items-center justify-center flex-shrink-0">
                     <Briefcase className="h-3 w-3 text-red-600" />
                   </div>
                   <div>
                     <p className="text-sm font-medium text-red-900">Disqualified Stage</p>
                     <p className="text-sm text-red-700">{localCandidate.disqualified?.disqualificationStage || localCandidate.currentStage || 'Not specified'}</p>
                   </div>
                 </div>
                 
                 <div className="flex items-start space-x-3">
                   <div className="w-6 h-6 bg-red-100 rounded-md flex items-center justify-center flex-shrink-0">
                     <Check className="h-3 w-3 text-red-600" />
                   </div>
                   <div>
                     <p className="text-sm font-medium text-red-900">Disqualification Status</p>
                     <p className="text-sm text-red-700">
                       {(() => {
                         return localCandidate.disqualified?.disqualificationStatus || 'Not specified';
                       })()}
                     </p>
                   </div>
                 </div>
                 
                 {/* Row 2 */}
                 <div className="flex items-start space-x-3">
                   <div className="w-6 h-6 bg-red-100 rounded-md flex items-center justify-center flex-shrink-0">
                     <FileText className="h-3 w-3 text-red-600" />
                   </div>
                   <div>
                     <p className="text-sm font-medium text-red-900">Reason</p>
                     <p className="text-sm text-red-700">{localCandidate.disqualified?.disqualificationReason || localCandidate.notes || 'Not specified'}</p>
                   </div>
                 </div>

                 {/* Row 3 */}
                 <div className="flex items-start space-x-3">
                   <div className="w-6 h-6 bg-red-100 rounded-md flex items-center justify-center flex-shrink-0">
                     <FileText className="h-3 w-3 text-red-600" />
                   </div>
                   <div>
                     <p className="text-sm font-medium text-red-900">Disqualification Feedback</p>
                     <p className="text-sm text-red-700">{localCandidate.disqualified?.disqualificationFeedback || 'Not specified'}</p>
                   </div>
                 </div>
                 
                 <div className="flex items-start space-x-3">
                   <div className="w-6 h-6 bg-red-100 rounded-md flex items-center justify-center flex-shrink-0">
                     <Calendar className="h-3 w-3 text-red-600" />
                   </div>
                   <div>
                     <p className="text-sm font-medium text-red-900">Disqualification Date</p>
                     <p className="text-sm text-red-700">
                       {localCandidate.disqualified?.disqualificationDate 
                         ? new Date(localCandidate.disqualified.disqualificationDate).toLocaleDateString('en-US', {
                             year: 'numeric',
                             month: 'long',
                             day: 'numeric',
                             hour: '2-digit',
                             minute: '2-digit'
                           })
                         : 'Not specified'
                       }
                     </p>
                   </div>
                 </div>
               </div>
             </div>
               );
             }
             return null;
           })()}
           
           {/* Pipeline Stage Details */}
           <div className="mt-6">
             <PipelineStageDetails 
               candidate={localCandidate}
               selectedStage={selectedStage}
               onStageSelect={setSelectedStage}
               onUpdateCandidate={handleUpdateCandidate}
               pipelineId={pipelineId}
               canModify={canModifyPipeline}
             />
           </div>
        </DialogHeader>

                 {candidate && (
           <div className="space-y-8">
            {/* Current Status */}
            {/* <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-foreground">Current Status</h3>
              <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                {candidate.currentStage}
              </Badge>
            </div> */}

                         {/* Basic Information */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
                 <h4 className="font-semibold text-foreground mb-4 flex items-center">
                   <Briefcase className="h-5 w-5 text-blue-500 mr-2" />
                   Basic Information
                 </h4>
                 
                 <div className="space-y-4">
                   <div className="flex items-start space-x-3">
                     <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                       <Briefcase className="h-4 w-4 text-blue-600" />
                     </div>
                     <div>
                       <p className="text-sm font-medium text-foreground">Current Position</p>
                       <p className="text-sm text-foreground">{candidate.currentJobTitle || "Not specified"}</p>
                     </div>
                   </div>
                   
                   <div className="flex items-start space-x-3">
                     <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                       <Building2 className="h-4 w-4 text-indigo-600" />
                     </div>
                     <div>
                       <p className="text-sm font-medium text-foreground">Previous Company</p>
                       <p className="text-sm text-foreground">{candidate.previousCompanyName || "Not specified"}</p>
                     </div>
                   </div>
                   
                   <div className="flex items-start space-x-3">
                     <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                       <Calendar className="h-4 w-4 text-green-600" />
                     </div>
                     <div>
                       <p className="text-sm font-medium text-foreground">Experience</p>
                       <p className="text-sm text-foreground">{candidate.experience || "Not specified"}</p>
                     </div>
                   </div>
                 </div>
               </div>

               <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
                 <h4 className="font-semibold text-foreground mb-4 flex items-center">
                   <Mail className="h-5 w-5 text-red-500 mr-2" />
                   Contact Information
                 </h4>
                 
                 <div className="space-y-4">
                   <div className="flex items-start space-x-3">
                     <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                       <Mail className="h-4 w-4 text-red-600" />
                     </div>
                     <div>
                       <p className="text-sm font-medium text-foreground">Email</p>
                       <p className="text-sm text-foreground">{candidate.email || "Not provided"}</p>
                     </div>
                   </div>
                   
                   <div className="flex items-start space-x-3">
                     <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                       <Phone className="h-4 w-4 text-green-600" />
                     </div>
                     <div>
                       <p className="text-sm font-medium text-foreground">Phone</p>
                       <p className="text-sm text-foreground">{candidate.phone || "Not provided"}</p>
                     </div>
                   </div>
                   
                   <div className="flex items-start space-x-3">
                     <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0">
                       <MapPin className="h-4 w-4 text-orange-600" />
                     </div>
                     <div>
                       <p className="text-sm font-medium text-foreground">Location</p>
                       <p className="text-sm text-foreground">{candidate.location || "Not specified"}</p>
                     </div>
                   </div>
                 </div>
               </div>

               <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
                 <h4 className="font-semibold text-foreground mb-4 flex items-center">
                   <Award className="h-5 w-5 text-purple-500 mr-2" />
                   Additional Information
                 </h4>
                 
                 <div className="space-y-4">
                   <div className="flex items-start space-x-3">
                     <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                       <GraduationCap className="h-4 w-4 text-purple-600" />
                     </div>
                     <div>
                       <p className="text-sm font-medium text-foreground">Education</p>
                       <p className="text-sm text-foreground">{candidate.educationDegree || "Not specified"}</p>
                     </div>
                   </div>
                   
                   <div className="flex items-start space-x-3">
                     <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                       <Languages className="h-4 w-4 text-blue-600" />
                     </div>
                     <div>
                       <p className="text-sm font-medium text-foreground">Languages</p>
                       <p className="text-sm text-foreground">{candidate.primaryLanguage || "Not specified"}</p>
                     </div>
                   </div>
                   
                   <div className="flex items-start space-x-3">
                     <div className="w-8 h-8 bg-yellow-50 rounded-lg flex items-center justify-center flex-shrink-0">
                       <Award className="h-4 w-4 text-yellow-600" />
                     </div>
                     <div>
                       <p className="text-sm font-medium text-foreground">Skills</p>
                       <p className="text-sm text-foreground">{candidate.skills?.join(', ') || "Not specified"}</p>
                     </div>
                   </div>
                   
                   
                 </div>
               </div>
             </div>

            



                         {/* Description */}
             {candidate.description && (
               <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
                 <h4 className="font-semibold text-foreground mb-4 flex items-center">
                   <FileText className="h-5 w-5 text-muted-foreground mr-2" />
                   Description
                 </h4>
                 <div className="bg-muted p-4 rounded-lg border border-border">
                   <p className="text-sm text-foreground leading-relaxed">{candidate.description}</p>
                 </div>
               </div>
             )}

             {/* Resume/CV Link */}
             {candidate.resume && (
               <div className="bg-card rounded-xl p-4 shadow-sm border border-border">
                 <h4 className="font-semibold text-foreground mb-4 flex items-center">
                   <FileText className="h-5 w-5 text-blue-500 mr-2" />
                   Documents
                 </h4>
                 <div className="flex items-center space-x-3">
                   <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                     <FileText className="h-4 w-4 text-blue-600" />
                   </div>
                   <a 
                     href={candidate.resume} 
                     target="_blank" 
                     rel="noopener noreferrer"
                     className="text-blue-600 hover:text-blue-800 text-sm font-medium underline hover:no-underline transition-all duration-200"
                   >
                     View Resume/CV
                   </a>
                 </div>
               </div>
             )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
