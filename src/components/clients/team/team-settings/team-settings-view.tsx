"use client"

import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { useState } from "react"

interface TeamSettingsViewProps {
  clientId: string;
}

export default function TeamSettingsView({ clientId }: TeamSettingsViewProps) {
  const [viewPermission, setViewPermission] = useState(false)
  const [editPermission, setEditPermission] = useState(false)

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center mb-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="text-blue-500 cursor-pointer">Teams</span>
          <span>›</span>
          <span>Team Settings</span>
        </div>
      </div>

      {/* Settings Card */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-card rounded-lg border shadow-sm">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-2">Team Settings</h2>
            <p className="text-muted-foreground mb-6">
              Modify the permissions given to users in this team.
            </p>

            {/* Permissions */}
            <div className="space-y-6">
              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <p className="font-medium">Anyone in the team can view external guests & contacts</p>
                </div>
                <Switch
                  checked={viewPermission}
                  onCheckedChange={setViewPermission}
                />
              </div>

              <div className="flex items-center justify-between py-3 border-b">
                <div>
                  <p className="font-medium">Anyone in the team can edit external guests & contacts</p>
                </div>
                <Switch
                  checked={editPermission}
                  onCheckedChange={setEditPermission}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}