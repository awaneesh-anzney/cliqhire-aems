"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { 
    Briefcase, 
    Users, 
    User, 
    Building2, 
    Loader2, 
    Search,
    UserPlus,
    ChevronRight,
    SearchX
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Command,
    CommandInput,
    CommandList,
    CommandItem,
    CommandEmpty,
    CommandGroup,
    CommandSeparator,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { useSearchAll } from "@/hooks/use-search";
import { 
    CandidateItem, 
    ClientItem, 
    JobItem, 
    UserItem, 
    TempCandidateItem 
} from "@/types/search";

export function GlobalSearch() {
    const router = useRouter();
    const [query, setQuery] = React.useState("");
    const [isOpen, setIsOpen] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);

    const { data, isLoading, isFetching } = useSearchAll(query, 5, isOpen);

    const handleSelect = (type: string, id: string) => {
        setIsOpen(false);
        setQuery("");

        const routes: Record<string, string> = {
            candidate: `/candidates/${id}`,
            client: `/clients/${id}`,
            job: `/jobs/${id}`,
            user: `/teammembers?highlight=${id}`,
            temp: `/temp-candidates/${id}`,
        };

        const route = routes[type];
        if (route) {
            router.push(route);
        }
    };

    // Close on click outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Keyboard shortcut (Ctrl+K or Cmd+K)
    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setIsOpen((open) => !open);
                if (containerRef.current) {
                    const input = containerRef.current.querySelector('input');
                    input?.focus();
                }
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const hasResults = data?.success && (
        (data.data.candidates?.count ?? 0) > 0 ||
        (data.data.clients?.count ?? 0) > 0 ||
        (data.data.jobs?.count ?? 0) > 0 ||
        (data.data.users?.count ?? 0) > 0 ||
        (data.data.tempCandidates?.count ?? 0) > 0
    );

    return (
        <div className="relative max-w-[450px] w-full mx-auto" ref={containerRef}>
            <div className={cn(
                "group flex items-center px-3 py-2 rounded-xl border transition-all duration-200 bg-background/50 backdrop-blur-sm shadow-sm",
                isOpen ? "border-primary ring-2 ring-primary/10 bg-background" : "border-muted-foreground/20 hover:border-muted-foreground/40"
            )}>
                <Search className={cn(
                    "h-4 w-4 mr-2 transition-colors",
                    isOpen ? "text-primary" : "text-muted-foreground"
                )} />
                <input
                    className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground"
                    placeholder="Search candidates, jobs, clients... (Ctrl+K)"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                />
                {isLoading && (
                    <Loader2 className="h-4 w-4 animate-spin text-primary ml-2" />
                )}
                {!isLoading && (
                    <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 ml-2">
                        <span className="text-xs">⌘</span>K
                    </kbd>
                )}
            </div>

            {isOpen && query.length >= 1 && (
                <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-popover text-popover-foreground rounded-xl border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top">
                    <Command shouldFilter={false} className="max-h-[500px]">
                        <CommandList className="scrollbar-thin scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/30">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center py-10 space-y-4">
                                    <div className="relative">
                                        <div className="h-12 w-12 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
                                        <Search className="absolute inset-0 m-auto h-5 w-5 text-primary/50" />
                                    </div>
                                    <p className="text-sm text-muted-foreground animate-pulse">Searching the galaxy...</p>
                                </div>
                            ) : !hasResults ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                                        <SearchX className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <p className="text-lg font-semibold">No matches found</p>
                                    <p className="text-sm text-muted-foreground mt-1 px-6">
                                        We couldn&apos;t find anything matching &quot;{query}&quot;
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {/* Candidates Section */}
                                    {data?.data.candidates && data.data.candidates.count > 0 && (
                                        <CommandGroup heading={
                                            <div className="flex items-center justify-between px-2 py-1">
                                                <span className="flex items-center gap-2">
                                                    <User className="h-3.5 w-3.5" />
                                                    Candidates
                                                </span>
                                                <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                                                    {data.data.candidates.count}
                                                </Badge>
                                            </div>
                                        }>
                                            {data.data.candidates.items.map((item: CandidateItem) => (
                                                <SearchResultItemComponent 
                                                    key={item.id} 
                                                    item={item} 
                                                    icon={<User className="h-4 w-4 text-orange-500" />}
                                                    iconBg="bg-orange-500/10"
                                                    onSelect={() => handleSelect('candidate', item.id)}
                                                />
                                            ))}
                                        </CommandGroup>
                                    )}

                                    {/* Jobs Section */}
                                    {data?.data.jobs && data.data.jobs.count > 0 && (
                                        <>
                                            <CommandSeparator />
                                            <CommandGroup heading={
                                                <div className="flex items-center justify-between px-2 py-1">
                                                    <span className="flex items-center gap-2">
                                                        <Briefcase className="h-3.5 w-3.5" />
                                                        Jobs
                                                    </span>
                                                    <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                                                        {data.data.jobs.count}
                                                    </Badge>
                                                </div>
                                            }>
                                                {data.data.jobs.items.map((item: JobItem) => (
                                                    <SearchResultItemComponent 
                                                        key={item.id} 
                                                        item={item} 
                                                        icon={<Briefcase className="h-4 w-4 text-blue-500" />}
                                                        iconBg="bg-blue-500/10"
                                                        onSelect={() => handleSelect('job', item.id)}
                                                    />
                                                ))}
                                            </CommandGroup>
                                        </>
                                    )}

                                    {/* Clients Section */}
                                    {data?.data.clients && data.data.clients.count > 0 && (
                                        <>
                                            <CommandSeparator />
                                            <CommandGroup heading={
                                                <div className="flex items-center justify-between px-2 py-1">
                                                    <span className="flex items-center gap-2">
                                                        <Building2 className="h-3.5 w-3.5" />
                                                        Clients
                                                    </span>
                                                    <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                                                        {data.data.clients.count}
                                                    </Badge>
                                                </div>
                                            }>
                                                {data.data.clients.items.map((item: ClientItem) => (
                                                    <SearchResultItemComponent 
                                                        key={item.id} 
                                                        item={item} 
                                                        icon={<Building2 className="h-4 w-4 text-green-500" />}
                                                        iconBg="bg-green-500/10"
                                                        onSelect={() => handleSelect('client', item.id)}
                                                    />
                                                ))}
                                            </CommandGroup>
                                        </>
                                    )}

                                    {/* Users Section */}
                                    {data?.data.users && data.data.users.count > 0 && (
                                        <>
                                            <CommandSeparator />
                                            <CommandGroup heading={
                                                <div className="flex items-center justify-between px-2 py-1">
                                                    <span className="flex items-center gap-2">
                                                        <Users className="h-3.5 w-3.5" />
                                                        Team
                                                    </span>
                                                    <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                                                        {data.data.users.count}
                                                    </Badge>
                                                </div>
                                            }>
                                                {data.data.users.items.map((item: UserItem) => (
                                                    <SearchResultItemComponent 
                                                        key={item.id} 
                                                        item={item} 
                                                        icon={<Users className="h-4 w-4 text-purple-500" />}
                                                        iconBg="bg-purple-500/10"
                                                        onSelect={() => handleSelect('user', item.id)}
                                                    />
                                                ))}
                                            </CommandGroup>
                                        </>
                                    )}

                                    {/* Temp Candidates Section */}
                                    {data?.data.tempCandidates && data.data.tempCandidates.count > 0 && (
                                        <>
                                            <CommandSeparator />
                                            <CommandGroup heading={
                                                <div className="flex items-center justify-between px-2 py-1">
                                                    <span className="flex items-center gap-2">
                                                        <UserPlus className="h-3.5 w-3.5" />
                                                        External Sources
                                                    </span>
                                                    <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                                                        {data.data.tempCandidates.count}
                                                    </Badge>
                                                </div>
                                            }>
                                                {data.data.tempCandidates.items.map((item: TempCandidateItem) => (
                                                    <SearchResultItemComponent 
                                                        key={item.id} 
                                                        item={item} 
                                                        icon={<UserPlus className="h-4 w-4 text-pink-500" />}
                                                        iconBg="bg-pink-500/10"
                                                        onSelect={() => handleSelect('temp', item.id)}
                                                    />
                                                ))}
                                            </CommandGroup>
                                        </>
                                    )}
                                </>
                            )}
                        </CommandList>
                        
                        {hasResults && !isLoading && (
                            <div className="border-t bg-muted/30 p-2 flex items-center justify-between text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                                <span>Showing top matches</span>
                                <div className="flex items-center gap-3">
                                    <span className="flex items-center gap-1">
                                        <kbd className="rounded border bg-background px-1">↑↓</kbd> Navigate
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <kbd className="rounded border bg-background px-1">↵</kbd> Select
                                    </span>
                                </div>
                            </div>
                        )}
                    </Command>
                </div>
            )}
        </div>
    );
}

