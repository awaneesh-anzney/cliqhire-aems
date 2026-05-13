"use client"

import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import Link from "next/link"

interface SourcingContentProps {
  jobId: string;
}

export function SourcingContent({ jobId }: SourcingContentProps) {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="grid grid-cols-2 gap-6">
        {/* Career Page Card */}
        <div className="bg-card rounded-lg border shadow-sm hover:shadow-md transition-shadow">
          <div className="p-6 flex items-start gap-4">
            {/* Icon */}
            <div className="flex-shrink-0">
              <svg
                viewBox="0 0 48 48"
                className="w-12 h-12 text-blue-500"
              >
                <rect 
                  x="8" 
                  y="8" 
                  width="32" 
                  height="32" 
                  rx="4" 
                  fill="currentColor" 
                  fillOpacity="0.1"
                />
                <rect 
                  x="12" 
                  y="14" 
                  width="16" 
                  height="2" 
                  rx="1" 
                  fill="currentColor"
                />
                <rect 
                  x="12" 
                  y="18" 
                  width="24" 
                  height="2" 
                  rx="1" 
                  fill="currentColor"
                />
                <rect 
                  x="12" 
                  y="22" 
                  width="20" 
                  height="2" 
                  rx="1" 
                  fill="currentColor"
                />
                <circle 
                  cx="36" 
                  cy="32" 
                  r="4" 
                  fill="currentColor"
                />
              </svg>
            </div>

            {/* Content */}
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">Career Page</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Publish the job on your career page and customize how it displays.
              </p>
              <Button 
                variant="ghost" 
                className="p-0 h-auto hover:bg-transparent text-blue-500 hover:text-blue-600"
              >
                <span className="flex items-center gap-1">
                  Configure career page
                  <ChevronRight className="h-4 w-4" />
                </span>
              </Button>
            </div>
          </div>
        </div>

        {/* Job Boards Card */}
        <div className="bg-card rounded-lg border shadow-sm hover:shadow-md transition-shadow">
          <div className="p-6 flex items-start gap-4">
            {/* Icon */}
            <div className="flex-shrink-0">
              <svg
                viewBox="0 0 48 48"
                className="w-12 h-12 text-orange-500"
              >
                <rect 
                  x="8" 
                  y="12" 
                  width="32" 
                  height="24" 
                  rx="4" 
                  fill="currentColor" 
                  fillOpacity="0.1"
                />
                <path 
                  d="M16 20 L32 20" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round"
                />
                <path 
                  d="M16 26 L28 26" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round"
                />
                <circle 
                  cx="36" 
                  cy="16" 
                  r="8" 
                  fill="currentColor" 
                  fillOpacity="0.2"
                />
              </svg>
            </div>

            {/* Content */}
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">Job Boards</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Share your job across free and premium job posting channels.
              </p>
              <Button 
                variant="ghost" 
                className="p-0 h-auto hover:bg-transparent text-blue-500 hover:text-blue-600"
              >
                <span className="flex items-center gap-1">
                  Configure job boards
                  <ChevronRight className="h-4 w-4" />
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Learn More Link */}
      <div className="text-center mt-6">
        <Link 
          href="#" 
          className="text-blue-500 hover:underline text-sm"
        >
          Learn more about sourcing channels
        </Link>
      </div>
    </div>
  )
}