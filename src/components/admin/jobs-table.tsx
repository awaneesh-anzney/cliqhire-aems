"use client"

import { MoreHorizontal, MapPin } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"

interface JobsTableProps {
  jobs?: any[]
  loading?: boolean
}

export function JobsTable({ jobs, loading }: JobsTableProps) {
  const router = useRouter()
  return (
    <Card className="border border-[hsl(var(--border))] shadow-sm rounded-xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-[hsl(var(--muted))] hover:bg-[hsl(var(--muted))]">
            <TableHead className="font-semibold text-[hsl(var(--muted-foreground))] h-12">Job Role</TableHead>
            <TableHead className="font-semibold text-[hsl(var(--muted-foreground))]">Client</TableHead>
            <TableHead className="font-semibold text-[hsl(var(--muted-foreground))]">CVs Sourced</TableHead>
            <TableHead className="font-semibold text-[hsl(var(--muted-foreground))]">Status</TableHead>
            <TableHead className="text-right font-semibold text-[hsl(var(--muted-foreground))]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            [...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell colSpan={5} className="py-4"><Skeleton className="h-8 w-full" /></TableCell>
              </TableRow>
            ))
          ) : (
            jobs?.map((job) => (
              <TableRow key={job._id} className="hover:bg-[hsl(var(--muted))] border-[hsl(var(--border))] transition-colors">
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-semibold text-[hsl(var(--foreground))]">{job.jobTitle}</span>
                    <span className="text-xs text-[hsl(var(--muted-foreground))] mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {(job as any).location || 'Remote'}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                   <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 rounded-md border border-[hsl(var(--border))]">
                         <AvatarFallback className="bg-[hsl(var(--primary))] text-white text-xs font-semibold">{job.client?.name?.[0] || 'C'}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-[hsl(var(--foreground))]">{job.client?.name || "Unknown Client"}</span>
                   </div>
                </TableCell>
                <TableCell>
                   <span className="text-sm font-medium text-[hsl(var(--foreground))]">{job.totalCVs || 0} candidates</span>
                </TableCell>
                <TableCell>
                   <Badge className={`rounded-md font-medium text-xs px-2.5 py-0.5 border-none ${
                     job.stage === 'Closed' ? 'bg-muted text-foreground' : 
                     job.stage === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                   }`}>
                     {job.stage || 'Draft'}
                   </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => router.push(`/jobs`)}>View Details</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push(`/jobs`)}>Assigned Recruiters</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600" onClick={() => alert("Close functionality to be added")}>Close Job</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  )
}
