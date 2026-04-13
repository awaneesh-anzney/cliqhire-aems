import type { ClientForm } from "@/components/create-client-modal/create-client-modal";

interface ClientInformationTabProps {
  form:     ClientForm;
  setField: <K extends keyof ClientForm>(key: K, value: ClientForm[K]) => void;
}

export function ClientInformationTab({ form, setField }: ClientInformationTabProps) {
  return (
    <div className="grid grid-cols-2 gap-3 p-1">
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">Client stage *</label>
        <select
          value={form.clientStage}
          onChange={e => setField("clientStage", e.target.value)}
          className="h-9 border rounded-md px-2 text-sm"
        >
          <option value="Lead">Lead</option>
          <option value="Engaged">Engaged</option>
          <option value="Signed">Signed</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground">Sub-stage</label>
        <select
          value={form.clientSubStage}
          onChange={e => setField("clientSubStage", e.target.value)}
          className="h-9 border rounded-md px-2 text-sm"
        >
          <option value="">— select —</option>
        </select>
      </div>

      {([
        { key: "salesLead",      label: "Sales lead",  placeholder: "e.g. John Smith" },
        { key: "referredBy",     label: "Referred by", placeholder: "Referral name"   },
        { key: "clientPriority", label: "Priority",    placeholder: ""                },
        { key: "clientSegment",  label: "Segment",     placeholder: ""                },
        { key: "clientSource",   label: "Source",      placeholder: ""                },
        { key: "industry",       label: "Industry",    placeholder: ""                },
      ] as const).map(({ key, label, placeholder }) => (
        <div key={key} className="flex flex-col gap-1">
          <label className="text-xs text-muted-foreground">{label}</label>
          <input
            type="text"
            value={form[key]}
            onChange={e => setField(key, e.target.value)}
            placeholder={placeholder}
            className="h-9 border rounded-md px-2 text-sm"
          />
        </div>
      ))}
    </div>
  );
}