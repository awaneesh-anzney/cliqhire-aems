import { ReportCard } from "@/components/report-card"
import { 
  CandidatesIcon, 
  HiringIcon, 
  JobsIcon, 
  LeaderboardIcon, 
  SalesIcon 
} from "@/components/report-icons"

export default function ReportsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="border-b">
        <div className="flex h-16 items-center px-4">
          <h1 className="text-2xl font-semibold">Reports</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-8">
        <div className="mx-auto max-w-5xl space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <ReportCard
              title="Candidates"
              description="View all reports related to your candidates."
              icon={<CandidatesIcon />}
              href="/reports/candidates"
            />
            <ReportCard
              title="Hiring Performance"
              description="View all reports related to your matches and hiring performance."
              icon={<HiringIcon />}
              href="/reports/hiring"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <ReportCard
              title="Jobs"
              description="View all reports related to your jobs."
              icon={<JobsIcon />}
              href="/reports/jobs"
            />
            <ReportCard
              title="Leaderboard"
              description="View all your team's leaderboards."
              icon={<LeaderboardIcon />}
              href="/reports/leaderboard"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <ReportCard
              title="Sales"
              description="View all reports related to your sales."
              icon={<SalesIcon />}
              href="/reports/sales"
            />
            <ReportCard
              title="CV Submission SLA"
              description="View all internal-to-client CV submission SLA compliance and metrics."
              icon={<CandidatesIcon />}
              href="/reports/cv-submissions"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

