"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { api } from "@/lib/axios-config"
import { ArrowLeft } from "lucide-react"
import { roleService } from "@/services/roleService"

interface User {
  _id: string
  name?: string
  firstName?: string
  lastName?: string
  email: string
}

export default function AssignUsersPage() {
  const router = useRouter()
  const params = useParams()
  const roleId = params?.id as string

  const [users, setUsers] = useState<User[]>([])
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [assigning, setAssigning] = useState(false)

  useEffect(() => {
    if (roleId) {
      fetchUsers()
    }
  }, [roleId])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res = await api.get('/api/users')
      if (res.data && res.data.status === 'success') {
        setUsers(res.data.data.users || [])
      } else if (Array.isArray(res.data)) {
        setUsers(res.data)
      } else if (res.data?.users) {
        setUsers(res.data.users)
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleUser = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAssigning(true)

    try {
      // Step 5 API update: Assign role to each user via PUT /api/users/:id/role
      await Promise.all(
        selectedUserIds.map((userId) => roleService.assignRoleToUser(userId, roleId))
      )
      router.push("/settings")
    } catch (error) {
      console.error("Error assigning users:", error)
      alert("Failed to assign users. Check console for details.")
    } finally {
      setAssigning(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="border-b">
        <div className="flex h-16 items-center px-4 gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/settings")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-semibold">Assign Users to Role</h1>
        </div>
      </div>

      <div className="flex-1 p-8">
        <div className="mx-auto max-w-3xl">
          <form onSubmit={handleSubmit} className="space-y-6 bg-card text-card-foreground p-6 rounded-lg border shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-medium">Select Users</h2>
                  <p className="text-sm text-muted-foreground">
                    Choose the users from your organization who will inherit the permissions of this role.
                  </p>
                </div>
                <div className="text-sm font-medium">
                  {selectedUserIds.length} Users Selected
                </div>
              </div>

              {loading ? (
                <div className="py-8 text-center text-muted-foreground">Loading users...</div>
              ) : (
                <div className="border rounded-md divide-y max-h-[400px] overflow-y-auto">
                  {users.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">No users found.</div>
                  ) : (
                    users.map((user) => {
                      const userId = user._id
                      const displayName = user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User'
                      
                      return (
                        <div key={userId} className="flex items-center space-x-3 p-3 hover:bg-muted/50 transition-colors">
                          <Checkbox
                            id={`user-${userId}`}
                            checked={selectedUserIds.includes(userId)}
                            onCheckedChange={() => toggleUser(userId)}
                          />
                          <div className="flex-1">
                            <Label htmlFor={`user-${userId}`} className="font-medium cursor-pointer flex flex-col gap-0.5">
                              <span>{displayName}</span>
                              <span className="text-xs text-muted-foreground font-normal">{user.email}</span>
                            </Label>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => router.push("/settings")}>
                Cancel
              </Button>
              <Button type="submit" disabled={assigning || selectedUserIds.length === 0 || loading}>
                {assigning ? "Assigning..." : "Assign Roles"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
