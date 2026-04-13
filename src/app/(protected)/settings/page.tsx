"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Shield, Users, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { api } from "@/lib/axios-config"

interface Role {
  _id: string; // or id
  id?: string;
  name: string;
  description: string;
  permissionMatrix: Record<string, any>;
}

export default function SettingsRolesPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRoles()
  }, [])

  const fetchRoles = async () => {
    try {
      setLoading(true)
      const res = await api.get('/api/rbac/roles')
      const data = res.data
      
      let fetchedRoles: Role[] = []
      if (Array.isArray(data)) {
        fetchedRoles = data
      } else if (data?.data && Array.isArray(data.data)) {
        fetchedRoles = data.data
      } else if (data?.data?.roles && Array.isArray(data.data.roles)) {
        fetchedRoles = data.data.roles
      } else if (data?.roles && Array.isArray(data.roles)) {
        fetchedRoles = data.roles
      }
      
      setRoles(fetchedRoles)
    } catch (error) {
      console.error("Error fetching roles:", error)
      setRoles([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="border-b">
        <div className="flex h-16 items-center px-4 justify-between">
          <h1 className="text-2xl font-semibold">Roles & Permissions</h1>
          <Button asChild>
            <Link href="/settings/roles/create">
              <Plus className="mr-2 h-4 w-4" /> Create Role
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex-1 p-8">
        <div className="mx-auto max-w-5xl">
          {loading ? (
            <div>Loading roles...</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {roles.map((role) => {
                const roleId = role._id || role.id
                return (
                  <Card key={roleId} className="flex flex-col">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Shield className="h-4 w-4 text-primary" />
                          {role.name}
                        </CardTitle>
                      </div>
                      <CardDescription>{role.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-4">
                      <div className="space-y-2">
                        <span className="text-sm font-medium">Permissions:</span>
                        <div className="flex flex-wrap gap-2">
                          {role.permissionMatrix && Object.keys(role.permissionMatrix).map((module) => {
                            const perms = role.permissionMatrix[module]
                            const hasAny = Object.values(perms).some(Boolean)
                            if (!hasAny) return null
                            return (
                              <Badge variant="secondary" key={module} className="text-xs">
                                {module}
                              </Badge>
                            )
                          })}
                        </div>
                      </div>

                      <div className="flex gap-2 pt-4 mt-auto">
                        <Button variant="outline" size="sm" className="flex-1" asChild>
                          <Link href={`/settings/roles/${roleId}/assign`}>
                            <Users className="mr-2 h-3.5 w-3.5" /> Assign Users
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}

              {!roles.length && !loading && (
                <div className="col-span-full text-center p-8 text-muted-foreground border rounded-lg">
                  No roles found. Create one.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
