"use client";

import { Button } from "@/components/ui/button";
import { Plus, Pencil } from "lucide-react";
import { useState } from "react";
import { EditFieldModal } from "./edit-field-modal";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Select, SelectItem, SelectTrigger } from "@/components/ui/select";
import { SelectValue } from "@radix-ui/react-select";

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
  disableInternalEdit?: boolean; // NEW PROP
  customEdit?: () => void; // NEW PROP for custom edit handlers
  customInput?: React.ReactNode; // NEW PROP for custom input component
  formattedValue?: string; // NEW PROP for display-only formatting
  isLocation?: boolean;
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
}: DetailRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
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
      // Create a new date in local timezone without time component
      const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      // Convert to ISO string and remove time component
      const dateString = localDate.toISOString().split("T")[0];
      onUpdate(dateString);
    }
    setShowDatePicker(false);
  };

  const displayValue = () => {
    if (!value) return null;
    if (isDate) {
      try {
        // Handle both string and Date objects, ensuring we don't show timezone-shifted dates
        const date = value instanceof Date ? value : new Date(value);
        // Format as YYYY-MM-DD to avoid timezone issues
        return date.toISOString().split("T")[0];
      } catch (e) {
        console.error("Error formatting date:", e);
        return "Invalid date";
      }
    }
    if (isNumber) {
      return `${value}${suffix || ""}`;
    }
    return value.toString();
  };

  return (
    <div className="border-b last:border-b-0">
      <div className="flex items-center py-2">
        <span className="text-sm text-muted-foreground w-1/3">
          {label}
          {optional && <span className="text-xs ml-1">(optional)</span>}
        </span>
        <div className="flex items-center justify-between flex-1">
          {customInput ? (
            <div className="w-full">{customInput}</div>
          ) : isSelect ? (
            <Select
              value={
                typeof value === "string" ? value : value instanceof Date ? value.toISOString() : ""
              }
              onValueChange={(value) => onUpdate(value)}
            >
              <SelectTrigger className="w-full p-2 border rounded text-sm">
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              {options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </Select>
          ) : (
            <span className="text-sm">
              {formattedValue ? (
                formattedValue
              ) : displayValue() ? (
                displayValue()
              ) : (
                <span className="text-muted-foreground">No Details</span>
              )}
            </span>
          )}
          {!isSelect && !disableInternalEdit && (
            <Button
              variant="outline"
              size="sm"
              className="h-8"
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
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {isDate && showDatePicker && (
        <div className="absolute z-50 mt-1 bg-white shadow-lg rounded-md">
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
        />
      )}
    </div>
  );
}
