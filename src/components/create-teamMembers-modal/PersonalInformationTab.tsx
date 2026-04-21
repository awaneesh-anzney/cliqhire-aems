"use client";
import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, EyeOff } from "lucide-react";
import { CreateTeamMemberData } from "@/types/teamMember";
import PhoneInput from "@/components/phone/Phoneinput";
import { useRoles } from "@/hooks/useRoles";

interface PersonalInformationTabProps {
  formData: CreateTeamMemberData;
  setFormData: React.Dispatch<React.SetStateAction<CreateTeamMemberData>>;
  errors: Record<string, string>;
}

export function PersonalInformationTab({
  formData,
  setFormData,
  errors,
}: PersonalInformationTabProps) {
  const { roles, loading: rolesLoading, fetchRoles } = useRoles();
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const handleInputChange = (field: keyof CreateTeamMemberData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleRoleSelect = (roleId: string) => {
    const selectedRole = roles.find((r) => r._id === roleId || r.id === roleId);
    if (selectedRole) {
      setFormData((prev) => ({
        ...prev,
        roleId: roleId,
        teamRole: selectedRole.name,
      }));
    }
  };

  return (
    <div className="space-y-6 pt-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="firstName">
            First Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => handleInputChange("firstName", e.target.value)}
            placeholder="Enter First Name"
            className={errors.firstName ? "border-red-500" : ""}
          />
          {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => handleInputChange("lastName", e.target.value)}
            placeholder="Enter Last Name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">
            Email <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            placeholder="Enter email address"
            className={errors.email ? "border-red-500" : ""}
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        {/* Password with show/hide eye toggle */}
        <div className="space-y-2">
          <Label htmlFor="password">
            Password <span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={formData.password || ""}
              onChange={(e) => handleInputChange("password", e.target.value)}
              placeholder="Set a password"
              className={`pr-10 ${errors.password ? "border-red-500" : ""}`}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-slate-400 hover:text-slate-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
        </div>

        {/* Role Dropdown — populated from API */}
        <div className="space-y-2">
          <Label htmlFor="teamRole">
            Team Role <span className="text-red-500">*</span>
          </Label>
          <Select value={formData.roleId || ""} onValueChange={handleRoleSelect}>
            <SelectTrigger className={errors.teamRole ? "border-red-500" : ""}>
              <SelectValue placeholder={rolesLoading ? "Loading roles..." : "Select team role"} />
            </SelectTrigger>
            <SelectContent>
              {roles.map((role) => {
                const id = role._id || role.id;
                return (
                  <SelectItem key={id as string} value={id as string}>
                    {role.displayName || role.name}
                    {role.isSystem && (
                      <span className="ml-1.5 text-xs text-slate-400">(System)</span>
                    )}
                  </SelectItem>
                );
              })}
              {!rolesLoading && roles.length === 0 && (
                <div className="px-2 py-1.5 text-xs text-slate-400">
                  No roles found. Create roles in Settings first.
                </div>
              )}
            </SelectContent>
          </Select>
          {errors.teamRole && <p className="text-red-500 text-sm mt-1">{errors.teamRole}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <PhoneInput
            countryCode={formData.countryCode || "IN"}
            onCountryCodeChange={(code) => handleInputChange("countryCode", code)}
            phoneNumber={formData.phone || ""}
            onPhoneNumberChange={(value) => handleInputChange("phone", value || "")}
          />
        </div>
      </div>
    </div>
  );
}
