import PhoneInput from "@/components/phone/Phoneinput";
import { LocationSuggestion } from "@/components/location/LocationSuggestion";
import type { ClientForm } from "@/components/create-client-modal/create-client-modal";

interface ContactDetailsTabProps {
  form: ClientForm;
  setField: <K extends keyof ClientForm>(key: K, value: ClientForm[K]) => void;
}

export function ContactDetailsTab({ form, setField }: ContactDetailsTabProps) {
  return (
    <div className="grid grid-cols-2 gap-4 p-1">
      <div className="col-span-2 flex flex-col gap-1.5">
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Company name *</label>
        <input
          type="text"
          value={form.name}
          onChange={e => setField("name", e.target.value)}
          placeholder="e.g. Acme Corp"
          className="h-11 border border-border rounded-xl px-4 text-sm bg-muted focus:bg-card transition-all font-semibold outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Email *</label>
        <input
          type="email"
          value={form.email}
          onChange={e => setField("email", e.target.value)}
          placeholder="primary@company.com"
          className="h-11 border border-border rounded-xl px-4 text-sm bg-muted focus:bg-card transition-all font-semibold outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Other email</label>
        <input
          type="email"
          value={form.otherEmail}
          onChange={e => setField("otherEmail", e.target.value)}
          placeholder="other@company.com (optional)"
          className="h-11 border border-border rounded-xl px-4 text-sm bg-muted focus:bg-card transition-all font-semibold outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="flex flex-col gap-1.5 col-span-2 md:col-span-1">
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Phone *</label>
        <PhoneInput
          countryCode={form.countryCode}
          onCountryCodeChange={(code) => setField("countryCode", code)}
          phoneNumber={form.phoneNumber}
          onPhoneNumberChange={(phone) => setField("phoneNumber", phone)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Website</label>
        <input
          type="url"
          value={form.website}
          onChange={e => setField("website", e.target.value)}
          placeholder="https://company.com"
          className="h-11 border border-border rounded-xl px-4 text-sm bg-muted focus:bg-card transition-all font-semibold outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Country of business</label>
        <input
          type="text"
          value={form.countryOfBusiness}
          onChange={e => setField("countryOfBusiness", e.target.value)}
          placeholder="e.g. Saudi Arabia"
          className="h-11 border border-border rounded-xl px-4 text-sm bg-muted focus:bg-card transition-all font-semibold outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Address</label>
        <input
          type="text"
          value={form.address}
          onChange={e => setField("address", e.target.value)}
          placeholder="e.g. 123 Business Way"
          className="h-11 border border-border rounded-xl px-4 text-sm bg-muted focus:bg-card transition-all font-semibold outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Location</label>
        <LocationSuggestion
          value={form.location}
          onChange={val => setField("location", val)}
          placeholder="Search for client city..."
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">LinkedIn</label>
        <input
          type="url"
          value={form.linkedInProfile}
          onChange={e => setField("linkedInProfile", e.target.value)}
          placeholder="https://linkedin.com/company/..."
          className="h-11 border border-border rounded-xl px-4 text-sm bg-muted focus:bg-card transition-all font-semibold outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Google Maps link</label>
        <input
          type="url"
          value={form.googleMapsLink}
          onChange={e => setField("googleMapsLink", e.target.value)}
          placeholder="https://maps.google.com/..."
          className="h-11 border border-border rounded-xl px-4 text-sm bg-muted focus:bg-card transition-all font-semibold outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>
    </div>
  );
}