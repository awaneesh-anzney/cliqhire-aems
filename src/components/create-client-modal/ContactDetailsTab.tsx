import type { ClientForm } from "@/components/create-client-modal/create-client-modal";
import PhoneInput from "@/components/phone/Phoneinput";

interface ContactDetailsTabProps {
  form:     ClientForm;
  setField: <K extends keyof ClientForm>(key: K, value: ClientForm[K]) => void;
}

export function ContactDetailsTab({ form, setField }: ContactDetailsTabProps) {
  return (
    <div className="grid grid-cols-2 gap-3 p-1">
      <div className="col-span-2 flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">Company name *</label>
        <input
          type="text"
          value={form.name}
          onChange={e => setField("name", e.target.value)}
          placeholder="e.g. Acme Corp"
          className="h-9 border rounded-md px-2 text-sm"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">Email *</label>
        <input
          type="email"
          value={form.email}
          onChange={e => setField("email", e.target.value)}
          placeholder="primary@company.com"
          className="h-9 border rounded-md px-2 text-sm"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">Other email</label>
        <input
          type="email"
          value={form.otherEmail}
          onChange={e => setField("otherEmail", e.target.value)}
          placeholder="other@company.com (optional)"
          className="h-9 border rounded-md px-2 text-sm"
        />
      </div>

      <div className="flex flex-col gap-1 col-span-2 md:col-span-1">
        <label className="text-xs text-muted-foreground">Phone *</label>
        <PhoneInput
          countryCode={form.countryCode}
          onCountryCodeChange={(code) => setField("countryCode", code)}
          phoneNumber={form.phoneNumber}
          onPhoneNumberChange={(phone) => setField("phoneNumber", phone)}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">Website</label>
        <input
          type="url"
          value={form.website}
          onChange={e => setField("website", e.target.value)}
          placeholder="https://company.com"
          className="h-9 border rounded-md px-2 text-sm"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">Country of business</label>
        <input
          type="text"
          value={form.countryOfBusiness}
          onChange={e => setField("countryOfBusiness", e.target.value)}
          placeholder="e.g. Saudi Arabia"
          className="h-9 border rounded-md px-2 text-sm"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">Address</label>
        <input
          type="text"
          value={form.address}
          onChange={e => setField("address", e.target.value)}
          placeholder="Street address"
          className="h-9 border rounded-md px-2 text-sm"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">LinkedIn</label>
        <input
          type="url"
          value={form.linkedInProfile}
          onChange={e => setField("linkedInProfile", e.target.value)}
          placeholder="https://linkedin.com/company/..."
          className="h-9 border rounded-md px-2 text-sm"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">Google Maps link</label>
        <input
          type="url"
          value={form.googleMapsLink}
          onChange={e => setField("googleMapsLink", e.target.value)}
          placeholder="https://maps.google.com/..."
          className="h-9 border rounded-md px-2 text-sm"
        />
      </div>
    </div>
  );
}