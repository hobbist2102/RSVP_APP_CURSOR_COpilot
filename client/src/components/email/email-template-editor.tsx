import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Loader2, Save } from 'lucide-react';

// Schema for email template form
const emailTemplateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  subject: z.string().min(1, 'Subject is required'),
  bodyHtml: z.string().min(1, 'HTML content is required'),
  bodyText: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  isDefault: z.boolean().default(false)
});

type EmailTemplateFormValues = z.infer<typeof emailTemplateSchema>;

interface EmailTemplateEditorProps {
  eventId: number;
  template: any | null; // The template to edit, null for new template
  onClose: () => void;
}

export default function EmailTemplateEditor({ eventId, template, onClose }: EmailTemplateEditorProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('html');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Create form
  const form = useForm<EmailTemplateFormValues>({
    resolver: zodResolver(emailTemplateSchema),
    defaultValues: {
      name: template?.name || '',
      description: template?.description || '',
      subject: template?.subject || '',
      bodyHtml: template?.bodyHtml || '<div style="font-family: Arial, sans-serif;"></div>',
      bodyText: template?.bodyText || '',
      category: template?.category || 'invitation',
      isDefault: template?.isDefault || false
    }
  });

  // Fetch email styles for template preview
  const { data: stylesData } = useQuery({
    queryKey: [`/api/events/${eventId}/email-styles`],
    queryFn: () => apiRequest('GET', `/api/events/${eventId}/email-styles`).then(res => res.json()),
  });

  // Fetch email assets for template editor
  const { data: assetsData } = useQuery({
    queryKey: [`/api/events/${eventId}/email-assets`],
    queryFn: () => apiRequest('GET', `/api/events/${eventId}/email-assets`).then(res => res.json()),
  });

  // Create template mutation
  const createTemplateMutation = useMutation({
    mutationFn: (data: EmailTemplateFormValues) => 
      apiRequest('POST', `/api/events/${eventId}/email-templates`, {
        ...data,
        eventId
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}/email-templates`] });
      toast({
        title: 'Template created',
        description: 'The email template has been created successfully.',
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to create template: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  // Update template mutation
  const updateTemplateMutation = useMutation({
    mutationFn: (data: EmailTemplateFormValues) => 
      apiRequest('PUT', `/api/events/${eventId}/email-templates/${template.id}`, {
        ...data,
        eventId
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}/email-templates`] });
      toast({
        title: 'Template updated',
        description: 'The email template has been updated successfully.',
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to update template: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  // Handle form submission
  const onSubmit = (values: EmailTemplateFormValues) => {
    if (template) {
      updateTemplateMutation.mutate(values);
    } else {
      createTemplateMutation.mutate(values);
    }
  };

  // Generate text version from HTML if text version is empty
  const generateTextVersion = () => {
    const htmlContent = form.getValues('bodyHtml');
    // This is a very basic conversion, in a real app you'd want a better HTML-to-text conversion
    let textContent = htmlContent
      .replace(/<div>/g, '')
      .replace(/<\/div>/g, '\n')
      .replace(/<p>/g, '')
      .replace(/<\/p>/g, '\n\n')
      .replace(/<br\s*\/?>/g, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>');
    
    form.setValue('bodyText', textContent);
  };

  // Preview the template with data
  const handlePreview = () => {
    setIsPreviewOpen(true);
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{template ? 'Edit Email Template' : 'Create Email Template'}</DialogTitle>
          <DialogDescription>
            {template 
              ? 'Update the template content and settings below.' 
              : 'Create a new email template for your event communications.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Template Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., RSVP Invitation" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select 
                      value={field.value} 
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="invitation">Invitation</SelectItem>
                        <SelectItem value="confirmation">Confirmation</SelectItem>
                        <SelectItem value="reminder">Reminder</SelectItem>
                        <SelectItem value="update">Update</SelectItem>
                        <SelectItem value="travel">Travel Information</SelectItem>
                        <SelectItem value="accommodation">Accommodation</SelectItem>
                        <SelectItem value="thankyou">Thank You</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Brief description of this template's purpose"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Subject</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., {{eventName}} - You're Invited!"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            <Tabs 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="html">HTML Content</TabsTrigger>
                <TabsTrigger value="text">Text Content</TabsTrigger>
              </TabsList>

              <TabsContent value="html" className="space-y-4">
                <FormField
                  control={form.control}
                  name="bodyHtml"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>HTML Content</FormLabel>
                      <FormControl>
                        <Textarea 
                          className="font-mono h-[300px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="text-sm text-gray-500">
                  <h4 className="font-medium mb-1">Available Variables:</h4>
                  <ul className="list-disc pl-5 grid grid-cols-2 gap-x-4">
                    <li><code>{'{{eventName}}'}</code> - Name of the event</li>
                    <li><code>{'{{guestName}}'}</code> - Guest's full name</li>
                    <li><code>{'{{coupleName}}'}</code> - Couple's names</li>
                    <li><code>{'{{eventDate}}'}</code> - Event date</li>
                    <li><code>{'{{eventLocation}}'}</code> - Event location</li>
                    <li><code>{'{{rsvpLink}}'}</code> - RSVP response link</li>
                    <li><code>{'{{rsvpDeadline}}'}</code> - RSVP deadline</li>
                    <li><code>{'{{headerLogo}}'}</code> - Header logo URL</li>
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="text" className="space-y-4">
                <div className="flex justify-end mb-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={generateTextVersion}
                  >
                    Generate from HTML
                  </Button>
                </div>

                <FormField
                  control={form.control}
                  name="bodyText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plain Text Content</FormLabel>
                      <FormControl>
                        <Textarea 
                          className="font-mono h-[300px]"
                          placeholder="Plain text version of the email (for email clients that don't support HTML)"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>

            <FormField
              control={form.control}
              name="isDefault"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Default Template</FormLabel>
                    <FormDescription>
                      Set as the default template for this category
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                variant="secondary"
                onClick={handlePreview}
                className="mr-2"
              >
                Preview
              </Button>
              <Button 
                type="submit"
                disabled={createTemplateMutation.isPending || updateTemplateMutation.isPending}
              >
                {(createTemplateMutation.isPending || updateTemplateMutation.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                <Save className="mr-2 h-4 w-4" />
                {template ? 'Update Template' : 'Create Template'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}