import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil } from "lucide-react";
import {getSalesInfo , updateSalesInfo , patchSalesInfoField ,SalesInfo as SalesInfoType,} from "./salesApi";

const salesFields = [
  { name: "financials", label: "Financials", type: "text" },
  { name: "nonFinancials", label: "Non Financials", type: "text" },
  { name: "numberOfEmployees", label: "Number Of Employees", type: "number" },
  { name: "formationYear", label: "Formation year", type: "number" },
];

// Reusable field component
function SalesField({
  field,
  value,
  editMode,
  onChange,
}: {
  field: { name: string; label: string; type: string };
  value: string;
  editMode: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}): JSX.Element {
  return (
    <div>
      <Label className="block text-xs font-medium mb-1">{field.label}</Label>
      {editMode ? (
        <Input name={field.name} type={field.type} value={value} onChange={onChange} />
      ) : (
        <div className="text-sm rounded-md border border-border p-2 bg-card">{value || "-"}</div>
      )}
    </div>
  );
}

export function SalesInfo() {
  const [form, setForm] = useState<SalesInfoType>({
    financials: "",
    nonFinancials: "",
    numberOfEmployees: "",
    formationYear: "",
  });
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const originalForm = useRef<SalesInfoType | null>(null);

  useEffect(() => {
    setLoading(true);
    getSalesInfo().then((data) => {
      setForm(data);
      originalForm.current = data;
      setLoading(false);
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEdit = () => {
    originalForm.current = form;
    setEditMode(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (originalForm.current) {
      const updates = Object.entries(form).filter(
        ([key, value]) => value !== (originalForm.current as any)[key],
      );
      if (updates.length === 1) {
        // Only one field changed, patch it
        const [field, value] = updates[0];
        await patchSalesInfoField(field as keyof SalesInfoType, value as string);
      } else if (updates.length > 1) {
        // Multiple fields changed, update all
        await updateSalesInfo(form);
      }
    } else {
      // Fallback: update all
      await updateSalesInfo(form);
    }
    setEditMode(false);
    setLoading(true);
    const updated = await getSalesInfo();
    setForm(updated);
    originalForm.current = updated;
    setLoading(false);
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="bg-card rounded-lg border shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold">Sales Team Info</h2>
        {!editMode && (
          <Button variant="outline" size="sm" onClick={handleEdit}>
            <Pencil className="w-4 h-4 mr-1 inline-block" />
            Edit
          </Button>
        )}
      </div>
      {editMode ? (
        <form onSubmit={handleSave} className="space-y-4">
          {salesFields.map((field) => (
            <SalesField
              key={field.name}
              field={field}
              value={form[field.name as keyof SalesInfoType] as string}
              editMode={true}
              onChange={handleChange}
            />
          ))}
          <Button type="submit" variant="outline" size="sm">
            Save
          </Button>
        </form>
      ) : (
        <div className="space-y-4">
          {salesFields.map((field) => (
            <SalesField
              key={field.name}
              field={field}
              value={form[field.name as keyof SalesInfoType] as string}
              editMode={false}
            />
          ))}
        </div>
      )}
    </div>
  );
}
