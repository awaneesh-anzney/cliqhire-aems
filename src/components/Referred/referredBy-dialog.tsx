"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import PhoneInput from "@/components/phone/Phoneinput"
import { Controller } from "react-hook-form"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }).nonempty("Name is required"),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }).nonempty("Email is required"),
  phone: z.string().min(1, "Phone is required"),
  countryCode: z.string().default("SA"),
  position: z.string().min(2, {
    message: "Position must be at least 2 characters.",
  }).nonempty("Position is required"),
})

type FormValues = z.infer<typeof formSchema>

interface ReferredByDialogProps {
  children: React.ReactNode;
  onSave: (data: FormValues) => Promise<void> | void;
  loading?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ReferredByDialog({
  children,
  onSave,
  loading = false,
  open: propOpen,
  onOpenChange: propOnOpenChange
}: ReferredByDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  
  // Use props if provided, otherwise use internal state
  const open = propOpen !== undefined ? propOpen : internalOpen;
  const setOpen = propOnOpenChange || setInternalOpen;
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      countryCode: "SA",
      position: "",
    },
  })

  async function onSubmit(data: FormValues) {
    try {
      await onSave(data);
      form.reset();
      setOpen(false);
    } catch (error) {
      // Error handling is done in the parent component
      console.error('Error in onSubmit:', error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Add Referral</DialogTitle>
            <DialogDescription>
              Enter the details of the person who referred you.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-1">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                disabled={loading}
                {...form.register("name")}
                className={form.formState.errors.name ? "border-red-500" : ""}
                placeholder="Enter Name"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-1">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                disabled={loading}
                {...form.register("email")}
                className={form.formState.errors.email ? "border-red-500" : ""}
                placeholder="Enter email address"
              />
              {form.formState.errors.email && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-1">
                Phone <span className="text-red-500">*</span>
              </Label>
              <Controller
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <PhoneInput
                    countryCode={form.watch("countryCode")}
                    onCountryCodeChange={(code) => form.setValue("countryCode", code)}
                    phoneNumber={field.value}
                    onPhoneNumberChange={field.onChange}
                    disabled={loading}
                  />
                )}
              />
              {form.formState.errors.phone && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.phone.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="position" className="flex items-center gap-1">
                Position <span className="text-red-500">*</span>
              </Label>
              <Input
                id="position"
                disabled={loading}
                {...form.register("position")}
                className={form.formState.errors.position ? "border-red-500" : ""}
                placeholder="eg, HR"
              />
              {form.formState.errors.position && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.position.message}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
