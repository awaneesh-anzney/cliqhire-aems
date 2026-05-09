import { Button } from "@/components/ui/button"
import Link from "next/link"
import { EmailLogo } from "@/components/email-logo"

export function InboxEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center text-center max-w-2xl mx-auto p-4">
      <div className="w-60 h-40 mb-6">
        <EmailLogo />
      </div>
      <h2 className="text-xl font-semibold mb-3">No email provider integrated yet</h2>
      <p className="text-muted-foreground mb-6">
        In order to best leverage inbox, please integrate your Google or Outlook email to sync all your candidate and contact emails with Cliqhire.
      </p>
      <div className="flex flex-col items-center gap-4">
        <Button className="bg-blue-600 hover:bg-blue-700">
          Integrate your email
        </Button>
        <Link href="#" className="text-blue-600 hover:underline">
          {/* Learn more about email integrations */}
        </Link>
      </div>
    </div>
  )
}

