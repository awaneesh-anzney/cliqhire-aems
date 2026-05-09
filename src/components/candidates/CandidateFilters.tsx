import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export type CandidateFilterState = {
  name: string;
  email: string;
  status: string; // "", "Active", "Pending", "Placed"
};

interface CandidateFiltersProps {
  filters: CandidateFilterState;
  onChange: (next: CandidateFilterState) => void;
}

const CandidateFilters: React.FC<CandidateFiltersProps> = ({ filters, onChange }) => {
  return (
    <div className="p-4 border-b bg-card">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1">
          <Label htmlFor="candidate-name">Name</Label>
          <Input
            id="candidate-name"
            placeholder="Search by name"
            value={filters.name}
            onChange={(e) => onChange({ ...filters, name: e.target.value })}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="candidate-email">Email</Label>
          <Input
            id="candidate-email"
            placeholder="Search by email"
            value={filters.email}
            onChange={(e) => onChange({ ...filters, email: e.target.value })}
          />
        </div>
        <div className="space-y-1">
          <Label>Status</Label>
          <Select
            value={filters.status === "" ? "all" : filters.status}
            onValueChange={(val) => onChange({ ...filters, status: val === "all" ? "" : val })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Placed">Placed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default CandidateFilters;
