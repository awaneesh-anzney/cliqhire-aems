import { Search } from 'lucide-react'
import Link from "next/link"

export function ClientEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="bg-muted p-4 rounded-full mb-4">
        <Search className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No clients found</h3>
      <p className="text-muted-foreground mb-4">
        No clients match the selected filters. Please modify the filters to try again.
      </p>
      <Link href="#" className="text-blue-600 hover:underline">
        {/* Learn more about clients */}
      </Link>
    </div>
  )
}

