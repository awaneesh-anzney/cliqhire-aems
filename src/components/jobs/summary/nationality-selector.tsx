"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { CountrySelect } from "@/components/ui/country-select";
import { Badge } from "@/components/ui/badge";
import { X, Globe, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface NationalitySelectorProps {
  open: boolean;
  onClose: () => void;
  currentValue?: string[];
  onSave: (value: string[]) => void;
}

export function NationalitySelector({
  open,
  onClose,
  currentValue = [],
  onSave,
}: NationalitySelectorProps) {
  const [selectedNationalities, setSelectedNationalities] = useState<string[]>([]);
  const [isAllMode, setIsAllMode] = useState(false);

  // Initialize state when the dialog is opened
  useEffect(() => {
    if (open) {
      const vals = currentValue || [];
      const hasAll = vals.includes("Open For All Nationals");
      setIsAllMode(hasAll);
      setSelectedNationalities(hasAll ? ["Open For All Nationals"] : vals);
    }
  }, [open, currentValue]);

  const handleSave = () => {
    onSave(selectedNationalities);
    onClose();
  };

  const handleAdd = (nationality: string) => {
    if (nationality && !selectedNationalities.includes(nationality)) {
      setSelectedNationalities((prev) => [...prev, nationality]);
      if (nationality === "Open For All Nationals") {
        setIsAllMode(true);
      }
    }
  };

  const toggleAllMode = () => {
    if (!isAllMode) {
      setIsAllMode(true);
      if (!selectedNationalities.includes("Open For All Nationals")) {
        setSelectedNationalities(prev => ["Open For All Nationals", ...prev]);
      }
    } else {
      setIsAllMode(false);
      setSelectedNationalities(prev => prev.filter(n => n !== "Open For All Nationals"));
    }
  };

  const handleRemove = (nationality: string) => {
    setSelectedNationalities((prev) => prev.filter((n) => n !== nationality));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select Nationalities</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Nationalities</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground mr-1">Open For All</span>
                <Switch
                  checked={isAllMode}
                  onCheckedChange={toggleAllMode}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 min-h-[3rem] p-3 border rounded-lg bg-muted/50">
              {isAllMode && (
                <Badge 
                  variant="outline" 
                  className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1 flex items-center gap-2 text-sm font-medium shadow-sm transition-all"
                >
                  <Globe className="h-4 w-4 text-blue-500" />
                  Open For All Nationals
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 hover:bg-transparent text-blue-400 hover:text-blue-600 ml-1"
                    onClick={toggleAllMode}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </Badge>
              )}
              
              {selectedNationalities.filter(n => n !== "Open For All Nationals").map((nationality) => (
                <Badge 
                  key={nationality} 
                  variant="secondary" 
                  className="flex items-center gap-1.5 px-3 py-1 bg-card border border-border shadow-sm transition-all hover:bg-muted"
                >
                  <span className="text-sm">{nationality}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 hover:bg-transparent text-muted-foreground hover:text-red-500"
                    onClick={() => handleRemove(nationality)}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </Badge>
              ))}

              {!isAllMode && selectedNationalities.length === 0 && (
                <div className="flex flex-col items-center justify-center w-full py-2">
                  <span className="text-sm text-muted-foreground italic">Select specific nationalities below</span>
                </div>
              )}
            </div>

            <div className="transition-opacity duration-200">
              <CountrySelect
                value={""}
                onChange={handleAdd}
                type="nationality"
                placeholder="Search and add specific nationalities..."
              />
            </div>
            
            {!isAllMode && selectedNationalities.length > 0 && (
              <div className="flex justify-end">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedNationalities([])}
                  className="text-xs text-muted-foreground hover:text-red-600 hover:bg-red-50 p-1.5 h-auto transition-colors rounded-full"
                  title="Clear All Specific Nationalities"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
