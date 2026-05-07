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
    SearchX,
    Filter,
    ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Command,
    CommandList,
    CommandItem,
    CommandGroup,
    CommandSeparator,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { useSearchAll, useInfiniteSearch } from "@/hooks/use-search";
import { 
    CandidateItem, 
    ClientItem, 
    JobItem, 
    UserItem, 
    TempCandidateItem,
    SearchEntityType
} from "@/types/search";
import { useInView } from "react-intersection-observer";

const CATEGORIES: { label: string; value: SearchEntityType; icon: any }[] = [
    { label: "All", value: "all", icon: Filter },
    { label: "Candidates", value: "candidates", icon: User },
    { label: "Jobs", value: "jobs", icon: Briefcase },
    { label: "Clients", value: "clients", icon: Building2 },
    { label: "Team", value: "users", icon: Users },
    { label: "External", value: "temp", icon: UserPlus },
];

export function GlobalSearch() {
    const router = useRouter();
    const [query, setQuery] = React.useState("");
    const [isOpen, setIsOpen] = React.useState(false);
    const [selectedCategory, setSelectedCategory] = React.useState<SearchEntityType>("all");
    const containerRef = React.useRef<HTMLDivElement>(null);
    const { ref: scrollRef, inView } = useInView();

    // Summary search (used for "All" tab)
    const { data: summaryData, isLoading: isSummaryLoading } = useSearchAll(query, 5, isOpen && selectedCategory === "all");

    // Infinite search (used for specific categories)
    const { 
        data: infiniteData, 
        isLoading: isInfiniteLoading, 
        fetchNextPage, 
        hasNextPage, 
        isFetchingNextPage 
    } = useInfiniteSearch({ q: query, type: selectedCategory, limit: 10 }, isOpen && selectedCategory !== "all");

    React.useEffect(() => {
        if (inView && hasNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, fetchNextPage]);

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

    const isLoading = isSummaryLoading || isInfiniteLoading;

    const hasResults = selectedCategory === "all" 
        ? summaryData?.success && (
            (summaryData.data.candidates?.count ?? 0) > 0 ||
            (summaryData.data.clients?.count ?? 0) > 0 ||
            (summaryData.data.jobs?.count ?? 0) > 0 ||
            (summaryData.data.users?.count ?? 0) > 0 ||
            (summaryData.data.tempCandidates?.count ?? 0) > 0
        )
        : (infiniteData?.pages[0]?.totalCount ?? 0) > 0;

    return (
        <div className="relative max-w-[500px] w-full mx-auto" ref={containerRef}>
            <div className={cn(
                "group flex items-center px-4 py-2.5 rounded-2xl border transition-all duration-300 bg-background/60 backdrop-blur-md shadow-sm",
                isOpen ? "border-primary ring-4 ring-primary/5 bg-background" : "border-muted-foreground/15 hover:border-muted-foreground/30"
            )}>
                <Search className={cn(
                    "h-5 w-5 mr-3 transition-colors",
                    isOpen ? "text-primary" : "text-muted-foreground/60"
                )} />
                <input
                    className="flex-1 bg-transparent border-none outline-none text-[15px] placeholder:text-muted-foreground/50"
                    placeholder="Search anything... (Ctrl+K)"
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
                    <kbd className="hidden sm:inline-flex h-6 select-none items-center gap-1 rounded-md border bg-muted/50 px-2 font-mono text-[11px] font-semibold text-muted-foreground/70 opacity-100 ml-2">
                        <span className="text-xs">⌘</span>K
                    </kbd>
                )}
            </div>

            {isOpen && query.length >= 1 && (
                <div className="absolute top-full left-0 right-0 mt-3 z-50 bg-popover/95 backdrop-blur-xl text-popover-foreground rounded-2xl border shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300 origin-top">
                    {/* Category Tabs */}
                    <div className="flex items-center gap-1 p-2 border-b bg-muted/20 overflow-x-auto scrollbar-none">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat.value}
                                onClick={() => setSelectedCategory(cat.value)}
                                className={cn(
                                    "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
                                    selectedCategory === cat.value 
                                        ? "bg-primary text-primary-foreground shadow-md" 
                                        : "hover:bg-muted text-muted-foreground"
                                )}
                            >
                                <cat.icon className="h-3.5 w-3.5" />
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    <Command shouldFilter={false} className="max-h-[500px]">
                        <CommandList className="scrollbar-thin scrollbar-thumb-muted-foreground/10 hover:scrollbar-thumb-muted-foreground/20">
                            {isLoading ? (
                                <SearchLoadingState />
                            ) : !hasResults ? (
                                <SearchEmptyState query={query} />
                            ) : (
                                <div className="p-2">
                                    {selectedCategory === "all" ? (
                                        <SummaryView 
                                            data={summaryData?.data} 
                                            onSelect={handleSelect} 
                                            onSeeAll={(cat: SearchEntityType) => setSelectedCategory(cat)} 
                                        />
                                    ) : (
                                        <DetailedView 
                                            pages={infiniteData?.pages} 
                                            onSelect={handleSelect} 
                                            type={selectedCategory}
                                            scrollRef={scrollRef}
                                            isFetchingNextPage={isFetchingNextPage}
                                        />
                                    )}
                                </div>
                            )}
                        </CommandList>
                        
                        <SearchFooter hasResults={!!hasResults} isLoading={isLoading} />
                    </Command>
                </div>
            )}
        </div>
    );
}

