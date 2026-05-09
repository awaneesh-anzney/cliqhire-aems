import { CandidateLogo } from "@/components/candidates-logo"

interface CandidatesEmptyStateProps {
  children?: React.ReactNode
}

export function CandidatesEmptyState({ children }: CandidatesEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center max-w-2xl mx-auto p-4">
      <div className="w-48 h-48 mb-6">
        <CandidateLogo />
      </div>
      <h2 className="text-xl font-semibold mb-3">You have not created any candidates yet</h2>
      <p className="text-muted-foreground mb-6">
        Creating candidates will allow you to add their details, resumes, add them to a job and much more.
      </p>
      {children}
    </div>
  )
}

