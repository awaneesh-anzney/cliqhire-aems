"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  CalendarIcon, 
  Clock 
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { parseDateString, StageField } from "./stage-fields";

// Date Picker Component
export const DatePickerField = ({ 
  value, 
  onChange 
}: { 
  value: string; 
  onChange: (value: string) => void; 
}) => {
  const [open, setOpen] = useState(false);
  const selectedDate = parseDateString(value);

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !selectedDate && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => {
            if (date) {
              onChange(format(date, "yyyy-MM-dd"));
            }
            setOpen(false);
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
};

// DateTime Picker Component
export const DateTimePickerField = ({ 
  value, 
  onChange 
}: { 
  value: string; 
  onChange: (value: string) => void; 
}) => {
  const [dateOpen, setDateOpen] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);
  const selectedDate = parseDateString(value);
  const datePart = value.split('T')[0] || "";
  const timePart = value.split('T')[1] || "00:00";

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      const newDatePart = format(date, "yyyy-MM-dd");
      onChange(`${newDatePart}T${timePart}`);
    }
    setDateOpen(false);
  };

  const handleTimeChange = (newTime: string) => {
    onChange(`${datePart}T${newTime}`);
  };

  return (
    <div className="space-y-2">
      <Popover open={dateOpen} onOpenChange={setDateOpen} modal={true}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !selectedDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateChange}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      
      <Popover open={timeOpen} onOpenChange={setTimeOpen} modal={true}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start text-left font-normal"
          >
            <Clock className="mr-2 h-4 w-4" />
            {timePart || "Pick a time"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-3 max-h-[300px] overflow-y-auto">
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 24 }, (_, hour) => 
                Array.from({ length: 4 }, (_, minute) => {
                  const time = `${hour.toString().padStart(2, '0')}:${(minute * 15).toString().padStart(2, '0')}`;
                  return (
                    <Button
                      key={time}
                      variant={timePart === time ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        handleTimeChange(time);
                        setTimeOpen(false);
                      }}
                      className="text-xs"
                    >
                      {time}
                    </Button>
                  );
                })
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

// Main field input renderer
export const renderFieldInput = (
  field: StageField,
  value: string,
  onChange: (value: string) => void
) => {
  switch (field.type) {
    case "text":
      return (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className="w-full"
        />
      );

    case "date":
      return <DatePickerField value={value} onChange={onChange} />;

    case "datetime":
      return <DateTimePickerField value={value} onChange={onChange} />;

    case "url":
      return (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className="w-full"
        />
      );

    case "select":
      return (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((option) => {
              const val = typeof option === "string" ? option : option.value;
              const lbl = typeof option === "string" ? option : option.label;
              return (
                <SelectItem key={val} value={val}>
                  {lbl}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      );

    case "rating":
      return (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select rating" />
          </SelectTrigger>
          <SelectContent>
            {field.options?.map((option) => {
              const val = typeof option === "string" ? option : option.value;
              const lbl = typeof option === "string" ? option : option.label;
              return (
                <SelectItem key={val} value={val}>
                  {lbl}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      );

    case "textarea":
      return (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className="w-full min-h-[80px]"
        />
      );

    default:
      return (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className="w-full"
        />
      );
  }
};