function SummaryView({ data, onSelect, onSeeAll }: { data: any; onSelect: any; onSeeAll: (cat: SearchEntityType) => void }) {
    if (!data) return null;

    return (
        <>
            <Section 
                title="Candidates" 
                icon={<User className="h-3.5 w-3.5" />} 
                items={data.candidates?.items} 
                count={data.candidates?.count}
                type="candidate"
                onSelect={onSelect}
                onSeeAll={() => onSeeAll('candidates')}
            />
            <Section 
                title="Jobs" 
                icon={<Briefcase className="h-3.5 w-3.5" />} 
                items={data.jobs?.items} 
                count={data.jobs?.count}
                type="job"
                onSelect={onSelect}
                onSeeAll={() => onSeeAll('jobs')}
            />
            <Section 
                title="Clients" 
                icon={<Building2 className="h-3.5 w-3.5" />} 
                items={data.clients?.items} 
                count={data.clients?.count}
                type="client"
                onSelect={onSelect}
                onSeeAll={() => onSeeAll('clients')}
            />
            <Section 
                title="Team Members" 
                icon={<Users className="h-3.5 w-3.5" />} 
                items={data.users?.items} 
                count={data.users?.count}
                type="user"
                onSelect={onSelect}
                onSeeAll={() => onSeeAll('users')}
            />
            <Section 
                title="External Sources" 
                icon={<UserPlus className="h-3.5 w-3.5" />} 
                items={data.tempCandidates?.items} 
                count={data.tempCandidates?.count}
                type="temp"
                onSelect={onSelect}
                onSeeAll={() => onSeeAll('temp')}
            />
        </>
    );
}

function DetailedView({ pages, onSelect, type, scrollRef, isFetchingNextPage }: { pages: any; onSelect: any; type: string; scrollRef: any; isFetchingNextPage: boolean }) {
    if (!pages) return null;

    const items = pages.flatMap((page: any) => {
        if (type === 'all') return [];
        const entityKey = type === 'temp' ? 'tempCandidates' : type;
        return page.data[entityKey]?.items || [];
    });

    return (
        <CommandGroup heading={
            <div className="flex items-center justify-between px-2 py-1">
                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                    {type.toUpperCase()} Results
                </span>
                <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                    {items.length} loaded
                </Badge>
            </div>
        }>
            {items.map((item: any) => (
                <SearchResultItemComponent 
                    key={item.id} 
                    item={item} 
                    icon={getIconForType(item.type || type.replace(/s$/, ''))}
                    iconBg={getIconBgForType(item.type || type.replace(/s$/, ''))}
                    onSelect={() => onSelect(item.type || type.replace(/s$/, ''), item.id)}
                />
            ))}
            <div ref={scrollRef} className="h-10 flex items-center justify-center">
                {isFetchingNextPage && <Loader2 className="h-5 w-5 animate-spin text-primary/40" />}
            </div>
        </CommandGroup>
    );
}

