"use client"

import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CalendarIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

interface ReportsContentProps {
  jobId: string;
}

interface CandidateStats {
  icon: React.ReactNode
  count: number
  label: string
}

interface SourceStats {
  label: string
  count: number
  percentage: number
  color: string
  icon: React.ReactNode
}

export function ReportsContent({ jobId }: ReportsContentProps) {
  const candidateStats: CandidateStats[] = [
    {
      icon: (
        <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="9" cy="7" r="4" strokeWidth="2"/>
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" strokeWidth="2" strokeLinecap="round"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      count: 0,
      label: "Candidate in pipeline"
    },
    {
      icon: (
        <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M9 12l2 2 4-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="12" cy="12" r="10" strokeWidth="2"/>
        </svg>
      ),
      count: 0,
      label: "Candidate hired"
    },
    {
      icon: (
        <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M18 6L6 18" strokeWidth="2" strokeLinecap="round"/>
          <path d="M6 6l12 12" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      count: 0,
      label: "Candidate dropped"
    }
  ]

  const sourceStats: SourceStats[] = [
    { 
      label: "Applied", 
      count: 0, 
      percentage: 0,
      color: "bg-blue-500",
      icon: (
        <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M9 12l2 2 4-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M20 12v7a2 2 0 01-2 2H6a2 2 0 01-2-2V5a2 2 0 012-2h7" strokeWidth="2"/>
          <path d="M16 5V3" strokeWidth="2" strokeLinecap="round"/>
          <path d="M8 5V3" strokeWidth="2" strokeLinecap="round"/>
          <path d="M12 5V3" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      )
    },
    { 
      label: "Sourced", 
      count: 0, 
      percentage: 0,
      color: "bg-purple-500",
      icon: (
        <svg className="w-4 h-4 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      )
    },
    { 
      label: "Referred", 
      count: 0, 
      percentage: 0,
      color: "bg-orange-500",
      icon: (
        <svg className="w-4 h-4 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M16 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" strokeWidth="2"/>
          <circle cx="12" cy="7" r="4" strokeWidth="2"/>
          <path d="M19 8l3 3" strokeWidth="2" strokeLinecap="round"/>
          <path d="M22 5l-3 3" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      )
    },
    { 
      label: "Agency", 
      count: 0, 
      percentage: 0,
      color: "bg-emerald-500",
      icon: (
        <svg className="w-4 h-4 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      )
    }
  ]

  // Chart data
  const data = {
    labels: ['2025-03-25', '2025-03-26', '2025-03-27', '2025-03-28', '2025-03-29', '2025-03-30', '2025-03-31', '2025-04-01', '2025-04-02'],
    datasets: [
      {
        label: 'Applied',
        data: [0, 0, 0, 0, 0, 0, 0, 0, 0],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
      },
      {
        label: 'Sourced',
        data: [0, 0, 0, 0, 0, 0, 0, 0, 0],
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
      },
      {
        label: 'Referred',
        data: [0, 0, 0, 0, 0, 0, 0, 0, 0],
        borderColor: 'rgb(245, 158, 11)',
        backgroundColor: 'rgba(245, 158, 11, 0.5)',
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 0.5,
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        {candidateStats.map((stat, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center justify-between">
              <div className="bg-blue-50 rounded-lg p-2">
                {stat.icon}
              </div>
              <span className="text-2xl font-semibold">{stat.count}</span>
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              {stat.label}
            </div>
          </Card>
        ))}
      </div>

      {/* New Candidates Chart */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">New candidates</h2>
        </div>
        <div className="h-[400px]">
          <Line options={options} data={data} />
        </div>
      </Card>

      {/* Sources Section */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-lg font-semibold">Sources of candidate</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Overview of candidate sources and their distribution
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {sourceStats.map((source, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-muted">
                      {source.icon}
                    </div>
                    <span className="font-medium">{source.label}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-muted-foreground">Total: {source.count}</span>
                    <span className="font-semibold w-16 text-right">{source.percentage}%</span>
                  </div>
                </div>
                <div className="relative pt-2">
                  <div className="absolute top-0 left-0 h-2 rounded-full bg-muted w-full" />
                  <div 
                    className={`absolute top-0 left-0 h-2 rounded-full ${source.color} transition-all duration-500`}
                    style={{ width: `${source.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}