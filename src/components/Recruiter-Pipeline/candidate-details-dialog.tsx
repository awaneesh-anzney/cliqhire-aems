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
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <DialogTitle className="text-2xl font-bold text-gray-900">
                    {localCandidate.name || 'Unknown Candidate'}
                  </DialogTitle>
                  {localCandidate.isTempCandidate && (
                    <Badge variant="destructive" className="text-xs px-2 py-0.5">
                      TEMP
                    </Badge>
                  )}
                </div>
                <DialogDescription className="text-lg text-gray-600 font-medium">
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
                  <span className="text-sm text-gray-500">•</span>
                  <span className="text-sm text-gray-500">{localCandidate.source}</span>
                </div>
              </div>
            </div>
          
                     {/* Pipeline Progress Bar */}
           <div className="w-full bg-gradient-to-r from-sky-200 to-indigo-200 rounded-xl p-2 shadow-sm border border-gray-100">
             <div className="flex items-center justify-between mb-4">
               <h4 className="text-lg font-semibold text-gray-900">Pipeline Progress</h4>
               <div className="flex items-center space-x-4">
                 <span className="text-xs text-gray-500 italic">Click any stage to view details</span>
                 <div className="flex items-center space-x-2">
                   <div className={`w-2 h-2 rounded-full ${localCandidate.status === 'Disqualified' ? 'bg-red-500' : 'bg-indigo-500 animate-pulse'}`}></div>
                   <span className="text-sm text-gray-600">
                     {localCandidate.status === 'Disqualified' 
                       ? (localCandidate.disqualified?.disqualificationStage || 'Disqualified')
                       : (localCandidate.status || 'No Status')
                     }
                   </span>
                 </div>
               </div>
             </div>
             <div className="relative">
               {/* Progress Bar Background */}
               <div className="w-full h-10 bg-gray-100 rounded-full relative overflow-hidden shadow-inner hover:shadow-md transition-shadow duration-200">
                 {/* Progress Bar Fill */}
                 <div 
                   className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ease-out shadow-sm ${
                     localCandidate.status === 'Disqualified' 
                       ? 'bg-gradient-to-r from-red-300 to-red-400' 
                       : 'bg-gradient-to-r from-blue-300 to-blue-400'
                   }`}
                   style={{ 
                     width: `${(() => {
                       if (localCandidate.status === 'Disqualified') {
                         // For disqualified candidates, show progress up to the disqualification stage or current stage
                         const disqualificationStage = localCandidate.disqualified?.disqualificationStage || localCandidate.currentStage;
                         return ((pipelineStages.indexOf(disqualificationStage) + 1) / pipelineStages.length) * 100;
                       }
                       return ((pipelineStages.indexOf(localCandidate.currentStage) + 1) / pipelineStages.length) * 100;
                     })()}%` 
                   }}
                 ></div>
                 
                 {/* Stage Names Inside Progress Bar */}
                 <div className="absolute inset-0 flex items-center justify-between px-4">
                   {pipelineStages.map((stage, index) => {
                     // For disqualified candidates, show completed stages up to disqualification stage or current stage
                     const disqualificationStage = localCandidate.disqualified?.disqualificationStage || localCandidate.currentStage;
                     const isDisqualified = localCandidate.status === 'Disqualified';
                     
                     let isCompleted, isCurrent, isPrevious;
                     if (isDisqualified) {
                       const disqualificationIndex = pipelineStages.indexOf(disqualificationStage);
                       isCompleted = disqualificationIndex >= index;
                       isCurrent = disqualificationStage === stage;
                       isPrevious = disqualificationIndex >= index; // All completed stages are clickable
                     } else {
                       const currentIndex = pipelineStages.indexOf(localCandidate.currentStage);
                       isCompleted = currentIndex >= index;
                       isCurrent = localCandidate.currentStage === stage;
                       isPrevious = currentIndex >= index; // All completed stages are clickable
                     }
                     
                     const isSelected = selectedStage === stage;
                     const isClickable = isCompleted; // All completed stages (current + previous) are clickable
                     
                     return (
                       <div 
                         key={stage} 
                         className={`flex items-center ${isClickable ? 'cursor-pointer group' : 'cursor-default'}`}
                         onClick={() => isClickable ? setSelectedStage(stage) : undefined}
                       >
                         <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-2 shadow-sm transition-all duration-200 ${
                           isCompleted 
                             ? isDisqualified 
                               ? 'bg-white text-red-500 ring-2 ring-red-200' 
                               : 'bg-white text-blue-500 ring-2 ring-blue-200'
                             : 'bg-gray-200 text-gray-400'
                         } ${isSelected ? (isDisqualified ? 'ring-4 ring-red-300 scale-110' : 'ring-4 ring-blue-300 scale-110') : ''} `}>
                           {isCompleted && <Check className="h-3 w-3" />}
                         </div>
                         <span className={`text-xs font-semibold transition-all duration-200 ${
                           isCurrent ? 'text-white drop-shadow-sm' : isCompleted ? 'text-white drop-shadow-sm' : 'text-gray-500'
                         } ${isSelected ? (isDisqualified ? 'text-red-100 font-bold' : 'text-blue-100 font-bold') : ''} `}>
                           {stage}
                         </span>
                       </div>
                     );
                   })}
                 </div>
               </div>
             </div>
           </div>

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
              <h3 className="text-lg font-medium text-gray-900">Current Status</h3>
              <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                {candidate.currentStage}
              </Badge>
            </div> */}

                         {/* Basic Information */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                 <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                   <Briefcase className="h-5 w-5 text-blue-500 mr-2" />
                   Basic Information
                 </h4>
                 
                 <div className="space-y-4">
                   <div className="flex items-start space-x-3">
                     <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                       <Briefcase className="h-4 w-4 text-blue-600" />
                     </div>
                     <div>
                       <p className="text-sm font-medium text-gray-900">Current Position</p>
                       <p className="text-sm text-gray-600">{candidate.currentJobTitle || "Not specified"}</p>
                     </div>
                   </div>
                   
                   <div className="flex items-start space-x-3">
                     <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                       <Building2 className="h-4 w-4 text-indigo-600" />
                     </div>
                     <div>
                       <p className="text-sm font-medium text-gray-900">Previous Company</p>
                       <p className="text-sm text-gray-600">{candidate.previousCompanyName || "Not specified"}</p>
                     </div>
                   </div>
                   
                   <div className="flex items-start space-x-3">
                     <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                       <Calendar className="h-4 w-4 text-green-600" />
                     </div>
                     <div>
                       <p className="text-sm font-medium text-gray-900">Experience</p>
                       <p className="text-sm text-gray-600">{candidate.experience || "Not specified"}</p>
                     </div>
                   </div>
                 </div>
               </div>

               <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                 <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                   <Mail className="h-5 w-5 text-red-500 mr-2" />
                   Contact Information
                 </h4>
                 
                 <div className="space-y-4">
                   <div className="flex items-start space-x-3">
                     <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                       <Mail className="h-4 w-4 text-red-600" />
                     </div>
                     <div>
                       <p className="text-sm font-medium text-gray-900">Email</p>
                       <p className="text-sm text-gray-600">{candidate.email || "Not provided"}</p>
                     </div>
                   </div>
                   
                   <div className="flex items-start space-x-3">
                     <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                       <Phone className="h-4 w-4 text-green-600" />
                     </div>
                     <div>
                       <p className="text-sm font-medium text-gray-900">Phone</p>
                       <p className="text-sm text-gray-600">{candidate.phone || "Not provided"}</p>
                     </div>
                   </div>
                   
                   <div className="flex items-start space-x-3">
                     <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0">
                       <MapPin className="h-4 w-4 text-orange-600" />
                     </div>
                     <div>
                       <p className="text-sm font-medium text-gray-900">Location</p>
                       <p className="text-sm text-gray-600">{candidate.location || "Not specified"}</p>
                     </div>
                   </div>
                 </div>
               </div>

               <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                 <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                   <Award className="h-5 w-5 text-purple-500 mr-2" />
                   Additional Information
                 </h4>
                 
                 <div className="space-y-4">
                   <div className="flex items-start space-x-3">
                     <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                       <GraduationCap className="h-4 w-4 text-purple-600" />
                     </div>
                     <div>
                       <p className="text-sm font-medium text-gray-900">Education</p>
                       <p className="text-sm text-gray-600">{candidate.educationDegree || "Not specified"}</p>
                     </div>
                   </div>
                   
                   <div className="flex items-start space-x-3">
                     <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                       <Languages className="h-4 w-4 text-blue-600" />
                     </div>
                     <div>
                       <p className="text-sm font-medium text-gray-900">Languages</p>
                       <p className="text-sm text-gray-600">{candidate.primaryLanguage || "Not specified"}</p>
                     </div>
                   </div>
                   
                   <div className="flex items-start space-x-3">
                     <div className="w-8 h-8 bg-yellow-50 rounded-lg flex items-center justify-center flex-shrink-0">
                       <Award className="h-4 w-4 text-yellow-600" />
                     </div>
                     <div>
                       <p className="text-sm font-medium text-gray-900">Skills</p>
                       <p className="text-sm text-gray-600">{candidate.skills?.join(', ') || "Not specified"}</p>
                     </div>
                   </div>
                   
                   
                 </div>
               </div>
             </div>

            



                         {/* Description */}
             {candidate.description && (
               <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                 <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                   <FileText className="h-5 w-5 text-gray-500 mr-2" />
                   Description
                 </h4>
                 <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                   <p className="text-sm text-gray-700 leading-relaxed">{candidate.description}</p>
                 </div>
               </div>
             )}

             {/* Resume/CV Link */}
             {candidate.resume && (
               <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                 <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
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
