'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Mail, 
  MessageSquare, 
  Send, 
  Users, 
  Eye,
  Edit,
  Copy,
  Trash2,
  Plus,
  Settings,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Filter,
  Download
} from 'lucide-react'

interface Template {
  id: string
  name: string
  type: 'invitation' | 'reminder' | 'update' | 'thank_you'
  subject: string
  content: string
  variables: string[]
  lastUsed?: Date
  usageCount: number
}

interface CommunicationLog {
  id: string
  type: 'email' | 'whatsapp' | 'sms'
  template: string
  recipients: number
  status: 'sent' | 'delivered' | 'failed' | 'pending'
  sentAt: Date
  deliveredCount: number
  failedCount: number
}

const SAMPLE_TEMPLATES: Template[] = [
  {
    id: '1',
    name: 'Wedding Invitation',
    type: 'invitation',
    subject: 'You\'re Invited to {{COUPLE_NAMES}}\'s Wedding!',
    content: 'Dear {{GUEST_NAME}},\n\nWe are delighted to invite you to celebrate our special day!\n\nDate: {{EVENT_DATE}}\nVenue: {{VENUE_NAME}}\nAddress: {{VENUE_ADDRESS}}\n\nPlease RSVP by {{RSVP_DEADLINE}} using this link: {{RSVP_LINK}}\n\nWith love,\n{{COUPLE_NAMES}}',
    variables: ['GUEST_NAME', 'COUPLE_NAMES', 'EVENT_DATE', 'VENUE_NAME', 'VENUE_ADDRESS', 'RSVP_DEADLINE', 'RSVP_LINK'],
    usageCount: 245,
    lastUsed: new Date('2024-01-15')
  },
  {
    id: '2',
    name: 'RSVP Reminder',
    type: 'reminder',
    subject: 'Gentle Reminder: RSVP for {{COUPLE_NAMES}}\'s Wedding',
    content: 'Hi {{GUEST_NAME}},\n\nWe hope you received our wedding invitation! We haven\'t received your RSVP yet and wanted to gently remind you.\n\nDeadline: {{RSVP_DEADLINE}}\nRSVP Link: {{RSVP_LINK}}\n\nLooking forward to celebrating with you!\n\n{{COUPLE_NAMES}}',
    variables: ['GUEST_NAME', 'COUPLE_NAMES', 'RSVP_DEADLINE', 'RSVP_LINK'],
    usageCount: 89,
    lastUsed: new Date('2024-01-20')
  }
]

const COMMUNICATION_LOGS: CommunicationLog[] = [
  {
    id: '1',
    type: 'email',
    template: 'Wedding Invitation',
    recipients: 250,
    status: 'delivered',
    sentAt: new Date('2024-01-15T10:00:00'),
    deliveredCount: 248,
    failedCount: 2
  },
  {
    id: '2',
    type: 'whatsapp',
    template: 'RSVP Reminder',
    recipients: 89,
    status: 'sent',
    sentAt: new Date('2024-01-20T14:30:00'),
    deliveredCount: 86,
    failedCount: 3
  }
]

