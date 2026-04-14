"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Shield, Users, Plus, Check, X, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useRoles } from "@/hooks/useRoles"

export default function SettingsRolesPage() {
  const { roles, loading, fetchRoles } = useRoles()

  useEffect(() => {
    fetchRoles()
  }, [fetchRoles])

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

      <div className="flex-1 py-2 px-[2px]">
        <div className="mx-auto w-full max-w-7xl">
          {loading ? (
            <div className="px-4">Loading roles...</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {roles.map((role) => {
                const roleId = role._id || role.id
                const permissionsObj = role.permissions || {}
                
                // Get modules that have at least one permission enabled
                const enabledModules = Object.keys(permissionsObj).filter(mod => {
                  const perms = permissionsObj[mod]
                  return perms && Object.values(perms).some(val => val === true)
                })

                return (
                  <Card key={roleId as string} className="flex flex-col mx-2 sm:mx-0">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Shield className="h-4 w-4 text-primary" />
                          {role.displayName || role.name}
                          {role.isSystem && <Badge variant="outline" className="ml-2 text-xs">System</Badge>}
                        </CardTitle>
                      </div>
                      <CardDescription>{role.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-4">
                      
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-sm font-medium">Access Matrix</span>
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8">
                              <Eye className="mr-2 h-3.5 w-3.5" /> View
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>{role.displayName || role.name} Permissions</DialogTitle>
                              <DialogDescription>
                                Defines what access this role provides across all modules.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="mt-4 border rounded-md overflow-hidden">
                              <div className="grid grid-cols-5 bg-muted p-2 text-sm font-medium">
                                <div>Module</div>
                                <div className="text-center">View</div>
                                <div className="text-center">Create</div>
                                <div className="text-center">Edit</div>
                                <div className="text-center">Delete</div>
                              </div>
                              <div className="divide-y">
                                {Object.keys(permissionsObj).map((mod) => (
                                  <div key={mod} className="grid grid-cols-5 items-center p-2 hover:bg-muted/50">
                                    <div className="text-sm font-medium capitalize">{mod.replace(/_/g, ' ')}</div>
                                    {["view", "create", "edit", "delete"].map(action => (
                                      <div key={action} className="flex justify-center">
                                        {permissionsObj[mod]?.[action] ? (
                                          <Check className="h-4 w-4 text-green-500" />
                                        ) : (
                                          <X className="h-4 w-4 text-muted-foreground/30" />
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                ))}
                                {Object.keys(permissionsObj).length === 0 && (
                                  <div className="p-4 text-center text-sm text-muted-foreground">
                                    No permissions defined.
                                  </div>
                                )}
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>

                      <div className="flex gap-2 pt-4 mt-auto">
                        <Button variant="secondary" size="sm" className="flex-1" asChild>
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
                <div className="col-span-full mx-2 text-center p-8 text-muted-foreground border rounded-lg">
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
