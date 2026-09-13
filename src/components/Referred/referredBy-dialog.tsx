"use client";

import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PhoneInput from "@/components/phone/Phoneinput";
import { UserPlus, User, Mail, Briefcase, Loader2, Sparkles } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }).nonempty("Name is required"),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }).optional().or(z.literal("")),
  phone: z.string().min(1, "Phone is required"),
  countryCode: z.string().default("SA"),
  position: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

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
  });

  async function onSubmit(data: FormValues) {
    try {
      await onSave(data);
      form.reset();
      setOpen(false);
    } catch (error) {
      console.error('Error in onSubmit:', error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-2xl sm:rounded-3xl border border-border/80 bg-background shadow-2xl">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {/* Header */}
          <DialogHeader className="p-6 pb-4 border-b border-border/60">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-foreground">Add New Referral</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Record details of the external contact who provided the reference
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Form Fields */}
          <div className="p-6 space-y-4">
            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-bold text-foreground flex items-center gap-1">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <div className="relative flex items-center">
                <User className="w-4 h-4 absolute left-3 text-muted-foreground/70 pointer-events-none" />
                <Input
                  id="name"
                  disabled={loading}
                  {...form.register("name")}
                  className={`h-10 pl-9 rounded-xl bg-muted/20 border-border/80 text-xs sm:text-sm font-semibold ${
                    form.formState.errors.name ? "border-destructive focus-visible:ring-destructive" : ""
                  }`}
                  placeholder="e.g. John Doe"
                />
              </div>
              {form.formState.errors.name && (
                <p className="text-[11px] text-destructive font-medium">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-bold text-foreground">
                Email Address
              </Label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 absolute left-3 text-muted-foreground/70 pointer-events-none" />
                <Input
                  id="email"
                  type="email"
                  disabled={loading}
                  {...form.register("email")}
                  className={`h-10 pl-9 rounded-xl bg-muted/20 border-border/80 text-xs sm:text-sm font-semibold ${
                    form.formState.errors.email ? "border-destructive focus-visible:ring-destructive" : ""
                  }`}
                  placeholder="john@example.com (optional)"
                />
              </div>
              {form.formState.errors.email && (
                <p className="text-[11px] text-destructive font-medium">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-xs font-bold text-foreground flex items-center gap-1">
                Phone Number <span className="text-destructive">*</span>
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
                <p className="text-[11px] text-destructive font-medium">
                  {form.formState.errors.phone.message}
                </p>
              )}
            </div>

            {/* Position */}
            <div className="space-y-1.5">
              <Label htmlFor="position" className="text-xs font-bold text-foreground">
                Position / Designation
              </Label>
              <div className="relative flex items-center">
                <Briefcase className="w-4 h-4 absolute left-3 text-muted-foreground/70 pointer-events-none" />
                <Input
                  id="position"
                  disabled={loading}
                  {...form.register("position")}
                  placeholder="e.g. HR Director, Executive Consultant"
                  className="h-10 pl-9 rounded-xl bg-muted/20 border-border/80 text-xs sm:text-sm font-semibold"
                />
              </div>
              {form.formState.errors.position && (
                <p className="text-[11px] text-destructive font-medium">
                  {form.formState.errors.position.message}
                </p>
              )}
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className="p-4 bg-muted/40 dark:bg-muted/20 border-t border-border/70 flex flex-row items-center justify-end gap-2">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => setOpen(false)}
              disabled={loading}
              className="text-xs font-bold h-9 px-4 rounded-xl text-muted-foreground hover:text-foreground"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold h-9 px-5 rounded-xl shadow-sm shadow-primary/20 min-w-[90px]"
            >
              {loading ? (
                <div className="flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </div>
              ) : (
                "Save Referral"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
