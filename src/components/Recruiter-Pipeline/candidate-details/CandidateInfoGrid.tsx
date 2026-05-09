import React from "react";
import { Briefcase, Building2, Calendar, Mail, Phone, MapPin, GraduationCap, Languages, Award } from "lucide-react";
import { type Candidate } from "@/components/Recruiter-Pipeline/dummy-data";

export function CandidateInfoGrid({ candidate }: { candidate: Candidate }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-card rounded-xl p-4 shadow-sm border border-border/60">
        <h4 className="font-semibold text-foreground text-sm mb-3 flex items-center">
          <Briefcase className="h-4 w-4 text-blue-500 mr-2" />
          Basic Information
        </h4>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-7 h-7 bg-blue-50/50 rounded-md flex items-center justify-center shrink-0 border border-blue-100">
              <Briefcase className="h-3.5 w-3.5 text-blue-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Current Position</p>
              <p className="text-xs text-foreground font-medium">{candidate.currentJobTitle || "Not specified"}</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-7 h-7 bg-indigo-50/50 rounded-md flex items-center justify-center shrink-0 border border-indigo-100">
              <Building2 className="h-3.5 w-3.5 text-indigo-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Previous Company</p>
              <p className="text-xs text-foreground font-medium">{candidate.previousCompanyName || "Not specified"}</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-7 h-7 bg-emerald-50/50 rounded-md flex items-center justify-center shrink-0 border border-emerald-100">
              <Calendar className="h-3.5 w-3.5 text-emerald-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Experience</p>
              <p className="text-xs text-foreground font-medium">{candidate.experience || "Not specified"}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl p-4 shadow-sm border border-border/60">
        <h4 className="font-semibold text-foreground text-sm mb-3 flex items-center">
          <Mail className="h-4 w-4 text-rose-500 mr-2" />
          Contact Information
        </h4>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-7 h-7 bg-rose-50/50 rounded-md flex items-center justify-center shrink-0 border border-rose-100">
              <Mail className="h-3.5 w-3.5 text-rose-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Email</p>
              <p className="text-xs text-foreground font-medium">{candidate.email || "Not provided"}</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-7 h-7 bg-green-50/50 rounded-md flex items-center justify-center shrink-0 border border-green-100">
              <Phone className="h-3.5 w-3.5 text-green-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Phone</p>
              <p className="text-xs text-foreground font-medium">{candidate.phone || "Not provided"}</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-7 h-7 bg-orange-50/50 rounded-md flex items-center justify-center shrink-0 border border-orange-100">
              <MapPin className="h-3.5 w-3.5 text-orange-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Location</p>
              <p className="text-xs text-foreground font-medium">{candidate.location || "Not specified"}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl p-4 shadow-sm border border-border/60">
        <h4 className="font-semibold text-foreground text-sm mb-3 flex items-center">
          <Award className="h-4 w-4 text-purple-500 mr-2" />
          Additional Info
        </h4>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-7 h-7 bg-purple-50/50 rounded-md flex items-center justify-center shrink-0 border border-purple-100">
              <GraduationCap className="h-3.5 w-3.5 text-purple-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Education</p>
              <p className="text-xs text-foreground font-medium">{candidate.educationDegree || "Not specified"}</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-7 h-7 bg-sky-50/50 rounded-md flex items-center justify-center shrink-0 border border-sky-100">
              <Languages className="h-3.5 w-3.5 text-sky-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Languages</p>
              <p className="text-xs text-foreground font-medium">{candidate.primaryLanguage || "Not specified"}</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-7 h-7 bg-amber-50/50 rounded-md flex items-center justify-center shrink-0 border border-amber-100">
              <Award className="h-3.5 w-3.5 text-amber-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5">Skills</p>
              <p className="text-xs text-foreground font-medium">{candidate.skills?.join(', ') || "Not specified"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
