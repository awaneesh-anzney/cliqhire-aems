"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { api } from "@/lib/axios-config"
import { ArrowLeft } from "lucide-react"

const MODULES = [
  "TODAY_TASKS", 
  "CLIENTS", 
  "JOBS", 
  "CANDIDATE", 
  "RECRUITMENT_PIPELINE", 
  "RECRUITER", 
  "HEAD_HUNTER", 
  "TEM_CANDIDATES", 
  "TEAM_MEMBERS", 
  "USER_ACCESS", 
  "ADMIN"
]

export default function CreateRolePage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [permissionMatrix, setPermissionMatrix] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {}
    MODULES.forEach(mod => {
      initial[mod] = { view: false, create: false, update: false, delete: false }
    })
    return initial
  })

  const [isLoading, setIsLoading] = useState(false)

  const handlePermissionChange = (moduleName: string, action: string, checked: boolean) => {
    setPermissionMatrix(prev => ({
      ...prev,
      [moduleName]: {
        ...prev[moduleName],
        [action]: checked
      }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await api.post('/api/rbac/roles', {
        name,
        description,
        permissionMatrix
      })
      router.push("/settings")
    } catch (error) {
      console.error("Error creating role:", error)
      alert("Failed to create role. Check console for details.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="border-b">
        <div className="flex h-16 items-center px-4 gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/settings")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-semibold">Create New Role</h1>
        </div>
      </div>

      <div className="flex-1 p-8">
        <div className="mx-auto max-w-4xl">
          <form onSubmit={handleSubmit} className="space-y-8 bg-card text-card-foreground p-6 rounded-lg border shadow-sm">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Role Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Recruitment Manager"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Describes what this role can do"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-base">Permission Matrix</Label>
              <div className="rounded-md border overflow-hidden">
                <div className="grid grid-cols-5 bg-muted p-3 text-sm font-medium">
                  <div>Module</div>
                  <div className="text-center">View</div>
                  <div className="text-center">Create</div>
                  <div className="text-center">Update</div>
                  <div className="text-center">Delete</div>
                </div>
                <div className="divide-y max-h-[500px] overflow-y-auto">
                  {MODULES.map((module) => (
                    <div key={module} className="grid grid-cols-5 items-center p-3 hover:bg-muted/50 transition-colors">
                      <div className="text-sm font-medium break-words pr-2">{module.replace(/_/g, ' ')}</div>
                      {["view", "create", "update", "delete"].map((action) => (
                        <div key={action} className="flex justify-center">
                          <Checkbox
                            checked={permissionMatrix[module]?.[action] || false}
                            onCheckedChange={(checked) => handlePermissionChange(module, action, checked as boolean)}
                          />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => router.push("/settings")}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Role"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
