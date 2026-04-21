"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { MoreVertical , Eye} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CandidateDetailsDialog } from "./candidate-details-dialog";
import { useState } from "react";

export interface HeadhunterCandidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  resumeUrl?: string;
  location?: string;
  gender?: string;
  dateOfBirth?: string;
  experience?: string;
  totalRelevantExperience?: string;
  noticePeriod?: string;
  currentJobTitle?: string;
  previousCompanyName?: string;
  currentSalary?: number;
  currentSalaryCurrency?: string;
  expectedSalary?: number;
  expectedSalaryCurrency?: string;
  universityName?: string;
  skills?: string[];
  willingToRelocate?: string;
  description?: string;
  country?: string;
  nationality?: string;
  overallStatus?: string;
  isTransferred?: boolean;
  transferredToCandidateId?: string | null;
  transferredAt?: string | null;
  transferredViaAssignment?: string | null;
  jobAssignments?: any[];
  createdAt?: string;
  updatedAt?: string;
  stats?: any;
}

interface HeadhunterCandidatesTableProps {
  candidates: HeadhunterCandidate[];
  onViewResume?: (candidate: HeadhunterCandidate) => void;
  onAction?: (candidate: HeadhunterCandidate) => void;
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
  onToggleSelectAll?: () => void;
}

export const HeadhunterCandidatesTable: React.FC<HeadhunterCandidatesTableProps> = ({
  candidates,
  onViewResume,
  onAction,
  selectedIds = new Set<string>(),
  onToggleSelect,
  onToggleSelectAll,
}) => {
  const [selectedCandidate, setSelectedCandidate] = useState<HeadhunterCandidate | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="bg-white  shadow-sm h-[560px] overflow-y-auto">
      <Table>
        <TableHeader className="sticky top-0 z-20 bg-white">
          <TableRow className="bg-white">
            <TableHead className="w-12 px-4 sticky top-0 z-20 bg-white">
              <div className="flex items-center justify-center">
                <Checkbox
                  checked={selectedIds.size > 0 && selectedIds.size === candidates.length}
                  onCheckedChange={() => onToggleSelectAll?.()}
                  className="h-4 w-4 rounded border-gray-300 data-[state=checked]:bg-slate-100 data-[state=checked]:text-blue-600 data-[state=checked]:border-blue-600 focus-visible:ring-indigo-500"
                />
              </div>
            </TableHead>
            <TableHead className="text-xs uppercase text-muted-foreground font-medium sticky top-0 z-20 bg-white">Candidate Name</TableHead>
            <TableHead className="text-xs uppercase text-muted-foreground font-medium sticky top-0 z-20 bg-white">Email</TableHead>
            <TableHead className="text-xs uppercase text-muted-foreground font-medium sticky top-0 z-20 bg-white">Phone</TableHead>
            <TableHead className="text-xs uppercase text-muted-foreground font-medium sticky top-0 z-20 bg-white">Resume</TableHead>
            <TableHead className="text-xs uppercase text-muted-foreground font-medium sticky top-0 z-20 bg-white">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {candidates.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-gray-500 py-6">
                No candidates
              </TableCell>
            </TableRow>
          ) : (
            candidates.map((c) => (
              <TableRow key={c.id} className={`${selectedIds.has(c.id) ? 'bg-blue-50' : ''}`}>
                <TableCell className="w-12 px-4">
                  <div className="flex items-center justify-center">
                    <Checkbox
                      checked={selectedIds.has(c.id)}
                      onCheckedChange={() => onToggleSelect?.(c.id)}
                      className="h-4 w-4 rounded border-gray-300 data-[state=checked]:bg-slate-100 data-[state=checked]:text-blue-600 data-[state=checked]:border-blue-600 focus-visible:ring-indigo-500"
                    />
                  </div>
                </TableCell>
                <TableCell className="text-sm font-medium">{c.name}</TableCell>
                <TableCell className="text-sm">{c.email}</TableCell>
                <TableCell className="text-sm">{c.phone}</TableCell>
                <TableCell>
                  {c.resumeUrl ? (
                    <span
                      className="text-blue-600 hover:underline cursor-pointer"
                      onClick={() => onViewResume?.(c)}
                    >
                      Resume
                    </span>
                  ) : (
                    <span className="text-gray-500">N/A</span>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-4 p-0"
                      >
                        <MoreVertical className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => {
                        setSelectedCandidate(c);
                        setIsDialogOpen(true);
                      }}>
                        
                          <Eye className="size-4"/>
                         View
                        
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <CandidateDetailsDialog
        candidate={selectedCandidate}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </div>
  );
};
