import Link from "next/link"
import { PlacementLogo } from "@/components/placement-logo"

export function PlacementsEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center text-center max-w-2xl mx-auto p-4">
      <div className="w-60 h-40 mb-6">
        <PlacementLogo />
      </div>
      <h2 className="text-xl font-semibold mb-3">No placement has been made yet</h2>
      <p className="text-muted-foreground mb-6">
        All placements will be displayed on this screen once the first placement has been made.
      </p>
      <Link href="#" className="text-blue-600 hover:underline">
        {/* Learn more about placements */}
      </Link>
    </div>
  )
}

