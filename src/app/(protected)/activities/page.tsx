import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, SlidersHorizontal, MoreVertical, Calendar, LayoutGrid, List } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { ActivityEmptyState } from "./empty-statetwo"

export default function ActivitiesPage() {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b">
        <div className="flex h-16 items-center px-4">
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            Upcoming
          </h1>
          <div className="ml-auto flex items-center space-x-2">
            <div className="bg-muted rounded-lg p-1 flex gap-1">
              <Button variant="ghost" size="sm" className="text-foreground">
                DAY
              </Button>
              <Button variant="ghost" size="sm" className="text-foreground">
                <Calendar className="h-4 w-4 mr-2" />
                WEEK
              </Button>
              <Button variant="ghost" size="sm" className="text-foreground">
                <LayoutGrid className="h-4 w-4 mr-2" />
                MONTH
              </Button>
              <Button variant="default" size="sm">
                <List className="h-4 w-4 mr-2" />
                LIST
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between p-4">
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Create activity
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
            {/* <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-700"></Badge> */}
          </Button>
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox />
              </TableHead>
              <TableHead className="min-w-[150px]">
                Title
                <Button variant="ghost" size="sm" className="ml-2 h-4 w-4 p-0">
                  ▼
                </Button>
              </TableHead>
              <TableHead>
                Type
                <Button variant="ghost" size="sm" className="ml-2 h-4 w-4 p-0">
                  ▼
                </Button>
              </TableHead>
              <TableHead>Related To</TableHead>
              <TableHead>
                Date
                <Button variant="ghost" size="sm" className="ml-2 h-4 w-4 p-0">
                  ▼
                </Button>
              </TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Assignees</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Empty State */}
            <TableRow>
              <TableCell colSpan={8} className="h-[400px] text-center">
                <ActivityEmptyState />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

