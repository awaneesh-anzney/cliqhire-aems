"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { COUNTRIES, validatePhone, getFullPhone, getCountryByCode } from "@/lib/countryCodes";
import { Country, PhoneRawChange } from "@/types/countryCodes";
import { cn } from "@/lib/utils";

/**
 * PhoneInput — Reusable phone number field for Next.js
 * 
 * Standardized to handle both E.164 (value) or separate (countryCode + phoneNumber)
 */
interface PhoneInputProps {
  // Mode 1: Controlled via full E.164 value
  value?: string;
  onChange?: (value: string) => void;

  // Mode 2: Controlled via separate fields (requested by user)
  countryCode?: string;
  onCountryCodeChange?: (code: string) => void;
  phoneNumber?: string;
  onPhoneNumberChange?: (number: string) => void;

  // Metadata callback
  onRawChange?: (data: PhoneRawChange) => void;

  // Configuration
  defaultCountry?: string; // ISO code e.g. "IN"
  label?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  error?: string;
  placeholder?: string;
}

export default function PhoneInput({
  value,
  onChange,
  countryCode,
  onCountryCodeChange,
  phoneNumber,
  onPhoneNumberChange,
  onRawChange,
  defaultCountry = "IN",
  label,
  required = false,
  disabled = false,
  className = "",
  error: externalError = "",
  placeholder,
}: PhoneInputProps) {
  // ── State ────────────────────────────────────────────────────────────────
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    () => getCountryByCode(countryCode || defaultCountry) || getCountryByCode("IN")!
  );
  
  // Internal state used if specific props aren't provided
  const [internalLocalNumber, setInternalLocalNumber] = useState("");
  const [touched, setTouched] = useState(false);
  const [internalError, setInternalError] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [search, setSearch] = useState("");

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Derived values
  const effectiveLocalNumber = phoneNumber !== undefined ? phoneNumber : internalLocalNumber;

  // ── Sync from controlled `value` (E.164) ────────────────────────────────
  useEffect(() => {
    if (value !== undefined) {
      if (!value) {
        setInternalLocalNumber("");
        return;
      }
      // Try to parse the E.164 value
      const sorted = [...COUNTRIES].sort((a, b) => b.dialCode.length - a.dialCode.length);
      const match = sorted.find((c) => value.startsWith(c.dialCode));

      if (match) {
        setSelectedCountry(match);
        const local = value.slice(match.dialCode.length);
        setInternalLocalNumber(local);
        // If external handlers for separate fields exist, sync them too? 
        // Usually, if value is provided, we use the value mode.
      }
    }
  }, [value]);

  // Sync from controlled `countryCode`
  useEffect(() => {
    if (countryCode) {
      const match = getCountryByCode(countryCode);
      if (match && match.code !== selectedCountry.code) {
        setSelectedCountry(match);
      }
    }
  }, [countryCode, selectedCountry.code]);

  // ── Outside click & Focus ───────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (dropdownOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [dropdownOpen]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const updateData = useCallback((country: Country, local: string, isTouched: boolean) => {
    const { valid, error } = validatePhone(country.code, local);
    const full = valid ? getFullPhone(country.code, local) : "";

    if (isTouched) {
      setInternalError(error || "");
    }

    // Call external handlers
    onChange?.(full);
    onCountryCodeChange?.(country.code);
    onPhoneNumberChange?.(local);
    
    onRawChange?.({
      countryCode: country.code,
      localNumber: local,
      dialCode: country.dialCode,
      full,
      valid,
      error,
    });
  }, [onChange, onCountryCodeChange, onPhoneNumberChange, onRawChange]);

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setDropdownOpen(false);
    setSearch("");
    
    // Reset local number when country changes? 
    // Usually better to keep it and re-validate.
    updateData(country, effectiveLocalNumber, touched);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    if (phoneNumber === undefined) {
      setInternalLocalNumber(raw);
    }
    updateData(selectedCountry, raw, touched);
  };

  const handleBlur = () => {
    setTouched(true);
    updateData(selectedCountry, effectiveLocalNumber, true);
  };

  const displayError = externalError || (touched ? internalError : "");

  const filteredCountries = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.dialCode.includes(search) ||
      c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label className="text-sm font-bold text-slate-700 uppercase tracking-tight ml-0.5">
          {label}
          {required && <span className="text-primary ml-1">*</span>}
        </label>
      )}

      <div
        className={cn(
          "flex items-center border rounded-xl overflow-visible bg-white transition-all h-11",
          displayError ? "border-red-400 focus-within:border-red-500 shadow-sm shadow-red-50" : "border-slate-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 shadow-sm",
          disabled && "opacity-50 pointer-events-none bg-slate-50"
        )}
      >
        {/* Country Selector */}
        <div className="relative h-full" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen((prev) => !prev)}
            disabled={disabled}
            className="flex items-center gap-2 px-3 h-full border-r border-slate-100 hover:bg-slate-50 transition-colors min-w-[95px]"
          >
            <span className="text-lg leading-none">{selectedCountry.flag}</span>
            <span className="text-sm text-slate-900 font-bold">{selectedCountry.dialCode}</span>
            <svg
              className={cn("w-3.5 h-3.5 text-slate-400 transition-transform", dropdownOpen && "rotate-180")}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown */}
          {dropdownOpen && (
            <div className="absolute z-[100] top-full left-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-left">
              <div className="p-3 border-b border-slate-100 bg-slate-50/50">
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search country or code..."
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 font-bold"
                />
              </div>

              <ul className="max-h-64 overflow-y-auto custom-scrollbar p-1">
                {filteredCountries.length === 0 ? (
                  <li className="px-4 py-8 text-sm text-slate-400 text-center font-bold">No country matches</li>
                ) : (
                  filteredCountries.map((country) => (
                    <li
                      key={country.code}
                      onClick={() => handleCountrySelect(country)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-xl transition-all",
                        country.code === selectedCountry.code ? "bg-primary/10 text-primary font-bold" : "hover:bg-slate-50 text-slate-700"
                      )}
                    >
                      <span className="text-lg">{country.flag}</span>
                      <span className="flex-1 text-sm font-bold truncate">{country.name}</span>
                      <span className="text-slate-400 text-[10px] font-black uppercase">{country.dialCode}</span>
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}
        </div>

        {/* Input */}
        <input
          type="tel"
          inputMode="numeric"
          value={effectiveLocalNumber}
          onChange={handleNumberChange}
          onBlur={handleBlur}
          disabled={disabled}
          placeholder={placeholder || `${selectedCountry.minLength}–${selectedCountry.maxLength} digits`}
          className="flex-1 px-4 py-2.5 text-sm font-bold outline-none bg-transparent text-slate-900 placeholder:text-slate-300"
        />

        {/* Status Icon */}
        <div className="pr-3 flex items-center justify-center">
          {touched && effectiveLocalNumber && (
            <span>
              {!internalError ? (
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              ) : (
                <div className="w-5 h-5 bg-red-400 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              )}
            </span>
          )}
        </div>
      </div>

      {displayError && (
        <p className="text-[10px] font-black text-red-500 uppercase tracking-wider ml-1 mt-0.5">
          {displayError}
        </p>
      )}
    </div>
  );
}