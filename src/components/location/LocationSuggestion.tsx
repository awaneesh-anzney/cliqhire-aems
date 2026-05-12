"use client";

import * as React from "react";
import { MapPin, Loader2, Check, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useCitySearch } from "@/hooks/use-location";
import { CitySuggestion } from "@/types/location";

interface LocationSuggestionProps {
  value?: string;
  onChange: (value: string) => void;
  onSelectCity?: (city: CitySuggestion) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function LocationSuggestion({
  value,
  onChange,
  onSelectCity,
  placeholder = "Search for a city...",
  className,
  disabled = false,
}: LocationSuggestionProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState(value || "");
  const [isTyping, setIsTyping] = React.useState(false);
  
  const { data: suggestions, isLoading } = useCitySearch(inputValue, open);

  // Update internal state when external value changes
  React.useEffect(() => {
    if (value !== undefined && value !== inputValue) {
      setInputValue(value);
    }
  }, [value]);

  const handleSelect = (city: CitySuggestion) => {
    setInputValue(city.label);
    onChange(city.label);
    onSelectCity?.(city);
    setOpen(false);
    setIsTyping(false);
  };

  const handleInputChange = (val: string) => {
    setInputValue(val);
    onChange(val); // Allow free text
    setIsTyping(val.length > 0);
    if (val.length >= 2) {
      setOpen(true);
    }
  };

  const clearInput = (e: React.MouseEvent) => {
    e.stopPropagation();
    setInputValue("");
    onChange("");
    setIsTyping(false);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <div className={cn("relative w-full group", className)}>
          <div className={cn(
            "flex items-center w-full rounded-xl border border-input bg-background/50 backdrop-blur-sm px-3.5 py-2.5 text-sm shadow-sm transition-all duration-200",
            "hover:border-muted-foreground/30",
            "focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/5",
            disabled && "opacity-50 cursor-not-allowed bg-muted"
          )}>
            <div className={cn(
              "p-1.5 rounded-lg mr-2.5 transition-colors",
              open ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground/60"
            )}>
              <MapPin className="h-4 w-4 shrink-0" />
            </div>
            <input
              className="flex h-full w-full bg-transparent outline-none placeholder:text-muted-foreground/50 text-[14px] font-medium disabled:cursor-not-allowed"
              placeholder={placeholder}
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              onFocus={() => {
                if (!disabled && inputValue.length >= 2) setOpen(true);
              }}
              disabled={disabled}
            />
            
            <div className="flex items-center gap-1.5">
              {isLoading && <Loader2 className="h-4 w-4 animate-spin text-primary/50" />}
              
              {!isLoading && isTyping && !disabled && (
                <button
                  type="button"
                  onClick={clearInput}
                  className="p-1 rounded-md hover:bg-muted text-muted-foreground/40 hover:text-muted-foreground transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
              
              {!isLoading && !isTyping && (
                <Search className="h-3.5 w-3.5 text-muted-foreground/20 group-hover:text-muted-foreground/40 transition-colors" />
              )}
            </div>
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent 
        className="p-0 shadow-2xl border-muted-foreground/10 rounded-2xl overflow-hidden mt-1 animate-in fade-in zoom-in-95 duration-200" 
        style={{ width: 'var(--radix-popover-trigger-width)' }}
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()} // Don't steal focus from input
      >
        <Command shouldFilter={false} className="max-h-[300px]">
          <CommandList className="scrollbar-thin scrollbar-thumb-muted-foreground/10">
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-10 space-y-3">
                <div className="relative">
                  <div className="h-10 w-10 rounded-full border-2 border-primary/10 border-t-primary animate-spin" />
                  <MapPin className="absolute inset-0 m-auto h-4 w-4 text-primary/30" />
                </div>
                <p className="text-xs font-bold text-muted-foreground/60 tracking-wider uppercase">Searching cities...</p>
              </div>
            )}
            
            {!isLoading && (!suggestions || suggestions.length === 0) && inputValue.length >= 2 && (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                <div className="p-3 bg-muted rounded-2xl mb-3">
                  <Search className="h-5 w-5 text-muted-foreground/40" />
                </div>
                <p className="text-sm font-bold text-foreground/80">No matches found</p>
                <p className="text-[11px] text-muted-foreground/60 mt-1 uppercase tracking-wider font-medium">Try checking the spelling</p>
              </div>
            )}
            
            {!isLoading && inputValue.length < 2 && (
              <div className="py-8 text-center px-4">
                <p className="text-xs font-bold text-muted-foreground/40 tracking-widest uppercase mb-1">Location Search</p>
                <p className="text-sm text-muted-foreground/60">Type at least 2 characters...</p>
              </div>
            )}

            <CommandGroup className="p-1.5">
              {suggestions?.map((city) => (
                <CommandItem
                  key={`${city.lat}-${city.lng}`}
                  value={city.label}
                  onSelect={() => handleSelect(city)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer aria-selected:bg-primary/5 group/item mb-0.5 transition-all duration-200"
                >
                  <div className="h-9 w-9 rounded-xl bg-muted group-aria-selected/item:bg-primary/10 flex items-center justify-center transition-colors">
                    <MapPin className="h-4 w-4 text-muted-foreground/60 group-aria-selected/item:text-primary transition-colors" />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-[14px] font-bold text-foreground/90 truncate group-aria-selected/item:text-primary transition-colors">
                      {city.city}
                    </span>
                    <span className="text-[11px] text-muted-foreground/60 font-medium truncate">
                      {city.state ? `${city.state}, ` : ""}{city.country}
                    </span>
                  </div>
                  <Check
                    className={cn(
                      "h-4 w-4 text-primary transition-all",
                      inputValue === city.label ? "opacity-100 scale-100" : "opacity-0 scale-50"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
          
          <div className="border-t bg-muted/30 px-3 py-2.5 flex items-center justify-between">
             <div className="flex items-center gap-1.5">
               <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
               <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">Powered by GeoNames</span>
             </div>
             <span className="text-[9px] font-bold text-muted-foreground/40">{suggestions?.length || 0} results</span>
          </div>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
