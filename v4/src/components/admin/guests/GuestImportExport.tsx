'use client'

import React, { useState, useRef, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { 
  Upload, 
  Download, 
  FileText, 
  FileSpreadsheet, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Eye, 
  RefreshCw,
  Trash2
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ImportResult {
  success: boolean
  total: number
  imported: number
  skipped: number
  errors: Array<{
    row: number
    error: string
    data: any
  }>
}

interface ParsedGuest {
  firstName: string
  lastName: string
  email?: string
  phone?: string
  side: 'bride' | 'groom' | 'both'
  relationship?: string
  isFamily?: boolean
  rsvpStatus?: 'pending' | 'confirmed' | 'declined'
  plusOneAllowed?: boolean
  dietaryRestrictions?: string
  allergies?: string
  needsAccommodation?: boolean
  needsFlightAssistance?: boolean
  notes?: string
  [key: string]: any
}

interface GuestImportExportProps {
  eventId: number
  onImportComplete?: (result: ImportResult) => void
  onExportComplete?: (data: any[]) => void
  className?: string
}

export default function GuestImportExport({
  eventId,
  onImportComplete,
  onExportComplete,
  className
}: GuestImportExportProps) {
  const [dragActive, setDragActive] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [parsing, setParsing] = useState(false)
  const [importing, setImporting] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [parsedData, setParsedData] = useState<ParsedGuest[]>([])
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [previewVisible, setPreviewVisible] = useState(false)
  const [importOptions, setImportOptions] = useState({
    skipDuplicates: true,
    overwriteExisting: false
  })
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Handle drag events
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  // Handle dropped files
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }, [])

  // Handle file input change
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }, [])

  // Validate and process file
  const handleFile = (file: File) => {
    const validTypes = [
      'text/csv',
      'application/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ]
    
    if (!validTypes.includes(file.type) && !file.name.match(/\.(csv|xlsx?)$/i)) {
      alert('Please upload a valid CSV or Excel file (.csv, .xls, .xlsx)')
      return
    }

    setFile(file)
    parseFile(file)
  }

  // Parse CSV/Excel file
  const parseFile = async (file: File) => {
    setParsing(true)
    try {
      const text = await file.text()
      const lines = text.split('\n').map(line => line.trim()).filter(line => line)
      
      if (lines.length < 2) {
        throw new Error('File must contain at least a header row and one data row')
      }

      // Parse CSV (basic implementation)
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
      const data: ParsedGuest[] = []

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
        const guest: ParsedGuest = {
          firstName: '',
          lastName: '',
          side: 'bride'
        }

        headers.forEach((header, index) => {
          const value = values[index] || ''
          
          // Map common header variations to standard fields
          const headerLower = header.toLowerCase()
          if (headerLower.includes('first') && headerLower.includes('name')) {
            guest.firstName = value
          } else if (headerLower.includes('last') && headerLower.includes('name')) {
            guest.lastName = value
          } else if (headerLower.includes('email')) {
            guest.email = value
          } else if (headerLower.includes('phone')) {
            guest.phone = value
          } else if (headerLower.includes('side')) {
            guest.side = value.toLowerCase().includes('groom') ? 'groom' : 'bride'
          } else if (headerLower.includes('relationship')) {
            guest.relationship = value
          } else if (headerLower.includes('family')) {
            guest.isFamily = value.toLowerCase() === 'true' || value.toLowerCase() === 'yes'
          } else if (headerLower.includes('rsvp')) {
            const statusLower = value.toLowerCase()
            if (statusLower.includes('confirm')) guest.rsvpStatus = 'confirmed'
            else if (statusLower.includes('decline')) guest.rsvpStatus = 'declined'
            else guest.rsvpStatus = 'pending'
          } else if (headerLower.includes('plus') && headerLower.includes('one')) {
            guest.plusOneAllowed = value.toLowerCase() === 'true' || value.toLowerCase() === 'yes'
          } else if (headerLower.includes('dietary')) {
            guest.dietaryRestrictions = value
          } else if (headerLower.includes('allerg')) {
            guest.allergies = value
          } else if (headerLower.includes('accommodation')) {
            guest.needsAccommodation = value.toLowerCase() === 'true' || value.toLowerCase() === 'yes'
          } else if (headerLower.includes('flight')) {
            guest.needsFlightAssistance = value.toLowerCase() === 'true' || value.toLowerCase() === 'yes'
          } else if (headerLower.includes('note')) {
            guest.notes = value
          }
        })

        if (guest.firstName && guest.lastName) {
          data.push(guest)
        }
      }

      setParsedData(data)
      setPreviewVisible(true)
    } catch (error) {
      console.error('Error parsing file:', error)
      alert(`Error parsing file: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setParsing(false)
    }
  }

  // Import guests to database
  const handleImport = async () => {
    if (!parsedData.length) return

    setImporting(true)
    try {
      const response = await fetch('/api/guests/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId,
          guests: parsedData,
          skipDuplicates: importOptions.skipDuplicates,
          overwriteExisting: importOptions.overwriteExisting
        })
      })

      const result = await response.json()
      
      if (result.success) {
        setImportResult(result.data)
        onImportComplete?.(result.data)
      } else {
        throw new Error(result.error || 'Import failed')
      }
    } catch (error) {
      console.error('Error importing guests:', error)
      alert(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setImporting(false)
    }
  }

  // Export guests
  const handleExport = async () => {
    setExporting(true)
    try {
      const response = await fetch(`/api/guests/export?eventId=${eventId}&includePersonalInfo=true&includeRsvpStatus=true&includeCeremonies=true&includeAccommodation=true&includeTravel=true&includeNotes=true`)
      const result = await response.json()
      
      if (result.success) {
        // Convert to CSV
        const csvData = convertToCSV(result.data.guests)
        downloadCSV(csvData, `guests-export-${new Date().toISOString().split('T')[0]}.csv`)
        onExportComplete?.(result.data.guests)
      } else {
        throw new Error(result.error || 'Export failed')
      }
    } catch (error) {
      console.error('Error exporting guests:', error)
      alert(`Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setExporting(false)
    }
  }

  // Convert data to CSV
  const convertToCSV = (data: any[]) => {
    if (!data.length) return ''
    
    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header] || ''
          // Escape commas and quotes
          return `"${String(value).replace(/"/g, '""')}"`
        }).join(',')
      )
    ].join('\n')
    
    return csvContent
  }

  // Download CSV file
  const downloadCSV = (csvContent: string, filename: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = filename
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Download template
  const downloadTemplate = () => {
    const template = [
      'First Name,Last Name,Email,Phone,Side,Relationship,Family Member,Plus One Allowed,Dietary Restrictions,Allergies,Needs Accommodation,Needs Flight Assistance,Notes',
      'John,Doe,john.doe@email.com,+1234567890,bride,Brother,true,true,Vegetarian,None,true,false,VIP guest',
      'Jane,Smith,jane.smith@email.com,+1987654321,groom,Friend,false,false,,,false,true,'
    ].join('\n')
    
    downloadCSV(template, 'guest-import-template.csv')
  }

  // Reset form
  const resetForm = () => {
    setFile(null)
    setParsedData([])
    setImportResult(null)
    setPreviewVisible(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle>Guest Import & Export</CardTitle>
          <CardDescription>
            Import guests from CSV/Excel files or export your current guest list
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Import Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Import Guests
            </CardTitle>
            <CardDescription>
              Upload a CSV or Excel file with guest information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* File Upload Area */}
            {!file && (
              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                  dragActive ? "border-purple-500 bg-purple-50" : "border-gray-300 hover:border-gray-400"
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleChange}
                  className="hidden"
                />
                <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-medium text-gray-700 mb-2">
                  Drop your file here or click to browse
                </p>
                <p className="text-sm text-gray-500">
                  Supports CSV, XLS, and XLSX files
                </p>
              </div>
            )}

            {/* File Info */}
            {file && (
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetForm}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Parsing Progress */}
            {parsing && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Parsing file...</span>
                </div>
                <Progress value={undefined} className="w-full" />
              </div>
            )}

            {/* Import Options */}
            {parsedData.length > 0 && (
              <div className="space-y-4">
                <Separator />
                <div className="space-y-3">
                  <h4 className="font-medium">Import Options</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="skipDuplicates"
                        checked={importOptions.skipDuplicates}
                        onCheckedChange={(checked) => 
                          setImportOptions(prev => ({ ...prev, skipDuplicates: checked as boolean }))
                        }
                      />
                      <Label htmlFor="skipDuplicates" className="text-sm">
                        Skip duplicate guests (based on name and email)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="overwriteExisting"
                        checked={importOptions.overwriteExisting}
                        onCheckedChange={(checked) => 
                          setImportOptions(prev => ({ ...prev, overwriteExisting: checked as boolean }))
                        }
                      />
                      <Label htmlFor="overwriteExisting" className="text-sm">
                        Overwrite existing guest information
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={downloadTemplate}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download Template
              </Button>
              
              {parsedData.length > 0 && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setPreviewVisible(!previewVisible)}
                    className="flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    {previewVisible ? 'Hide' : 'Preview'}
                  </Button>
                  <Button
                    onClick={handleImport}
                    disabled={importing}
                    className="flex items-center gap-2"
                  >
                    {importing ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    Import {parsedData.length} Guests
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Export Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export Guests
            </CardTitle>
            <CardDescription>
              Download your current guest list as a CSV file
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-8">
              <FileSpreadsheet className="h-16 w-16 mx-auto mb-4 text-green-600" />
              <p className="text-lg font-medium text-gray-900 mb-2">
                Export Guest List
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Download a complete CSV file with all guest information including RSVP status, dietary restrictions, and travel details
              </p>
              <Button
                onClick={handleExport}
                disabled={exporting}
                size="lg"
                className="flex items-center gap-2"
              >
                {exporting ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Export CSV
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Preview */}
      {previewVisible && parsedData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Data Preview</CardTitle>
            <CardDescription>
              Review the data before importing ({parsedData.length} guests found)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Name</th>
                    <th className="text-left p-2">Email</th>
                    <th className="text-left p-2">Phone</th>
                    <th className="text-left p-2">Side</th>
                    <th className="text-left p-2">Relationship</th>
                    <th className="text-left p-2">Family</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedData.slice(0, 10).map((guest, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2 font-medium">
                        {guest.firstName} {guest.lastName}
                      </td>
                      <td className="p-2">{guest.email || '-'}</td>
                      <td className="p-2">{guest.phone || '-'}</td>
                      <td className="p-2">
                        <Badge variant="outline">{guest.side}</Badge>
                      </td>
                      <td className="p-2">{guest.relationship || '-'}</td>
                      <td className="p-2">
                        {guest.isFamily ? (
                          <Badge className="bg-blue-100 text-blue-800">Family</Badge>
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {parsedData.length > 10 && (
                <p className="text-sm text-gray-500 mt-2 text-center">
                  Showing first 10 of {parsedData.length} guests
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Import Results */}
      {importResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Import Complete
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{importResult.total}</p>
                <p className="text-sm text-gray-600">Total Processed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{importResult.imported}</p>
                <p className="text-sm text-gray-600">Successfully Imported</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">{importResult.skipped}</p>
                <p className="text-sm text-gray-600">Skipped</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{importResult.errors.length}</p>
                <p className="text-sm text-gray-600">Errors</p>
              </div>
            </div>

            {importResult.errors.length > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-medium mb-2">Import Errors:</p>
                  <ul className="space-y-1 text-sm">
                    {importResult.errors.slice(0, 5).map((error, index) => (
                      <li key={index}>
                        Row {error.row}: {error.error}
                      </li>
                    ))}
                  </ul>
                  {importResult.errors.length > 5 && (
                    <p className="text-sm text-gray-600 mt-2">
                      ... and {importResult.errors.length - 5} more errors
                    </p>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}