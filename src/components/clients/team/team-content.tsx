"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import { useState } from "react"
import TeamMembersList from "./team-members/team-members-list"
import TeamSettingsView from "./team-settings/team-settings-view"

interface TeamContentProps {
  clientId: string;
}

export default function TeamContent({ clientId }: TeamContentProps) {
  const [currentView, setCurrentView] = useState<'main' | 'members' | 'settings'>('main')

  if (currentView === 'members') {
    return <TeamMembersList />
  }

  if (currentView === 'settings') {
    return <TeamSettingsView clientId={clientId} />
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-card rounded-lg border shadow-sm">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-2">Client Team</h2>
          <p className="text-muted-foreground mb-4">
            Users part of this team will have full visibility of the jobs under that client, and will have the ability to add / move / remove candidates from all these jobs.
          </p>
          <Button variant="link" className="text-blue-500 px-0">
            Learn more about client ownership & team
          </Button>
        </div>

        <div className="border-t">
          <button 
            className="w-full flex items-center justify-between p-4 hover:bg-muted"
            onClick={() => setCurrentView('members')}
          >
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">Team members</span>
              <Avatar className="h-8 w-8 bg-orange-500">
                <AvatarFallback>SS</AvatarFallback>
              </Avatar>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <div className="border-t">
          <button 
            className="w-full flex items-center justify-between p-4 hover:bg-muted"
            onClick={() => setCurrentView('settings')}
          >
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">Team Settings</span>
              <span className="text-sm">Manage team permissions</span>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  )
}