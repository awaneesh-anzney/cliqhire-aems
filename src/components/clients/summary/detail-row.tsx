"use client";

import { Button } from "@/components/ui/button";
import { Plus, Pencil, Copy, Check, ExternalLink } from "lucide-react";
import { useState } from "react";
import { EditFieldModal } from "./edit-field-modal";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface DetailRowProps {
  label: string;
  value?: string | Date | null;
  onUpdate: (value: string) => void;
  optional?: boolean;
  isDate?: boolean;
  isNumber?: boolean;
  min?: number;
  max?: number;
  suffix?: string;
  options?: { value: string; label: string }[];
  isSelect?: boolean;
  alwaysShowEdit?: boolean;
  disableInternalEdit?: boolean;
  customEdit?: () => void;
  customInput?: React.ReactNode;
  formattedValue?: string;
  isLocation?: boolean;
  isPhone?: boolean;
  countryCode?: string;
}

export function DetailRow({
  label,
  value,
  onUpdate,
  optional,
  isDate,
  isNumber,
  min,
  max,
  suffix,
  options,
  isSelect,
  alwaysShowEdit,
  disableInternalEdit,
  customEdit,
  customInput,
  formattedValue,
  isLocation,
  isPhone,
  countryCode,
}: DetailRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    value && typeof value === "string" && isDate
      ? new Date(value)
      : value instanceof Date
        ? value
        : null,
  );

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    if (date) {
      const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dateString = localDate.toISOString().split("T")[0];
      onUpdate(dateString);
    }
    setShowDatePicker(false);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const displayValue = () => {
    if (!value) return null;
    if (isDate) {
      try {
        const date = value instanceof Date ? value : new Date(value);
        return date.toISOString().split("T")[0];
      } catch (e) {
        return "Invalid date";
      }
    }
    if (isNumber) {
      return `${value}${suffix || ""}`;
    }
    return value.toString();
  };

  const rawDisplay = formattedValue || displayValue();
  const isUrl = typeof rawDisplay === "string" && (rawDisplay.startsWith("http://") || rawDisplay.startsWith("https://"));
  const isPriority = label.toLowerCase().includes("priority");
  const isSegment = label.toLowerCase().includes("segment");

  const getPriorityBadge = (val: string) => {
    const v = val.toLowerCase();
    if (v === "high") {
      return <Badge className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-semibold text-xs">High</Badge>;
    }
    if (v === "medium") {
      return <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-semibold text-xs">Medium</Badge>;
    }
    if (v === "low") {
      return <Badge className="bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20 font-semibold text-xs">Low</Badge>;
    }
    return <span className="text-sm font-medium text-foreground">{val}</span>;
  };

  const getSegmentBadge = (val: string) => {
    const v = val.toLowerCase();
    if (v === "premium") {
      return <Badge className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 font-semibold text-xs">Premium</Badge>;
    }
    if (v === "gold") {
      return <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-semibold text-xs">Gold</Badge>;
    }
    if (v === "silver") {
      return <Badge className="bg-slate-500/10 text-slate-600 dark:text-slate-300 border border-slate-500/20 font-semibold text-xs">Silver</Badge>;
    }
    return <span className="text-sm font-medium text-foreground">{val}</span>;
  };

  return (
    <div className="group/row flex flex-col sm:flex-row sm:items-center justify-between py-2.5 px-3 rounded-lg hover:bg-muted/40 transition-colors border-b border-border/40 last:border-b-0 gap-2">
      <div className="flex items-center gap-1.5 sm:w-1/3 shrink-0">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
        {optional && <span className="text-[10px] text-muted-foreground/60">(opt)</span>}
      </div>

      <div className="flex items-center justify-between sm:justify-end flex-1 min-w-0 gap-3">
        {customInput ? (
          <div className="w-full min-w-0">{customInput}</div>
        ) : isSelect ? (
          <Select
            value={typeof value === "string" ? value : value instanceof Date ? value.toISOString() : ""}
            onValueChange={(val) => onUpdate(val)}
          >
            <SelectTrigger className="h-8 text-xs font-medium border-border/70 bg-background/80 rounded-lg">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {options?.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} className="text-xs font-medium">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <div className="flex items-center gap-2 min-w-0 flex-1 sm:justify-end">
            {rawDisplay ? (
              isPriority ? (
                getPriorityBadge(rawDisplay)
              ) : isSegment ? (
                getSegmentBadge(rawDisplay)
              ) : isUrl ? (
                <a
                  href={rawDisplay}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1 truncate max-w-[240px]"
                >
                  <span className="truncate">{rawDisplay}</span>
                  <ExternalLink className="h-3 w-3 shrink-0 opacity-70" />
                </a>
              ) : (
                <span className="text-xs font-medium text-foreground truncate max-w-[280px]" title={rawDisplay}>
                  {rawDisplay}
                </span>
              )
            ) : (
              <span className="text-xs text-muted-foreground/60 italic font-normal">Not configured</span>
            )}

            {rawDisplay && !isPriority && !isSegment && (
              <button
                type="button"
                onClick={() => handleCopy(rawDisplay)}
                className="opacity-0 group-hover/row:opacity-100 transition-opacity p-1 text-muted-foreground hover:text-foreground rounded hover:bg-muted shrink-0"
                title="Copy to clipboard"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
              </button>
            )}
          </div>
        )}

        {!isSelect && !disableInternalEdit && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/70 rounded-md shrink-0 transition-colors"
            onClick={() => {
              if (customEdit) {
                customEdit();
              } else if (isDate) {
                setShowDatePicker(!showDatePicker);
              } else {
                setIsEditing(true);
              }
            }}
          >
            {alwaysShowEdit || value ? (
              <>
                <Pencil className="h-3 w-3 mr-1 opacity-70" />
                <span>Edit</span>
              </>
            ) : (
              <>
                <Plus className="h-3 w-3 mr-1 opacity-70" />
                <span>Add</span>
              </>
            )}
          </Button>
        )}
      </div>

      {isDate && showDatePicker && (
        <div className="absolute z-50 mt-1 bg-card shadow-lg rounded-xl border border-border p-2">
          <DatePicker
            selected={selectedDate}
            onChange={handleDateChange}
            dateFormat="dd/MM/yyyy"
            inline
            onClickOutside={() => setShowDatePicker(false)}
          />
        </div>
      )}

      {!isDate && !isSelect && !disableInternalEdit && (
        <EditFieldModal
          open={isEditing}
          onClose={() => setIsEditing(false)}
          fieldName={label}
          currentValue={typeof value === "string" ? value : ""}
          onSave={onUpdate}
          isDate={isDate}
          isNumber={isNumber}
          options={options}
          isCountry={label.toLowerCase().includes("country")}
          isLocation={isLocation || label.toLowerCase().includes("location")}
          isPhone={isPhone}
          countryCode={countryCode}
        />
      )}
    </div>
  );
}
