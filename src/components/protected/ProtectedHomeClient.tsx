"use client";

import { Button } from "@/components/ui/button";
import { Users, Building2, Briefcase, FileText, UserPlus, CheckCircle, Clock, Calendar, Check } from 'lucide-react'
import { useRouter } from "next/navigation"
import { CreateCandidateButton } from "@/components/candidates/create-candidate-button"
import { useState } from "react"
import { CreateClientModal } from "@/components/create-client-modal/create-client-modal"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { CreateJobRequirementForm } from "@/components/new-jobs/create-jobs-form";

export function ProtectedHomeClient() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [openJobModal, setJobModal] = useState(false);
  const [todoItems, setTodoItems] = useState([
    { id: 1, task: "Interview with Ankit singh", time: "10:00 AM", priority: "high", type: "interview" },
    { id: 2, task: "Client meeting - Acme Inc.", time: "2:00 PM", priority: "medium", type: "meeting" },
    { id: 3, task: "Review candidate profiles", time: "4:00 PM", priority: "low", type: "review" },
    { id: 4, task: "Follow up with potential candidates", time: "3:00 PM", priority: "medium", type: "follow-up" },
    { id: 5, task: "Update job descriptions", time: "5:00 PM", priority: "low", type: "task" }
  ]);

  const completeTask = (id: number) => {
    setTodoItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'low':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-muted text-foreground';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'interview':
        return <Users className="w-4 h-4" />;
      case 'meeting':
        return <Building2 className="w-4 h-4" />;
      case 'review':
        return <FileText className="w-4 h-4" />;
      case 'follow-up':
        return <Clock className="w-4 h-4" />;
      default:
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  return (
    <>
      <div className="flex flex-col items-center max-w-6xl mx-auto py-12 px-4">
        <h1 className="text-4xl font-semibold mb-6">Hello Aems,</h1>
        <p className="text-xl text-foreground mb-12">Here are three steps to get you started.</p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
          {/* Create Client Tile */}
          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 mb-6 flex items-center justify-center bg-green-100 rounded-full">
              <Building2 className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Create a Client</h2>
            <p className="text-muted-foreground mb-4">Clients host the different jobs under your agency&apos;s account.</p>
            <Button className="w-full max-w-xs" size="lg" onClick={() => setOpen(true)}>
              Create a Client
            </Button>
          </div>

          {/* Create Candidate Tile */}
          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 mb-6 flex items-center justify-center bg-blue-100 rounded-full">
              <Briefcase className="w-12 h-12 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Create Job Requirement</h2>
            <p className="text-muted-foreground mb-4">A new position opened up? Let&apos;s add it to the job list.</p>
            <Button
              className="w-full max-w-xs"
              size="lg"
              onClick={() => setJobModal(true)}
            >
              Create Job Requirement
            </Button>
          </div>

          {/* Create Job Tile */}
          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 mb-6 flex items-center justify-center bg-yellow-100 rounded-full">
              <UserPlus className="w-12 h-12 text-yellow-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Create a Candidate</h2>
            <p className="text-muted-foreground mb-4">Let&apos;s start by creating your first candidate and manage them</p>
            <CreateCandidateButton className="w-full max-w-xs" size="lg">
              Create a Candidate
            </CreateCandidateButton>
          </div>
        </div>

        {/* Enhanced Todo List Section */}
        <Card className="w-full mt-12">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="w-6 h-6 text-primary" />
              <div>
                <CardTitle>Today&apos;s To-Do List</CardTitle>
                <CardDescription>
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todoItems.map((item) => (
                <div
                  key={item.id}
                  className="group flex items-center gap-4 p-4 rounded-lg transition-all bg-card hover:shadow-md border relative overflow-hidden cursor-pointer"
                  onClick={() => completeTask(item.id)}
                >
                  <div className="absolute inset-0 bg-green-500/0 group-hover:bg-green-500/5 transition-colors duration-200" />
                  <div className="absolute right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="flex items-center gap-2 text-green-600">
                      <Check className="w-5 h-5" />
                      <span className="text-sm font-medium">Mark Complete</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{item.task}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(item.priority)}`}>
                        {item.priority}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        {getTypeIcon(item.type)}
                        <span className="text-sm capitalize">{item.type}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">•</span>
                      <span className="text-sm text-muted-foreground">{item.time}</span>
                    </div>
                  </div>
                </div>
              ))}
              {todoItems.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                  <p className="text-lg font-medium">All tasks completed!</p>
                  <p className="text-sm">Great job! You&apos;re all caught up for today.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <CreateClientModal open={open} onOpenChange={setOpen} />
      <CreateJobRequirementForm open={openJobModal} onOpenChange={setJobModal} />
    </>
  );
}
