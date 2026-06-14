"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { Search, ChevronDown } from "lucide-react";
import countryList from 'react-select-country-list';
import nationalities from 'i18n-nationality';
import enLocale from 'i18n-nationality/langs/en.json';
import { CONTINENTS } from "@/lib/constants";

// Register English locale for nationalities
nationalities.registerLocale(enLocale);

interface CountrySelectProps {
    value: string;
    onChange: (value: string, nationality?: string) => void;
    type?: "country" | "nationality" | "continent";
    placeholder?: string;
    className?: string;
    error?: boolean;
}

export function CountrySelect({
    value,
    onChange,
    type = "country",
    placeholder = "Select...",
    className = "",
    error = false,
}: CountrySelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 300);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Build the country and nationality list statically/offline using the libraries
    const countriesData = useMemo(() => {
        return countryList().getData().map((c) => {
            const code = c.value;
            const name = c.label;
            const nationality = nationalities.getName(code, "en") || name;
            return {
                code,
                name,
                nationality,
            };
        });
    }, []);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearch("");
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const getDisplayText = useCallback((country: typeof countriesData[number]) => {
        if (type === "nationality") {
            return country.nationality;
        }
        return country.name;
    }, [type]);

    const filteredCountries = useMemo(() => {
        return countriesData
            .filter((country) => {
                const text = getDisplayText(country).toLowerCase();
                return text.includes(debouncedSearch.toLowerCase());
            })
            .sort((a, b) => getDisplayText(a).localeCompare(getDisplayText(b)));
    }, [countriesData, debouncedSearch, getDisplayText]);

    const filteredContinents = useMemo(() => {
        return CONTINENTS.filter((continent) => {
            return continent.toLowerCase().includes(debouncedSearch.toLowerCase());
        }).sort();
    }, [debouncedSearch]);

    return (
        <div ref={wrapperRef} className={`relative ${className}`}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 relative pr-10 ${error ? 'border-red-500' : ''}`}
            >
                {value ? (
                    <span className="truncate font-bold">{value}</span>
                ) : (
                    <span className="text-muted-foreground font-bold">{placeholder}</span>
                )}
                <div 
                    className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5"
                    onClick={(e) => e.stopPropagation()}
                >
                    {value && (
                        <div
                            role="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onChange("", "");
                            }}
                            className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors cursor-pointer"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="text-muted-foreground hover:text-foreground"
                            >
                                <path d="M18 6 6 18" />
                                <path d="m6 6 12 12" />
                            </svg>
                        </div>
                    )}
                    <ChevronDown className="h-4 w-4 opacity-50" />
                </div>
            </button>

            {isOpen && (
                <div className="absolute z-50 mt-1 w-full min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md max-h-64 flex flex-col data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[side=bottom]:translate-y-1">
                    <div className="flex items-center border-b px-3 shrink-0">
                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                        <input
                            className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 font-bold"
                            placeholder="Search..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            autoFocus
                        />
                    </div>

                    <div className="overflow-auto p-1 flex-1">
                        {type === "continent" ? (
                            filteredContinents.length === 0 ? (
                                <div className="p-2 text-sm text-center text-muted-foreground py-6 font-bold">
                                    No results found.
                                </div>
                            ) : (
                                filteredContinents.map((continent) => (
                                    <div
                                        key={continent}
                                        className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 font-bold"
                                        onClick={() => {
                                            onChange(continent);
                                            setSearch("");
                                            setIsOpen(false);
                                        }}
                                    >
                                        <span className="truncate">{continent}</span>
                                    </div>
                                ))
                            )
                        ) : (
                            filteredCountries.length === 0 ? (
                                <div className="p-2 text-sm text-center text-muted-foreground py-6 font-bold">
                                    No results found.
                                </div>
                            ) : (
                                filteredCountries.map((country) => {
                                    const text = getDisplayText(country);
                                    const nationalityName = country.nationality;

                                    return (
                                        <div
                                            key={country.code}
                                            className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 font-bold"
                                            onClick={() => {
                                                onChange(text, nationalityName);
                                                setSearch("");
                                                setIsOpen(false);
                                            }}
                                        >
                                            <img
                                                src={`https://purecatamphetamine.github.io/country-flag-icons/3x2/${country.code.toUpperCase()}.svg`}
                                                alt={`Flag of ${country.name}`}
                                                className="h-4 w-6 object-cover rounded-sm border shrink-0"
                                            />
                                            <span className="truncate">{text}</span>
                                        </div>
                                    );
                                })
                            )
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
