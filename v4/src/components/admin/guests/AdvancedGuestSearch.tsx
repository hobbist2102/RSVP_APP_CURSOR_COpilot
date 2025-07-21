'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { 
  Search, 
  Filter, 
  Save, 
  Trash2, 
  BarChart3, 
  Users, 
  TrendingUp,
  Eye,
  EyeOff,
  RefreshCw,
  Star,
  Calendar,
  MapPin
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchFilters {
  query: string
  side: string
  rsvpStatus: string
  isFamily: boolean | null
  needsAccommodation: boolean | null
  needsFlightAssistance: boolean | null
  hasEmail: boolean | null
  hasPhone: boolean | null
  plusOneAllowed: boolean | null
  plusOneConfirmed: boolean | null
  dateRange: {
    start?: string
    end?: string
  }
  ceremonies: string[]
  customFields: Record<string, any>
}

interface SavedFilter {
  id: string
  name: string
  filters: SearchFilters
  createdAt: string
}

interface GuestAnalytics {
  total: number
  confirmed: number
  declined: number
  pending: number
  familyMembers: number
  withEmail: number
  withPhone: number
  needingAccommodation: number
  needingFlightAssistance: number
  plusOnesAllowed: number
  plusOnesConfirmed: number
  sideBreakdown: {
    bride: number
    groom: number
    both: number
  }
  relationshipBreakdown: Record<string, number>
  ceremonyAttendance: Record<string, number>
}

interface AdvancedGuestSearchProps {
  onFiltersChange: (filters: SearchFilters) => void
  analytics?: GuestAnalytics
  ceremonies?: Array<{ id: number; name: string }>
  loading?: boolean
  className?: string
}

const defaultFilters: SearchFilters = {
  query: '',
  side: 'all',
  rsvpStatus: 'all',
  isFamily: null,
  needsAccommodation: null,
  needsFlightAssistance: null,
  hasEmail: null,
  hasPhone: null,
  plusOneAllowed: null,
  plusOneConfirmed: null,
  dateRange: {},
  ceremonies: [],
  customFields: {}
}

