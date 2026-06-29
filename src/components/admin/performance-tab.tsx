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
          ) : teamData?.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No team performance data found.
              </CardContent>
            </Card>
          ) : (
            teamData?.map((team) => (
              <Card key={team.teamId}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    {team.teamName}
                  </CardTitle>
                  <CardDescription>Overall Team Conversion: {team.conversionRate}%</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-muted p-4 rounded-lg flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Submitted</p>
                        <p className="text-2xl font-bold">{team.submitted}</p>
                      </div>
                      <Briefcase className="h-8 w-8 text-blue-500/20" />
                    </div>
                    <div className="bg-muted p-4 rounded-lg flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Hired</p>
                        <p className="text-2xl font-bold">{team.hired}</p>
                      </div>
                      <CheckCircle2 className="h-8 w-8 text-emerald-500/20" />
                    </div>
                    <div className="bg-muted p-4 rounded-lg flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Dropped</p>
                        <p className="text-2xl font-bold">{team.dropped}</p>
                      </div>
                      <XCircle className="h-8 w-8 text-destructive/20" />
                    </div>
                  </div>
                  
                  <h4 className="font-medium text-sm mb-3">Team Members</h4>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Profile ID</TableHead>
                          <TableHead className="text-right">Submitted</TableHead>
                          <TableHead className="text-right">Hired</TableHead>
                          <TableHead className="text-right">Dropped</TableHead>
                          <TableHead className="text-right">Conversion</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {team.members?.map((member) => (
                          <TableRow key={member.profileId}>
                            <TableCell className="font-mono text-xs text-muted-foreground">
                              {member.profileId}
                            </TableCell>
                            <TableCell className="text-right">{member.submitted}</TableCell>
                            <TableCell className="text-right text-emerald-600 font-medium">{member.hired}</TableCell>
                            <TableCell className="text-right text-destructive">{member.dropped}</TableCell>
                            <TableCell className="text-right">{member.conversionRate}%</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
