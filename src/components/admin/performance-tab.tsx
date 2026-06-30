import { useState } from "react"
import { Users, TrendingUp, CheckCircle2, XCircle, Briefcase, Search, ChevronLeft, ChevronRight } from "lucide-react"
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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useDebounce } from "@/hooks/use-debounce"
import { JobBasedTeamPerformanceData, PositionLeaderboardData } from "@/services/performanceService"

const renderLeaderboardRow = (user: any, idx: number) => {
  const rank = idx + 1;
  let rankBadge = null;
  if (rank === 1) {
    rankBadge = <span className="flex h-5 w-5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20 items-center justify-center text-[10px] font-black shadow-sm shrink-0">1</span>;
  } else if (rank === 2) {
    rankBadge = <span className="flex h-5 w-5 rounded-full bg-slate-400/10 text-slate-500 border border-slate-400/20 items-center justify-center text-[10px] font-black shadow-sm shrink-0">2</span>;
  } else if (rank === 3) {
    rankBadge = <span className="flex h-5 w-5 rounded-full bg-amber-700/10 text-amber-800 border border-amber-700/20 items-center justify-center text-[10px] font-black shadow-sm shrink-0">3</span>;
  } else {
    rankBadge = <span className="flex h-5 w-5 rounded-full bg-muted text-muted-foreground items-center justify-center text-[10px] font-bold shrink-0">{rank}</span>;
  }

  const initials = (user.name || "User")
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  let barColor = "bg-rose-500";
  if (user.conversionRate >= 50) barColor = "bg-emerald-500";
  else if (user.conversionRate >= 20) barColor = "bg-blue-500";
  else if (user.conversionRate > 0) barColor = "bg-amber-500";

  return (
    <TableRow key={user.userId} className="hover:bg-muted/15 border-b border-border/40">
      <TableCell className="font-medium pl-6 py-3">
        <div className="flex items-center gap-3">
          {rankBadge}
          <div className="h-7 w-7 rounded-lg bg-brand/10 text-brand flex items-center justify-center shrink-0 border border-brand/10 font-black text-[10px]">
            {initials}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-xs text-foreground tracking-tight truncate">{user.name}</span>
            <span className="text-[9px] text-muted-foreground truncate leading-none mt-0.5">{user.email}</span>
          </div>
        </div>
      </TableCell>
      <TableCell className="text-right font-medium text-xs py-3">{user.submitted}</TableCell>
      <TableCell className="text-right text-emerald-600 font-bold text-xs py-3">{user.hired}</TableCell>
      <TableCell className="text-right text-rose-600 font-medium text-xs py-3">{user.dropped}</TableCell>
      <TableCell className="text-right pr-6 py-3">
        <div className="flex flex-col items-end gap-1.5 min-w-[100px] ml-auto">
          <span className="inline-flex items-center gap-1 font-black text-xs text-foreground">
            <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
            {user.conversionRate}%
          </span>
          <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden border border-border/40">
            <div 
              className={`h-full ${barColor} transition-all duration-500 rounded-full`} 
              style={{ width: `${Math.min(user.conversionRate, 100)}%` }} 
            />
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
};

export function PerformanceTab() {
  const [activeTab, setActiveTab] = useState<"users" | "team">("users")
  
  // Users Tab State
  const [usersPage, setUsersPage] = useState(1)
  const [usersLimit, setUsersLimit] = useState(10)
  const [usersSearch, setUsersSearch] = useState("")
  const [usersSortBy, setUsersSortBy] = useState("hired")
  
  const debouncedUsersSearch = useDebounce(usersSearch, 500)

  // Team Tab State
  const [teamPage, setTeamPage] = useState(1)
  const [teamLimit, setTeamLimit] = useState(10)
  const [teamPosition, setTeamPosition] = useState<string>("all") // "all" or specific position
  const [teamSearch, setTeamSearch] = useState("")
  const [teamSortBy, setTeamSortBy] = useState("hired")
  
  const debouncedTeamSearch = useDebounce(teamSearch, 500)

  const { data: usersResponse, isLoading: isUsersLoading } = useUsersPerformance({
    page: usersPage,
    limit: usersLimit,
    search: debouncedUsersSearch || undefined,
    sortBy: usersSortBy,
    order: "desc",
  })
  
  const { data: teamResponse, isLoading: isTeamLoading } = useTeamPerformance({
    page: teamPage,
    limit: teamLimit,
    position: teamPosition === "all" ? undefined : teamPosition,
    search: debouncedTeamSearch || undefined,
    sortBy: teamPosition !== "all" ? teamSortBy : undefined,
    order: "desc"
  })

  const usersData = usersResponse?.data || []
  const usersPagination = usersResponse?.pagination

  const isMode2 = teamPosition !== "all";
  const teamDataMode1 = !isMode2 ? (teamResponse?.data as JobBasedTeamPerformanceData) : null;
  const teamDataMode2 = isMode2 ? (teamResponse?.data as PositionLeaderboardData) : null;
  const teamPagination = teamResponse?.pagination;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1">
        <div>
          <h3 className="text-sm font-black uppercase tracking-wider text-foreground">Performance Tracking</h3>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">Monitor candidate conversions across recruitment teams and users.</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full space-y-4">
        <TabsList className="flex w-full sm:w-[350px] bg-muted/65 p-1 rounded-xl border border-border/50 shadow-inner">
          <TabsTrigger 
            value="users"
            className="flex-1 gap-2 rounded-lg py-2 font-black text-xs uppercase tracking-wider transition-all data-[state=active]:bg-card data-[state=active]:text-brand data-[state=active]:shadow-sm"
          >
            User Leaderboard
          </TabsTrigger>
          <TabsTrigger 
            value="team"
            className="flex-1 gap-2 rounded-lg py-2 font-black text-xs uppercase tracking-wider transition-all data-[state=active]:bg-card data-[state=active]:text-brand data-[state=active]:shadow-sm"
          >
            Team Performance
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" className="mt-2">
          <Card className="border border-border/60 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.02)] rounded-xl overflow-hidden bg-card">
            <CardHeader className="border-b border-border/40 pb-4">
              <CardTitle className="text-base font-black text-foreground tracking-tight">User Leaderboard</CardTitle>
              <CardDescription className="text-xs font-medium text-muted-foreground">Performance metrics for all users, sorted by highest hires.</CardDescription>
            </CardHeader>
            <div className="p-4 border-b border-border/40 bg-muted/10 flex flex-wrap gap-4 items-center justify-between">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by name or email..."
                  className="pl-9 h-9 text-xs bg-background"
                  value={usersSearch}
                  onChange={(e) => {
                    setUsersSearch(e.target.value)
                    setUsersPage(1)
                  }}
                />
              </div>
              <div className="flex gap-2 items-center">
                <Select value={usersSortBy} onValueChange={(v) => { setUsersSortBy(v); setUsersPage(1); }}>
                  <SelectTrigger className="h-9 w-[130px] text-xs font-medium bg-background">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hired" className="text-xs">Sort by Hired</SelectItem>
                    <SelectItem value="submitted" className="text-xs">Sort by Submitted</SelectItem>
                    <SelectItem value="dropped" className="text-xs">Sort by Dropped</SelectItem>
                    <SelectItem value="conversionRate" className="text-xs">Sort by Conv. Rate</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={usersLimit.toString()} onValueChange={(v) => { setUsersLimit(Number(v)); setUsersPage(1); }}>
                  <SelectTrigger className="h-9 w-[80px] text-xs font-medium bg-background">
                    <SelectValue placeholder="Limit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5" className="text-xs">5 / page</SelectItem>
                    <SelectItem value="10" className="text-xs">10 / page</SelectItem>
                    <SelectItem value="20" className="text-xs">20 / page</SelectItem>
                    <SelectItem value="50" className="text-xs">50 / page</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <CardContent className="p-0">
              {isUsersLoading ? (
                <div className="p-6 space-y-3">
                  <Skeleton className="h-6 w-full rounded" />
                  <Skeleton className="h-10 w-full rounded" />
                  <Skeleton className="h-10 w-full rounded" />
                  <Skeleton className="h-10 w-full rounded" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead className="pl-6 h-9 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Rank & User</TableHead>
                      <TableHead className="text-right h-9 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Submitted</TableHead>
                      <TableHead className="text-right h-9 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Hired</TableHead>
                      <TableHead className="text-right h-9 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Dropped</TableHead>
                      <TableHead className="text-right pr-6 h-9 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Conversion Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usersData.map((user, idx) => renderLeaderboardRow(user, (usersPage - 1) * usersLimit + idx))}
                    {usersData.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-xs font-bold uppercase tracking-widest text-muted-foreground py-8">
                          No user performance data found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
              {usersPagination && usersPagination.totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-border/40 bg-muted/10">
                  <span className="text-xs font-medium text-muted-foreground">
                    Showing {(usersPagination.page - 1) * usersPagination.limit + 1} to {Math.min(usersPagination.page * usersPagination.limit, usersPagination.total)} of {usersPagination.total} users
                  </span>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 w-8 p-0" 
                      onClick={() => setUsersPage(p => Math.max(1, p - 1))}
                      disabled={usersPagination.page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center justify-center h-8 px-3 text-xs font-medium border border-border/40 rounded-md bg-background">
                      Page {usersPagination.page} of {usersPagination.totalPages}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 w-8 p-0" 
                      onClick={() => setUsersPage(p => Math.min(usersPagination.totalPages, p + 1))}
                      disabled={usersPagination.page === usersPagination.totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="mt-2 space-y-4">
          <div className="flex flex-wrap gap-4 items-center justify-between bg-card p-4 rounded-xl border border-border/60 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.02)]">
            <div className="flex gap-2 items-center w-full max-w-sm">
              <Select value={teamPosition} onValueChange={(v) => { setTeamPosition(v); setTeamPage(1); }}>
                <SelectTrigger className="h-9 w-[180px] text-xs font-medium bg-background">
                  <SelectValue placeholder="Select View" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">All Jobs (Overview)</SelectItem>
                  <SelectItem value="recruiter" className="text-xs">Recruiters</SelectItem>
                  <SelectItem value="teamLead" className="text-xs">Team Leads</SelectItem>
                  <SelectItem value="hiringManager" className="text-xs">Hiring Managers</SelectItem>
                  <SelectItem value="accountManager" className="text-xs">Account Managers</SelectItem>
                </SelectContent>
              </Select>
              {isMode2 && (
                <div className="relative w-full">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search name..."
                    className="pl-9 h-9 text-xs bg-background"
                    value={teamSearch}
                    onChange={(e) => {
                      setTeamSearch(e.target.value)
                      setTeamPage(1)
                    }}
                  />
                </div>
              )}
            </div>
            <div className="flex gap-2 items-center">
              {isMode2 && (
                <Select value={teamSortBy} onValueChange={(v) => { setTeamSortBy(v); setTeamPage(1); }}>
                  <SelectTrigger className="h-9 w-[130px] text-xs font-medium bg-background">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hired" className="text-xs">Sort by Hired</SelectItem>
                    <SelectItem value="submitted" className="text-xs">Sort by Submitted</SelectItem>
                    <SelectItem value="dropped" className="text-xs">Sort by Dropped</SelectItem>
                    <SelectItem value="conversionRate" className="text-xs">Sort by Conv. Rate</SelectItem>
                  </SelectContent>
                </Select>
              )}
              <Select value={teamLimit.toString()} onValueChange={(v) => { setTeamLimit(Number(v)); setTeamPage(1); }}>
                <SelectTrigger className="h-9 w-[80px] text-xs font-medium bg-background">
                  <SelectValue placeholder="Limit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5" className="text-xs">5 / page</SelectItem>
                  <SelectItem value="10" className="text-xs">10 / page</SelectItem>
                  <SelectItem value="20" className="text-xs">20 / page</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isTeamLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-[180px] w-full rounded-xl" />
              <Skeleton className="h-[180px] w-full rounded-xl" />
            </div>
          ) : isMode2 ? (
            <Card className="border border-border/60 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.02)] rounded-xl overflow-hidden bg-card">
              <CardHeader className="border-b border-border/40 pb-4">
                <CardTitle className="text-base font-black text-foreground tracking-tight capitalize">{teamDataMode2?.position} Leaderboard</CardTitle>
                <CardDescription className="text-xs font-medium text-muted-foreground">Performance metrics for this specific position.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead className="pl-6 h-9 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Rank & User</TableHead>
                      <TableHead className="text-right h-9 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Submitted</TableHead>
                      <TableHead className="text-right h-9 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Hired</TableHead>
                      <TableHead className="text-right h-9 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Dropped</TableHead>
                      <TableHead className="text-right pr-6 h-9 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Conversion Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teamDataMode2?.leaderboard?.map((user, idx) => renderLeaderboardRow(user, (teamPage - 1) * teamLimit + idx))}
                    {(!teamDataMode2?.leaderboard || teamDataMode2.leaderboard.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-xs font-bold uppercase tracking-widest text-muted-foreground py-8">
                          No users found for this position.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                {teamPagination && teamPagination.totalPages > 1 && (
                  <div className="flex items-center justify-between px-6 py-4 border-t border-border/40 bg-muted/10">
                    <span className="text-xs font-medium text-muted-foreground">
                      Showing {(teamPagination.page - 1) * teamPagination.limit + 1} to {Math.min(teamPagination.page * teamPagination.limit, teamPagination.total)} of {teamPagination.total} users
                    </span>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 w-8 p-0" 
                        onClick={() => setTeamPage(p => Math.max(1, p - 1))}
                        disabled={teamPagination.page === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <div className="flex items-center justify-center h-8 px-3 text-xs font-medium border border-border/40 rounded-md bg-background">
                        Page {teamPagination.page} of {teamPagination.totalPages}
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-8 w-8 p-0" 
                        onClick={() => setTeamPage(p => Math.min(teamPagination.totalPages, p + 1))}
                        disabled={teamPagination.page === teamPagination.totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : !teamDataMode1?.jobs?.length && !Object.keys(teamDataMode1?.byPosition || {}).length ? (
            <Card className="border border-border/60 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.02)] rounded-xl">
              <CardContent className="py-8 text-center text-xs font-bold uppercase tracking-widest text-muted-foreground">
                No team performance data found.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* By Position Section */}
              {teamDataMode1?.byPosition && Object.keys(teamDataMode1.byPosition).length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Overall By Position</h4>
                  </div>
                  <div className="grid gap-4">
                    {Object.entries(teamDataMode1.byPosition).map(([position, users]) => (
                      <Card key={position} className="border border-border/60 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.02)] rounded-xl overflow-hidden bg-card">
                        <CardHeader className="py-3 px-6 bg-muted/20 border-b border-border/40">
                          <CardTitle className="text-sm font-black text-foreground tracking-tight capitalize">
                            {position.replace(/([A-Z])/g, ' $1').trim()}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-muted/10 hover:bg-muted/10">
                                <TableHead className="pl-6 h-9 text-[10px] font-black uppercase tracking-widest text-muted-foreground">User</TableHead>
                                <TableHead className="text-right h-9 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Submitted</TableHead>
                                <TableHead className="text-right h-9 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Hired</TableHead>
                                <TableHead className="text-right h-9 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Dropped</TableHead>
                                <TableHead className="text-right pr-6 h-9 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Conversion Rate</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {users.map((user) => {
                                const initials = (user.name || "User")
                                  .split(" ")
                                  .map((w: string) => w[0])
                                  .join("")
                                  .toUpperCase()
                                  .slice(0, 2);

                                let barColor = "bg-rose-500";
                                if (user.conversionRate >= 50) barColor = "bg-emerald-500";
                                else if (user.conversionRate >= 20) barColor = "bg-blue-500";
                                else if (user.conversionRate > 0) barColor = "bg-amber-500";

                                return (
                                  <TableRow key={user.userId} className="hover:bg-muted/15 border-b border-border/40">
                                    <TableCell className="font-medium pl-6 py-2.5">
                                      <div className="flex items-center gap-2.5">
                                        <div className="h-7 w-7 rounded-lg bg-brand/10 text-brand flex items-center justify-center shrink-0 border border-brand/10 font-black text-[10px]">
                                          {initials}
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                          <span className="font-bold text-xs text-foreground tracking-tight truncate">{user.name}</span>
                                          <span className="text-[9px] text-muted-foreground truncate leading-none mt-0.5">{user.email}</span>
                                        </div>
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-right font-medium text-xs py-2.5">{user.submitted}</TableCell>
                                    <TableCell className="text-right text-emerald-600 font-bold text-xs py-2.5">{user.hired}</TableCell>
                                    <TableCell className="text-right text-rose-600 font-medium text-xs py-2.5">{user.dropped}</TableCell>
                                    <TableCell className="text-right pr-6 py-2.5">
                                      <div className="flex items-center justify-end gap-2.5 min-w-[100px] ml-auto">
                                        <span className="font-black text-xs text-foreground">{user.conversionRate}%</span>
                                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden border border-border/40">
                                          <div className={`h-full ${barColor} rounded-full`} style={{ width: `${Math.min(user.conversionRate, 100)}%` }} />
                                        </div>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* By Job Section */}
              {teamDataMode1?.jobs && teamDataMode1.jobs.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Job Performance</h4>
                  </div>
                  <div className="grid gap-6">
                    {teamDataMode1.jobs.map((job) => (
                      <Card key={job.jobId} className="border border-border/60 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.02)] rounded-xl overflow-hidden bg-card">
                        <CardHeader className="border-b border-border/40 pb-4">
                          <CardTitle className="flex items-center gap-2 text-sm font-black text-foreground tracking-tight animate-in fade-in duration-300">
                            <Briefcase className="h-4 w-4 text-brand" />
                            {job.jobTitle}
                          </CardTitle>
                          <CardDescription className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-0.5">{job.client.name}</CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-5 space-y-5">
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                            <div className="bg-muted/40 border border-border/40 p-3 rounded-xl flex items-center justify-between shadow-sm">
                              <div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Overall Conv.</p>
                                <p className="text-xl font-black text-foreground tracking-tight mt-1">{job.jobTotals.conversionRate}%</p>
                              </div>
                              <div className="p-2 rounded-lg bg-brand/10 text-brand">
                                <TrendingUp className="h-4 w-4" />
                              </div>
                            </div>
                            <div className="bg-muted/40 border border-border/40 p-3 rounded-xl flex items-center justify-between shadow-sm">
                              <div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Submitted</p>
                                <p className="text-xl font-black text-foreground tracking-tight mt-1">{job.jobTotals.submitted}</p>
                              </div>
                              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                                <Briefcase className="h-4 w-4" />
                              </div>
                            </div>
                            <div className="bg-muted/40 border border-border/40 p-3 rounded-xl flex items-center justify-between shadow-sm">
                              <div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Hired</p>
                                <p className="text-xl font-black text-emerald-600 tracking-tight mt-1">{job.jobTotals.hired}</p>
                              </div>
                              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                                <CheckCircle2 className="h-4 w-4" />
                              </div>
                            </div>
                            <div className="bg-muted/40 border border-border/40 p-3 rounded-xl flex items-center justify-between shadow-sm">
                              <div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Dropped</p>
                                <p className="text-xl font-black text-rose-600 tracking-tight mt-1">{job.jobTotals.dropped}</p>
                              </div>
                              <div className="p-2 rounded-lg bg-rose-500/10 text-rose-500">
                                <XCircle className="h-4 w-4" />
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            {job.team.map((positionGroup) => (
                              <div key={positionGroup.position} className="space-y-2">
                                <h5 className="font-black text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                  <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                                  {positionGroup.positionLabel}
                                </h5>
                                <div className="rounded-xl border border-border/40 overflow-hidden bg-card">
                                  <Table>
                                    <TableHeader>
                                      <TableRow className="bg-muted/20 hover:bg-muted/20">
                                        <TableHead className="pl-6 h-8 text-[9px] font-black uppercase tracking-widest text-muted-foreground">User</TableHead>
                                        <TableHead className="text-right h-8 text-[9px] font-black uppercase tracking-widest text-muted-foreground">Submitted</TableHead>
                                        <TableHead className="text-right h-8 text-[9px] font-black uppercase tracking-widest text-muted-foreground">Hired</TableHead>
                                        <TableHead className="text-right h-8 text-[9px] font-black uppercase tracking-widest text-muted-foreground">Dropped</TableHead>
                                        <TableHead className="text-right pr-6 h-8 text-[9px] font-black uppercase tracking-widest text-muted-foreground">Conversion Rate</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {positionGroup.users.map((user) => {
                                        const initials = (user.name || "User")
                                          .split(" ")
                                          .map((w: string) => w[0])
                                          .join("")
                                          .toUpperCase()
                                          .slice(0, 2);

                                        let barColor = "bg-rose-500";
                                        if (user.conversionRate >= 50) barColor = "bg-emerald-500";
                                        else if (user.conversionRate >= 20) barColor = "bg-blue-500";
                                        else if (user.conversionRate > 0) barColor = "bg-amber-500";

                                        return (
                                          <TableRow key={user.userId} className="hover:bg-muted/15 border-b border-border/40">
                                            <TableCell className="font-medium pl-6 py-2">
                                              <div className="flex items-center gap-2">
                                                <div className="h-6 w-6 rounded bg-brand/10 text-brand flex items-center justify-center shrink-0 border border-brand/10 font-black text-[9px]">
                                                  {initials}
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                  <span className="font-bold text-xs text-foreground tracking-tight truncate">{user.name}</span>
                                                  <span className="text-[9px] text-muted-foreground truncate leading-none mt-0.5">{user.email}</span>
                                                </div>
                                              </div>
                                            </TableCell>
                                            <TableCell className="text-right font-medium text-xs py-2">{user.submitted}</TableCell>
                                            <TableCell className="text-right text-emerald-600 font-bold text-xs py-2">{user.hired}</TableCell>
                                            <TableCell className="text-right text-rose-600 font-medium text-xs py-2">{user.dropped}</TableCell>
                                            <TableCell className="text-right pr-6 py-2">
                                              <div className="flex items-center justify-end gap-2 min-w-[80px] ml-auto">
                                                <span className="font-black text-xs text-foreground">{user.conversionRate}%</span>
                                                <div className="w-12 h-1 bg-muted rounded-full overflow-hidden border border-border/40">
                                                  <div className={`h-full ${barColor} rounded-full`} style={{ width: `${Math.min(user.conversionRate, 100)}%` }} />
                                                </div>
                                              </div>
                                            </TableCell>
                                          </TableRow>
                                        );
                                      })}
                                      {positionGroup.users.length === 0 && (
                                        <TableRow>
                                          <TableCell colSpan={5} className="text-center text-xs font-bold uppercase tracking-widest text-muted-foreground py-4">
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
              {teamPagination && teamPagination.totalPages > 1 && (
                <div className="flex items-center justify-end px-4 py-2 mt-4">
                  <span className="text-xs font-medium text-muted-foreground mr-4">
                    Showing {(teamPagination.page - 1) * teamPagination.limit + 1} to {Math.min(teamPagination.page * teamPagination.limit, teamPagination.total)} of {teamPagination.total} jobs
                  </span>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 w-8 p-0" 
                      onClick={() => setTeamPage(p => Math.max(1, p - 1))}
                      disabled={teamPagination.page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center justify-center h-8 px-3 text-xs font-medium border border-border/40 rounded-md bg-background">
                      Page {teamPagination.page} of {teamPagination.totalPages}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 w-8 p-0" 
                      onClick={() => setTeamPage(p => Math.min(teamPagination.totalPages, p + 1))}
                      disabled={teamPagination.page === teamPagination.totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
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

