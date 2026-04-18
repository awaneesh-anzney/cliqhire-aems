import { Button } from "@/components/ui/button";
import { ChevronsUpDown, Eye } from "lucide-react";
import React from "react";

const ContractOverview = ({
  lineOfBusiness,
  onViewDetails,
}: {
  lineOfBusiness: Array<string>;
  onViewDetails?: () => void;
}) => {
  return (
    <div className="space-y-4">
      {(lineOfBusiness || []).map((lineOfBusiness) => (
        <div
          key={lineOfBusiness}
          className="flex items-center justify-between border p-4 rounded-lg"
        >
          <h4 className="text-sm font-semibold">{lineOfBusiness} Contract</h4>
          <Button variant="ghost" size="sm" className="text-xs p-1" onClick={onViewDetails}>
            <Eye className="size-6" />
            View Details
          </Button>
        </div>
      ))}
    </div>
  );
};

export default ContractOverview;