export default function CommunicationCenter() {
  const [activeTab, setActiveTab] = useState('templates')
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [sendProgress, setSendProgress] = useState(0)

  const handleSendBulk = async (templateId: string, recipients: string[]) => {
    setIsSending(true)
    setSendProgress(0)

    // Simulate sending progress
    const interval = setInterval(() => {
      setSendProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsSending(false)
          return 100
        }
        return prev + 5
      })
    }, 100)
  }

  const previewTemplate = (template: Template) => {
    const sampleData = {
      'GUEST_NAME': 'John Smith',
      'COUPLE_NAMES': 'Sarah & Michael',
      'EVENT_DATE': 'June 15, 2024',
      'VENUE_NAME': 'The Grand Ballroom',
      'VENUE_ADDRESS': '123 Wedding Lane, City, State',
      'RSVP_DEADLINE': 'May 15, 2024',
      'RSVP_LINK': 'https://wedding.com/rsvp/abc123'
    }

    let previewContent = template.content
    template.variables.forEach(variable => {
      previewContent = previewContent.replace(
        new RegExp(`{{${variable}}}`, 'g'), 
        sampleData[variable as keyof typeof sampleData] || `{{${variable}}}`
      )
    })

    return previewContent
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'success'
      case 'sent': return 'pending'
      case 'failed': return 'destructive'
      case 'pending': return 'secondary'
      default: return 'secondary'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="w-4 h-4" />
      case 'whatsapp': return <MessageSquare className="w-4 h-4" />
      case 'sms': return <MessageSquare className="w-4 h-4" />
      default: return <Mail className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Communication Center</h1>
          <p className="text-gray-600 mt-2">
            Manage templates and send bulk communications to your guests
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="compose">Compose</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Message Templates</h2>
              <Button onClick={() => setIsTemplateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                New Template
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {SAMPLE_TEMPLATES.map((template) => (
                <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{template.type}</Badge>
                      <div className="flex space-x-1">
                        <Button size="sm" variant="ghost" onClick={() => setSelectedTemplate(template)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription>{template.subject}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div>Variables: {template.variables.length}</div>
                      <div>Used: {template.usageCount} times</div>
                      {template.lastUsed && (
                        <div>Last used: {template.lastUsed.toLocaleDateString()}</div>
                      )}
                    </div>
                    <Button className="w-full mt-4" size="sm">
                      Use Template
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Compose Tab */}
          <TabsContent value="compose" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Compose Message</CardTitle>
                <CardDescription>
                  Create and send bulk messages to your guests
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>Select Recipients</Label>
                    <div className="space-y-2 mt-2">
                      <Button variant="outline" className="w-full justify-start">
                        <Users className="w-4 h-4 mr-2" />
                        All Guests (245)
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Filter className="w-4 h-4 mr-2" />
                        Pending RSVP (89)
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Filter className="w-4 h-4 mr-2" />
                        Bride's Side (120)
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Communication Method</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      <Button variant="outline" className="flex-col h-16">
                        <Mail className="w-5 h-5 mb-1" />
                        Email
                      </Button>
                      <Button variant="outline" className="flex-col h-16">
                        <MessageSquare className="w-5 h-5 mb-1" />
                        WhatsApp
                      </Button>
                      <Button variant="outline" className="flex-col h-16" disabled>
                        <MessageSquare className="w-5 h-5 mb-1" />
                        SMS
                      </Button>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input 
                    id="subject" 
                    placeholder="Enter email subject..." 
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea 
                    id="message" 
                    placeholder="Type your message here..."
                    rows={8}
                    className="mt-1"
                  />
                </div>

                <Alert>
                  <Settings className="h-4 w-4" />
                  <AlertDescription>
                    Use variables like {{GUEST_NAME}}, {{COUPLE_NAMES}}, {{RSVP_LINK}} for personalization
                  </AlertDescription>
                </Alert>

                {isSending ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Sending messages...</span>
                      <span className="text-sm text-gray-600">{sendProgress}%</span>
                    </div>
                    <Progress value={sendProgress} />
                  </div>
                ) : (
                  <div className="flex space-x-3">
                    <Button className="flex-1">
                      <Send className="w-4 h-4 mr-2" />
                      Send to All Recipients
                    </Button>
                    <Button variant="outline">
                      <Eye className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Communication History</h2>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Logs
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Communications</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Template</TableHead>
                      <TableHead>Recipients</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Sent At</TableHead>
                      <TableHead>Delivery Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {COMMUNICATION_LOGS.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getTypeIcon(log.type)}
                            <span className="capitalize">{log.type}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{log.template}</TableCell>
                        <TableCell>{log.recipients}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(log.status) as any}>
                            {log.status === 'delivered' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                            {log.status === 'sent' && <Clock className="w-3 h-3 mr-1" />}
                            {log.status === 'failed' && <AlertTriangle className="w-3 h-3 mr-1" />}
                            {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>{log.sentAt.toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm">
                              {Math.round((log.deliveredCount / log.recipients) * 100)}%
                            </span>
                            <span className="text-xs text-gray-500">
                              ({log.deliveredCount}/{log.recipients})
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Email Configuration</CardTitle>
                  <CardDescription>Configure your email provider settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Email Provider</Label>
                    <select className="w-full mt-1 p-2 border rounded-md">
                      <option>Resend (Active)</option>
                      <option>SendGrid</option>
                      <option>Gmail OAuth2</option>
                      <option>SMTP</option>
                    </select>
                  </div>
                  <div>
                    <Label>From Name</Label>
                    <Input placeholder="Sarah & Michael" />
                  </div>
                  <div>
                    <Label>From Email</Label>
                    <Input placeholder="wedding@yourdomain.com" />
                  </div>
                  <Button>Save Email Settings</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>WhatsApp Configuration</CardTitle>
                  <CardDescription>Set up WhatsApp Business API</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <MessageSquare className="h-4 w-4" />
                    <AlertDescription>
                      WhatsApp Business API requires approval and phone number verification
                    </AlertDescription>
                  </Alert>
                  <div>
                    <Label>Business Phone Number</Label>
                    <Input placeholder="+1234567890" />
                  </div>
                  <div>
                    <Label>Access Token</Label>
                    <Input type="password" placeholder="Enter your access token" />
                  </div>
                  <Button variant="outline" disabled>
                    Configure WhatsApp (Coming Soon)
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Template Preview Dialog */}
        <Dialog open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Template Preview: {selectedTemplate?.name}</DialogTitle>
            </DialogHeader>
            {selectedTemplate && (
              <div className="space-y-4">
                <div>
                  <Label>Subject Preview</Label>
                  <div className="p-3 bg-gray-50 rounded-md mt-1">
                    {selectedTemplate.subject.replace(/{{(\w+)}}/g, (match, variable) => {
                      const sampleData: any = {
                        'GUEST_NAME': 'John Smith',
                        'COUPLE_NAMES': 'Sarah & Michael',
                        'EVENT_DATE': 'June 15, 2024'
                      }
                      return sampleData[variable] || match
                    })}
                  </div>
                </div>
                <div>
                  <Label>Message Preview</Label>
                  <div className="p-3 bg-gray-50 rounded-md mt-1 whitespace-pre-wrap">
                    {previewTemplate(selectedTemplate)}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={() => {setSelectedTemplate(null); setActiveTab('compose')}}>
                    Use This Template
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}