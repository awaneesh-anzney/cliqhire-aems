import { SidebarNav } from "@/components/sidebar-nav"
import { InboxEmptyState } from "./empty-state"

export default function InboxPage() {
  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-64 border-r bg-card">
        <SidebarNav />
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <div className="border-b">
          <div className="flex h-16 items-center px-4">
            <h1 className="text-2xl font-semibold">Inbox</h1>
          </div>
        </div>
        
        <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <InboxEmptyState />
        </div>
      </div>
    </div>
  )
}

