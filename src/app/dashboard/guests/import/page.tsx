'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Upload, 
  Download, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  FileSpreadsheet,
  Users
} from 'lucide-react'

interface ImportResult {
  valid: number
  invalid: number
  total: number
  errors: Array<{
    row: number
    field: string
    message: string
  }>
  preview: Array<{
    firstName: string
    lastName: string
    email: string
    side: string
    relationship: string
    status: 'valid' | 'invalid' | 'warning'
    errors: string[]
  }>
}

export default function GuestImportPage() {
  const [importing, setImporting] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const mockImportResult: ImportResult = {
    valid: 45,
    invalid: 3,
    total: 48,
    errors: [
      { row: 12, field: 'email', message: 'Invalid email format' },
      { row: 23, field: 'side', message: 'Side must be bride, groom, or mutual' },
      { row: 34, field: 'firstName', message: 'First name is required' }
    ],
    preview: [
      {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john@example.com',
        side: 'groom',
        relationship: 'friend',
        status: 'valid',
        errors: []
      },
      {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'invalid-email',
        side: 'bride',
        relationship: 'cousin',
        status: 'invalid',
        errors: ['Invalid email format']
      },
      {
        firstName: 'Bob',
        lastName: 'Wilson',
        email: 'bob@example.com',
        side: 'mutual',
        relationship: 'family',
        status: 'warning',
        errors: ['Duplicate email found']
      }
    ]
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }, [])

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0])
    }
  }, [])

  const handleFileUpload = async (file: File) => {
    setImporting(true)
    setImportProgress(0)
    setImportResult(null)

    // Simulate file processing
    const interval = setInterval(() => {
      setImportProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setImporting(false)
          setImportResult(mockImportResult)
          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0])
    }
  }

  const downloadTemplate = () => {
    // Create CSV template
    const csvContent = 'firstName,lastName,email,phone,side,relationship,address,dietaryRestrictions,specialRequests\n' +
      'John,Smith,john@example.com,+1234567890,groom,friend,"123 Main St, City, State",Vegetarian,None\n' +
      'Jane,Doe,jane@example.com,+1234567891,bride,cousin,"456 Oak Ave, City, State",None,Wheelchair access'
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'guest-import-template.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const confirmImport = async () => {
    // Implement actual import logic here
    console.log('Importing guests...')
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Import Guests</h1>
          <p className="text-gray-600">Upload your guest list from Excel or CSV files</p>
        </div>

        {/* Template Download */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Download Template
            </CardTitle>
            <CardDescription>
              Download our template to ensure your data is formatted correctly
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={downloadTemplate} variant="outline">
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Download CSV Template
            </Button>
          </CardContent>
        </Card>

        {/* File Upload */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload Guest List
            </CardTitle>
            <CardDescription>
              Drag and drop your CSV or Excel file, or click to browse
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDragIn}
              onDragLeave={handleDragOut}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <div className="space-y-2">
                <p className="text-lg font-medium">Drop your file here</p>
                <p className="text-gray-500">or</p>
                <div>
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileInput}
                    className="hidden"
                    id="fileInput"
                    disabled={importing}
                  />
                  <label htmlFor="fileInput">
                    <Button variant="outline" className="cursor-pointer" disabled={importing}>
                      Browse Files
                    </Button>
                  </label>
                </div>
                <p className="text-sm text-gray-500">
                  Supports CSV, Excel (.xlsx, .xls) files up to 10MB
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Import Progress */}
        {importing && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Processing File...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Progress value={importProgress} />
                <p className="text-sm text-gray-600">
                  Processing: {importProgress}% complete
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Import Results */}
        {importResult && (
          <div className="space-y-6">
            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Import Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {importResult.valid}
                    </div>
                    <div className="text-sm text-green-700">Valid Records</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {importResult.invalid}
                    </div>
                    <div className="text-sm text-red-700">Invalid Records</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {importResult.total}
                    </div>
                    <div className="text-sm text-blue-700">Total Records</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Errors */}
            {importResult.errors.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    Import Errors
                  </CardTitle>
                  <CardDescription>
                    These records could not be imported and need to be fixed
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {importResult.errors.map((error, index) => (
                      <Alert key={index} variant="destructive">
                        <AlertDescription>
                          <strong>Row {error.row}:</strong> {error.field} - {error.message}
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Data Preview
                </CardTitle>
                <CardDescription>
                  Preview of the first few records from your import
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Status</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Side</TableHead>
                        <TableHead>Relationship</TableHead>
                        <TableHead>Issues</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {importResult.preview.map((guest, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Badge 
                              variant={
                                guest.status === 'valid' ? 'default' :
                                guest.status === 'invalid' ? 'destructive' : 'secondary'
                              }
                            >
                              {guest.status === 'valid' && <CheckCircle className="w-3 h-3 mr-1" />}
                              {guest.status === 'invalid' && <XCircle className="w-3 h-3 mr-1" />}
                              {guest.status === 'warning' && <AlertTriangle className="w-3 h-3 mr-1" />}
                              {guest.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {guest.firstName} {guest.lastName}
                          </TableCell>
                          <TableCell>{guest.email}</TableCell>
                          <TableCell className="capitalize">{guest.side}</TableCell>
                          <TableCell className="capitalize">{guest.relationship}</TableCell>
                          <TableCell>
                            {guest.errors.length > 0 ? (
                              <div className="text-sm text-red-600">
                                {guest.errors.join(', ')}
                              </div>
                            ) : (
                              <span className="text-green-600 text-sm">No issues</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            {importResult.valid > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Confirm Import</CardTitle>
                  <CardDescription>
                    {importResult.valid} valid guests will be imported. Invalid records will be skipped.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <Button onClick={confirmImport} className="bg-green-600 hover:bg-green-700">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Import {importResult.valid} Guests
                    </Button>
                    <Button variant="outline" onClick={() => setImportResult(null)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}