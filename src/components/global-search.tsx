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
    ArrowRight,
    X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useSearchAll, useInfiniteSearch } from "@/hooks/use-search";
import { SearchEntityType } from "@/types/search";
import { useInView } from "react-intersection-observer";

const CATEGORIES: { label: string; value: SearchEntityType; icon: React.ElementType }[] = [
    { label: "All", value: "all", icon: Filter },
    { label: "Candidates", value: "candidates", icon: User },
    { label: "Jobs", value: "jobs", icon: Briefcase },
    { label: "Clients", value: "clients", icon: Building2 },
    { label: "Team", value: "users", icon: Users },
    { label: "External", value: "temp", icon: UserPlus },
];

interface ExtractedGroup {
    items: any[];
    count: number;
}

/**
 * Resilient helper to extract items and counts from various backend response shapes:
 * - { success: true, data: { candidates: { items: [...], count: 5 } } }
 * - { status: "success", data: { candidates: [...] } }
 * - { candidates: [...], jobs: [...] }
 * - Direct array of mixed items with .type
 * - { data: { items: [...] } }
 */
function extractEntityData(raw: any, entityKey: string): ExtractedGroup {
    if (!raw) return { items: [], count: 0 };

    // Drill down potential response envelopes
    let root = raw;
    if (root.data && typeof root.data === "object" && !Array.isArray(root.data)) {
        if (root.data.data && typeof root.data.data === "object" && !Array.isArray(root.data.data)) {
            root = root.data.data;
        } else {
            root = root.data;
        }
    }

    const aliases: Record<string, string[]> = {
        candidates: ["candidates", "candidate", "candidateList"],
        jobs: ["jobs", "job", "jobList", "positions"],
        clients: ["clients", "client", "clientList", "companies"],
        users: ["users", "user", "team", "teamMembers", "teamMember", "members"],
        temp: ["tempCandidates", "temp", "tempCandidate", "temporaryCandidates", "tem_candidates", "temCandidates"],
        tempCandidates: ["tempCandidates", "temp", "tempCandidate", "temporaryCandidates", "tem_candidates", "temCandidates"],
    };

    const keys = aliases[entityKey] || [entityKey];

    // Check if root itself is an array of items (each item might have .type)
    if (Array.isArray(root)) {
        const normKey = entityKey.toLowerCase().replace(/s$/, "");
        const matched = root.filter((item: any) => {
            const itemType = (item.type || "").toLowerCase().replace(/s$/, "");
            if (normKey === "temp" || normKey === "tempcandidate") {
                return itemType === "temp" || itemType === "tempcandidate" || itemType === "temporary";
            }
            return itemType === normKey;
        });
        if (matched.length > 0) {
            return { items: matched, count: matched.length };
        }
    }

    // Check direct property match on root
    for (const k of keys) {
        if (k in root) {
            const val = root[k];
            if (Array.isArray(val)) {
                return { items: val, count: val.length };
            }
            if (val && typeof val === "object") {
                const list = Array.isArray(val.items) 
                    ? val.items 
                    : Array.isArray(val.data) 
                    ? val.data 
                    : Array.isArray(val.results) 
                    ? val.results 
                    : [];
                const count = typeof val.count === "number" 
                    ? val.count 
                    : typeof val.total === "number" 
                    ? val.total 
                    : typeof val.totalCount === "number" 
                    ? val.totalCount 
                    : list.length;
                return { items: list, count };
            }
        }
    }

    // If searching a specific category tab, data might have items/results directly
    if (Array.isArray(root.items)) {
        const count = typeof root.count === "number" ? root.count : (root.totalCount ?? root.total ?? root.items.length);
        return { items: root.items, count };
    }
    if (Array.isArray(root.results)) {
        const count = typeof root.count === "number" ? root.count : (root.totalCount ?? root.total ?? root.results.length);
        return { items: root.results, count };
    }
    if (Array.isArray(root.data)) {
        return { items: root.data, count: root.data.length };
    }

    return { items: [], count: 0 };
}

function getItemId(item: any): string {
    return item.id || item._id || item.jobId || item.clientId || item.candidateId || item.userId || item._doc?._id || "";
}

function getItemTitle(item: any): string {
    return (
        item.name || 
        item.fullName || 
        (item.firstName ? `${item.firstName} ${item.lastName || ""}`.trim() : "") ||
        item.jobTitle || 
        item.title || 
        item.positionName ||
        item.clientName || 
        item.companyName ||
        "Untitled"
    );
}

