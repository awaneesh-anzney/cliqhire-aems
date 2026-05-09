import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export interface ComboboxOption {
  value: string;
  label: string;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  inputPlaceholder?: string;
  disabled?: boolean;
  className?: string;
}

export const Combobox: React.FC<ComboboxProps> = ({
  options,
  value,
  onValueChange,
  placeholder = "Select an option",
  inputPlaceholder = "Search...",
  disabled = false,
  className,
}) => {
  const [search, setSearch] = React.useState("");
  const [focused, setFocused] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    // If value changes externally, update search text
    const selected = options.find((opt) => opt.value === value);
    if (selected && search !== selected.label) {
      setSearch(selected.label);
    }
    if (!value) setSearch("");
    // eslint-disable-next-line
  }, [value]);

  const filtered =
    search.trim().length === 0
      ? options
      : options.filter((opt) =>
          opt.label.toLowerCase().includes(search.trim().toLowerCase())
        );

  const handleSelect = (opt: ComboboxOption) => {
    setSearch(opt.label);
    onValueChange(opt.value);
    setFocused(false);
  };

  return (
    <div className={cn("relative w-full", className)}>
      <Input
        ref={inputRef}
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          onValueChange(""); // Clear selection when typing
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 100)}
        placeholder={inputPlaceholder}
        disabled={disabled}
        autoComplete="off"
      />
      {(focused && filtered.length > 0) && (
        <div className="absolute left-0 right-0 mt-1 bg-card border border-border rounded-md shadow-lg z-50 max-h-56 overflow-y-auto">
          {filtered.map((opt) => (
            <div
              key={opt.value}
              className={cn(
                "px-4 py-2 cursor-pointer hover:bg-muted flex items-center",
                value === opt.value && "bg-blue-100"
              )}
              onMouseDown={() => handleSelect(opt)}
            >
              {opt.label}
              {value === opt.value && <Check className="ml-auto h-4 w-4 text-primary" />}
            </div>
          ))}
        </div>
      )}
      {(focused && filtered.length === 0) && (
        <div className="absolute left-0 right-0 mt-1 bg-card border border-border rounded-md shadow-lg z-50 px-4 py-2 text-muted-foreground text-sm">
          No options found
        </div>
      )}
    </div>
  );
}; 