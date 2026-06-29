import { useState } from "react"
import { Users, TrendingUp, CheckCircle2, XCircle, Briefcase, ChevronDown } from "lucide-react"
import { useUsersPerformance, useTeamPerformance } from "@/hooks/usePerformance"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"

export function PerformanceTab() {
  const [activeTab, setActiveTab] = useState<"users" | "team">("users")
  
  const { data: usersData, isLoading: isUsersLoading } = useUsersPerformance()
  const { data: teamData, isLoading: isTeamLoading } = useTeamPerformance()

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">Performance Tracking</h3>
          <p className="text-sm text-muted-foreground">Monitor candidate conversions across users and teams.</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
        <TabsList className="grid w-full sm:w-[400px] grid-cols-2">
          <TabsTrigger value="users">User Leaderboard</TabsTrigger>
          <TabsTrigger value="team">Team Performance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>User Leaderboard</CardTitle>
              <CardDescription>Performance metrics for all users, sorted by highest hires.</CardDescription>
            </CardHeader>
            <CardContent>
              {isUsersLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead className="text-right">Submitted</TableHead>
                      <TableHead className="text-right">Hired</TableHead>
                      <TableHead className="text-right">Dropped</TableHead>
                      <TableHead className="text-right">Conversion</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usersData?.map((user) => (
                      <TableRow key={user.userId}>
                        <TableCell className="font-medium">
                          <div>{user.name}</div>
                          <div className="text-xs text-muted-foreground">{user.email}</div>
                        </TableCell>
                        <TableCell className="text-right">{user.submitted}</TableCell>
                        <TableCell className="text-right text-emerald-600 font-medium">{user.hired}</TableCell>
                        <TableCell className="text-right text-destructive">{user.dropped}</TableCell>
                        <TableCell className="text-right">
                          <span className="inline-flex items-center gap-1">
                            <TrendingUp className="h-3 w-3 text-muted-foreground" />
                            {user.conversionRate}%
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                    {!usersData?.length && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          No user performance data found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="mt-4 space-y-6">
          {isTeamLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-[200px] w-full rounded-xl" />
              <Skeleton className="h-[200px] w-full rounded-xl" />
            </div>
          ) : !teamData?.jobs?.length && !Object.keys(teamData?.byPosition || {}).length ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No team performance data found.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              {/* By Position Section */}
              {teamData?.byPosition && Object.keys(teamData.byPosition).length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">Overall By Position</h4>
                  <div className="grid gap-4">
                    {Object.entries(teamData.byPosition).map(([position, users]) => (
                      <Card key={position}>
                        <CardHeader className="py-4 bg-muted/30">
                          <CardTitle className="text-base capitalize">
                            {position.replace(/([A-Z])/g, ' $1').trim()}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="pl-6">User</TableHead>
                                <TableHead className="text-right">Submitted</TableHead>
                                <TableHead className="text-right">Hired</TableHead>
                                <TableHead className="text-right">Dropped</TableHead>
                                <TableHead className="text-right pr-6">Conversion</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {users.map((user) => (
                                <TableRow key={user.userId}>
                                  <TableCell className="font-medium pl-6">
                                    <div>{user.name}</div>
                                    <div className="text-xs text-muted-foreground">{user.email}</div>
                                  </TableCell>
                                  <TableCell className="text-right">{user.submitted}</TableCell>
                                  <TableCell className="text-right text-emerald-600 font-medium">{user.hired}</TableCell>
                                  <TableCell className="text-right text-destructive">{user.dropped}</TableCell>
                                  <TableCell className="text-right pr-6">{user.conversionRate}%</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* By Job Section */}
              {teamData?.jobs && teamData.jobs.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">Job Performance</h4>
                  <div className="grid gap-6">
                    {teamData.jobs.map((job) => (
                      <Card key={job.jobId}>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Briefcase className="h-5 w-5 text-primary" />
                            {job.jobTitle}
                          </CardTitle>
                          <CardDescription>{job.client.name}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            <div className="bg-muted p-4 rounded-lg flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Overall Conv.</p>
                                <p className="text-2xl font-bold">{job.jobTotals.conversionRate}%</p>
                              </div>
                              <TrendingUp className="h-8 w-8 text-primary/20" />
                            </div>
                            <div className="bg-muted p-4 rounded-lg flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Submitted</p>
                                <p className="text-2xl font-bold">{job.jobTotals.submitted}</p>
                              </div>
                              <Briefcase className="h-8 w-8 text-blue-500/20" />
                            </div>
                            <div className="bg-muted p-4 rounded-lg flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Hired</p>
                                <p className="text-2xl font-bold">{job.jobTotals.hired}</p>
                              </div>
                              <CheckCircle2 className="h-8 w-8 text-emerald-500/20" />
                            </div>
                            <div className="bg-muted p-4 rounded-lg flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-muted-foreground">Dropped</p>
                                <p className="text-2xl font-bold">{job.jobTotals.dropped}</p>
                              </div>
                              <XCircle className="h-8 w-8 text-destructive/20" />
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            {job.team.map((positionGroup) => (
                              <div key={positionGroup.position}>
                                <h5 className="font-medium text-sm mb-2 text-muted-foreground">
                                  {positionGroup.positionLabel}
                                </h5>
                                <div className="rounded-md border">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead className="text-right">Submitted</TableHead>
                                        <TableHead className="text-right">Hired</TableHead>
                                        <TableHead className="text-right">Dropped</TableHead>
                                        <TableHead className="text-right">Conversion</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {positionGroup.users.map((user) => (
                                        <TableRow key={user.userId}>
                                          <TableCell className="font-medium">
                                            <div>{user.name}</div>
                                            <div className="text-xs text-muted-foreground">{user.email}</div>
                                          </TableCell>
                                          <TableCell className="text-right">{user.submitted}</TableCell>
                                          <TableCell className="text-right text-emerald-600 font-medium">{user.hired}</TableCell>
                                          <TableCell className="text-right text-destructive">{user.dropped}</TableCell>
                                          <TableCell className="text-right">{user.conversionRate}%</TableCell>
                                        </TableRow>
                                      ))}
                                      {positionGroup.users.length === 0 && (
                                        <TableRow>
                                          <TableCell colSpan={5} className="text-center text-muted-foreground py-4">
                                            No users assigned
                                          </TableCell>
                                        </TableRow>
                                      )}
                                    </TableBody>
                                  </Table>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