function getItemSubtitle(item: any): string {
    return (
        item.subtitle || 
        item.email || 
        item.currentJobTitle ||
        item.experience ||
        item.department || 
        (item.client ? (typeof item.client === 'string' ? item.client : (item.client.name || item.client.companyName || "")) : "") ||
        item.industry ||
        item.phone ||
        ""
    );
}

function getItemLocation(item: any): string {
    return item.location || item.city || (item.address ? (typeof item.address === 'string' ? item.address : item.address.city) : "") || "";
}

function getItemStatus(item: any): string {
    return item.status || item.stage || item.state || "";
}

export function GlobalSearch() {
    const router = useRouter();
    const [query, setQuery] = React.useState("");
    const [isOpen, setIsOpen] = React.useState(false);
    const [selectedCategory, setSelectedCategory] = React.useState<SearchEntityType>("all");
    const [activeIndex, setActiveIndex] = React.useState<number>(-1);
    
    const containerRef = React.useRef<HTMLDivElement>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const listRef = React.useRef<HTMLDivElement>(null);
    const { ref: scrollRef, inView } = useInView();

    // Summary search (used for "All" tab)
    const { data: summaryData, isLoading: isSummaryLoading } = useSearchAll(
        query, 
        5, 
        isOpen && query.trim().length >= 1 && selectedCategory === "all"
    );

    // Infinite search (used for specific categories)
    const { 
        data: infiniteData, 
        isLoading: isInfiniteLoading, 
        fetchNextPage, 
        hasNextPage, 
        isFetchingNextPage 
    } = useInfiniteSearch(
        { q: query, type: selectedCategory, limit: 10 }, 
        isOpen && query.trim().length >= 1 && selectedCategory !== "all"
    );

    React.useEffect(() => {
        if (inView && hasNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, fetchNextPage]);

    // Extract structured data for "All" tab
    const candidateGroup = React.useMemo(() => extractEntityData(summaryData, "candidates"), [summaryData]);
    const jobGroup = React.useMemo(() => extractEntityData(summaryData, "jobs"), [summaryData]);
    const clientGroup = React.useMemo(() => extractEntityData(summaryData, "clients"), [summaryData]);
    const userGroup = React.useMemo(() => extractEntityData(summaryData, "users"), [summaryData]);
    const tempGroup = React.useMemo(() => extractEntityData(summaryData, "temp"), [summaryData]);

    const totalSummaryCount = 
        candidateGroup.items.length + 
        jobGroup.items.length + 
        clientGroup.items.length + 
        userGroup.items.length + 
        tempGroup.items.length;

    // Detailed items for specific category tabs
    const detailedItems = React.useMemo(() => {
        if (selectedCategory === "all") return [];
        return (infiniteData?.pages || []).flatMap((page: any) => {
            return extractEntityData(page, selectedCategory).items;
        });
    }, [infiniteData, selectedCategory]);

    // Flat list of visible items for keyboard navigation (ArrowUp/ArrowDown/Enter)
    const flatItems = React.useMemo(() => {
        if (selectedCategory === "all") {
            return [
                ...candidateGroup.items.map(item => ({ item, type: "candidate" })),
                ...jobGroup.items.map(item => ({ item, type: "job" })),
                ...clientGroup.items.map(item => ({ item, type: "client" })),
                ...userGroup.items.map(item => ({ item, type: "user" })),
                ...tempGroup.items.map(item => ({ item, type: "temp" })),
            ];
        }
        const mappedType = selectedCategory === "temp" ? "temp" : selectedCategory.replace(/s$/, "");
        return detailedItems.map(item => ({ item, type: item.type || mappedType }));
    }, [selectedCategory, candidateGroup, jobGroup, clientGroup, userGroup, tempGroup, detailedItems]);

    const hasResults = selectedCategory === "all" ? totalSummaryCount > 0 : detailedItems.length > 0;
    const isLoading = selectedCategory === "all" ? isSummaryLoading : isInfiniteLoading;

    // Reset active index when query, category, or results change
    React.useEffect(() => {
        setActiveIndex(-1);
    }, [query, selectedCategory]);

    const handleSelect = (rawType: string, item: any) => {
        const id = getItemId(item);
        if (!id) return;

        setIsOpen(false);
        setQuery("");
        setActiveIndex(-1);

        const normType = (item.type || rawType || "").toLowerCase().replace(/s$/, "");

        const routes: Record<string, string> = {
            candidate: `/candidates/${id}`,
            client: `/clients/${id}`,
            job: `/jobs/${id}`,
            user: `/teammembers?highlight=${id}`,
            team: `/teammembers?highlight=${id}`,
            teammember: `/teammembers?highlight=${id}`,
            temp: `/tem-candidates?highlight=${id}`,
            tempcandidate: `/tem-candidates?highlight=${id}`,
        };

        const route = routes[normType] || `/candidates/${id}`;
        router.push(route);
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

    // Global keyboard shortcut (Ctrl+K or Cmd+K)
    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setIsOpen(true);
                inputRef.current?.focus();
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    // Arrow navigation & Enter key handling on search input
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            if (!isOpen) {
                setIsOpen(true);
                return;
            }
            if (flatItems.length === 0) return;
            setActiveIndex((prev) => (prev + 1 < flatItems.length ? prev + 1 : 0));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            if (flatItems.length === 0) return;
            setActiveIndex((prev) => (prev - 1 >= 0 ? prev - 1 : flatItems.length - 1));
        } else if (e.key === "Enter") {
            if (activeIndex >= 0 && activeIndex < flatItems.length) {
                e.preventDefault();
                const target = flatItems[activeIndex];
                handleSelect(target.type, target.item);
            }
        } else if (e.key === "Escape") {
            e.preventDefault();
            setIsOpen(false);
        }
    };

    // Scroll active item into view
    React.useEffect(() => {
        if (activeIndex >= 0 && listRef.current) {
            const activeEl = listRef.current.querySelector(`[data-search-index="${activeIndex}"]`);
            if (activeEl) {
                activeEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
            }
        }
    }, [activeIndex]);

    let runningIndex = 0;

    return (
        <div className="relative max-w-[500px] w-full mx-auto" ref={containerRef}>
            {/* Input Bar */}
            <div className={cn(
                "group flex items-center px-3.5 py-1.5 rounded-xl border transition-all duration-200 bg-white/95 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-800 backdrop-blur-md shadow-2xs text-foreground",
                isOpen 
                    ? "border-blue-600 ring-2 ring-blue-500/20 bg-white dark:bg-slate-800" 
                    : "border-blue-200/80 dark:border-slate-700 hover:border-blue-400 dark:hover:border-slate-600"
            )}>
                <Search className={cn(
                    "h-4 w-4 mr-2.5 transition-colors shrink-0",
                    isOpen ? "text-blue-600" : "text-blue-500 group-hover:text-blue-600"
                )} />
                <input
                    ref={inputRef}
                    className="flex-1 bg-transparent border-none outline-none text-xs text-foreground placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium"
                    placeholder="Search anything... (Ctrl+K)"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                />
                
                {query.length > 0 && (
                    <button
                        type="button"
                        onClick={() => {
                            setQuery("");
                            setActiveIndex(-1);
                            inputRef.current?.focus();
                        }}
                        className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors mr-1"
                        title="Clear search"
                    >
                        <X className="h-3 w-3" />
                    </button>
                )}

                {isLoading && (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-600 ml-1 shrink-0" />
                )}
                {!isLoading && (
                    <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-0.5 rounded border border-blue-200/80 dark:border-blue-900 bg-blue-50/80 dark:bg-blue-950/50 px-1.5 font-mono text-[10px] font-bold text-blue-600 dark:text-blue-400 ml-1">
                        <span className="text-[10px]">⌘</span>K
                    </kbd>
                )}
            </div>

            {/* Dropdown Results Panel */}
            {isOpen && query.trim().length >= 1 && (
                <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-popover/98 backdrop-blur-2xl text-popover-foreground rounded-2xl border border-border shadow-[0_20px_50px_rgba(0,0,0,0.18)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.45)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 origin-top">
                    {/* Category Filter Tabs */}
                    <div className="flex items-center gap-1.5 p-2 border-b border-border/80 bg-muted/30 overflow-x-auto scrollbar-none">
                        {CATEGORIES.map((cat) => {
                            const IconComponent = cat.icon;
                            const isSelected = selectedCategory === cat.value;
                            return (
                                <button
                                    key={cat.value}
                                    type="button"
                                    onClick={() => {
                                        setSelectedCategory(cat.value);
                                        setActiveIndex(-1);
                                    }}
                                    className={cn(
                                        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap",
                                        isSelected 
                                            ? "bg-blue-600 text-white shadow-xs" 
                                            : "hover:bg-muted text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <IconComponent className="h-3.5 w-3.5" />
                                    <span>{cat.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Results Container */}
                    <div 
                        ref={listRef}
                        className="max-h-[460px] overflow-y-auto overscroll-contain p-2 scrollbar-thin scrollbar-thumb-muted-foreground/15 hover:scrollbar-thumb-muted-foreground/25"
                    >
                        {isLoading && !hasResults ? (
                            <SearchLoadingState />
                        ) : !hasResults ? (
                            <SearchEmptyState query={query} />
                        ) : (
                            <div>
                                {selectedCategory === "all" ? (
                                    <>
                                        <Section 
                                            title="Candidates" 
                                            icon={<User className="h-3.5 w-3.5 text-orange-500" />} 
                                            items={candidateGroup.items} 
                                            count={candidateGroup.count}
                                            type="candidate"
                                            activeIndex={activeIndex}
                                            startIndex={(() => {
                                                const start = runningIndex;
                                                runningIndex += candidateGroup.items.length;
                                                return start;
                                            })()}
                                            onHoverIndex={setActiveIndex}
                                            onSelect={(item: any) => handleSelect("candidate", item)}
                                            onSeeAll={() => setSelectedCategory("candidates")}
                                        />
                                        <Section 
                                            title="Jobs" 
                                            icon={<Briefcase className="h-3.5 w-3.5 text-blue-500" />} 
                                            items={jobGroup.items} 
                                            count={jobGroup.count}
                                            type="job"
                                            activeIndex={activeIndex}
                                            startIndex={(() => {
                                                const start = runningIndex;
                                                runningIndex += jobGroup.items.length;
                                                return start;
                                            })()}
                                            onHoverIndex={setActiveIndex}
                                            onSelect={(item: any) => handleSelect("job", item)}
                                            onSeeAll={() => setSelectedCategory("jobs")}
                                        />
                                        <Section 
                                            title="Clients" 
                                            icon={<Building2 className="h-3.5 w-3.5 text-emerald-500" />} 
                                            items={clientGroup.items} 
                                            count={clientGroup.count}
                                            type="client"
                                            activeIndex={activeIndex}
                                            startIndex={(() => {
                                                const start = runningIndex;
                                                runningIndex += clientGroup.items.length;
                                                return start;
                                            })()}
                                            onHoverIndex={setActiveIndex}
                                            onSelect={(item: any) => handleSelect("client", item)}
                                            onSeeAll={() => setSelectedCategory("clients")}
                                        />
                                        <Section 
                                            title="Team Members" 
                                            icon={<Users className="h-3.5 w-3.5 text-violet-500" />} 
                                            items={userGroup.items} 
                                            count={userGroup.count}
                                            type="user"
                                            activeIndex={activeIndex}
                                            startIndex={(() => {
                                                const start = runningIndex;
                                                runningIndex += userGroup.items.length;
                                                return start;
                                            })()}
                                            onHoverIndex={setActiveIndex}
                                            onSelect={(item: any) => handleSelect("user", item)}
                                            onSeeAll={() => setSelectedCategory("users")}
                                        />
                                        <Section 
                                            title="External Sources" 
                                            icon={<UserPlus className="h-3.5 w-3.5 text-pink-500" />} 
                                            items={tempGroup.items} 
                                            count={tempGroup.count}
                                            type="temp"
                                            activeIndex={activeIndex}
                                            startIndex={(() => {
                                                const start = runningIndex;
                                                runningIndex += tempGroup.items.length;
                                                return start;
                                            })()}
                                            onHoverIndex={setActiveIndex}
                                            onSelect={(item: any) => handleSelect("temp", item)}
                                            onSeeAll={() => setSelectedCategory("temp")}
                                        />
                                    </>
                                ) : (
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between px-2.5 py-1.5 mb-1 border-b border-border/50">
                                            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                                                {selectedCategory.toUpperCase()} RESULTS
                                            </span>
                                            <Badge variant="secondary" className="text-[10px] h-4 px-1.5 font-bold">
                                                {detailedItems.length} loaded
                                            </Badge>
                                        </div>

                                        {detailedItems.map((item: any, idx: number) => {
                                            const itemType = item.type || (selectedCategory === "temp" ? "temp" : selectedCategory.replace(/s$/, ""));
                                            return (
                                                <SearchResultItemComponent 
                                                    key={getItemId(item) || idx} 
                                                    index={idx}
                                                    isActive={activeIndex === idx}
                                                    item={item} 
                                                    icon={getIconForType(itemType)}
                                                    iconBg={getIconBgForType(itemType)}
                                                    onSelect={() => handleSelect(itemType, item)}
                                                    onHover={() => setActiveIndex(idx)}
                                                />
                                            );
                                        })}

                                        <div ref={scrollRef} className="h-10 flex items-center justify-center">
                                            {isFetchingNextPage && <Loader2 className="h-5 w-5 animate-spin text-primary/60" />}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    
                    {/* Footer */}
                    <SearchFooter hasResults={hasResults} isLoading={isLoading} />
                </div>
            )}
        </div>
    );
}

function Section({ 
    title, 
    icon, 
    items, 
    count, 
    type, 
    activeIndex,
    startIndex,
    onHoverIndex,
    onSelect, 
    onSeeAll 
}: {
    title: string;
    icon: React.ReactNode;
    items: any[];
    count: number;
    type: string;
    activeIndex: number;
    startIndex: number;
    onHoverIndex: (idx: number) => void;
    onSelect: (item: any) => void;
    onSeeAll: () => void;
}) {
    if (!items || items.length === 0) return null;

    return (
        <div className="mb-3 last:mb-0">
            {/* Section Header */}
            <div className="flex items-center justify-between px-2.5 py-1 mb-1 group/header">
                <span className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80">
                    {icon}
                    <span>{title}</span>
                </span>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] h-4 px-1.5 font-bold border-muted-foreground/20">
                        {count || items.length}
                    </Badge>
                    {(count > 5 || items.length >= 5) && (
                        <button 
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onSeeAll();
                            }}
                            className="text-[10px] text-blue-600 hover:text-blue-700 dark:text-blue-400 font-bold flex items-center gap-0.5 hover:underline cursor-pointer"
                        >
                            <span>View all</span>
                            <ArrowRight className="h-2.5 w-2.5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Items List */}
            <div className="space-y-1">
                {items.map((item: any, idx: number) => {
                    const globalIdx = startIndex + idx;
                    return (
                        <SearchResultItemComponent 
                            key={getItemId(item) || `${type}-${idx}`} 
                            index={globalIdx}
                            isActive={activeIndex === globalIdx}
                            item={item} 
                            icon={getIconForType(item.type || type)}
                            iconBg={getIconBgForType(item.type || type)}
                            onSelect={() => onSelect(item)}
                            onHover={() => onHoverIndex(globalIdx)}
                        />
                    );
                })}
            </div>
        </div>
    );
}

function SearchResultItemComponent({ 
    item, 
    index,
    isActive,
    icon, 
    iconBg, 
    onSelect,
    onHover
}: { 
    item: any; 
    index: number;
    isActive: boolean;
    icon: React.ReactNode; 
    iconBg: string; 
    onSelect: () => void;
    onHover: () => void;
}) {
    const title = getItemTitle(item);
    const subtitle = getItemSubtitle(item);
    const location = getItemLocation(item);
    const status = getItemStatus(item);

    return (
        <div
            data-search-index={index}
            onClick={onSelect}
            onMouseEnter={onHover}
            role="button"
            tabIndex={0}
            className={cn(
                "group flex items-center gap-3.5 p-2.5 rounded-xl cursor-pointer transition-all duration-150 select-none",
                isActive 
                    ? "bg-blue-50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 ring-1 ring-blue-500/30 shadow-xs" 
                    : "hover:bg-muted/60 text-foreground"
            )}
        >
            {/* Icon Avatar */}
            <div className={cn(
                "shrink-0 h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-200 shadow-2xs",
                "group-hover:scale-105 group-hover:rotate-2",
                iconBg
            )}>
                {icon}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                    <p className={cn(
                        "text-[13px] font-bold truncate transition-colors",
                        isActive ? "text-blue-600 dark:text-blue-400" : "text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400"
                    )}>
                        {title}
                    </p>
                    {status && (
                        <Badge 
                            variant="secondary" 
                            className={cn(
                                "text-[9px] px-1.5 py-0 rounded-md font-bold uppercase tracking-wider shrink-0",
                                status.toLowerCase() === "open" || status.toLowerCase() === "active" || status.toLowerCase() === "signed" 
                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" 
                                    : "bg-muted text-muted-foreground border-transparent"
                            )}
                        >
                            {status}
                        </Badge>
                    )}
                </div>

                <div className="flex items-center gap-2 text-xs">
                    {subtitle && (
                        <p className="text-[11px] text-muted-foreground truncate flex-1 font-medium">
                            {subtitle}
                        </p>
                    )}
                    {location && (
                        <div className="flex items-center gap-1 text-muted-foreground/60 shrink-0">
                            <span className="h-1 w-1 rounded-full bg-current" />
                            <p className="text-[10px] font-semibold truncate max-w-[120px]">
                                {location}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Arrow affordance */}
            <div className="h-7 w-7 rounded-lg flex items-center justify-center text-muted-foreground/30 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0">
                <ChevronRight className="h-4 w-4" />
            </div>
        </div>
    );
}

function SearchLoadingState() {
    return (
        <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <div className="relative">
                <div className="h-12 w-12 rounded-full border-[3px] border-blue-500/15 border-t-blue-600 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <Search className="h-5 w-5 text-blue-600/40" />
                </div>
            </div>
            <div className="text-center">
                <p className="text-[14px] font-bold text-foreground">Searching your database...</p>
                <p className="text-xs text-muted-foreground/70 mt-0.5 animate-pulse">Finding matching candidates, jobs, and records</p>
            </div>
        </div>
    );
}

function SearchEmptyState({ query }: { query: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-14 text-center px-4">
            <div className="h-14 w-14 rounded-2xl bg-muted/50 flex items-center justify-center mb-3">
                <SearchX className="h-7 w-7 text-muted-foreground/60" />
            </div>
            <p className="text-base font-bold text-foreground">No matches found</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-[280px]">
                We couldn&apos;t find anything matching &quot;<span className="text-foreground font-semibold">{query}</span>&quot;. Try searching with a different name, job title, or email.
            </p>
        </div>
    );
}

function SearchFooter({ hasResults, isLoading }: { hasResults: boolean; isLoading: boolean }) {
    return (
        <div className="border-t border-border/80 bg-muted/25 px-3.5 py-2 flex items-center justify-between text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
            <div className="flex items-center gap-2">
                <div className={cn("h-1.5 w-1.5 rounded-full", isLoading ? "bg-amber-500 animate-pulse" : hasResults ? "bg-emerald-500" : "bg-muted-foreground/40")} />
                <span>{isLoading ? "Searching..." : hasResults ? "Results Ready" : "No results"}</span>
            </div>
            <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                    <kbd className="rounded border border-border bg-background px-1 py-0.5 text-[9px] font-mono shadow-xs text-foreground font-bold">↑↓</kbd> Navigate
                </span>
                <span className="flex items-center gap-1">
                    <kbd className="rounded border border-border bg-background px-1 py-0.5 text-[9px] font-mono shadow-xs text-foreground font-bold">↵</kbd> Select
                </span>
                <span className="flex items-center gap-1">
                    <kbd className="rounded border border-border bg-background px-1 py-0.5 text-[9px] font-mono shadow-xs text-foreground font-bold">Esc</kbd> Close
                </span>
            </div>
        </div>
    );
}

function getIconForType(type: string) {
    const t = (type || "").toLowerCase().replace(/s$/, "");
    switch (t) {
        case "candidate": return <User className="h-5 w-5 text-orange-500" />;
        case "job": return <Briefcase className="h-5 w-5 text-blue-500" />;
        case "client": return <Building2 className="h-5 w-5 text-emerald-500" />;
        case "user": return <Users className="h-5 w-5 text-violet-500" />;
        case "temp": 
        case "tempcandidate": 
            return <UserPlus className="h-5 w-5 text-pink-500" />;
        default: return <Search className="h-5 w-5 text-blue-500" />;
    }
}

function getIconBgForType(type: string) {
    const t = (type || "").toLowerCase().replace(/s$/, "");
    switch (t) {
        case "candidate": return "bg-orange-500/10 border border-orange-500/20";
        case "job": return "bg-blue-500/10 border border-blue-500/20";
        case "client": return "bg-emerald-500/10 border border-emerald-500/20";
        case "user": return "bg-violet-500/10 border border-violet-500/20";
        case "temp": 
        case "tempcandidate": 
            return "bg-pink-500/10 border border-pink-500/20";
        default: return "bg-muted border border-border";
    }
}
