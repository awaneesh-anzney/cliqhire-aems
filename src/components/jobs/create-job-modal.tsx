"use client"
import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect } from "react"
import { createJob } from "@/services/jobService"
import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import axios from "axios"
import * as Flags from 'country-flag-icons/react/3x2'
import React from "react"
import { JobStage } from "@/types/job"
import { Badge } from "@/components/ui/badge"
import { X, Upload, FileText, Globe, Trash2 } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { getClients } from "@/services/clientService"
import { cn } from "@/lib/utils"
import { CountrySelect } from "@/components/ui/country-select"
import { CONTINENTS } from "@/lib/constants"
import { LocationSuggestion as LocationSearch } from "@/components/location/LocationSuggestion"

// Define type for client data
interface ClientData {
  _id: string;
  name: string;
  jobCount: number;
}

interface LocationSuggestion {
  display_name: string;
  lat: string;
  lon: string;
}



const jobTypes = ["Full time", "Part time", "Project based", "Outsourcing"]

const jobStages: JobStage[] = [
  "Open",
  "Active",
  "Onboarding",
  "Hired",
  "On Hold",
  "Closed",
]

const currencies = [
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal', flag: 'SA' },
  { code: 'USD', symbol: '$', name: 'US Dollar', flag: 'US' },
  { code: 'EUR', symbol: '€', name: 'Euro', flag: 'EU' },
  { code: 'GBP', symbol: '£', name: 'British Pound', flag: 'GB' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', flag: 'JP' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', flag: 'AU' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', flag: 'CA' },
  { code: 'CHF', symbol: 'Fr', name: 'Swiss Franc', flag: 'CH' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', flag: 'CN' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', flag: 'IN' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', flag: 'AE' },
  { code: 'KWD', symbol: 'د.ك', name: 'Kuwaiti Dinar', flag: 'KW' },
  { code: 'BHD', symbol: '.د.ب', name: 'Bahraini Dinar', flag: 'BH' },
  { code: 'QAR', symbol: 'ر.ق', name: 'Qatari Riyal', flag: 'QA' },
  { code: 'OMR', symbol: 'ر.ع.', name: 'Omani Rial', flag: 'OM' }
]

const educationQualifications = [
  "High School Diploma",
  "Associate Degree",
  "Bachelor's Degree",
  "Master's Degree",
  "Doctorate",
  "Professional Certification"
]

const workVisa = [
  "Transferrable Iqama",
  "Client Sponsored Visa",
  "Both"
]

const specialization = [
  "B.Sc. in Computer Science",
  "B.Sc. in Dietetics",
  "B.Sc. in Electronic",
  "B.Sc. in Fashion Technology",
  "B.Sc. in Food Technology",
  "Master of Computer Applications",
  "Master of Computer Science",
  "Master of Data Science",
  "Master of Computational Finance"
]

const otherBenefits = [
  "Health Insurance",
  "Relocation Allowance",
  "Flexible Working Hours",
  "Remote Work Option"
]

interface CreateJobModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  clientName: string;
  onJobCreated: (open: boolean) => void;
  refreshJobs?: () => void;
}

export function CreateJobModal({ open, onOpenChange }: CreateJobModalProps) {
  const [selectedNationalities, setSelectedNationalities] = useState<string[]>([])
  const [selectedContinents, setSelectedContinents] = useState<string[]>([])
  const [nationalityMode, setNationalityMode] = useState<'all' | 'specific'>('specific')
  const [clients, setClients] = useState<ClientData[]>([])
  const [isLoadingClients, setIsLoadingClients] = useState(false)
  const [clientError, setClientError] = useState<string | null>(null)
  const [searchClient, setSearchClient] = useState("")
  const [showClientDropdown, setShowClientDropdown] = useState(false)
  const [currentTab, setCurrentTab] = useState(0)
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])
  const [locationInput, setLocationInput] = useState("")
  const [certificationInput, setCertificationInput] = useState("")
  const [selectedCertifications, setSelectedCertifications] = useState<string[]>([])

  const [formData, setFormData] = useState({
    jobTitle: "test",
    client: "",
    relationshipManager: "",
    jobTypes: "",
    stage: "Open" as JobStage,
    deadline: null as Date | null,
    clientDeadline: null as Date | null,
    internalDeadline: null as Date | null,
    dateRange: {
      start: "" as any,
      end: "" as any,
    },
    salaryRange: {
      min: "",
      max: "",
      currency: "SAR"
    },
    nationalities: [] as string[],
    continents: [] as string[],
    location: "",
    locations: [] as string[],
    gender: "",
    numberOfPositions: "",
    experience: "",
    reportingTo: "",
    teamSize: 0 as any,
    link: "",
    keySkills: "",
    jobDescription: "",
    jobDescriptionByInternalTeam: "",
    otherBenefits: [] as string[],
    certifications: [] as string[]
  })

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = React.useRef<HTMLInputElement | null>(null)
  const [isInputFocused, setIsInputFocused] = useState(false)

  const fetchClients = async (searchTerm: string) => {
    setIsLoadingClients(true);
    setClientError(null);
    try {
      const { clients: clientsFromApi } = await getClients({ search: searchTerm, limit: 50 });

      if (Array.isArray(clientsFromApi)) {
        const clientData: ClientData[] = clientsFromApi.map(client => ({
          _id: client._id,
          name: client.name,
          jobCount: 0, // jobCount is not available from this endpoint
        }));

        setClients(clientData);

        if (clientData.length === 0 && searchTerm) {
          setClientError(`No client found for "${searchTerm}"`);
        } else if (clientData.length === 0) {
          setClientError('No clients found in the database');
        }
      } else {
        console.error('Received unexpected data format for clients:', clientsFromApi);
        setClientError('Failed to load clients due to unexpected data format.');
        setClients([]);
      }
    } catch (error: any) {
      console.error('Error fetching clients:', error.message);
      setClientError(`Failed to load clients: ${error.message}`);
      setClients([]);
    } finally {
      setIsLoadingClients(false);
    }
  };



  // Location search handled by LocationSearch component now

  const handleLocationSelect = (label: string) => {
    const numberOfPositions = parseInt(formData.numberOfPositions) || 1
    if (numberOfPositions > 1) {
      if (!selectedLocations.includes(label)) {
        setSelectedLocations(prev => [...prev, label])
        setFormData(prev => ({
          ...prev,
          locations: [...prev.locations, label]
        }))
      }
      setLocationInput("")
    } else {
      setFormData(prev => ({
        ...prev,
        location: label
      }));
      setLocationInput(label); 
    }
  }

  const addLocation = () => {
    if (locationInput.trim() && !selectedLocations.includes(locationInput.trim())) {
      setSelectedLocations(prev => [...prev, locationInput.trim()])
      setFormData(prev => ({
        ...prev,
        locations: [...prev.locations, locationInput.trim()]
      }))
      setLocationInput("")
    }
  }

  const handleLocationKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addLocation()
    }
  }

  const removeLocation = (locationToRemove: string) => {
    setSelectedLocations(prev => prev.filter(location => location !== locationToRemove))
    setFormData(prev => ({
      ...prev,
      locations: prev.locations.filter(location => location !== locationToRemove)
    }))
  }



  const addNationality = (nationality: string) => {
    if (!selectedNationalities.includes(nationality)) {
      setSelectedNationalities(prev => [...prev, nationality])
      setFormData(prev => ({
        ...prev,
        nationalities: [...prev.nationalities, nationality]
      }))
    }
  }
  
  const addContinent = (continent: string) => {
    if (!selectedContinents.includes(continent)) {
      setSelectedContinents(prev => [...prev, continent])
      setFormData(prev => ({
        ...prev,
        continents: [...prev.continents, continent]
      }))
    }
  }

  const removeContinent = (continentToRemove: string) => {
    setSelectedContinents(prev =>
      prev.filter(continent => continent !== continentToRemove)
    )
    setFormData(prev => ({
      ...prev,
      continents: prev.continents.filter(c => c !== continentToRemove)
    }))
  }

  const removeNationality = (nationalityToRemove: string) => {
    setSelectedNationalities(prev =>
      prev.filter(nationality => nationality !== nationalityToRemove)
    )
    setFormData(prev => ({
      ...prev,
      nationalities: prev.nationalities.filter(n => n !== nationalityToRemove)
    }))
  }

  const handleNationalityModeChange = (mode: 'all' | 'specific') => {
    setNationalityMode(mode)
    if (mode === 'all') {
      if (!selectedNationalities.includes('Open For All Nationals')) {
        const newList = ['Open For All Nationals', ...selectedNationalities]
        setSelectedNationalities(newList)
        setFormData(prev => ({ ...prev, nationalities: newList }))
      }
    } else {
      const newList = selectedNationalities.filter(n => n !== 'Open For All Nationals')
      setSelectedNationalities(newList)
      setFormData(prev => ({ ...prev, nationalities: newList }))
    }
  }

  const handleBenefitToggle = (benefit: string) => {
    setFormData(prev => {
      const currentBenefits = prev.otherBenefits
      const updatedBenefits = currentBenefits.includes(benefit)
        ? currentBenefits.filter(b => b !== benefit)
        : [...currentBenefits, benefit]
      return { ...prev, otherBenefits: updatedBenefits }
    })
  }

  const addCertification = () => {
    if (certificationInput.trim() && !selectedCertifications.includes(certificationInput.trim())) {
      setSelectedCertifications(prev => [...prev, certificationInput.trim()])
      setFormData(prev => ({
        ...prev,
        certifications: [...prev.certifications, certificationInput.trim()]
      }))
      setCertificationInput("")
    }
  }

  const handleCertificationKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addCertification()
    }
  }

  const removeCertification = (certificationToRemove: string) => {
    setSelectedCertifications(prev => prev.filter(cert => cert !== certificationToRemove))
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter(cert => cert !== certificationToRemove)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const numberOfPositions = parseInt(formData.numberOfPositions) || 1
      const location = numberOfPositions > 1 ? formData.locations : [formData.location]
      const jobData = {
        jobTitle: formData.jobTitle,
        department: "General",
        client: formData.client,
        jobPosition: [formData.jobTitle], // Convert to array
        location: location, // Use the array of locations
        headcount: numberOfPositions,
        stage: formData.stage,
        minimumSalary: parseInt(formData.salaryRange.min) || 0,
        maximumSalary: parseInt(formData.salaryRange.max) || 0,
        salaryCurrency: formData.salaryRange.currency,
        jobType: formData.jobTypes,
        experience: formData.experience,
        jobDescription: formData.jobDescription,
        nationalities: formData.nationalities,
        continents: formData.continents,
        salaryRange: {
          min: parseInt(formData.salaryRange.min) || 0,
          max: parseInt(formData.salaryRange.max) || 0,
          currency: formData.salaryRange.currency
        },
        gender: formData.gender,
        deadline: formData.deadline ? formData.deadline.toISOString() : "",
        clientDeadline: formData.clientDeadline ? formData.clientDeadline.toISOString() : null,
        internalDeadline: formData.internalDeadline ? formData.internalDeadline.toISOString() : null,
        relationshipManager: formData.relationshipManager,
        reportingTo: formData.reportingTo,
        teamSize: formData.teamSize,
        link: formData.link,
        keySkills: formData.keySkills,
        dateRange: {
          start: formData.dateRange.start,
          end: formData.dateRange.end
        },
        otherBenefits: formData.otherBenefits,
        certifications: formData.certifications
      }

      const response = await createJob(jobData)
      setCurrentTab(0)
      onOpenChange(false)
    } catch (error: any) {
      console.error("Error creating job:", error)
    }
  }

  function handleRemoveFile(): void {
    setSelectedFile(null)
    setFormData(prev => ({ ...prev, jobDescription: "" }))
  }

  function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onload = () => {
        const text = reader.result as string
        setFormData(prev => ({ ...prev, jobDescription: text }))
      }
      reader.readAsText(file)
    }
  }

  const handleNext = () => {
    setCurrentTab(prev => Math.min(prev + 1, 2))
  }

  const handlePrevious = () => {
    setCurrentTab(prev => Math.max(prev - 1, 0))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-full md:max-w-3xl lg:max-w-4xl xl:max-w-5xl max-h-[90vh] overflow-y-auto p-4 md:p-6 lg:p-8">
        <DialogHeader>
          <DialogTitle>Create Job Requirement</DialogTitle>
        </DialogHeader>

        <div className="flex flex-wrap justify-between border-b mb-4">
          <button
            className={`px-4 py-2 ${currentTab === 0 ? 'border-b-2 border-blue-500 text-blue-500' : 'text-muted-foreground'}`}
            onClick={() => setCurrentTab(0)}
          >
            General Information
          </button>
          <button
            className={`px-4 py-2 ${currentTab === 1 ? 'border-b-2 border-blue-500 text-blue-500' : 'text-muted-foreground'}`}
            onClick={() => setCurrentTab(1)}
          >
            Details
          </button>
          <button
            className={`px-4 py-2 ${currentTab === 2 ? 'border-b-2 border-blue-500 text-blue-500' : 'text-muted-foreground'}`}
            onClick={() => setCurrentTab(2)}
          >
            Description
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {currentTab === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
              <div className="grid gap-2">
                <Label htmlFor="client">Client* </Label>
                <div className="flex flex-col gap-2">
                  <div className="relative">
                    <Input
                      placeholder="Search"
                      value={searchClient}
                      onChange={(e) => {
                        setSearchClient(e.target.value);
                      }}
                      onFocus={() => {
                        setShowClientDropdown(true);
                        if (!clients.length) {
                          fetchClients('');
                        }
                      }}
                      onBlur={() => {
                        // Delay hiding dropdown to allow clicking on items
                        setTimeout(() => setShowClientDropdown(false), 200);
                      }}
                      required
                    />
                    {formData.client && (
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      </div>
                    )}
                    {showClientDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-card border rounded-md shadow-lg max-h-60 overflow-auto">
                        {clientError ? (
                          <div className="px-4 py-2 text-muted-foreground flex items-center justify-between">
                            <span>{clientError}</span>
                            <Button
                              variant="link"
                              size="sm"
                              onClick={() => fetchClients('')}
                              className="text-blue-500"
                            >
                              Retry
                            </Button>
                          </div>
                        ) : clients.length === 0 && !isLoadingClients ? (
                          <div className="px-4 py-2 text-muted-foreground">No clients available</div>
                        ) : (
                          <>
                            {(() => {
                              const filteredClients = clients.filter(client => {
                                // If search term is empty, show all clients
                                if (!searchClient.trim()) {
                                  return true;
                                }
                                // Otherwise, filter by name
                                return client.name &&
                                  client.name.toLowerCase().includes(searchClient.toLowerCase().trim());
                              });

                              if (filteredClients.length === 0 && searchClient.trim()) {
                                return (
                                  <div className="px-4 py-2 text-muted-foreground">
                                    No clients found matching &quot{searchClient}&quot
                                  </div>
                                );
                              }

                              return filteredClients.map((client) => (
                                <div
                                  key={client._id}
                                  className={`px-4 py-2 hover:bg-muted cursor-pointer ${formData.client === client._id ? 'bg-blue-100' : ''
                                    }`}
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setFormData(prev => {
                                      const newData = { ...prev, client: client._id };
                                      return newData;
                                    });
                                    setSearchClient(client.name || '');
                                    setShowClientDropdown(false);
                                  }}
                                >
                                  {client.name || 'Unknown Client'}
                                </div>
                              ));
                            })()}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="jobTitle">Job Title *</Label>
                <Input
                  id="jobTitle"
                  placeholder="Type new job title here"
                  value={formData.jobTitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, jobTitle: e.target.value }))}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="jobTypes">Job Types *</Label>
                <Select
                  value={formData.jobTypes}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, jobTypes: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {jobTypes.map((type: string) => (
                      <SelectItem key={type} value={type.toLowerCase()}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="location">Job Location *</Label>
                {parseInt(formData.numberOfPositions) > 1 ? (
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2 min-h-[2.5rem] p-2 border rounded-md">
                      {selectedLocations.map((location) => (
                        <Badge key={location} variant="secondary" className="flex items-center gap-1">
                          {location}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 hover:bg-transparent"
                            onClick={() => removeLocation(location)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <LocationSearch
                          value={locationInput}
                          onChange={setLocationInput}
                          onSelectCity={(city) => handleLocationSelect(city.label)}
                          placeholder="Type location and press Enter"
                          disabled={selectedLocations.length >= parseInt(formData.numberOfPositions) && parseInt(formData.numberOfPositions) > 1}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addLocation}
                        disabled={!locationInput.trim()}
                        className="h-11 px-4 rounded-xl"
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                ) : (
                  <LocationSearch
                    value={locationInput || formData.location}
                    onChange={(val) => {
                      setLocationInput(val);
                      if (formData.location && val !== formData.location) {
                        setFormData(prev => ({ ...prev, location: "" }));
                      }
                    }}
                    onSelectCity={(city) => handleLocationSelect(city.label)}
                    placeholder="Type to search location"
                  />
                )}
              </div>

              <div className="grid gap-2">
                <Label>Salary Range</Label>
                <div className="flex gap-2">
                  <Select
                    value={formData.salaryRange.currency}
                    onValueChange={(value) => setFormData(prev => ({
                      ...prev,
                      salaryRange: { ...prev.salaryRange, currency: value }
                    }))}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue>
                        {formData.salaryRange.currency && (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-3">
                              {currencies.find(c => c.code === formData.salaryRange.currency)?.flag && (
                                // @ts-ignore
                                React.createElement(Flags[currencies.find(c => c.code === formData.salaryRange.currency)?.flag || ''])
                              )}
                            </div>
                            <span>{formData.salaryRange.currency}</span>
                          </div>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-3">
                              {/* @ts-ignore */}
                              {Flags[currency.flag] && React.createElement(Flags[currency.flag])}
                            </div>
                            <span>{currency.name}</span>
                            <span className="text-muted-foreground ml-auto">{currency.symbol}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Min"
                    type="number"
                    value={formData.salaryRange.min}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      salaryRange: { ...prev.salaryRange, min: e.target.value }
                    }))}
                  />
                  <Input
                    placeholder="Max"
                    type="number"
                    value={formData.salaryRange.max}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      salaryRange: { ...prev.salaryRange, max: e.target.value }
                    }))}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="otherBenefits">Other Benefits</Label>
                <div className="space-y-2">
                  <Select
                    onValueChange={(value) => handleBenefitToggle(value)}
                    value=""
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select benefits" />
                    </SelectTrigger>
                    <SelectContent>
                      {otherBenefits.map((benefit) => (
                        <SelectItem key={benefit} value={benefit}>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.otherBenefits.includes(benefit)}
                              readOnly
                              className="mr-2"
                            />
                            {benefit}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex flex-wrap gap-2">
                    {formData.otherBenefits.map((benefit) => (
                      <Badge key={benefit} variant="secondary" className="flex items-center gap-1">
                        {benefit}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 hover:bg-transparent"
                          onClick={() => handleBenefitToggle(benefit)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="nationality" className="text-base font-semibold">Nationalities</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground mr-1">Open For All</span>
                    <Switch
                      checked={nationalityMode === 'all'}
                      onCheckedChange={(checked: boolean) => handleNationalityModeChange(checked ? 'all' : 'specific')}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2 min-h-[3.5rem] p-3 border rounded-lg bg-muted/30">
                    {nationalityMode === 'all' && (
                      <Badge 
                        variant="outline" 
                        className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1 flex items-center gap-2 text-sm font-medium shadow-sm"
                      >
                        <Globe className="h-4 w-4 text-blue-500" />
                        Open For All Nationals
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 hover:bg-transparent text-blue-400 hover:text-blue-600 ml-1"
                          onClick={() => handleNationalityModeChange('specific')}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </Badge>
                    )}
                    
                    {selectedNationalities.filter(n => n !== 'Open For All Nationals').map((nationality) => (
                      <Badge 
                        key={nationality} 
                        variant="secondary" 
                        className="flex items-center gap-1.5 px-3 py-1 bg-card border border-border shadow-sm transition-all hover:bg-muted"
                      >
                        <span className="text-sm">{nationality}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 hover:bg-transparent text-muted-foreground hover:text-red-500"
                          onClick={() => removeNationality(nationality)}
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      </Badge>
                    ))}

                    {nationalityMode !== 'all' && selectedNationalities.length === 0 && (
                      <div className="flex flex-col items-center justify-center w-full py-2">
                        <span className="text-sm text-muted-foreground italic">No specific nationalities selected</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <CountrySelect
                      value={""}
                      onChange={(val) => {
                        addNationality(val)
                      }}
                      type="nationality"
                      placeholder="Search and add specific nationalities..."
                    />
                    {selectedNationalities.filter(n => n !== 'Open For All Nationals').length > 0 && (
                      <div className="flex justify-end">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => {
                            const remaining = selectedNationalities.includes('Open For All Nationals') ? ['Open For All Nationals'] : [];
                            setSelectedNationalities(remaining);
                            setFormData(prev => ({ ...prev, nationalities: remaining }));
                          }}
                          className="text-xs text-muted-foreground hover:text-red-600 hover:bg-red-50 p-1.5 h-auto transition-colors rounded-full"
                          title="Clear All Specific Nationalities"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="continents">Continents</Label>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2 min-h-[2.5rem] p-2 border rounded-md">
                    {selectedContinents.map((continent) => (
                      <Badge key={continent} variant="secondary" className="flex items-center gap-1">
                        {continent}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 hover:bg-transparent"
                          onClick={() => removeContinent(continent)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                  <Select onValueChange={addContinent} value="">
                    <SelectTrigger>
                      <SelectValue placeholder="Select continents..." />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTINENTS.map((continent) => (
                        <SelectItem key={continent} value={continent}>
                          {continent}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col">
                <Label htmlFor="gender" className="text-sm font-medium text-foreground mb-1">Gender</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="any">Any</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col">
                <Label htmlFor="numberOfPositions" className="text-sm font-medium text-foreground mb-1">Number of Positions</Label>
                <Input
                  id="numberOfPositions"
                  type="number"
                  min="1"
                  value={formData.numberOfPositions}
                  onChange={(e) => setFormData(prev => ({ ...prev, numberOfPositions: e.target.value }))}
                  placeholder="Number of jobs Positions"
                />
              </div>
            </div>
          )}

          {currentTab === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
              <div className="grid gap-2">
                <Label htmlFor="experience">Experience</Label>
                <Input
                  id="experience"
                  value={formData.experience}
                  onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                  placeholder="e.g., 5 years"
                />
              </div>


              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="educationQualification">Education Qualification</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Qualification" />
                    </SelectTrigger>
                    <SelectContent>
                      {educationQualifications.map((qualification) => (
                        <SelectItem key={qualification} value={qualification}>
                          {qualification}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="specialization">Specialization</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Specialization" />
                    </SelectTrigger>
                    <SelectContent>
                      {specialization.map((spec) => (
                        <SelectItem key={spec} value={spec}>
                          {spec}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>


              <div className="grid gap-2">
                <Label htmlFor="certifications">Certifications</Label>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2 min-h-[2.5rem] p-2 border rounded-md">
                    {selectedCertifications.map((certification) => (
                      <Badge key={certification} variant="secondary" className="flex items-center gap-1">
                        {certification}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 hover:bg-transparent"
                          onClick={() => removeCertification(certification)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                  <div className="relative flex gap-2">
                    <Input
                      id="certifications"
                      value={certificationInput}
                      onChange={(e) => setCertificationInput(e.target.value)}
                      onKeyDown={handleCertificationKeyDown}
                      placeholder="Type certification and press Enter"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addCertification}
                      disabled={!certificationInput.trim()}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col">
                <Label htmlFor="reportingTo" className="text-sm font-medium text-foreground mb-1">Reporting To</Label>
                <Input
                  id="reportingTo"
                  value={formData.reportingTo}
                  onChange={(e) => setFormData(prev => ({ ...prev, reportingTo: e.target.value }))}
                  placeholder="Enter reporting manager's name"
                />
              </div>

              <div className="grid gap-2">
                <Label>Deadline (Client)</Label>
                <DatePicker
                  selected={formData.deadline}
                  onChange={(date) => setFormData(prev => ({ ...prev, deadline: date }))}
                  dateFormat="dd/MM/yyyy"
                  className="w-full p-2 border rounded-md"
                  placeholderText="Select deadline"
                />
              </div>

              <div className="grid gap-2">
                <Label>Deadline (Internal)</Label>
                <DatePicker
                  selected={formData.internalDeadline}
                  onChange={(date) => setFormData(prev => ({ ...prev, internalDeadline: date }))}
                  dateFormat="dd/MM/yyyy"
                  className="w-full p-2 border rounded-md"
                  placeholderText="Select deadline"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="teamSize">Team Size</Label>
                <Input
                  id="teamSize"
                  type="number"
                  min="0"
                  value={formData.teamSize}
                  onChange={(e) => setFormData(prev => ({ ...prev, teamSize: e.target.value }))}
                  placeholder="Number of team Under Job Position"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="educationQualification">Work Visa</Label>
                <Select required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Work Visa" />
                  </SelectTrigger>
                  <SelectContent>
                    {workVisa.map((visa) => (
                      <SelectItem key={visa} value={visa}>
                        {visa}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="keySkills">Key Skills</Label>
                <Input
                  id="keySkills"
                  value={formData.keySkills}
                  onChange={(e) => setFormData(prev => ({ ...prev, keySkills: e.target.value }))}
                  placeholder="Enter key skills required"
                />
              </div>
            </div>
          )}

          {currentTab === 2 && (
            <div className="grid grid-cols-1 gap-6 py-4">
              <div className="grid gap-2">
                <Label>Job Description</Label>
                <div className="flex flex-col gap-4">
                  <div className="border-2 border-dashed rounded-lg p-6 text-center">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept=".pdf,.doc,.docx,.rtf,.jpg,.jpeg,.png,image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload File
                    </Button>
                    <p className="text-sm text-muted-foreground mt-2">
                      Or write the description below
                    </p>
                    {selectedFile && (
                      <div className="flex items-center justify-between p-2 bg-muted rounded">
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-blue-500" />
                          <span>{selectedFile.name}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleRemoveFile}
                          type="button"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <Textarea
                  placeholder="Enter job description..."
                  value={formData.jobDescription}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData(prev => ({ ...prev, jobDescription: e.target.value }))}
                  className="min-h-[200px]"
                  disabled={!!selectedFile}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <div className="flex flex-wrap justify-between w-full">
              <div>
                {currentTab > 0 && (
                  <Button
                    variant="outline"
                    type="button"
                    onClick={handlePrevious}
                    className="mb-2 md:mb-0"
                  >
                    Previous
                  </Button>
                )}
              </div>
              <div className="flex space-x-2">
                {currentTab < 2 && (
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => onOpenChange(false)}
                  >
                    Cancel
                  </Button>
                )}
                {currentTab < 2 ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                  >
                    Next
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => onOpenChange(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                    >
                      Create Job Requirement
                    </Button>
                  </>
                )}
              </div>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}