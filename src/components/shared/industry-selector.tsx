import { useState } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useIndustries } from "@/hooks/useIndustries";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface IndustrySelectorProps {
    value?: string;
    onValueChange: (value: string) => void;
    modal?: boolean;
    disabled?: boolean;
    className?: string;
}

export function IndustrySelector({ value, onValueChange, modal = false, disabled = false, className }: IndustrySelectorProps) {
    const [open, setOpen] = useState(false);
    const { industries, addIndustry, isAdding } = useIndustries();
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [newIndustryName, setNewIndustryName] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    const handleAddIndustry = async () => {
        if (!newIndustryName.trim()) return;
        try {
            const newInd = await addIndustry(newIndustryName);
            onValueChange(newInd.name);
            setNewIndustryName("");
            setIsAddDialogOpen(false);
            setOpen(false);
        } catch (e) {
            // toast handled in hook
        }
    };

    const filteredIndustries = industries.filter((industry) =>
        industry.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex items-center gap-2 w-full">
            <Popover open={open} onOpenChange={setOpen} modal={modal}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className={cn(
                            "w-full justify-between font-semibold",
                            !value && "text-muted-foreground/60 font-semibold",
                            className
                        )}
                        disabled={disabled}
                    >
                        {value ? value : "Select industry..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0" align="start">
                    <Command shouldFilter={false}>
                        {/* We handle filtering manually to allow "Add 'searchQuery'" logic seamlessly if needed, 
                 or we can rely on Command's filtering but we need to access the search value.
                 CommandInput 'value' prop is controlled. */}
                        <CommandInput
                            placeholder="Search industry..."
                            value={searchQuery}
                            onValueChange={setSearchQuery}
                        />
                        <CommandList>
                            <CommandEmpty>
                                <div className="p-2 flex flex-col items-center gap-2">
                                    <span className="text-sm text-muted-foreground">No industry found.</span>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => {
                                            setNewIndustryName(searchQuery);
                                            setIsAddDialogOpen(true);
                                        }}
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Create &quot;{searchQuery}&quot;
                                    </Button>
                                </div>
                            </CommandEmpty>
                            <CommandGroup>
                                {filteredIndustries.map((industry) => (
                                    <CommandItem
                                        key={industry._id}
                                        value={industry.name}
                                        onSelect={(currentValue) => {
                                            onValueChange(currentValue);
                                            setOpen(false);
                                        }}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                value === industry.name ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        {industry.name}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                        {/* Always visible Add button at bottom if needed, or rely on Empty state. 
                 User asked for an Add button. I'll add a persistent footer button or keep the Empty state logic.
                 The Empty state logic is excellent for search-first. 
                 But let's also add a dedicated item effectively acting as a button if needed.
              */}
                        {searchQuery === "" && (
                            <div className="p-1 border-t">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full justify-start font-normal"
                                    onClick={() => {
                                        setNewIndustryName("");
                                        setIsAddDialogOpen(true);
                                    }}
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add New Industry
                                </Button>
                            </div>
                        )}
                    </Command>
                </PopoverContent>
            </Popover>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Industry</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="space-y-2">
                            <Label>Industry Name</Label>
                            <Input
                                value={newIndustryName}
                                onChange={(e) => setNewIndustryName(e.target.value)}
                                placeholder="e.g. Automotive"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleAddIndustry} disabled={isAdding}>
                            {isAdding ? "Adding..." : "Add Industry"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