function SearchResultItemComponent({ 
    item, 
    icon, 
    iconBg, 
    onSelect 
}: { 
    item: any; 
    icon: React.ReactNode; 
    iconBg: string; 
    onSelect: () => void;
}) {
    const title = item.name || item.jobTitle || "Untitled";
    const subtitle = item.subtitle || item.email || item.department || (item.client ? (typeof item.client === 'string' ? item.client : item.client.name) : "");
    const location = item.location;
    const status = item.status;

    return (
        <CommandItem
            onSelect={onSelect}
            className="group flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors duration-150 aria-selected:bg-primary/5"
        >
            <div className={cn("flex-shrink-0 h-10 w-10 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110", iconBg)}>
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                        {title}
                    </p>
                    {status && (
                        <span className={cn(
                            "text-[10px] px-1.5 py-0.5 rounded-full font-medium ml-2 uppercase",
                            status === "Open" || status === "Active" || status === "Signed" 
                                ? "bg-green-100 text-green-700" 
                                : "bg-muted text-muted-foreground"
                        )}>
                            {status}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-xs text-muted-foreground truncate flex-1">
                        {subtitle}
                    </p>
                    {location && (
                        <>
                            <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                            <p className="text-[10px] text-muted-foreground/70 truncate">
                                {location}
                            </p>
                        </>
                    )}
                </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary transition-colors" />
        </CommandItem>
    );
}

