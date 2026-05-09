"use client"
// import { CreateJobModal } from "@/components/jobs/create-job-modal"
import { Button } from "@/components/ui/button"
import { Laptop, Plus } from 'lucide-react'
import Link from "next/link"
import { useState } from "react"
import { CreateJobRequirementForm } from "@/components/new-jobs/create-jobs-form";


export function JobsEmptyState() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <div className="flex flex-col items-center justify-center text-center max-w-2xl mx-auto p-4">
        <div className="relative w-32 h-32 mb-6">
          <div className="absolute inset-0 flex items-center justify-center">
            <Laptop className="w-24 h-24 text-muted-foreground" />
          </div>
          <div className="absolute bottom-0 right-0">
            <div className="bg-blue-600 p-2 rounded-lg">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
          </div>
        <h2 className="text-xl font-semibold mb-3">You have not created any jobs yet</h2>
        <p className="text-muted-foreground mb-6">
          A Job represents a new job opening, an open position or vacancy listing. Creating a job will allow you to start adding candidates to that job, publish the job onto your career page, post the job to job boards and much more.
        </p>
        <div className="flex flex-col items-center gap-4">
          <Button onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create job
          </Button>
          <Link href="#" className="text-blue-600 hover:underline">
            Learn more about jobs
          </Link>
        </div>
      </div>
      <CreateJobRequirementForm open={open} onOpenChange={setOpen} />
    </>
  )
}