export default function AdvancedGuestSearch({
  onFiltersChange,
  analytics,
  ceremonies = [],
  loading = false,
  className
}: AdvancedGuestSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>(defaultFilters)
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([])
  const [showAnalytics, setShowAnalytics] = useState(true)
  const [saveFilterName, setSaveFilterName] = useState('')
  const [showSaveDialog, setShowSaveDialog] = useState(false)

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      onFiltersChange(filters)
    }, 300)

    return () => clearTimeout(timer)
  }, [filters, onFiltersChange])

  // Load saved filters from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('guestSearchFilters')
    if (saved) {
      try {
        setSavedFilters(JSON.parse(saved))
      } catch (error) {
        console.error('Error loading saved filters:', error)
      }
    }
  }, [])

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const resetFilters = () => {
    setFilters(defaultFilters)
  }

  const saveCurrentFilter = () => {
    if (!saveFilterName.trim()) return

    const newFilter: SavedFilter = {
      id: Date.now().toString(),
      name: saveFilterName.trim(),
      filters: { ...filters },
      createdAt: new Date().toISOString()
    }

    const updatedFilters = [...savedFilters, newFilter]
    setSavedFilters(updatedFilters)
    localStorage.setItem('guestSearchFilters', JSON.stringify(updatedFilters))
    
    setSaveFilterName('')
    setShowSaveDialog(false)
  }

  const loadSavedFilter = (savedFilter: SavedFilter) => {
    setFilters(savedFilter.filters)
  }

  const deleteSavedFilter = (filterId: string) => {
    const updatedFilters = savedFilters.filter(f => f.id !== filterId)
    setSavedFilters(updatedFilters)
    localStorage.setItem('guestSearchFilters', JSON.stringify(updatedFilters))
  }

  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (filters.query) count++
    if (filters.side !== 'all') count++
    if (filters.rsvpStatus !== 'all') count++
    if (filters.isFamily !== null) count++
    if (filters.needsAccommodation !== null) count++
    if (filters.needsFlightAssistance !== null) count++
    if (filters.hasEmail !== null) count++
    if (filters.hasPhone !== null) count++
    if (filters.plusOneAllowed !== null) count++
    if (filters.plusOneConfirmed !== null) count++
    if (filters.dateRange.start || filters.dateRange.end) count++
    if (filters.ceremonies.length > 0) count++
    return count
  }, [filters])

  const getPercentage = (value: number, total: number) => {
    return total > 0 ? Math.round((value / total) * 100) : 0
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Search Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Advanced Guest Search
              </CardTitle>
              <CardDescription>
                Search and filter guests with advanced criteria
                {activeFiltersCount > 0 && (
                  <Badge variant="outline" className="ml-2">
                    {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} active
                  </Badge>
                )}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAnalytics(!showAnalytics)}
              >
                {showAnalytics ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                Analytics
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                disabled={activeFiltersCount === 0}
              >
                <RefreshCw className="h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Search Filters */}
        <div className="lg:col-span-2 space-y-6">
          {/* Text Search */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Search Query</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, email, phone, relationship, or notes..."
                  value={filters.query}
                  onChange={(e) => updateFilter('query', e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Basic Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Wedding Side</Label>
                  <Select value={filters.side} onValueChange={(value) => updateFilter('side', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sides</SelectItem>
                      <SelectItem value="bride">Bride's Side</SelectItem>
                      <SelectItem value="groom">Groom's Side</SelectItem>
                      <SelectItem value="both">Both Sides</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>RSVP Status</Label>
                  <Select value={filters.rsvpStatus} onValueChange={(value) => updateFilter('rsvpStatus', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="declined">Declined</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Guest Type Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Guest Type</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Family Members</Label>
                    <div className="flex gap-2">
                      <Button
                        variant={filters.isFamily === true ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateFilter('isFamily', filters.isFamily === true ? null : true)}
                      >
                        Yes
                      </Button>
                      <Button
                        variant={filters.isFamily === false ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateFilter('isFamily', filters.isFamily === false ? null : false)}
                      >
                        No
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Has Email</Label>
                    <div className="flex gap-2">
                      <Button
                        variant={filters.hasEmail === true ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateFilter('hasEmail', filters.hasEmail === true ? null : true)}
                      >
                        Yes
                      </Button>
                      <Button
                        variant={filters.hasEmail === false ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateFilter('hasEmail', filters.hasEmail === false ? null : false)}
                      >
                        No
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Has Phone</Label>
                    <div className="flex gap-2">
                      <Button
                        variant={filters.hasPhone === true ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateFilter('hasPhone', filters.hasPhone === true ? null : true)}
                      >
                        Yes
                      </Button>
                      <Button
                        variant={filters.hasPhone === false ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateFilter('hasPhone', filters.hasPhone === false ? null : false)}
                      >
                        No
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Plus One Allowed</Label>
                    <div className="flex gap-2">
                      <Button
                        variant={filters.plusOneAllowed === true ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateFilter('plusOneAllowed', filters.plusOneAllowed === true ? null : true)}
                      >
                        Yes
                      </Button>
                      <Button
                        variant={filters.plusOneAllowed === false ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateFilter('plusOneAllowed', filters.plusOneAllowed === false ? null : false)}
                      >
                        No
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Plus One Confirmed</Label>
                    <div className="flex gap-2">
                      <Button
                        variant={filters.plusOneConfirmed === true ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateFilter('plusOneConfirmed', filters.plusOneConfirmed === true ? null : true)}
                      >
                        Yes
                      </Button>
                      <Button
                        variant={filters.plusOneConfirmed === false ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateFilter('plusOneConfirmed', filters.plusOneConfirmed === false ? null : false)}
                      >
                        No
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Needs Accommodation</Label>
                    <div className="flex gap-2">
                      <Button
                        variant={filters.needsAccommodation === true ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateFilter('needsAccommodation', filters.needsAccommodation === true ? null : true)}
                      >
                        Yes
                      </Button>
                      <Button
                        variant={filters.needsAccommodation === false ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateFilter('needsAccommodation', filters.needsAccommodation === false ? null : false)}
                      >
                        No
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ceremony Filters */}
          {ceremonies.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ceremony Attendance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {ceremonies.map((ceremony) => (
                    <div key={ceremony.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`ceremony-${ceremony.id}`}
                        checked={filters.ceremonies.includes(ceremony.id.toString())}
                        onCheckedChange={(checked) => {
                          const ceremonyId = ceremony.id.toString()
                          if (checked) {
                            updateFilter('ceremonies', [...filters.ceremonies, ceremonyId])
                          } else {
                            updateFilter('ceremonies', filters.ceremonies.filter(id => id !== ceremonyId))
                          }
                        }}
                      />
                      <Label htmlFor={`ceremony-${ceremony.id}`} className="text-sm">
                        {ceremony.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Date Range Filter */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">RSVP Date Range</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>From Date</Label>
                  <Input
                    type="date"
                    value={filters.dateRange.start || ''}
                    onChange={(e) => updateFilter('dateRange', { ...filters.dateRange, start: e.target.value })}
                  />
                </div>
                <div>
                  <Label>To Date</Label>
                  <Input
                    type="date"
                    value={filters.dateRange.end || ''}
                    onChange={(e) => updateFilter('dateRange', { ...filters.dateRange, end: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics & Saved Filters */}
        <div className="space-y-6">
          {/* Guest Analytics */}
          {showAnalytics && analytics && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Guest Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Overview Stats */}
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{analytics.total}</div>
                    <div className="text-xs text-blue-700">Total Guests</div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{analytics.confirmed}</div>
                    <div className="text-xs text-green-700">Confirmed</div>
                  </div>
                </div>

                {/* RSVP Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Response Rate</span>
                    <span className="font-medium">
                      {getPercentage(analytics.confirmed + analytics.declined, analytics.total)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full"
                      style={{ 
                        width: `${getPercentage(analytics.confirmed + analytics.declined, analytics.total)}%` 
                      }}
                    />
                  </div>
                </div>

                <Separator />

                {/* Side Breakdown */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">By Wedding Side</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Bride's Side</span>
                      <Badge variant="outline" className="border-pink-200 text-pink-700">
                        {analytics.sideBreakdown.bride}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Groom's Side</span>
                      <Badge variant="outline" className="border-blue-200 text-blue-700">
                        {analytics.sideBreakdown.groom}
                      </Badge>
                    </div>
                    {analytics.sideBreakdown.both > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>Both Sides</span>
                        <Badge variant="outline" className="border-purple-200 text-purple-700">
                          {analytics.sideBreakdown.both}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Quick Stats */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Quick Stats</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Family Members</span>
                      <span>{analytics.familyMembers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>With Email</span>
                      <span>{analytics.withEmail}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>With Phone</span>
                      <span>{analytics.withPhone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Plus Ones Allowed</span>
                      <span>{analytics.plusOnesAllowed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Plus Ones Confirmed</span>
                      <span>{analytics.plusOnesConfirmed}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Saved Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Saved Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Save Current Filter */}
              {activeFiltersCount > 0 && (
                <div className="space-y-2">
                  {showSaveDialog ? (
                    <div className="space-y-2">
                      <Input
                        placeholder="Filter name..."
                        value={saveFilterName}
                        onChange={(e) => setSaveFilterName(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={saveCurrentFilter} disabled={!saveFilterName.trim()}>
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setShowSaveDialog(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowSaveDialog(true)}
                      className="w-full"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Current Filter
                    </Button>
                  )}
                </div>
              )}

              {/* Saved Filters List */}
              {savedFilters.length > 0 && (
                <div className="space-y-2">
                  <Separator />
                  <div className="space-y-2">
                    {savedFilters.map((savedFilter) => (
                      <div key={savedFilter.id} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{savedFilter.name}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(savedFilter.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => loadSavedFilter(savedFilter)}
                          >
                            Load
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteSavedFilter(savedFilter.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {savedFilters.length === 0 && !showSaveDialog && (
                <div className="text-center py-4 text-gray-500">
                  <Star className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No saved filters yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}