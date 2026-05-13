import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Briefcase,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { AssignedJob } from "./types";
import { StatusDropdown, JobStatus } from "./StatusDropdown";

interface AssignedJobsProps {
  assignedJobs: AssignedJob[];
  onStatusChange?: (jobId: string, newStatus: JobStatus) => void;
  loading?: boolean;
}

export function AssignedJobs({ assignedJobs, onStatusChange, loading = false }: AssignedJobsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [checkedJobs, setCheckedJobs] = useState<Set<string>>(new Set());

  // Calculate job counts
  const totalJobs = assignedJobs.length;
  const activeJobs = assignedJobs.filter(job => job.status === 'In Progress').length;

  const handleJobCheck = (jobId: string, checked: boolean) => {
    setCheckedJobs(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(jobId);
      } else {
        newSet.delete(jobId);
      }
      return newSet;
    });
  };

  const handleStatusChange = (jobId: string, newStatus: JobStatus) => {
    if (onStatusChange) {
      onStatusChange(jobId, newStatus);
    }
  };

  return (
    <Card className="rounded-xl border border-border shadow-sm bg-card overflow-hidden">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted transition-colors py-4 px-6 border-b border-transparent data-[state=open]:border-border">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <Briefcase className="w-5 h-5 text-brand" />
                Assigned Jobs
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground font-normal">
                <span>Total Job Count: <span className="font-semibold text-foreground">{totalJobs}</span></span>
                <span>Total Active Job: <span className="font-semibold text-green-600">{activeJobs}</span></span>
                {isOpen ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </div>
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent>
            <div className="rounded-md border">
              {/* Fixed Header */}
              <div className="border-b bg-muted/50">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b-0 hover:bg-transparent">
                      <TableHead className="w-12">
                        <Checkbox
                          checked={checkedJobs.size === assignedJobs.length && assignedJobs.length > 0}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setCheckedJobs(new Set(assignedJobs.map(job => job.id)));
                            } else {
                              setCheckedJobs(new Set());
                            }
                          }}
                        />
                      </TableHead>
                      <TableHead className="w-1/3">Job Title</TableHead>
                      <TableHead className="w-1/4">Client</TableHead>
                      <TableHead className="w-24">No of Candidates</TableHead>
                      <TableHead className="w-20">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                </Table>
              </div>

              {/* Scrollable Body */}
              <div className="max-h-96 overflow-y-auto">
                <Table>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand"></div>
                            <span className="ml-2 text-muted-foreground">Loading assigned jobs...</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : assignedJobs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          No assigned jobs found
                        </TableCell>
                      </TableRow>
                    ) : (
                      assignedJobs.map((job) => (
                        <TableRow key={job.id} className="hover:bg-muted">
                          <TableCell className="w-12">
                            <Checkbox
                              checked={checkedJobs.has(job.id)}
                              onCheckedChange={(checked) => handleJobCheck(job.id, checked as boolean)}
                            />
                          </TableCell>
                          <TableCell className="font-medium w-1/3">
                            {job.jobTitle}
                          </TableCell>
                          <TableCell className="w-1/4">
                            {job.clientName}
                          </TableCell>
                          <TableCell className="w-24">
                            {job.candidatesCount}
                          </TableCell>
                          <TableCell className="w-20">
                            <StatusDropdown
                              currentStatus={job.status}
                              onStatusChange={(newStatus) => handleStatusChange(job.id, newStatus)}
                              jobTitle={job.jobTitle}
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
