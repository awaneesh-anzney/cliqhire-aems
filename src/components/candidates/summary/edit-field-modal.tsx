"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CurrencyFlag from "react-currency-flags";
import { CountrySelect } from "@/components/ui/country-select";
import PhoneInput from "@/components/phone/Phoneinput";

interface EditFieldModalProps {
  open: boolean;
  onClose: () => void;
  fieldName: string;
  currentValue?: any;
  onSave: (value: any) => void;
  isDate?: boolean;
  isNumber?: boolean;
  isCurrency?: boolean;
  isTextarea?: boolean;
  isCountry?: boolean;
  isNationality?: boolean;
  isContinent?: boolean;
  isPhone?: boolean;
  countryCode?: string;
  options?: { value: string; label: string }[];
  currencyOptions?: Array<{ code: string; symbol: string; name: string; countryCode?: string }>;
}

export function EditFieldModal({
  open,
  onClose,
  fieldName,
  currentValue = "",
  isNumber,
  onSave,
  isDate,
  isCurrency,
  isTextarea,
  isCountry,
  isNationality,
  isContinent,
  isPhone,
  countryCode: initialCountryCode = "SA",
  options,
  currencyOptions
}: EditFieldModalProps) {
  const [value, setValue] = useState(currentValue);
  const [phoneCountryCode, setPhoneCountryCode] = useState(initialCountryCode);
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    currentValue ? new Date(currentValue) : null
  );

  const handleSave = () => {
    if (isDate && selectedDate) {
      onSave(selectedDate.toISOString().split("T")[0]);
    } else if (isPhone) {
      onSave({ phone: value, countryCode: phoneCountryCode });
    } else {
      onSave(value);
    }
    onClose();
  };

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit {fieldName}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="value">{fieldName}</Label>
            {isDate ? (
              <div className="relative">
                <DatePicker
                  selected={selectedDate}
                  onChange={handleDateChange}
                  dateFormat="yyyy-MM-dd"
                  className="border p-2 rounded w-full"
                />
              </div>
            ) : isCurrency && currencyOptions ? (
              <Select value={value} onValueChange={setValue}>
                <SelectTrigger>
                  <SelectValue>
                    {value && (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-3">
                          <CurrencyFlag currency={value} size="sm" />
                        </div>
                        <span>{value}</span>
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {currencyOptions.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-3">
                          <CurrencyFlag currency={currency.code} size="sm" />
                        </div>
                        <span>{currency.name}</span>
                        <span className="text-muted-foreground ml-auto">{currency.symbol}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : options ? (
              <select
                className="w-full p-2 border rounded text-sm"
                value={value}
                onChange={e => setValue(e.target.value)}
              >
                {options.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : isCountry ? (
              <div className="space-y-2">
                <CountrySelect
                  value={value}
                  onChange={setValue}
                  type="country"
                  placeholder={`Search ${fieldName.toLowerCase()}...`}
                />
              </div>
            ) : isNationality ? (
              <div className="space-y-2">
                <CountrySelect
                  value={value}
                  onChange={setValue}
                  type="nationality"
                  placeholder={`Search ${fieldName.toLowerCase()}...`}
                />
                <div className="flex justify-between items-center">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setValue("Open")}
                    className={`text-xs h-8 px-2 ${value === "Open" ? "bg-blue-50 border-blue-200 text-blue-700" : ""}`}
                  >
                    Set as &quot;Open&quot;
                  </Button>
                </div>
              </div>
            ) : isContinent ? (
              <div className="space-y-2">
                <CountrySelect
                  value={value}
                  onChange={setValue}
                  type="continent"
                  placeholder={`Search ${fieldName.toLowerCase()}...`}
                />
              </div>
            ) : isPhone ? (
              <div className="space-y-2">
                <PhoneInput
                  phoneNumber={value}
                  onPhoneNumberChange={setValue}
                  countryCode={phoneCountryCode}
                  onCountryCodeChange={setPhoneCountryCode}
                />
              </div>
            ) : isTextarea ? (
              <Textarea
                id="value"
                value={value}
                onChange={e => setValue(e.target.value)}
                placeholder={`Enter ${fieldName.toLowerCase()}`}
                className="min-h-[120px] resize-none"
              />
            ) : (
              <Input
                id="value"
                type={isNumber ? "number" : "text"}
                value={value}
                onChange={e => setValue(e.target.value)}
              />
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button onClick={handleSave} type="button">
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
