"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { 
  PlusIcon, 
  Check, 
  ChevronsUpDown, 
  Search, 
  Loader2, 
  Briefcase, 
  MapPin, 
  Users, 
  DollarSign, 
  FileText,
  Building2,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Info
} from "lucide-react";
import { fetchClients } from "./clientApi";
import { useDebounce } from "@/hooks/use-debounce";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { createJob } from "@/services/jobService";
import { currencies } from "country-data-list";
import CurrencyFlag from "react-currency-flags";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lockedClientId?: string;
  lockedClientName?: string;
}

interface Form {
  clientName: string;
  clientId: string;
  positionName: string;
  headcount: string;
  jobType: string;
  location: string;
  minSalary: string;
  maxSalary: string;
  currency: string;
  jobDescription: string;
}

const TABS = ["Core Info", "Requirements", "Description"] as const;

export function CreateJobRequirementForm({
  open,
  onOpenChange,
  lockedClientId,
  lockedClientName,
}: Props) {
  const [form, setForm] = useState<Form>({
    clientName: lockedClientName || "",
    clientId: lockedClientId || "",
    positionName: "",
    headcount: "",
    jobType: "Full Time",
    location: "",
    minSalary: "",
    maxSalary: "",
    currency: "SAR",
    jobDescription: "",
  });
  const [currentTab, setCurrentTab] = useState(0);
  const [clientOptions, setClientOptions] = useState<{ _id: string; name: string }[]>([]);
  const [clientSearch, setClientSearch] = useState("");
  const [clientPage, setClientPage] = useState(1);
  const [hasMoreClients, setHasMoreClients] = useState(true);
  const [loadingClients, setLoadingClients] = useState(false);
  const [clientDropdownOpen, setClientDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debouncedSearch = useDebounce(clientSearch, 500);
  const [errors, setErrors] = useState<{ clientName?: string; positionName?: string; clientId?: string }>({});
  const router = useRouter();

  useEffect(() => {
    if (!lockedClientId) {
      setClientPage(1);
      setClientOptions([]);
      setHasMoreClients(true);
    }
  }, [debouncedSearch, clientDropdownOpen, lockedClientId]);

  useEffect(() => {
    if (lockedClientId && lockedClientName) {
      setClientOptions([{ _id: lockedClientId, name: lockedClientName }]);
      return;
    }

    if (open && (clientDropdownOpen || clientPage > 1)) {
      const loadClients = async () => {
        setLoadingClients(true);
        try {
          const result = await fetchClients(debouncedSearch, clientPage);
          setClientOptions((prev) => {
            const newOptions = clientPage === 1 ? result.clients : [...prev, ...result.clients];
            return newOptions.filter((v, i, a) => a.findIndex(t => t._id === v._id) === i);
          });
          setHasMoreClients(result.hasMore);
        } catch (error) {
          console.error("Error loading clients:", error);
        } finally {
          setLoadingClients(false);
        }
      };
      loadClients();
    }
  }, [debouncedSearch, clientPage, open, clientDropdownOpen, lockedClientId, lockedClientName]);

  const handleClientScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (target.scrollHeight - target.scrollTop <= target.clientHeight + 100 && hasMoreClients && !loadingClients) {
      setClientPage((prev) => prev + 1);
    }
  };

  useEffect(() => {
    if (lockedClientId) {
      setForm((prev) => ({
        ...prev,
        clientId: lockedClientId,
        clientName: lockedClientName || prev.clientName,
      }));
    }
  }, [lockedClientId, lockedClientName]);

  const formOptions = {
    jobTypeOptions: ["Full Time", "Part Time", "Internship", "Apprenticeship", "Temporary"],
    currencyOptions: Object.values(currencies)
      .filter((c: any) => c.code && c.name && c.symbol)
      .map((c: any) => ({
        code: c.code,
        name: c.name,
        symbol: c.symbol,
      })),
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validateCurrentStep = () => {
    let newErrors: typeof errors = {};
    if (currentTab === 0) {
      if (!lockedClientId && !form.clientId) newErrors.clientId = "Client selection is required.";
      if (!form.positionName.trim()) newErrors.positionName = "Position Name is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentTab(prev => Math.min(prev + 1, TABS.length - 1));
    }
  };

  const handlePrevious = () => setCurrentTab(prev => Math.max(prev - 1, 0));

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;
    
    setLoading(true);
    const jobData = {
      jobTitle: form.positionName,
      client: form.clientId,
      jobType: (form.jobType || "full time").toLowerCase(),
      experience: "0",
      headcount: form.headcount ? parseInt(form.headcount) : undefined,
      location: form.location ? [form.location] : undefined,
      minimumSalary: form.minSalary ? parseInt(form.minSalary) : undefined,
      maximumSalary: form.maxSalary ? parseInt(form.maxSalary) : undefined,
      salaryCurrency: form.currency || undefined,
      jobDescription: form.jobDescription || undefined,
    };

    try {
      const result = await createJob(jobData);
      if (result && result.success && (result.data as any)._id) {
        toast.success("Job created successfully");
        onOpenChange(false);
        router.push(`/jobs/${(result.data as any)._id}`);
        return;
      }
      toast.success("Job created successfully");
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      toast.error("Failed to create job. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden border-none shadow-2xl rounded-2xl">
        <div className="flex h-full lg:h-[650px] min-h-[500px]">
          {/* Sidebar Step Indicator */}
          <div className="hidden md:flex flex-col w-64 bg-slate-50 border-r border-slate-200 p-8 shrink-0">
            <div className="mb-10">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Briefcase className="w-5 h-5 text-primary" />
                </div>
                <span className="font-bold text-slate-800 text-lg tracking-tight">CliqHire</span>
              </div>
              <p className="text-xs text-slate-400 font-bold tracking-widest uppercase">Job Recruitment</p>
            </div>

            <div className="space-y-8">
              {TABS.map((tab, index) => (
                <div key={tab} className="flex items-start gap-4 transition-all">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                    ${currentTab === index 
                      ? "bg-primary text-white shadow-lg shadow-primary/30 scale-110" 
                      : (index < currentTab ? "bg-green-500 text-white" : "bg-slate-200 text-slate-500")}
                  `}>
                    {index < currentTab ? <CheckCircle2 className="w-5 h-5" /> : index + 1}
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-sm font-bold ${currentTab === index ? "text-slate-900" : "text-slate-400"}`}>
                      {tab}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">Section {index + 1}</span>
                  </div>
                </div>
              ))}
            </div>

             <div className="mt-auto bg-primary/5 p-4 rounded-xl border border-primary/10">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-600 leading-relaxed font-semibold">
                  Defining precise requirements helps our AI match the best candidates for your team.
                </p>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1 flex flex-col bg-white overflow-hidden">
            <DialogHeader className="p-8 pb-4 border-b md:border-none">
              <div className="flex justify-between items-center mb-1">
                <DialogTitle className="text-3xl font-black text-slate-900 tracking-tight">
                  {currentTab === 0 ? "Job Core Info" : currentTab === 1 ? "Requirements" : "Final Details"}
                </DialogTitle>
                <div className="text-[10px] text-primary font-black bg-primary/10 px-2 py-1 rounded-full uppercase tracking-tighter shadow-sm">
                  {currentTab + 1} of 3
                </div>
              </div>
              <DialogDescription className="text-slate-500 font-semibold text-sm">
                Provide the details to start sourcing top talent for this role.
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 pt-4 min-h-0">
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {currentTab === 0 && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label className="text-sm font-bold text-slate-700">Position Name <span className="text-primary">*</span></Label>
                        <div className="relative group">
                          <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                          <Input
                            name="positionName"
                            value={form.positionName}
                            onChange={handleChange}
                            placeholder="e.g. Senior Frontend Developer"
                            className={cn("pl-10 h-12 border-slate-200 focus:border-primary focus:ring-primary/10", errors.positionName && "border-red-500")}
                          />
                        </div>
                        {errors.positionName && <p className="text-[10px] text-red-500 font-bold uppercase">{errors.positionName}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-bold text-slate-700">Client Name <span className="text-primary">*</span></Label>
                        {lockedClientId ? (
                          <div className="h-12 flex items-center px-4 border border-slate-200 rounded-lg bg-slate-50 text-slate-700 font-bold">
                            <Building2 className="w-4 h-4 mr-3 text-slate-400" />
                            {lockedClientName}
                          </div>
                        ) : (
                          <Popover open={clientDropdownOpen} onOpenChange={setClientDropdownOpen} modal={true}>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn("w-full h-12 justify-between font-bold border-slate-200 hover:border-primary/50 text-slate-700 px-4", errors.clientId && "border-red-500")}
                              >
                                <div className="flex items-center">
                                  <Building2 className="w-4 h-4 mr-3 text-slate-400" />
                                  {form.clientId ? clientOptions.find(c => c._id === form.clientId)?.name || form.clientName : "Select Client"}
                                </div>
                                <ChevronsUpDown className="w-4 h-4 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 shadow-2xl border-slate-100" align="start">
                              <div className="flex flex-col">
                                <div className="flex items-center border-b px-3 bg-slate-50">
                                  <Search className="mr-2 h-4 w-4 text-slate-400" />
                                  <input
                                    className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-slate-400 font-semibold"
                                    placeholder="Search client database..."
                                    value={clientSearch}
                                    onChange={(e) => setClientSearch(e.target.value)}
                                  />
                                </div>
                                <div className="max-h-[250px] overflow-y-auto" onScroll={handleClientScroll}>
                                  {clientOptions.map((client) => (
                                    <div
                                      key={client._id}
                                      className={cn(
                                        "flex items-center px-4 py-3 text-sm cursor-pointer hover:bg-primary/5 transition-colors font-bold",
                                        form.clientId === client._id && "bg-primary/10 text-primary"
                                      )}
                                      onClick={() => {
                                        setForm(prev => ({ ...prev, clientId: client._id, clientName: client.name }));
                                        setClientDropdownOpen(false);
                                      }}
                                    >
                                      <Check className={cn("mr-2 h-4 w-4", form.clientId === client._id ? "opacity-100" : "opacity-0")} />
                                      {client.name}
                                    </div>
                                  ))}
                                  {loadingClients && <div className="p-4 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto text-primary" /></div>}
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        )}
                        {errors.clientId && <p className="text-[10px] text-red-500 font-bold uppercase">{errors.clientId}</p>}
                      </div>
                    </div>
                  )}

                  {currentTab === 1 && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-bold text-slate-700">Contract Type</Label>
                          <Select value={form.jobType} onValueChange={(val) => setForm(prev => ({ ...prev, jobType: val }))}>
                            <SelectTrigger className="h-12 border-slate-200 font-bold">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {formOptions.jobTypeOptions.map(opt => <SelectItem key={opt} value={opt} className="font-bold">{opt}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-bold text-slate-700">Headcount</Label>
                          <div className="relative group">
                            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                              name="headcount"
                              value={form.headcount}
                              onChange={handleChange}
                              type="number"
                              placeholder="0"
                              className="pl-10 h-12 border-slate-200 font-bold"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-bold text-slate-700">Work Location</Label>
                        <div className="relative group">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <Input
                            name="location"
                            value={form.location}
                            onChange={handleChange}
                            placeholder="e.g. Dubai, UAE (or Remote)"
                            className="pl-10 h-12 border-slate-200 font-bold"
                          />
                        </div>
                      </div>

                      <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                        <Label className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-primary" /> Budget Range
                        </Label>
                        <div className="grid grid-cols-12 gap-3">
                          <div className="col-span-4">
                             <Select value={form.currency} onValueChange={(val) => setForm(prev => ({ ...prev, currency: val }))}>
                              <SelectTrigger className="h-11 border-slate-200 bg-white font-bold">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="max-h-[200px]">
                                {Object.values(currencies).filter((c:any) => c.code).map((opt:any) => (
                                  <SelectItem key={opt.code} value={opt.code} className="font-bold">
                                    <div className="flex items-center gap-2">
                                      <CurrencyFlag currency={opt.code} size="sm" />
                                      {opt.code}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="col-span-4">
                            <Input 
                              name="minSalary" 
                              value={form.minSalary} 
                              onChange={handleChange} 
                              placeholder="Min" 
                              type="number" 
                              className="h-11 border-slate-200 bg-white font-bold"
                            />
                          </div>
                          <div className="col-span-4">
                            <Input 
                              name="maxSalary" 
                              value={form.maxSalary} 
                              onChange={handleChange} 
                              placeholder="Max" 
                              type="number" 
                              className="h-11 border-slate-200 bg-white font-bold"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {currentTab === 2 && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center px-1">
                        <Label className="text-sm font-bold text-slate-700">Position Summary</Label>
                        <span className="text-[10px] bg-slate-100 text-slate-400 px-2 py-0.5 rounded font-black uppercase">Markdown Support</span>
                      </div>
                      <div className="relative">
                        <FileText className="absolute right-4 top-4 w-5 h-5 text-slate-100" />
                        <textarea
                          name="jobDescription"
                          value={form.jobDescription}
                          onChange={handleChange}
                          className="w-full min-h-[300px] p-6 border border-slate-200 rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/5 outline-none transition-all font-medium text-slate-700 text-sm leading-relaxed custom-scrollbar"
                          placeholder="Describe the role, key responsibilities, and must-have requirements..."
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter className="p-6 bg-slate-50 border-t flex flex-row items-center mt-auto shrink-0 transition-all">
              <div className="flex justify-between w-full items-center">
                <div className="flex gap-3">
                  <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-slate-500 font-bold hover:bg-slate-100">
                    Cancel
                  </Button>
                  {currentTab > 0 && (
                    <Button variant="outline" onClick={handlePrevious} className="border-slate-200 font-bold bg-white px-5 shadow-sm">
                      <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                  )}
                </div>

                <div className="flex gap-3">
                  {currentTab === TABS.length - 1 ? (
                    <Button 
                      onClick={handleSubmit} 
                      disabled={loading}
                      className="bg-primary hover:bg-primary/90 text-white px-8 font-black shadow-xl shadow-primary/30 h-11"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <PlusIcon className="w-4 h-4 mr-2" />}
                      {loading ? "Publishing..." : "Launch Job"}
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleNext} 
                      className="bg-primary hover:bg-primary/90 text-white px-8 font-black shadow-xl shadow-primary/30 h-11"
                    >
                      Continue <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              </div>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
