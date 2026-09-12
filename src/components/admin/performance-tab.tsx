import { useState, useMemo } from "react"
import {
  Users,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Briefcase,
  Award,
  Sparkles,
  Building2,
  UserCheck,
} from "lucide-react"
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
import { Badge } from "@/components/ui/badge"
import { useDebounce } from "@/hooks/use-debounce"
import {
  JobBasedTeamPerformanceData,
  PositionLeaderboardData,
} from "@/services/performanceService"
import { AdminFilters, FilterField } from "@/components/admin/shared/admin-filters"
import { AdminPagination } from "@/components/admin/shared/admin-pagination"
import { cn } from "@/lib/utils"

export interface PerformanceTabProps {
  className?: string
}

interface UserDisplayInfo {
  id: string
  name: string
  email: string
  initials: string
  submitted: number
  hired: number
  dropped: number
  conversionRate: number
}

const extractUserInfo = (rawUser: any): UserDisplayInfo => {
  const userObj = rawUser?.user || {}
  const id = String(rawUser?.userId || rawUser?._id || userObj?._id || userObj?.id || "")

  const rawName =
    rawUser?.name ||
    userObj?.name ||
    (userObj?.firstName ? `${userObj.firstName} ${userObj.lastName || ""}`.trim() : "")
  const rawEmail = rawUser?.email || userObj?.email || ""

  const name =
    rawName && rawName.trim().length > 0
      ? rawName
      : rawEmail && rawEmail.includes("@")
      ? rawEmail.split("@")[0]
      : id
      ? `Team Member #${id.slice(-4)}`
      : "Team Member"

  const email = rawEmail && rawEmail.trim().length > 0 ? rawEmail : "No email provided"

  const initials =
    (name || "TM")
      .split(/[\s._-]+/)
      .filter(Boolean)
      .map((w: string) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "TM"

  const submitted = Number(rawUser?.submitted) || 0
  const hired = Number(rawUser?.hired) || 0
  const dropped = Number(rawUser?.dropped) || 0

  let conversionRate = 0
  if (
    rawUser?.conversionRate !== undefined &&
    rawUser?.conversionRate !== null &&
    !isNaN(Number(rawUser.conversionRate))
  ) {
    conversionRate = Number(rawUser.conversionRate)
  } else if (submitted > 0) {
    conversionRate = Math.round((hired / submitted) * 100)
  } else if (hired > 0) {
    conversionRate = 100
  }

  return {
    id,
    name,
    email,
    initials,
    submitted,
    hired,
    dropped,
    conversionRate: Math.min(Math.max(conversionRate, 0), 100),
  }
}

const formatPositionTitle = (pos: string): string => {
  if (!pos || pos === "all") return "All Roles (Overview)"
  if (pos.toLowerCase() === "recruiter") return "Recruiter"
  if (pos.toLowerCase() === "teamlead" || pos.toLowerCase() === "team lead") return "Team Lead"
  if (pos.toLowerCase() === "hiringmanager" || pos.toLowerCase() === "hiring manager")
    return "Hiring Manager"
  if (pos.toLowerCase() === "accountmanager" || pos.toLowerCase() === "account manager")
    return "Account Manager"

  return pos
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .split(/[\s_-]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ")
}

const getDateRange = (range: string): { from?: string; to?: string } => {
  if (range === "all") return {}
  const now = new Date()
  const to = now.toISOString()

  if (range === "today") {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    return { from: start.toISOString(), to }
  }
  if (range === "week") {
    const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    return { from: start.toISOString(), to }
  }
  if (range === "month") {
    const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    return { from: start.toISOString(), to }
  }
  if (range === "year") {
    const start = new Date(now.getFullYear(), 0, 1)
    return { from: start.toISOString(), to }
  }
  return {}
}

const renderLeaderboardRow = (rawUser: any, idx: number) => {
  const user = extractUserInfo(rawUser)
  const rank = idx + 1

  let rankBadge = null
  if (rank === 1) {
    rankBadge = (
      <span className="flex h-5 w-5 rounded-full bg-amber-500/15 text-amber-600 border border-amber-500/30 items-center justify-center text-[10px] font-black shadow-xs shrink-0">
        1
      </span>
    )
  } else if (rank === 2) {
    rankBadge = (
      <span className="flex h-5 w-5 rounded-full bg-slate-400/15 text-slate-600 border border-slate-400/30 items-center justify-center text-[10px] font-black shadow-xs shrink-0">
        2
      </span>
    )
  } else if (rank === 3) {
    rankBadge = (
      <span className="flex h-5 w-5 rounded-full bg-amber-700/15 text-amber-800 border border-amber-700/30 items-center justify-center text-[10px] font-black shadow-xs shrink-0">
        3
      </span>
    )
  } else {
    rankBadge = (
      <span className="flex h-5 w-5 rounded-full bg-muted text-muted-foreground items-center justify-center text-[10px] font-bold shrink-0">
        {rank}
      </span>
    )
  }

  let barColor = "bg-rose-500"
  let statusBadge = (
    <Badge
      variant="outline"
      className="text-[9px] font-bold bg-muted/30 text-muted-foreground border-border/50 py-0 px-1.5 h-4.5"
    >
      Pipeline
    </Badge>
  )

  if (user.conversionRate >= 50) {
    barColor = "bg-emerald-500"
    statusBadge = (
      <Badge
        variant="outline"
        className="text-[9px] font-bold bg-emerald-500/10 text-emerald-600 border-emerald-500/25 py-0 px-1.5 h-4.5"
      >
        Top Performer
      </Badge>
    )
  } else if (user.conversionRate >= 20) {
    barColor = "bg-blue-500"
    statusBadge = (
      <Badge
        variant="outline"
        className="text-[9px] font-bold bg-blue-500/10 text-blue-600 border-blue-500/25 py-0 px-1.5 h-4.5"
      >
        On Track
      </Badge>
    )
  } else if (user.conversionRate > 0) {
    barColor = "bg-amber-500"
    statusBadge = (
      <Badge
        variant="outline"
        className="text-[9px] font-bold bg-amber-500/10 text-amber-600 border-amber-500/25 py-0 px-1.5 h-4.5"
      >
        Active
      </Badge>
    )
  }

  return (
    <TableRow
      key={user.id || `row-${idx}`}
      className="hover:bg-muted/15 border-b border-border/40 transition-colors"
    >
      <TableCell className="font-medium pl-3 sm:pl-4 py-2">
        <div className="flex items-center gap-2.5">
          {rankBadge}
          <div className="h-6.5 w-6.5 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20 font-black text-[9.5px]">
            {user.initials}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-xs text-foreground tracking-tight truncate max-w-[180px] sm:max-w-[240px]">
              {user.name}
            </span>
            <span className="text-[9.5px] text-muted-foreground truncate max-w-[180px] sm:max-w-[240px] leading-none mt-0.5">
              {user.email}
            </span>
          </div>
        </div>
      </TableCell>
      <TableCell className="text-right font-medium text-xs py-2">
        <span className="text-foreground">{user.submitted}</span>
      </TableCell>
      <TableCell className="text-right text-emerald-600 font-bold text-xs py-2">
        {user.hired}
      </TableCell>
      <TableCell className="text-right text-rose-600 font-medium text-xs py-2">
        {user.dropped}
      </TableCell>
      <TableCell className="text-center py-2 hidden md:table-cell">
        {statusBadge}
      </TableCell>
      <TableCell className="text-right pr-3 sm:pr-4 py-2">
        <div className="flex flex-col items-end gap-1 min-w-[85px] ml-auto">
          <span className="inline-flex items-center gap-1 font-black text-xs text-foreground">
            <TrendingUp className="h-3 w-3 text-muted-foreground" />
            {user.conversionRate}%
          </span>
          <div className="w-16 sm:w-20 h-1.5 bg-muted rounded-full overflow-hidden border border-border/40">
            <div
              className={`h-full ${barColor} transition-all duration-500 rounded-full`}
              style={{ width: `${Math.min(user.conversionRate, 100)}%` }}
            />
          </div>
        </div>
      </TableCell>
    </TableRow>
  )
}

export function PerformanceTab({ className }: PerformanceTabProps = {}) {
  const [activeTab, setActiveTab] = useState<"users" | "team">("users")

  // Common Filter: Date Range
  const [timeRange, setTimeRange] = useState<string>("all")
  const dateParams = useMemo(() => getDateRange(timeRange), [timeRange])

  // Users Tab State
  const [usersPage, setUsersPage] = useState(1)
  const [usersLimit, setUsersLimit] = useState(10)
  const [usersSearch, setUsersSearch] = useState("")
  const [usersSortBy, setUsersSortBy] = useState("hired")

  const debouncedUsersSearch = useDebounce(usersSearch, 400)

  // Team Tab State
  const [teamPage, setTeamPage] = useState(1)
  const [teamLimit, setTeamLimit] = useState(10)
  const [teamPosition, setTeamPosition] = useState<string>("all") // "all" or specific position
  const [teamSearch, setTeamSearch] = useState("")
  const [teamSortBy, setTeamSortBy] = useState("hired")

  const debouncedTeamSearch = useDebounce(teamSearch, 400)

  const { data: usersResponse, isLoading: isUsersLoading } = useUsersPerformance({
    page: usersPage,
    limit: usersLimit,
    search: debouncedUsersSearch || undefined,
    sortBy: usersSortBy,
    order: "desc",
    from: dateParams.from,
    to: dateParams.to,
  })

  const { data: teamResponse, isLoading: isTeamLoading } = useTeamPerformance({
    page: teamPage,
    limit: teamLimit,
    position: teamPosition === "all" ? undefined : teamPosition,
    search: debouncedTeamSearch || undefined,
    sortBy: teamPosition !== "all" ? teamSortBy : undefined,
    order: "desc",
    from: dateParams.from,
    to: dateParams.to,
  })

  const usersData = usersResponse?.data || []
  const usersPagination = usersResponse?.pagination

  const isMode2 = teamPosition !== "all"
  const teamDataMode1 = !isMode2 ? (teamResponse?.data as JobBasedTeamPerformanceData) : null
  const teamDataMode2 = isMode2 ? (teamResponse?.data as PositionLeaderboardData) : null
  const teamPagination = teamResponse?.pagination

  // Aggregate Executive Funnel Metrics
  const summaryKPIs = useMemo(() => {
    let totalSubmitted = 0
    let totalHired = 0
    let totalDropped = 0
    const performersCount = usersPagination?.total ?? usersData.length

    usersData.forEach((raw) => {
      const u = extractUserInfo(raw)
      totalSubmitted += u.submitted
      totalHired += u.hired
      totalDropped += u.dropped
    })

    const avgConversion =
      totalSubmitted > 0
        ? Math.round((totalHired / totalSubmitted) * 100)
        : totalHired > 0
        ? 100
        : 0

    return {
      totalSubmitted,
      totalHired,
      totalDropped,
      avgConversion,
      performersCount,
    }
  }, [usersData, usersPagination])

  // Filter definitions for User Leaderboard
  const usersLeftFilters: FilterField[] = [
    {
      id: "usersSearch",
      type: "search",
      placeholder: "Search team member by name or email...",
      value: usersSearch,
      onChange: (val: string) => {
        setUsersSearch(val)
        setUsersPage(1)
      },
      className: "w-full sm:w-64",
    },
    {
      id: "timeRange",
      type: "select",
      placeholder: "Time Range",
      value: timeRange,
      onChange: (val: string) => {
        setTimeRange(val)
        setUsersPage(1)
      },
      options: [
        { label: "All Time", value: "all" },
        { label: "Today", value: "today" },
        { label: "Last 7 Days", value: "week" },
        { label: "Last 30 Days", value: "month" },
        { label: "This Year", value: "year" },
      ],
      className: "w-[125px]",
    },
  ]

  const usersRightFilters: FilterField[] = [
    {
      id: "usersSortBy",
      type: "select",
      placeholder: "Sort by",
      value: usersSortBy,
      onChange: (val: string) => {
        setUsersSortBy(val)
        setUsersPage(1)
      },
      options: [
        { label: "Sort by Hired", value: "hired" },
        { label: "Sort by Submitted", value: "submitted" },
        { label: "Sort by Dropped", value: "dropped" },
        { label: "Sort by Conv. Rate", value: "conversionRate" },
      ],
      className: "w-[145px]",
    },
  ]

  // Filter definitions for Team Performance
  const teamLeftFilters: FilterField[] = [
    {
      id: "teamPosition",
      type: "select",
      placeholder: "Select View",
      value: teamPosition,
      onChange: (val: string) => {
        setTeamPosition(val)
        setTeamPage(1)
      },
      options: [
        { label: "All Roles (Overview)", value: "all" },
        { label: "Recruiters", value: "recruiter" },
        { label: "Team Leads", value: "teamLead" },
        { label: "Hiring Managers", value: "hiringManager" },
        { label: "Account Managers", value: "accountManager" },
      ],
      className: "w-[165px]",
    },
    {
      id: "teamTimeRange",
      type: "select",
      placeholder: "Time Range",
      value: timeRange,
      onChange: (val: string) => {
        setTimeRange(val)
        setTeamPage(1)
      },
      options: [
        { label: "All Time", value: "all" },
        { label: "Today", value: "today" },
        { label: "Last 7 Days", value: "week" },
        { label: "Last 30 Days", value: "month" },
        { label: "This Year", value: "year" },
      ],
      className: "w-[125px]",
    },
    {
      id: "teamSearch",
      type: "search",
      placeholder: isMode2 ? "Search member..." : "Filter jobs / team...",
      value: teamSearch,
      onChange: (val: string) => {
        setTeamSearch(val)
        setTeamPage(1)
      },
      className: "w-full sm:w-56",
    },
  ]

  const teamRightFilters: FilterField[] = isMode2
    ? [
        {
          id: "teamSortBy",
          type: "select",
          placeholder: "Sort by",
          value: teamSortBy,
          onChange: (val: string) => {
            setTeamSortBy(val)
            setTeamPage(1)
          },
          options: [
            { label: "Sort by Hired", value: "hired" },
            { label: "Sort by Submitted", value: "submitted" },
            { label: "Sort by Dropped", value: "dropped" },
            { label: "Sort by Conv. Rate", value: "conversionRate" },
          ],
          className: "w-[145px]",
        },
      ]
    : []

  // Client-side filtering for Overview mode jobs
  const filteredOverviewJobs = useMemo(() => {
    if (!teamDataMode1?.jobs) return []
    if (!debouncedTeamSearch) return teamDataMode1.jobs

    const q = debouncedTeamSearch.toLowerCase()
    return teamDataMode1.jobs.filter((job) => {
      const matchTitle = (job.jobTitle || "").toLowerCase().includes(q)
      const matchClient = (job.client?.name || "").toLowerCase().includes(q)
      const matchMember = job.team?.some((pos) =>
        pos.users?.some((u) => {
          const info = extractUserInfo(u)
          return info.name.toLowerCase().includes(q) || info.email.toLowerCase().includes(q)
        })
      )
      return matchTitle || matchClient || matchMember
    })
  }, [teamDataMode1?.jobs, debouncedTeamSearch])

  return (
    <Tabs
      value={activeTab}
      onValueChange={(v) => setActiveTab(v as any)}
      className={cn("flex-1 min-h-0 flex flex-col gap-2 overflow-hidden w-full", className)}
    >
      {/* Performance Command Header & Subtab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1.5 border-b border-border/40 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-foreground">
              Performance Tracking
            </h3>
            <Badge
              variant="outline"
              className="text-[9.5px] font-black uppercase tracking-wider bg-primary/10 text-primary border-primary/20 py-0 px-1.5 h-4.5"
            >
              Telemetry
            </Badge>
          </div>
          <p className="text-[11px] text-muted-foreground font-medium">
            Track individual conversions, role-based metrics, and job performance telemetry.
          </p>
        </div>

        <TabsList className="flex w-full sm:w-[300px] bg-muted/65 p-0.5 rounded-lg border border-border/50 shadow-inner shrink-0 h-7.5">
          <TabsTrigger
            value="users"
            className="flex-1 gap-1.5 rounded-md py-0.5 px-2.5 font-black text-[10px] uppercase tracking-wider transition-all data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-2xs"
          >
            <UserCheck className="h-3 w-3" />
            User Leaderboard
          </TabsTrigger>
          <TabsTrigger
            value="team"
            className="flex-1 gap-1.5 rounded-md py-0.5 px-2.5 font-black text-[10px] uppercase tracking-wider transition-all data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-2xs"
          >
            <Users className="h-3 w-3" />
            Team Analytics
          </TabsTrigger>
        </TabsList>
      </div>

      {/* Executive Telemetry KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 shrink-0">
        {/* Metric: Submitted */}
        <div className="p-2 sm:p-2.5 rounded-xl border border-border/60 bg-card/90 backdrop-blur-xs flex items-center justify-between shadow-2xs">
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
              Submitted
            </p>
            <p className="text-base sm:text-lg font-black text-foreground tracking-tight mt-0.5">
              {summaryKPIs.totalSubmitted}
            </p>
          </div>
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 border border-blue-500/20 shrink-0">
            <Briefcase className="h-3.5 w-3.5" />
          </div>
        </div>

        {/* Metric: Hired */}
        <div className="p-2 sm:p-2.5 rounded-xl border border-border/60 bg-card/90 backdrop-blur-xs flex items-center justify-between shadow-2xs">
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
              Hired
            </p>
            <p className="text-base sm:text-lg font-black text-emerald-600 tracking-tight mt-0.5">
              {summaryKPIs.totalHired}
            </p>
          </div>
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shrink-0">
            <CheckCircle2 className="h-3.5 w-3.5" />
          </div>
        </div>

        {/* Metric: Dropped */}
        <div className="p-2 sm:p-2.5 rounded-xl border border-border/60 bg-card/90 backdrop-blur-xs flex items-center justify-between shadow-2xs">
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
              Dropped
            </p>
            <p className="text-base sm:text-lg font-black text-rose-600 tracking-tight mt-0.5">
              {summaryKPIs.totalDropped}
            </p>
          </div>
          <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 border border-rose-500/20 shrink-0">
            <XCircle className="h-3.5 w-3.5" />
          </div>
        </div>

        {/* Metric: Conversion Rate */}
        <div className="p-2 sm:p-2.5 rounded-xl border border-border/60 bg-card/90 backdrop-blur-xs flex items-center justify-between shadow-2xs">
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
              Funnel Conv.
            </p>
            <p className="text-base sm:text-lg font-black text-foreground tracking-tight mt-0.5">
              {summaryKPIs.avgConversion}%
            </p>
          </div>
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 shrink-0">
            <TrendingUp className="h-3.5 w-3.5" />
          </div>
        </div>

        {/* Metric: Active Performers */}
        <div className="col-span-2 sm:col-span-1 p-2 sm:p-2.5 rounded-xl border border-border/60 bg-card/90 backdrop-blur-xs flex items-center justify-between shadow-2xs">
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
              Tracked Members
            </p>
            <p className="text-base sm:text-lg font-black text-foreground tracking-tight mt-0.5">
              {summaryKPIs.performersCount}
            </p>
          </div>
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 border border-indigo-500/20 shrink-0">
            <Award className="h-3.5 w-3.5" />
          </div>
        </div>
      </div>

      {/* ─── USER LEADERBOARD CONTENT ─── */}
      <TabsContent
        value="users"
        className="data-[state=inactive]:hidden data-[state=active]:flex data-[state=active]:flex-1 data-[state=active]:min-h-0 data-[state=active]:flex-col gap-2 m-0 overflow-hidden outline-none"
      >
        <AdminFilters
          leftFields={usersLeftFilters}
          rightFields={usersRightFilters}
          className="py-1.5 px-2.5 shrink-0 bg-card/90 backdrop-blur-xs"
        />

        <div className="flex-1 min-h-0 flex flex-col rounded-xl border border-border/70 bg-card/95 shadow-2xs overflow-hidden">
          <div className="px-3.5 py-2 border-b border-border/40 bg-muted/15 flex items-center justify-between shrink-0">
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-foreground">
                All Team Members Leaderboard
              </h4>
              <p className="text-[10px] text-muted-foreground font-medium">
                Comprehensive candidate conversion metrics, ranked by highest successful hires.
              </p>
            </div>
            <span className="text-[10px] font-bold text-muted-foreground">
              Total {usersPagination?.total ?? usersData.length} records
            </span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto relative custom-scrollbar">
            {isUsersLoading ? (
              <div className="p-3 space-y-2">
                <Skeleton className="h-7 w-full rounded-md" />
                <Skeleton className="h-9 w-full rounded-md" />
                <Skeleton className="h-9 w-full rounded-md" />
                <Skeleton className="h-9 w-full rounded-md" />
              </div>
            ) : (
              <Table className="w-full">
                <TableHeader className="sticky top-0 z-10 bg-muted/95 backdrop-blur-md border-b border-border/60 shadow-2xs">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="pl-3 sm:pl-4 h-8 text-[9.5px] font-black uppercase tracking-widest text-muted-foreground">
                      Rank & Team Member
                    </TableHead>
                    <TableHead className="text-right h-8 text-[9.5px] font-black uppercase tracking-widest text-muted-foreground">
                      Submitted
                    </TableHead>
                    <TableHead className="text-right h-8 text-[9.5px] font-black uppercase tracking-widest text-muted-foreground">
                      Hired
                    </TableHead>
                    <TableHead className="text-right h-8 text-[9.5px] font-black uppercase tracking-widest text-muted-foreground">
                      Dropped
                    </TableHead>
                    <TableHead className="text-center h-8 text-[9.5px] font-black uppercase tracking-widest text-muted-foreground hidden md:table-cell">
                      Status
                    </TableHead>
                    <TableHead className="text-right pr-3 sm:pr-4 h-8 text-[9.5px] font-black uppercase tracking-widest text-muted-foreground">
                      Conversion Rate
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usersData.map((user, idx) =>
                    renderLeaderboardRow(user, (usersPage - 1) * usersLimit + idx)
                  )}
                  {usersData.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-xs font-bold uppercase tracking-widest text-muted-foreground py-10"
                      >
                        No user performance records found for this timeframe.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>

          {usersPagination && usersPagination.total > 0 && (
            <AdminPagination
              page={usersPage}
              totalPages={usersPagination.totalPages}
              totalItems={usersPagination.total}
              limit={usersLimit}
              onPageChange={setUsersPage}
              onLimitChange={(v) => {
                setUsersLimit(v)
                setUsersPage(1)
              }}
              itemName="members"
              isLoading={isUsersLoading}
              limitOptions={[5, 10, 20, 50]}
              className="border-t border-border/50 py-1 px-3 bg-card shrink-0"
            />
          )}
        </div>
      </TabsContent>

      {/* ─── TEAM ANALYTICS CONTENT ─── */}
      <TabsContent
        value="team"
        className="data-[state=inactive]:hidden data-[state=active]:flex data-[state=active]:flex-1 data-[state=active]:min-h-0 data-[state=active]:flex-col gap-2 m-0 overflow-hidden outline-none"
      >
        <AdminFilters
          leftFields={teamLeftFilters}
          rightFields={teamRightFilters}
          className="py-1.5 px-2.5 shrink-0 bg-card/90 backdrop-blur-xs"
        />

        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden space-y-3.5 custom-scrollbar pr-1">
          {isTeamLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-[140px] w-full rounded-xl" />
              <Skeleton className="h-[180px] w-full rounded-xl" />
            </div>
          ) : isMode2 ? (
            /* Mode 2: Specific Position Leaderboard */
            <Card className="border border-border/70 shadow-2xs rounded-xl overflow-hidden bg-card/95">
              <CardHeader className="py-2.5 px-4 border-b border-border/40 bg-muted/15 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xs sm:text-sm font-black text-foreground tracking-tight">
                    {formatPositionTitle(teamDataMode2?.position || teamPosition)} Leaderboard
                  </CardTitle>
                  <CardDescription className="text-[10px] font-medium text-muted-foreground mt-0.5">
                    Conversion benchmarks for all users assigned to this role.
                  </CardDescription>
                </div>
                <Badge
                  variant="outline"
                  className="text-[9.5px] font-bold bg-primary/10 text-primary border-primary/20"
                >
                  {teamPagination?.total || 0} Members
                </Badge>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-muted/40 border-b border-border/60">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="pl-3 sm:pl-4 h-8 text-[9.5px] font-black uppercase tracking-widest text-muted-foreground">
                        Rank & Team Member
                      </TableHead>
                      <TableHead className="text-right h-8 text-[9.5px] font-black uppercase tracking-widest text-muted-foreground">
                        Submitted
                      </TableHead>
                      <TableHead className="text-right h-8 text-[9.5px] font-black uppercase tracking-widest text-muted-foreground">
                        Hired
                      </TableHead>
                      <TableHead className="text-right h-8 text-[9.5px] font-black uppercase tracking-widest text-muted-foreground">
                        Dropped
                      </TableHead>
                      <TableHead className="text-center h-8 text-[9.5px] font-black uppercase tracking-widest text-muted-foreground hidden md:table-cell">
                        Status
                      </TableHead>
                      <TableHead className="text-right pr-3 sm:pr-4 h-8 text-[9.5px] font-black uppercase tracking-widest text-muted-foreground">
                        Conversion Rate
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teamDataMode2?.leaderboard?.map((user, idx) =>
                      renderLeaderboardRow(user, (teamPage - 1) * teamLimit + idx)
                    )}
                    {(!teamDataMode2?.leaderboard || teamDataMode2.leaderboard.length === 0) && (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center text-xs font-bold uppercase tracking-widest text-muted-foreground py-10"
                        >
                          No members found for position &quot;
                          {formatPositionTitle(teamPosition)}&quot;.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>

                {teamPagination && teamPagination.total > 0 && (
                  <AdminPagination
                    page={teamPage}
                    totalPages={teamPagination.totalPages}
                    totalItems={teamPagination.total}
                    limit={teamLimit}
                    onPageChange={setTeamPage}
                    onLimitChange={(v) => {
                      setTeamLimit(v)
                      setTeamPage(1)
                    }}
                    itemName="members"
                    isLoading={isTeamLoading}
                    limitOptions={[5, 10, 20]}
                    className="border-t border-border/50 py-1 px-3 bg-card"
                  />
                )}
              </CardContent>
            </Card>
          ) : !teamDataMode1?.jobs?.length &&
            !Object.keys(teamDataMode1?.byPosition || {}).length ? (
            <Card className="border border-border/60 shadow-2xs rounded-xl">
              <CardContent className="py-10 text-center text-xs font-bold uppercase tracking-widest text-muted-foreground">
                No team performance records found for this timeframe.
              </CardContent>
            </Card>
          ) : (
            /* Mode 1: All Jobs Overview */
            <div className="space-y-4">
              {/* Section 1: Overall By Position */}
              {teamDataMode1?.byPosition &&
                Object.keys(teamDataMode1.byPosition).length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 px-0.5">
                      <Users className="h-3.5 w-3.5 text-primary" />
                      <h4 className="text-[10.5px] font-black uppercase tracking-widest text-foreground">
                        Overall By Role
                      </h4>
                      <span className="text-[10px] text-muted-foreground font-medium">
                        (Top performers by assigned recruitment role)
                      </span>
                    </div>

                    <div className="grid gap-3 grid-cols-1 xl:grid-cols-2">
                      {Object.entries(teamDataMode1.byPosition).map(([posKey, users]) => (
                        <Card
                          key={posKey}
                          className="border border-border/70 shadow-2xs rounded-xl overflow-hidden bg-card/95"
                        >
                          <CardHeader className="py-2 px-3.5 bg-muted/20 border-b border-border/40 flex flex-row items-center justify-between">
                            <CardTitle className="text-xs font-black text-foreground tracking-tight">
                              {formatPositionTitle(posKey)}
                            </CardTitle>
                            <Badge
                              variant="outline"
                              className="text-[9px] font-bold bg-muted/40 text-muted-foreground border-border/60 py-0 px-1.5 h-4"
                            >
                              {users.length} Active
                            </Badge>
                          </CardHeader>
                          <CardContent className="p-0">
                            <Table>
                              <TableHeader className="bg-muted/10 border-b border-border/40">
                                <TableRow className="hover:bg-transparent">
                                  <TableHead className="pl-3 sm:pl-3.5 h-7.5 text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                                    Team Member
                                  </TableHead>
                                  <TableHead className="text-right h-7.5 text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                                    Submitted
                                  </TableHead>
                                  <TableHead className="text-right h-7.5 text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                                    Hired
                                  </TableHead>
                                  <TableHead className="text-right h-7.5 text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                                    Dropped
                                  </TableHead>
                                  <TableHead className="text-right pr-3 sm:pr-3.5 h-7.5 text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                                    Conv. Rate
                                  </TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {users.map((rawUser, idx) => {
                                  const user = extractUserInfo(rawUser)
                                  let barColor = "bg-rose-500"
                                  if (user.conversionRate >= 50) barColor = "bg-emerald-500"
                                  else if (user.conversionRate >= 20) barColor = "bg-blue-500"
                                  else if (user.conversionRate > 0) barColor = "bg-amber-500"

                                  return (
                                    <TableRow
                                      key={user.id || `bypos-${posKey}-${idx}`}
                                      className="hover:bg-muted/15 border-b border-border/40"
                                    >
                                      <TableCell className="font-medium pl-3 sm:pl-3.5 py-1.5">
                                        <div className="flex items-center gap-2">
                                          <div className="h-6 w-6 rounded bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20 font-black text-[9px]">
                                            {user.initials}
                                          </div>
                                          <div className="flex flex-col min-w-0">
                                            <span className="font-bold text-xs text-foreground tracking-tight truncate max-w-[140px] sm:max-w-[180px]">
                                              {user.name}
                                            </span>
                                            <span className="text-[9px] text-muted-foreground truncate max-w-[140px] sm:max-w-[180px] leading-none mt-0.5">
                                              {user.email}
                                            </span>
                                          </div>
                                        </div>
                                      </TableCell>
                                      <TableCell className="text-right font-medium text-xs py-1.5">
                                        {user.submitted}
                                      </TableCell>
                                      <TableCell className="text-right text-emerald-600 font-bold text-xs py-1.5">
                                        {user.hired}
                                      </TableCell>
                                      <TableCell className="text-right text-rose-600 font-medium text-xs py-1.5">
                                        {user.dropped}
                                      </TableCell>
                                      <TableCell className="text-right pr-3 sm:pr-3.5 py-1.5">
                                        <div className="flex items-center justify-end gap-1.5 min-w-[70px] ml-auto">
                                          <span className="font-black text-xs text-foreground">
                                            {user.conversionRate}%
                                          </span>
                                          <div className="w-12 h-1 bg-muted rounded-full overflow-hidden border border-border/40">
                                            <div
                                              className={`h-full ${barColor} rounded-full`}
                                              style={{ width: `${Math.min(user.conversionRate, 100)}%` }}
                                            />
                                          </div>
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  )
                                })}
                              </TableBody>
                            </Table>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

              {/* Section 2: By Job Section */}
              {filteredOverviewJobs.length > 0 && (
                <div className="space-y-2.5 pt-1">
                  <div className="flex items-center justify-between px-0.5">
                    <div className="flex items-center gap-1.5">
                      <Briefcase className="h-3.5 w-3.5 text-primary" />
                      <h4 className="text-[10.5px] font-black uppercase tracking-widest text-foreground">
                        Job Performance Telemetry
                      </h4>
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground">
                      Showing {filteredOverviewJobs.length} jobs
                    </span>
                  </div>

                  <div className="grid gap-3">
                    {filteredOverviewJobs.map((job) => (
                      <Card
                        key={job.jobId}
                        className="border border-border/70 shadow-2xs rounded-xl overflow-hidden bg-card/95"
                      >
                        <CardHeader className="py-2.5 px-4 border-b border-border/40 bg-muted/15 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <div>
                            <CardTitle className="flex items-center gap-2 text-xs sm:text-sm font-black text-foreground tracking-tight">
                              <Briefcase className="h-3.5 w-3.5 text-primary" />
                              {job.jobTitle}
                            </CardTitle>
                            <CardDescription className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-0.5 flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              {job.client?.name || "Independent Client"}
                            </CardDescription>
                          </div>

                          <div className="flex items-center gap-2 mt-1 sm:mt-0">
                            <span className="text-[10px] font-bold text-muted-foreground">
                              Job Conversion:
                            </span>
                            <Badge
                              variant="outline"
                              className="text-[10.5px] font-black bg-primary/10 text-primary border-primary/20 py-0.5 px-2"
                            >
                              {job.jobTotals?.conversionRate ?? 0}%
                            </Badge>
                          </div>
                        </CardHeader>

                        <CardContent className="p-3 sm:p-4 space-y-3.5">
                          {/* Mini KPI metrics list */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <div className="bg-muted/30 border border-border/40 p-2 rounded-lg flex items-center justify-between">
                              <div>
                                <p className="text-[8.5px] font-black uppercase tracking-widest text-muted-foreground">
                                  Conversion
                                </p>
                                <p className="text-base font-black text-foreground tracking-tight mt-0.5">
                                  {job.jobTotals?.conversionRate ?? 0}%
                                </p>
                              </div>
                              <div className="p-1.5 rounded-md bg-primary/10 text-primary">
                                <TrendingUp className="h-3 w-3" />
                              </div>
                            </div>

                            <div className="bg-muted/30 border border-border/40 p-2 rounded-lg flex items-center justify-between">
                              <div>
                                <p className="text-[8.5px] font-black uppercase tracking-widest text-muted-foreground">
                                  Submitted
                                </p>
                                <p className="text-base font-black text-foreground tracking-tight mt-0.5">
                                  {job.jobTotals?.submitted ?? 0}
                                </p>
                              </div>
                              <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-600">
                                <Briefcase className="h-3 w-3" />
                              </div>
                            </div>

                            <div className="bg-muted/30 border border-border/40 p-2 rounded-lg flex items-center justify-between">
                              <div>
                                <p className="text-[8.5px] font-black uppercase tracking-widest text-muted-foreground">
                                  Hired
                                </p>
                                <p className="text-base font-black text-emerald-600 tracking-tight mt-0.5">
                                  {job.jobTotals?.hired ?? 0}
                                </p>
                              </div>
                              <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-600">
                                <CheckCircle2 className="h-3 w-3" />
                              </div>
                            </div>

                            <div className="bg-muted/30 border border-border/40 p-2 rounded-lg flex items-center justify-between">
                              <div>
                                <p className="text-[8.5px] font-black uppercase tracking-widest text-muted-foreground">
                                  Dropped
                                </p>
                                <p className="text-base font-black text-rose-600 tracking-tight mt-0.5">
                                  {job.jobTotals?.dropped ?? 0}
                                </p>
                              </div>
                              <div className="p-1.5 rounded-md bg-rose-500/10 text-rose-600">
                                <XCircle className="h-3 w-3" />
                              </div>
                            </div>
                          </div>

                          {/* Inner Table list by Position Group */}
                          <div className="space-y-3">
                            {job.team?.map((positionGroup) => (
                              <div key={positionGroup.position} className="space-y-1.5">
                                <h5 className="font-black text-[9.5px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                                  {positionGroup.positionLabel || formatPositionTitle(positionGroup.position)}
                                </h5>

                                <div className="rounded-lg border border-border/50 overflow-hidden bg-card">
                                  <Table>
                                    <TableHeader className="bg-muted/20 border-b border-border/40">
                                      <TableRow className="hover:bg-transparent">
                                        <TableHead className="pl-3 sm:pl-4 h-7 text-[8.5px] font-black uppercase tracking-widest text-muted-foreground">
                                          User
                                        </TableHead>
                                        <TableHead className="text-right h-7 text-[8.5px] font-black uppercase tracking-widest text-muted-foreground">
                                          Submitted
                                        </TableHead>
                                        <TableHead className="text-right h-7 text-[8.5px] font-black uppercase tracking-widest text-muted-foreground">
                                          Hired
                                        </TableHead>
                                        <TableHead className="text-right h-7 text-[8.5px] font-black uppercase tracking-widest text-muted-foreground">
                                          Dropped
                                        </TableHead>
                                        <TableHead className="text-right pr-3 sm:pr-4 h-7 text-[8.5px] font-black uppercase tracking-widest text-muted-foreground">
                                          Conversion Rate
                                        </TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {positionGroup.users?.map((rawUser, uIdx) => {
                                        const user = extractUserInfo(rawUser)
                                        let barColor = "bg-rose-500"
                                        if (user.conversionRate >= 50) barColor = "bg-emerald-500"
                                        else if (user.conversionRate >= 20) barColor = "bg-blue-500"
                                        else if (user.conversionRate > 0) barColor = "bg-amber-500"

                                        return (
                                          <TableRow
                                            key={user.id || `job-u-${job.jobId}-${uIdx}`}
                                            className="hover:bg-muted/15 border-b border-border/40"
                                          >
                                            <TableCell className="font-medium pl-3 sm:pl-4 py-1.5">
                                              <div className="flex items-center gap-2">
                                                <div className="h-5.5 w-5.5 rounded bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20 font-black text-[8.5px]">
                                                  {user.initials}
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                  <span className="font-bold text-xs text-foreground tracking-tight truncate max-w-[130px] sm:max-w-[180px]">
                                                    {user.name}
                                                  </span>
                                                  <span className="text-[8.5px] text-muted-foreground truncate max-w-[130px] sm:max-w-[180px] leading-none mt-0.5">
                                                    {user.email}
                                                  </span>
                                                </div>
                                              </div>
                                            </TableCell>
                                            <TableCell className="text-right font-medium text-xs py-1.5">
                                              {user.submitted}
                                            </TableCell>
                                            <TableCell className="text-right text-emerald-600 font-bold text-xs py-1.5">
                                              {user.hired}
                                            </TableCell>
                                            <TableCell className="text-right text-rose-600 font-medium text-xs py-1.5">
                                              {user.dropped}
                                            </TableCell>
                                            <TableCell className="text-right pr-3 sm:pr-4 py-1.5">
                                              <div className="flex items-center justify-end gap-2 min-w-[70px] ml-auto">
                                                <span className="font-black text-xs text-foreground">
                                                  {user.conversionRate}%
                                                </span>
                                                <div className="w-10 h-1 bg-muted rounded-full overflow-hidden border border-border/40">
                                                  <div
                                                    className={`h-full ${barColor} rounded-full`}
                                                    style={{
                                                      width: `${Math.min(user.conversionRate, 100)}%`,
                                                    }}
                                                  />
                                                </div>
                                              </div>
                                            </TableCell>
                                          </TableRow>
                                        )
                                      })}
                                      {(!positionGroup.users ||
                                        positionGroup.users.length === 0) && (
                                        <TableRow>
                                          <TableCell
                                            colSpan={5}
                                            className="text-center text-xs font-bold uppercase tracking-widest text-muted-foreground py-3"
                                          >
                                            No team members assigned
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

              {teamPagination && teamPagination.total > 0 && (
                <div className="border border-border/60 rounded-xl overflow-hidden bg-card shadow-2xs">
                  <AdminPagination
                    page={teamPage}
                    totalPages={teamPagination.totalPages}
                    totalItems={teamPagination.total}
                    limit={teamLimit}
                    onPageChange={setTeamPage}
                    onLimitChange={(v) => {
                      setTeamLimit(v)
                      setTeamPage(1)
                    }}
                    itemName="jobs"
                    isLoading={isTeamLoading}
                    limitOptions={[5, 10, 20]}
                    className="py-1 px-3"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </TabsContent>
    </Tabs>
  )
}