function Section({ title, icon, items, count, type, onSelect, onSeeAll }: any) {
    if (!items || items.length === 0) return null;

    return (
        <>
            <CommandGroup heading={
                <div className="flex items-center justify-between px-2 py-1 group/header">
                    <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80">
                        {icon}
                        {title}
                    </span>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] h-4 px-1.5 font-bold border-muted-foreground/20">
                            {count}
                        </Badge>
                        {count > 5 && (
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onSeeAll();
                                }}
                                className="text-[10px] text-primary hover:underline font-bold flex items-center gap-0.5 opacity-0 group-hover/header:opacity-100 transition-opacity"
                            >
                                View all <ArrowRight className="h-2.5 w-2.5" />
                            </button>
                        )}
                    </div>
                </div>
            }>
                {items.map((item: any) => (
                    <SearchResultItemComponent 
                        key={item.id} 
                        item={item} 
                        icon={getIconForType(item.type || type)}
                        iconBg={getIconBgForType(item.type || type)}
                        onSelect={() => onSelect(item.type || type, item.id)}
                    />
                ))}
            </CommandGroup>
            <CommandSeparator className="my-2 opacity-50" />
        </>
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
            className="group flex items-center gap-4 p-3.5 rounded-xl cursor-pointer transition-all duration-200 aria-selected:bg-primary/5 hover:bg-primary/5 mb-1"
        >
            <div className={cn(
                "flex-shrink-0 h-11 w-11 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-sm",
                "group-hover:scale-105 group-hover:rotate-3 group-hover:shadow-md",
                iconBg
            )}>
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                    <p className="text-[14px] font-bold text-foreground/90 truncate group-hover:text-primary transition-colors">
                        {title}
                    </p>
                    {status && (
                        <Badge variant="secondary" className={cn(
                            "text-[9px] px-1.5 py-0 rounded-md font-bold uppercase tracking-wider",
                            status === "Open" || status === "Active" || status === "Signed" 
                                ? "bg-green-500/10 text-green-600 border-green-500/20" 
                                : "bg-muted text-muted-foreground border-transparent"
                        )}>
                            {status}
                        </Badge>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <p className="text-[12px] text-muted-foreground/70 truncate flex-1 font-medium">
                        {subtitle}
                    </p>
                    {location && (
                        <div className="flex items-center gap-1.5 text-muted-foreground/40">
                            <span className="h-1 w-1 rounded-full bg-current" />
                            <p className="text-[10px] font-semibold truncate max-w-[100px]">
                                {location}
                            </p>
                        </div>
                    )}
                </div>
            </div>
            <div className="h-8 w-8 rounded-full bg-muted/0 group-hover:bg-primary/10 flex items-center justify-center transition-all">
                <ChevronRight className="h-4 w-4 text-muted-foreground/20 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
            </div>
        </CommandItem>
    );
}

function SearchLoadingState() {
    return (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <div className="relative">
                <div className="h-16 w-16 rounded-full border-[3px] border-primary/5 border-t-primary animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <Search className="h-6 w-6 text-primary/30" />
                </div>
            </div>
            <div className="text-center">
                <p className="text-[15px] font-bold text-foreground/80">Analyzing your data...</p>
                <p className="text-xs text-muted-foreground/60 mt-1 animate-pulse">Finding the best matches for you</p>
            </div>
        </div>
    );
}

function SearchEmptyState({ query }: { query: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center px-6">
            <div className="h-20 w-20 rounded-3xl bg-muted/30 flex items-center justify-center mb-6 rotate-3">
                <SearchX className="h-10 w-10 text-muted-foreground/40 -rotate-3" />
            </div>
            <p className="text-xl font-black text-foreground/90">No results found</p>
            <p className="text-sm text-muted-foreground/60 mt-2 max-w-[250px]">
                We couldn&apos;t find anything matching &quot;<span className="text-foreground font-bold">{query}</span>&quot;. Try different keywords.
            </p>
        </div>
    );
}

function SearchFooter({ hasResults, isLoading }: { hasResults: boolean; isLoading: boolean }) {
    return (
        <div className="border-t bg-muted/30 px-4 py-3 flex items-center justify-between text-[10px] text-muted-foreground uppercase tracking-[0.1em] font-black">
            <div className="flex items-center gap-2">
                <div className={cn("h-1.5 w-1.5 rounded-full", hasResults ? "bg-green-500" : "bg-muted-foreground/30")} />
                <span>{isLoading ? "Searching..." : hasResults ? "Results Ready" : "No results"}</span>
            </div>
            <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                    <kbd className="rounded-md border border-muted-foreground/20 bg-background px-1.5 py-0.5 shadow-sm text-foreground/70 font-bold">↑↓</kbd> Navigate
                </span>
                <span className="flex items-center gap-1.5">
                    <kbd className="rounded-md border border-muted-foreground/20 bg-background px-1.5 py-0.5 shadow-sm text-foreground/70 font-bold">↵</kbd> Select
                </span>
            </div>
        </div>
    );
}

function getIconForType(type: string) {
    switch (type) {
        case 'candidate': return <User className="h-5 w-5 text-orange-500" />;
        case 'job': return <Briefcase className="h-5 w-5 text-blue-500" />;
        case 'client': return <Building2 className="h-5 w-5 text-emerald-500" />;
        case 'user': return <Users className="h-5 w-5 text-violet-500" />;
        case 'temp': return <UserPlus className="h-5 w-5 text-pink-500" />;
        default: return <Search className="h-5 w-5" />;
    }
}

function getIconBgForType(type: string) {
    switch (type) {
        case 'candidate': return "bg-orange-500/10 border border-orange-500/10";
        case 'job': return "bg-blue-500/10 border border-blue-500/10";
        case 'client': return "bg-emerald-500/10 border border-emerald-500/10";
        case 'user': return "bg-violet-500/10 border border-violet-500/10";
        case 'temp': return "bg-pink-500/10 border border-pink-500/10";
        default: return "bg-muted";
    }
}


