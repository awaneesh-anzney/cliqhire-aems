import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Calendar,
  Clock,
  Video,
  ChevronDown,
  ChevronRight,
  MoreHorizontal
} from "lucide-react";
import { Interview } from "./types";

interface InterviewsProps {
  interviews: Interview[];
  onUpdateInterviewStatus: (interviewId: string, status: Interview['status']) => void;
}

export function Interviews({ interviews, onUpdateInterviewStatus }: InterviewsProps) {
  const [isOpen, setIsOpen] = useState(false);

  // No filtering, show all
  const todaysInterviews = interviews;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-700';
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      case 'rescheduled':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-muted text-foreground';
    }
  };

  const formatTime = (dateTime: string | null) => {
    if (!dateTime) return '-';
    return new Date(dateTime).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateTime: string | null) => {
    if (!dateTime) return '-';
    const d = new Date(dateTime);
    const day = d.getDate();
    const mon = d.toLocaleString('en-US', { month: 'short' });
    return `${day} ${mon}`;
  };

  return (
    <Card className="rounded-xl border border-border shadow-sm bg-card overflow-hidden">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted transition-colors py-4 px-6 border-b border-transparent data-[state=open]:border-border">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-foreground font-semibold">
                <Calendar className="w-5 h-5 text-brand" />
                Reminder Task
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground font-normal">
                <span>Total: <span className="font-semibold text-foreground">{todaysInterviews.length}</span></span>
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
          <CardContent className="pt-4">
            {todaysInterviews.length > 0 ? (
              <div className="rounded-md border border-border">
                <div className="max-h-96 overflow-y-auto custom-scrollbar pr-2">
                  <Table>
                    <TableHeader className="sticky top-0 bg-muted border-b border-border hover:bg-muted text-foreground z-10">
                      <TableRow className="border-b-0 hover:bg-transparent">
                        <TableHead>Candidate</TableHead>
                        <TableHead>Job & Client</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Meeting</TableHead>
                        <TableHead>Status</TableHead>
                        {/* <TableHead>Actions</TableHead> */}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {todaysInterviews.map((interview) => (
                        <TableRow key={interview.id} className="hover:bg-muted">
                          <TableCell>
                            <div>
                              <div className="font-semibold text-foreground">{interview.candidateName}</div>
                              <div className="text-sm text-foreground">{interview.candidateEmail}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{interview.jobTitle}</div>
                              <div className="text-sm text-foreground">{interview.clientName}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium">{formatDate(interview.scheduledTime)}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <div>
                                <div className="font-medium">{formatTime(interview.scheduledTime)}</div>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            {interview.meetingLink ? (
                              <a
                                href={interview.meetingLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-blue-600 hover:underline text-sm"
                              >
                                <Video className="w-4 h-4" />
                                Join Meeting
                              </a>
                            ) : (
                              <span className="text-sm text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(interview.status)}>
                              {interview.status}
                            </Badge>
                          </TableCell>
                          {/* <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger className="hover:bg-muted p-1 rounded">
                                <MoreHorizontal className="w-4 h-4" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => onUpdateInterviewStatus(interview.id, 'completed')}>
                                  Mark Complete
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onUpdateInterviewStatus(interview.id, 'rescheduled')}>
                                  Reschedule
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell> */}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-lg font-medium">No reminder tasks found</p>
                <p className="text-sm">You are all caught up!</p>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
