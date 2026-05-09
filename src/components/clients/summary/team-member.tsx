"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Eye } from "lucide-react"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { formatPhoneNumber } from "@/lib/countryCodes"

interface TeamMemberProps {
  name: string
  avatar?: string
  role?: string
  isActive?: boolean
  email?: string
  phone?: string
  countryCode?: string
}

export function TeamMember({ name, avatar, role, isActive, email, phone, countryCode }: TeamMemberProps) {
  const [showDetails, setShowDetails] = useState(false)

  return (
    <>
      <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8 bg-orange-500 text-white">
            <AvatarFallback>{avatar || name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <span className="text-sm font-medium">{name}</span>
            {role && <div className="text-xs text-muted-foreground">{role}</div>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isActive && (
            <Badge variant="outline" className="bg-green-100 text-green-800 border-none">
              ACTIVE
            </Badge>
          )}
          <Eye 
            className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-foreground transition-colors duration-200"
            onClick={() => setShowDetails(true)}
          />
        </div>
      </div>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Team Member Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-muted rounded-2xl border border-border">
              <Avatar className="h-16 w-16 bg-orange-500 text-white border-2 border-white shadow-sm">
                <AvatarFallback className="text-xl font-bold">{avatar || name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-bold text-foreground">{name}</h3>
                <p className="text-sm font-medium text-muted-foreground">{role}</p>
                {isActive && (
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-none mt-2 font-bold text-[10px]">
                    ACTIVE
                  </Badge>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-black text-muted-foreground uppercase tracking-widest">Contact Information</h4>
              <div className="grid grid-cols-1 gap-4 text-sm bg-card p-4 rounded-xl border border-border shadow-sm">
                <div className="flex flex-col gap-1">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter">Email Address</p>
                  <p className="font-bold text-foreground">{email || "No email provided"}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter">Phone Number</p>
                  <p className="font-bold text-foreground">{formatPhoneNumber(phone, countryCode) || "No phone provided"}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-black text-muted-foreground uppercase tracking-widest">Permissions</h4>
              <div className="space-y-2 text-sm bg-muted/50 p-4 rounded-xl border border-dashed border-border">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <p className="font-medium text-foreground">Can view and edit client information</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <p className="font-medium text-foreground">Can manage team members</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <p className="font-medium text-foreground">Can view analytics and reports</p>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-[11px] font-bold text-muted-foreground border-t border-border uppercase tracking-wider">
              <span>Last active</span>
              <span className="text-foreground">Today at 2:30 PM</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
