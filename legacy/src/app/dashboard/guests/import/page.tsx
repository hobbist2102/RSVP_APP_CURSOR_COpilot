'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Upload, 
  Download, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle, 
  X,
  Users,
  ArrowLeft
} from 'lucide-react'

interface ImportError {
  row: number
  field: string
  message: string
  value: string
}

interface GuestPreview {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  side: 'bride' | 'groom' | 'mutual'
  relationship: string
  plusOnes: number
  errors?: ImportError[]
}

const SAMPLE_DATA: GuestPreview[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@email.com',
    phone: '+1234567890',
    side: 'groom',
    relationship: 'friend',
    plusOnes: 1
  },
  {
    id: '2',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.j@email.com',
    phone: '+1234567891',
    side: 'bride',
    relationship: 'family',
    plusOnes: 0
  }
]

export default function GuestImportPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [importResults, setImportResults] = useState<{
    total: number
    successful: number
    errors: number
    preview: GuestPreview[]
  } | null>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0])
    }
  }

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true)
    setUploadProgress(0)

    // Simulate file processing
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 10
      })
    }, 200)

    // Mock processing delay
    setTimeout(() => {
      setImportResults({
        total: 150,
        successful: 148,
        errors: 2,
        preview: SAMPLE_DATA
      })
      setIsProcessing(false)
    }, 2500)
  }

  const downloadTemplate = () => {
    // In real app, this would download an actual Excel/CSV template
    const csvContent = `firstName,lastName,email,phone,side,relationship,plusOnes,address,dietaryRestrictions
John,Smith,john@email.com,+1234567890,groom,friend,1,"123 Main St",vegetarian
Sarah,Johnson,sarah@email.com,+1234567891,bride,family,0,"456 Oak Ave",none`
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'guest-list-template.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const confirmImport = async () => {
    setIsProcessing(true)
    // Simulate API call
    setTimeout(() => {
      setIsProcessing(false)
      router.push('/dashboard/guests?imported=true')
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Guests
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Import Guests</h1>
          <p className="text-gray-600 mt-2">
            Upload your guest list from Excel or CSV files
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upload Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Upload Guest List</CardTitle>
                <CardDescription>
                  Supported formats: .xlsx, .csv, .xls (Max 10MB)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!importResults ? (
                  <>
                    <div
                      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                        dragActive
                          ? 'border-wedding-gold bg-wedding-gold/5'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Drag and drop your file here
                      </h3>
                      <p className="text-gray-600 mb-4">
                        or click to browse files
                      </p>
                      <Button onClick={() => fileInputRef.current?.click()}>
                        Choose File
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        accept=".xlsx,.csv,.xls"
                        onChange={handleFileSelect}
                      />
                    </div>

                    {isProcessing && (
                      <div className="mt-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Processing file...</span>
                          <span className="text-sm text-gray-600">{uploadProgress}%</span>
                        </div>
                        <Progress value={uploadProgress} />
                      </div>
                    )}
                  </>
                ) : (
                  <div className="space-y-6">
                    {/* Import Summary */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center space-x-3">
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                        <div>
                          <h3 className="font-medium text-green-900">File processed successfully!</h3>
                          <p className="text-sm text-green-700">
                            {importResults.successful} of {importResults.total} guests ready to import
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Import Stats */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900">{importResults.total}</div>
                        <div className="text-sm text-gray-600">Total Rows</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-700">{importResults.successful}</div>
                        <div className="text-sm text-green-600">Valid</div>
                      </div>
                      <div className="text-center p-4 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-700">{importResults.errors}</div>
                        <div className="text-sm text-red-600">Errors</div>
                      </div>
                    </div>

                    {/* Preview Table */}
                    <div>
                      <h4 className="font-medium mb-3">Preview (First 10 rows)</h4>
                      <div className="border rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Email</TableHead>
                              <TableHead>Side</TableHead>
                              <TableHead>Relationship</TableHead>
                              <TableHead>Plus Ones</TableHead>
                              <TableHead>Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {importResults.preview.map((guest) => (
                              <TableRow key={guest.id}>
                                <TableCell className="font-medium">
                                  {guest.firstName} {guest.lastName}
                                </TableCell>
                                <TableCell>{guest.email}</TableCell>
                                <TableCell>
                                  <Badge variant="outline">
                                    {guest.side === 'bride' ? "Bride's Side" : guest.side === 'groom' ? "Groom's Side" : "Mutual"}
                                  </Badge>
                                </TableCell>
                                <TableCell className="capitalize">{guest.relationship}</TableCell>
                                <TableCell>{guest.plusOnes}</TableCell>
                                <TableCell>
                                  {guest.errors ? (
                                    <Badge variant="destructive">
                                      <AlertTriangle className="w-3 h-3 mr-1" />
                                      Error
                                    </Badge>
                                  ) : (
                                    <Badge variant="success">
                                      <CheckCircle2 className="w-3 h-3 mr-1" />
                                      Valid
                                    </Badge>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3">
                      <Button 
                        onClick={confirmImport}
                        disabled={isProcessing}
                        className="flex-1"
                      >
                        {isProcessing ? 'Importing...' : `Import ${importResults.successful} Guests`}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setImportResults(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Instructions & Template */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Download className="w-5 h-5" />
                  <span>Download Template</span>
                </CardTitle>
                <CardDescription>
                  Start with our pre-formatted template
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={downloadTemplate}
                >
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Guest List Template.csv
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Required Columns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium">firstName</span>
                    <p className="text-gray-600">Guest's first name</p>
                  </div>
                  <div>
                    <span className="font-medium">lastName</span>
                    <p className="text-gray-600">Guest's last name</p>
                  </div>
                  <div>
                    <span className="font-medium">email</span>
                    <p className="text-gray-600">Email address</p>
                  </div>
                  <div>
                    <span className="font-medium">side</span>
                    <p className="text-gray-600">bride, groom, or mutual</p>
                  </div>
                  <div>
                    <span className="font-medium">relationship</span>
                    <p className="text-gray-600">family, friend, colleague, etc.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Alert>
              <Users className="h-4 w-4" />
              <AlertDescription>
                <strong>Pro Tip:</strong> Include phone numbers for WhatsApp invitations and addresses for accommodation planning.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    </div>
  )
}