"use client";
import React, { useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreateTeamMemberData } from '@/types/teamMember';
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import "@/styles/phone-input-override.css";
import { useRoles } from '@/hooks/useRoles';

interface PersonalInformationTabProps {
  formData: CreateTeamMemberData;
  setFormData: React.Dispatch<React.SetStateAction<CreateTeamMemberData>>;
  errors: Record<string, string>;
}

export function PersonalInformationTab({ formData, setFormData, errors }: PersonalInformationTabProps) {
  const { roles, loading: rolesLoading, fetchRoles } = useRoles();

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const handleInputChange = (field: keyof CreateTeamMemberData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRoleSelect = (roleId: string) => {
    const selectedRole = roles.find(r => r._id === roleId || r.id === roleId);
    if (selectedRole) {
      setFormData(prev => ({
        ...prev,
        roleId: roleId,
        teamRole: selectedRole.name
      }));
    }
  };

  return (
    <div className="space-y-6 pt-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name <span className="text-red-500">*</span></Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            placeholder="Enter First Name"
            className={errors.firstName ? 'border-red-500' : ''}
          />
          {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
        </div>

         <div className="space-y-2">
          <Label htmlFor="lastName"> Last Name </Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            placeholder="Enter Last Name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="Enter email address"
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password <span className="text-red-500">*</span></Label>
          <Input
            id="password"
            type="password"
            value={formData.password || ""}
            onChange={(e) => handleInputChange('password', e.target.value)}
            placeholder="Set a password"
            className={errors.password ? 'border-red-500' : ''}
          />
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="teamRole">Team Role <span className="text-red-500">*</span></Label>
          <Select value={formData.roleId || ""} onValueChange={handleRoleSelect}>
            <SelectTrigger className={errors.teamRole ? 'border-red-500' : ''}>
              <SelectValue placeholder={rolesLoading ? "Loading roles..." : "Select team role"} />
            </SelectTrigger>
            <SelectContent>
              {roles.map((role) => {
                const id = role._id || role.id;
                return (
                  <SelectItem key={id as string} value={id as string}>
                    {role.displayName || role.name}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          {errors.teamRole && <p className="text-red-500 text-sm mt-1">{errors.teamRole}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <PhoneInput
            country={"sa"}
            value={formData.phone || ""}
            onChange={(value) => {
              handleInputChange('phone', value || "");
            }}
            inputClass="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm w-full"
            enableSearch={true}
            preferredCountries={["in", "us", "gb", "sa"]}
            countryCodeEditable={false}
            autoFormat={true}
          />
        </div>
      </div>
    </div>
  );
} 