"use client";

import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { 
  User, 
  Link as LinkIcon, 
  Mail, 
  Phone as PhoneIcon, 
  Plus, 
  X, 
  UserPlus,
  Info,
  Loader2
} from "lucide-react";
import PhoneInput from "@/components/phone/Phoneinput";
import { tempCandidateService } from "@/services/tempCandidateService";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const CreateCandidateSchema = z.object({
  name: z.string().min(1, "Candidate name is required"),
  profileLink: z.string().min(1, "Profile Link is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  countryCode: z.string().default("SA"),
});

export type CreateCandidateValues = z.infer<typeof CreateCandidateSchema>;

interface CreateCandidateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pipelineId: string;
  onSubmit?: (values: CreateCandidateValues) => void;
  tempCandidateData?: {
    name?: string;
    email?: string;
    phone?: string;
    countryCode?: string;
    profileLink?: string;
  };
}

export function CreateCandidateDialog({ 
  open, 
  onOpenChange, 
  pipelineId, 
  onSubmit, 
  tempCandidateData 
}: CreateCandidateDialogProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<CreateCandidateValues>({
    resolver: zodResolver(CreateCandidateSchema),
    defaultValues: {
      name: tempCandidateData?.name || "",
      profileLink: tempCandidateData?.profileLink || "",
      email: tempCandidateData?.email || "",
      phone: tempCandidateData?.phone || "",
      countryCode: tempCandidateData?.countryCode || "SA",
    },
  });

  React.useEffect(() => {
    if (tempCandidateData) {
      form.reset({
        name: tempCandidateData.name || "",
        profileLink: tempCandidateData.profileLink || "",
        email: tempCandidateData.email || "",
        phone: tempCandidateData.phone || "",
        countryCode: tempCandidateData.countryCode || "SA",
      });
    }
  }, [tempCandidateData, form]);

  const handleSubmit = async (values: CreateCandidateValues) => {
    setIsSubmitting(true);
    try { 
      const requestData = {
        ...values,
        pipelineId: pipelineId,
      }; 
      await tempCandidateService.createTempCandidate(requestData); 
      
      toast.success("Temporary candidate added to pipeline");
      
      if (onSubmit) {
        onSubmit(values);
      }
      
      onOpenChange(false);
      form.reset();
    } catch (error: any) {
      console.error('Error creating temporary candidate:', error);
      toast.error(error.message || 'Failed to create temporary candidate');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-0 overflow-hidden border-none shadow-2xl rounded-2xl">
        <div className="bg-primary/5 p-6 border-b border-primary/10">
           <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary shadow-inner">
                <UserPlus className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <DialogTitle className="text-xl font-black text-slate-900 tracking-tight">Add Temp Candidate</DialogTitle>
                <DialogDescription className="text-[10px] uppercase font-black text-slate-400 tracking-widest leading-none">
                  Quick pipeline entry
                </DialogDescription>
              </div>
           </div>
        </div>

        <div className="p-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-xs font-black text-slate-700 uppercase tracking-wide">Full Name <span className="text-primary">*</span></FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <User className={cn("absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors", form.formState.errors.name ? "text-red-400" : "text-slate-300 group-focus-within:text-primary")} />
                          <Input 
                            placeholder="John Doe" 
                            {...field} 
                            className="pl-10 h-10 border-slate-200 font-bold focus:border-primary shadow-sm hover:border-slate-300 transition-all text-sm"
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-[9px] font-black uppercase" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="profileLink"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-xs font-black text-slate-700 uppercase tracking-wide">Profile Link <span className="text-primary">*</span></FormLabel>
                      <FormControl>
                        <div className="relative group">
                          <LinkIcon className={cn("absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors", form.formState.errors.profileLink ? "text-red-400" : "text-slate-300 group-focus-within:text-primary")} />
                          <Input 
                            placeholder="LinkedIn URL" 
                            {...field} 
                            className="pl-10 h-10 border-slate-200 font-bold focus:border-primary shadow-sm text-sm"
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-[9px] font-black uppercase" />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-xs font-black text-slate-700 uppercase tracking-wide">Email</FormLabel>
                        <FormControl>
                          <div className="relative group">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-primary transition-colors" />
                            <Input 
                              placeholder="email@..." 
                              {...field} 
                              className="pl-10 h-10 border-slate-200 font-bold focus:border-primary shadow-sm text-sm"
                            />
                          </div>
                        </FormControl>
                        <FormMessage className="text-[9px] font-black uppercase" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-xs font-black text-slate-700 uppercase tracking-wide">Phone</FormLabel>
                        <FormControl>
                          <PhoneInput
                            countryCode={form.watch("countryCode")}
                            onCountryCodeChange={(code) => form.setValue("countryCode", code)}
                            phoneNumber={field.value}
                            onPhoneNumberChange={(num) => field.onChange(num)}
                            placeholder="5..."
                          />
                        </FormControl>
                        <FormMessage className="text-[9px] font-black uppercase" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="bg-amber-50 p-3 rounded-xl border border-amber-100 flex items-start gap-3">
                 <Info className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                 <p className="text-[9px] font-bold text-amber-700 leading-relaxed uppercase">
                   Temporary candidates can be converted to official profiles later.
                 </p>
              </div>

              <div className="pt-2 flex gap-3">
                <DialogClose asChild>
                  <Button type="button" variant="ghost" className="flex-1 font-bold text-slate-500 h-11">Cancel</Button>
                </DialogClose>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 bg-primary hover:bg-primary/90 text-white font-black h-11 shadow-xl shadow-primary/20 rounded-xl transition-all active:scale-95"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                  {isSubmitting ? "Adding..." : "Add to Pipeline"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
