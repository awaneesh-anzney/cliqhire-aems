"use client";
import React, { useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Upload, X } from 'lucide-react';
import { CreateTeamMemberData } from '@/types/teamMember';

interface SkillsAndStatusTabProps {
  formData: CreateTeamMemberData;
  setFormData: React.Dispatch<React.SetStateAction<CreateTeamMemberData>>;
  errors: Record<string, string>;
  onResumeFileChange?: (file: File | null) => void;
}

export function SkillsAndStatusTab({ formData, setFormData, errors, onResumeFileChange }: SkillsAndStatusTabProps) {
  const [skillsInput, setSkillsInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const handleInputChange = (field: keyof CreateTeamMemberData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSkillsChange = (value: string) => {
    setSkillsInput(value);
    
    // Convert comma-separated or newline-separated string to array of strings
    const skillsArray = value
      .split(/[,\n]/)
      .map(skill => skill.trim())
      .filter(skill => skill.length > 0);
    
    setFormData(prev => ({ ...prev, skills: skillsArray }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit per API specification
        alert('File size must be less than 10MB');
        return;
      }
      if (!file.type.includes('pdf') && !file.type.includes('doc') && !file.type.includes('docx')) {
        alert('Please upload a PDF, DOC, or DOCX file');
        return;
      }
      // Store the actual file and show the file name
      setResumeFile(file);
      onResumeFileChange?.(file);
    }
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    setResumeFile(null);
    onResumeFileChange?.(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Initialize skillsInput when component mounts or formData changes
  React.useEffect(() => {
    if (formData.skills.length > 0 && skillsInput === '') {
      setSkillsInput(formData.skills.join(', '));
    }
  }, [formData.skills]);

  return (
    <div className="space-y-6">
      {/* Experience */}
      <div className="ml-2 mr-2">
        <Label htmlFor="experience">Experience</Label>
        <Input
          id="experience"
          value={formData.experience}
          onChange={(e) => handleInputChange('experience', e.target.value)}
          placeholder="Enter experience"
        />
      </div>
      {/* Specialization */}
      <div className="ml-2 mr-2">
        <Label htmlFor="specialization">Specialization</Label>
        <Input
          id="specialization"
          value={formData.specialization}
          onChange={(e) => handleInputChange('specialization', e.target.value)}
          placeholder="e.g., Technical Recruiting"
        />
      </div>

      {/* Skills as textarea */}
      <div className='ml-2 mr-2'>
        <Label htmlFor="skills">Skills</Label>
        <Textarea
          id="skills"
          value={skillsInput}
          onChange={(e) => handleSkillsChange(e.target.value)}
          placeholder="Enter skills separated by commas or press Enter for new lines (e.g., Technical Recruiting, ATS Management, LinkedIn Recruiter)"
          className="min-h-[120px]"
        />
      </div>

      {/* Resume Upload */}
      <div className="space-y-2 ml-2 mr-2 ">
        <Label htmlFor="resume">Upload Resume</Label>
        <div 
          className="relative border-2 border-dashed border-border rounded-md p-6 text-center cursor-pointer hover:border-border transition-colors"
          onClick={handleFileClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            id="resume"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            className="hidden"
          />
          <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
          <div className="text-sm text-foreground">
            {resumeFile ? (
              <div className="flex items-center justify-center gap-2">
                <span className="text-green-600 font-medium">{resumeFile.name}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFile();
                  }}
                  className="p-1 rounded hover:bg-red-100 text-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <span className="font-medium text-foreground">Click to upload</span>
                <br />
                <span className="text-muted-foreground">PDF, DOC, DOCX (max 10MB)</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 