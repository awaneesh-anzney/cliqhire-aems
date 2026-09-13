import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PrimaryContact } from "@/components/create-client-modal/type";
import { positionOptions } from "./constants";
import PhoneInput from "@/components/phone/Phoneinput";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { primaryContactSchema, PrimaryContactFormData } from "./schema";
import { useEffect } from "react";
import { User, Mail, Phone, Briefcase, Linkedin, UserPlus, Check } from "lucide-react";

interface ContactModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  newContact: PrimaryContact;
  setNewContact: React.Dispatch<React.SetStateAction<PrimaryContact>>;
  handleAddContact: (contact: PrimaryContact) => void;
}

export function ContactModal({
  isOpen,
  onOpenChange,
  newContact,
  setNewContact,
  handleAddContact,
}: ContactModalProps) {
  const form = useForm<PrimaryContactFormData>({
    resolver: zodResolver(primaryContactSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      gender: "",
      email: "",
      phone: "",
      countryCode: "+966",
      designation: "",
      linkedin: "",
      isPrimary: true,
    },
  });

  // Update form when newContact changes
  useEffect(() => {
    form.reset(newContact);
  }, [newContact, form]);

  // Initialize form with default values when modal opens
  useEffect(() => {
    if (isOpen) {
      form.reset(newContact);
    }
  }, [isOpen, newContact, form]);

  const onSubmit = (data: PrimaryContactFormData) => {
    handleAddContact(data);
    form.reset();
  };

  const handleCancel = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden rounded-2xl sm:rounded-3xl border border-border/80 bg-background shadow-2xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {/* Header */}
            <DialogHeader className="p-6 pb-4 border-b border-border/60">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold text-foreground">Add Primary Contact</DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">
                    Set up direct coordinator contact for this client account
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            {/* Content */}
            <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-xs font-bold text-foreground flex items-center gap-1">
                        First Name <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative flex items-center">
                          <User className="w-4 h-4 absolute left-3 text-muted-foreground/70 pointer-events-none" />
                          <Input {...field} placeholder="e.g. Sarah" className="h-10 pl-9 rounded-xl bg-muted/20 border-border/80 text-xs sm:text-sm font-semibold" />
                        </div>
                      </FormControl>
                      <FormMessage className="text-[11px]" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-xs font-bold text-foreground flex items-center gap-1">
                        Last Name <span className="text-destructive">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative flex items-center">
                          <User className="w-4 h-4 absolute left-3 text-muted-foreground/70 pointer-events-none" />
                          <Input {...field} placeholder="e.g. Connor" className="h-10 pl-9 rounded-xl bg-muted/20 border-border/80 text-xs sm:text-sm font-semibold" />
                        </div>
                      </FormControl>
                      <FormMessage className="text-[11px]" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-xs font-bold text-foreground flex items-center gap-1">
                        Gender <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="h-10 rounded-xl bg-muted/20 border-border/80 font-semibold text-xs sm:text-sm">
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl border-border/80 shadow-lg">
                          <SelectItem value="Male" className="text-xs sm:text-sm font-semibold">Male</SelectItem>
                          <SelectItem value="Female" className="text-xs sm:text-sm font-semibold">Female</SelectItem>
                          <SelectItem value="Other" className="text-xs sm:text-sm font-semibold">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-[11px]" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="designation"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-xs font-bold text-foreground flex items-center gap-1">
                        Designation <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="h-10 rounded-xl bg-muted/20 border-border/80 font-semibold text-xs sm:text-sm">
                            <SelectValue placeholder="Select designation" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl border-border/80 shadow-lg">
                          {positionOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value} className="text-xs sm:text-sm font-semibold">
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-[11px]" />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-xs font-bold text-foreground flex items-center gap-1">
                      Email Address <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <div className="relative flex items-center">
                        <Mail className="w-4 h-4 absolute left-3 text-muted-foreground/70 pointer-events-none" />
                        <Input {...field} type="email" placeholder="contact@example.com" className="h-10 pl-9 rounded-xl bg-muted/20 border-border/80 text-xs sm:text-sm font-semibold" />
                      </div>
                    </FormControl>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-xs font-bold text-foreground flex items-center gap-1">
                      Direct Phone <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <PhoneInput
                        countryCode={form.watch("countryCode")}
                        onCountryCodeChange={(code) => form.setValue("countryCode", code)}
                        phoneNumber={field.value}
                        onPhoneNumberChange={(value) => field.onChange(value)}
                      />
                    </FormControl>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="linkedin"
                render={({ field }) => (
                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-xs font-bold text-foreground">LinkedIn Profile</FormLabel>
                    <FormControl>
                      <div className="relative flex items-center">
                        <Linkedin className="w-4 h-4 absolute left-3 text-muted-foreground/70 pointer-events-none" />
                        <Input
                          {...field}
                          value={field.value || ""}
                          type="url"
                          placeholder="https://www.linkedin.com/in/..."
                          className="h-10 pl-9 rounded-xl bg-muted/20 border-border/80 text-xs sm:text-sm font-semibold"
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-[11px]" />
                  </FormItem>
                )}
              />
            </div>

            {/* Footer */}
            <DialogFooter className="p-4 bg-muted/40 dark:bg-muted/20 border-t border-border/70 flex flex-row items-center justify-end gap-2">
              <Button 
                variant="ghost" 
                onClick={handleCancel} 
                type="button"
                className="text-xs font-bold h-9 px-4 rounded-xl text-muted-foreground hover:text-foreground"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold h-9 px-5 rounded-xl shadow-sm shadow-primary/20"
              >
                <Check className="w-3.5 h-3.5 mr-1" />
                Add Contact
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
