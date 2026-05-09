'use client'

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, Plus } from 'lucide-react'
import { SearchLogo } from "@/components/searchLogo"

export function AdvanceSearch() {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <input
          type="search"
          placeholder="Search by entering keywords in this field and/or selecting one or more criteria below"
          className="flex-1 px-4 py-2 border rounded-md"
        />
      </div>
      
      <div className="flex flex-wrap gap-2">
        <Select>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ny">New York</SelectItem>
            <SelectItem value="sf">San Francisco</SelectItem>
            <SelectItem value="la">Los Angeles</SelectItem>
          </SelectContent>
        </Select>

        <Select>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Experience" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1-3">1-3 years</SelectItem>
            <SelectItem value="3-5">3-5 years</SelectItem>
            <SelectItem value="5+">5+ years</SelectItem>
          </SelectContent>
        </Select>

        <Select>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Employers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="google">Google</SelectItem>
            <SelectItem value="apple">Apple</SelectItem>
            <SelectItem value="meta">Meta</SelectItem>
          </SelectContent>
        </Select>

        <Select>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Languages" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="es">Spanish</SelectItem>
            <SelectItem value="fr">French</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Skills
        </Button>

        <Button variant="link" className="text-blue-600">
          More Search Criteria
        </Button>

        <div className="flex-1" />

        <Button variant="secondary">Search</Button>
        <Button variant="outline">Clear all</Button>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="flex-3 flex-col items-center justify-center text-center max-w-2xl mx-auto p-4">
      <div className="w-48 h-48 mb-6">
            <SearchLogo/>
        </div>
    </div>
    </div>
    <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center justify-center text-center ">
        <h2 className="mt-4 text-xl font-semibold">
        Start your search by combining keywords and/or selecting a criteria
      </h2>
      <p className="mt-6 text-foreground max-w-xl mx-auto">
        The advanced search allows you to search for candidates in your database using keywords in a boolean search and/or a wide range of search criteria.
      </p>
      <div className="mt-6 grid md:grid-cols-2 gap-4 max-w-6xl mx-auto text-left">
        <div>
          <h3 className="font-medium mb-2">What&apos;s a search criteria?</h3>
          <p className="text-foreground">
            Search criteria allow you to search and rank candidates based on multiple parameters such as skills, spoken languages, degree, location, current and past experiences, and many more. Candidate scores are generated using artificial intelligence based on how well each candidate matches the selected criteria.
          </p>
        </div>
        <div>
          <h3 className="font-medium mb-2">What&apos;s a boolean search?</h3>
          <p className="text-foreground">
            A boolean search is a type of search allowing users to combine keywords with operators to make the search results more relevant. Manatal&apos;s boolean search works the same way as LinkedIn or Google, and is case insensitive.
          </p>
          <div className="mt-4">
            <h4 className="font-medium mb-1">Examples</h4>
            <ul className="space-y-1 text-foreground">
              <li>Google AND developer</li>
              <li>Apple AND (iOS OR android)</li>
              <li>(Google OR Apple) AND (iOS AND android)</li>
            </ul>
          </div>
        </div>
      </div>
        </div>
        </div>

    </div>
  )
}

