"use client";

import PhoneInput from "@/components/phone/Phoneinput";
import { LocationSuggestion } from "@/components/location/LocationSuggestion";
import type { ClientForm } from "@/components/create-client-modal/create-client-modal";
import { CountrySelect } from "@/components/ui/country-select";
import { Input } from "@/components/ui/input";
import { 
  Building2, 
  Mail, 
  Globe, 
  MapPin, 
  MapPinned, 
  Linkedin, 
  Navigation, 
  Phone, 
  Send
} from "lucide-react";

interface ContactDetailsTabProps {
  form: ClientForm;
  setField: <K extends keyof ClientForm>(key: K, value: ClientForm[K]) => void;
}

export function ContactDetailsTab({ form, setField }: ContactDetailsTabProps) {
  return (
    <div className="space-y-4 pb-2">
      {/* 1. Company Identity & Email */}
      <div className="rounded-2xl border border-border/70 bg-card p-4 sm:p-5 space-y-4 shadow-xs">
        <div className="flex items-center gap-2 pb-2 border-b border-border/40">
          <div className="h-6 w-6 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Building2 className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Company & Communication</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Company Name */}
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-bold text-foreground/90 flex items-center gap-1">
              Company Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative flex items-center">
              <Building2 className="w-4 h-4 absolute left-3 text-primary pointer-events-none" />
              <Input
                type="text"
                value={form.name}
                onChange={e => setField("name", e.target.value)}
                placeholder="e.g. Acme International Ltd."
                className="h-10 pl-9.5 rounded-xl bg-background border-border/80 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 font-semibold text-xs sm:text-sm transition-all"
              />
            </div>
          </div>

          {/* Primary Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground/90 flex items-center gap-1">
              Primary Email <span className="text-rose-500">*</span>
            </label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 absolute left-3 text-primary pointer-events-none" />
              <Input
                type="email"
                value={form.email}
                onChange={e => setField("email", e.target.value)}
                placeholder="official@company.com"
                className="h-10 pl-9.5 rounded-xl bg-background border-border/80 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 font-semibold text-xs sm:text-sm transition-all"
              />
            </div>
          </div>

          {/* Secondary Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground/90">Secondary Email</label>
            <div className="relative flex items-center">
              <Send className="w-4 h-4 absolute left-3 text-muted-foreground pointer-events-none" />
              <Input
                type="email"
                value={form.otherEmail}
                onChange={e => setField("otherEmail", e.target.value)}
                placeholder="billing@company.com (optional)"
                className="h-10 pl-9.5 rounded-xl bg-background border-border/80 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 font-semibold text-xs sm:text-sm transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Direct Phone & Web Presence */}
      <div className="rounded-2xl border border-border/70 bg-card p-4 sm:p-5 space-y-4 shadow-xs">
        <div className="flex items-center gap-2 pb-2 border-b border-border/40">
          <div className="h-6 w-6 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Phone className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Phone & Online Presence</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Phone */}
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-bold text-foreground/90 flex items-center gap-1">
              Official Phone <span className="text-rose-500">*</span>
            </label>
            <div className="w-full">
              <PhoneInput
                countryCode={form.countryCode}
                onCountryCodeChange={(code) => setField("countryCode", code)}
                phoneNumber={form.phoneNumber}
                onPhoneNumberChange={(phone) => setField("phoneNumber", phone)}
              />
            </div>
          </div>

          {/* Website */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground/90">Website</label>
            <div className="relative flex items-center">
              <Globe className="w-4 h-4 absolute left-3 text-muted-foreground pointer-events-none" />
              <Input
                type="url"
                value={form.website}
                onChange={e => setField("website", e.target.value)}
                placeholder="https://example.com"
                className="h-10 pl-9.5 rounded-xl bg-background border-border/80 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 font-semibold text-xs sm:text-sm transition-all"
              />
            </div>
          </div>

          {/* LinkedIn Profile */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground/90">LinkedIn Page</label>
            <div className="relative flex items-center">
              <Linkedin className="w-4 h-4 absolute left-3 text-[#0A66C2] pointer-events-none" />
              <Input
                type="url"
                value={form.linkedInProfile}
                onChange={e => setField("linkedInProfile", e.target.value)}
                placeholder="https://linkedin.com/company/acme"
                className="h-10 pl-9.5 rounded-xl bg-background border-border/80 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 font-semibold text-xs sm:text-sm transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Location & Physical Address */}
      <div className="rounded-2xl border border-border/70 bg-card p-4 sm:p-5 space-y-4 shadow-xs">
        <div className="flex items-center gap-2 pb-2 border-b border-border/40">
          <div className="h-6 w-6 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <MapPin className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Location & Coordinates</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Country of Business */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground/90">Country of Operations</label>
            <CountrySelect
              value={form.countryOfBusiness}
              onChange={val => setField("countryOfBusiness", val)}
              type="country"
              placeholder="Select country..."
            />
          </div>

          {/* City / Location */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground/90">City / Location</label>
            <LocationSuggestion
              value={form.location}
              onChange={val => setField("location", val)}
              placeholder="Search city, e.g. Riyadh..."
            />
          </div>

          {/* Street Address */}
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-bold text-foreground/90">Street Address</label>
            <div className="relative flex items-center">
              <MapPinned className="w-4 h-4 absolute left-3 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                value={form.address}
                onChange={e => setField("address", e.target.value)}
                placeholder="Floor 4, Building 12, Olaya Street"
                className="h-10 pl-9.5 rounded-xl bg-background border-border/80 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 font-semibold text-xs sm:text-sm transition-all"
              />
            </div>
          </div>

          {/* Google Maps link */}
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs font-bold text-foreground/90">Google Maps Location Link</label>
            <div className="relative flex items-center">
              <Navigation className="w-4 h-4 absolute left-3 text-muted-foreground pointer-events-none" />
              <Input
                type="url"
                value={form.googleMapsLink}
                onChange={e => setField("googleMapsLink", e.target.value)}
                placeholder="https://maps.app.goo.gl/..."
                className="h-10 pl-9.5 rounded-xl bg-background border-border/80 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 font-semibold text-xs sm:text-sm transition-all"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}