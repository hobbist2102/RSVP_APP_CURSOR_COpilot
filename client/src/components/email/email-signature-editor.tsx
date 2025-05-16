import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription 
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Loader2, PenTool, Edit, Trash2, Save, Plus, Copy } from 'lucide-react';

interface EmailSignatureEditorProps {
  eventId: number;
}

// Schema for email signature form
const emailSignatureSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  content: z.string().min(1, 'HTML content is required'),
  plainText: z.string().optional(),
  includesSocialLinks: z.boolean().default(false),
  isDefault: z.boolean().default(false),
});

type EmailSignatureFormValues = z.infer<typeof emailSignatureSchema>;

type EmailSignature = {
  id: number;
  name: string;
  content: string;
  plainText?: string;
  includesSocialLinks: boolean;
  socialLinks?: any;
  isDefault: boolean;
};

export default function EmailSignatureEditor({ eventId }: EmailSignatureEditorProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingSignature, setEditingSignature] = useState<EmailSignature | null>(null);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);

  // Fetch email signatures
  const { data: signaturesData, isLoading: signaturesLoading } = useQuery({
    queryKey: [`/api/events/${eventId}/email-signatures`],
    queryFn: () => apiRequest('GET', `/api/events/${eventId}/email-signatures`).then(res => res.json()),
  });

  // Create signature mutation
  const createSignatureMutation = useMutation({
    mutationFn: (data: EmailSignatureFormValues) => 
      apiRequest('POST', `/api/events/${eventId}/email-signatures`, {
        ...data,
        eventId,
        socialLinks: data.includesSocialLinks ? JSON.stringify({
          instagram: true,
          facebook: true,
          website: true
        }) : null
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}/email-signatures`] });
      toast({
        title: 'Signature created',
        description: 'The email signature has been created successfully.',
      });
      setIsEditorOpen(false);
      setEditingSignature(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to create signature: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  // Update signature mutation
  const updateSignatureMutation = useMutation({
    mutationFn: (data: EmailSignatureFormValues & { id: number }) => 
      apiRequest('PUT', `/api/events/${eventId}/email-signatures/${data.id}`, {
        name: data.name,
        content: data.content,
        plainText: data.plainText,
        includesSocialLinks: data.includesSocialLinks,
        socialLinks: data.includesSocialLinks ? JSON.stringify({
          instagram: true,
          facebook: true,
          website: true
        }) : null,
        isDefault: data.isDefault
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}/email-signatures`] });
      toast({
        title: 'Signature updated',
        description: 'The email signature has been updated successfully.',
      });
      setIsEditorOpen(false);
      setEditingSignature(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to update signature: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  // Delete signature mutation
  const deleteSignatureMutation = useMutation({
    mutationFn: (signatureId: number) => 
      apiRequest('DELETE', `/api/events/${eventId}/email-signatures/${signatureId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}/email-signatures`] });
      toast({
        title: 'Signature deleted',
        description: 'The email signature has been deleted successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to delete signature: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  // Initialize form
  const form = useForm<EmailSignatureFormValues>({
    resolver: zodResolver(emailSignatureSchema),
    defaultValues: {
      name: editingSignature?.name || '',
      content: editingSignature?.content || '',
      plainText: editingSignature?.plainText || '',
      includesSocialLinks: editingSignature?.includesSocialLinks || false,
      isDefault: editingSignature?.isDefault || false
    }
  });

  // Open editor with a signature to edit
  const openEditor = (signature?: EmailSignature) => {
    if (signature) {
      setEditingSignature(signature);
      form.reset({
        name: signature.name,
        content: signature.content,
        plainText: signature.plainText || '',
        includesSocialLinks: signature.includesSocialLinks,
        isDefault: signature.isDefault
      });
    } else {
      setEditingSignature(null);
      form.reset({
        name: '',
        content: defaultSignatureTemplate,
        plainText: '',
        includesSocialLinks: false,
        isDefault: false
      });
    }
    setIsEditorOpen(true);
  };

  // Handle form submission
  const onSubmit = (values: EmailSignatureFormValues) => {
    if (editingSignature) {
      updateSignatureMutation.mutate({ ...values, id: editingSignature.id });
    } else {
      createSignatureMutation.mutate(values);
    }
  };

  // Generate plain text from HTML
  const generatePlainText = () => {
    const htmlContent = form.getValues('content');
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
    
    form.setValue('plainText', textContent);
  };

  // Preview signature
  const previewSignature = (signature: EmailSignature) => {
    setSignaturePreview(signature.content);
  };

  // Default signature template
  const defaultSignatureTemplate = `
<div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-family: Arial, sans-serif;">
  <p style="margin: 0;">Warm regards,</p>
  <p style="margin: 5px 0; font-weight: bold;">{{brideName}} & {{groomName}}</p>
  
  {{#if includesSocialLinks}}
  <div style="margin-top: 10px;">
    {{#if instagramUrl}}<a href="{{instagramUrl}}" style="display: inline-block; margin-right: 10px;"><img src="{{instagramIcon}}" alt="Instagram" style="width: 24px; height: 24px;"></a>{{/if}}
    {{#if facebookUrl}}<a href="{{facebookUrl}}" style="display: inline-block; margin-right: 10px;"><img src="{{facebookIcon}}" alt="Facebook" style="width: 24px; height: 24px;"></a>{{/if}}
    {{#if websiteUrl}}<a href="{{websiteUrl}}" style="display: inline-block;"><img src="{{websiteIcon}}" alt="Website" style="width: 24px; height: 24px;"></a>{{/if}}
  </div>
  {{/if}}
</div>
  `;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Email Signatures</h2>
        <Button onClick={() => openEditor()}>
          <Plus className="mr-2 h-4 w-4" /> New Signature
        </Button>
      </div>

      {signaturesLoading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : signaturesData?.signatures?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {signaturesData.signatures.map((signature: EmailSignature) => (
            <Card key={signature.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{signature.name}</CardTitle>
                  {signature.isDefault && (
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">Default</span>
                  )}
                </div>
                <CardDescription>
                  {signature.includesSocialLinks ? 'Includes social links' : 'Basic signature'}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div 
                  className="border rounded-md p-3 bg-gray-50 overflow-hidden"
                  style={{ maxHeight: '100px' }}
                >
                  <div
                    className="text-sm"
                    dangerouslySetInnerHTML={{ 
                      __html: signature.content
                        .replace(/{{brideName}}/g, 'Priya')
                        .replace(/{{groomName}}/g, 'Raj') 
                    }}
                  />
                </div>
              </CardContent>
              <CardFooter className="pt-0 flex justify-end">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => previewSignature(signature)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => openEditor(signature)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this signature?')) {
                      deleteSignatureMutation.mutate(signature.id);
                    }
                  }}
                  disabled={deleteSignatureMutation.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center p-10 border rounded-lg">
          <PenTool className="h-10 w-10 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium">No signatures found</h3>
          <p className="text-sm text-gray-500 mb-4">
            Create your first email signature to add a professional touch to your communications.
          </p>
          <Button onClick={() => openEditor()}>
            <Plus className="mr-2 h-4 w-4" /> Create Signature
          </Button>
        </div>
      )}

      {/* Signature Editor Dialog */}
      <Dialog open={isEditorOpen} onOpenChange={(open) => !open && setIsEditorOpen(false)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingSignature ? 'Edit Email Signature' : 'Create Email Signature'}
            </DialogTitle>
            <DialogDescription>
              {editingSignature 
                ? 'Update your email signature settings below.' 
                : 'Create a new signature for your email communications.'}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Signature Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Formal Signature" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>HTML Content</FormLabel>
                    <FormControl>
                      <Textarea 
                        className="font-mono h-[200px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Use variables like {"{{"} brideName {"}}"}, {"{{"} groomName {"}}"}, and social media placeholders.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end mb-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={generatePlainText}
                >
                  Generate Plain Text
                </Button>
              </div>

              <FormField
                control={form.control}
                name="plainText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plain Text Version</FormLabel>
                    <FormControl>
                      <Textarea 
                        className="font-mono h-[100px]"
                        placeholder="Plain text version of the signature (for email clients that don't support HTML)"
                        {...field} 
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="includesSocialLinks"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Include Social Media Links</FormLabel>
                      <FormDescription>
                        Enable to include social media icons and links in the signature
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

              <FormField
                control={form.control}
                name="isDefault"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Default Signature</FormLabel>
                      <FormDescription>
                        Set as the default signature for new emails
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
                  onClick={() => setIsEditorOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={createSignatureMutation.isPending || updateSignatureMutation.isPending}
                >
                  {(createSignatureMutation.isPending || updateSignatureMutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  <Save className="mr-2 h-4 w-4" />
                  {editingSignature ? 'Update Signature' : 'Create Signature'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Signature Preview Dialog */}
      <Dialog open={!!signaturePreview} onOpenChange={(open) => !open && setSignaturePreview(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Signature Preview</DialogTitle>
          </DialogHeader>
          
          <div className="border rounded-lg p-4 bg-white">
            <div
              dangerouslySetInnerHTML={{ 
                __html: signaturePreview
                  ?.replace(/{{brideName}}/g, 'Priya')
                  .replace(/{{groomName}}/g, 'Raj')
                  .replace(/{{instagramUrl}}/g, 'https://instagram.com/')
                  .replace(/{{facebookUrl}}/g, 'https://facebook.com/')
                  .replace(/{{websiteUrl}}/g, 'https://example.com/')
                  .replace(/{{instagramIcon}}/g, 'https://cdn.jsdelivr.net/npm/simple-icons@v5/icons/instagram.svg')
                  .replace(/{{facebookIcon}}/g, 'https://cdn.jsdelivr.net/npm/simple-icons@v5/icons/facebook.svg')
                  .replace(/{{websiteIcon}}/g, 'https://cdn.jsdelivr.net/npm/simple-icons@v5/icons/internetexplorer.svg')
                || ''
              }}
            />
          </div>
          
          <DialogFooter>
            <Button onClick={() => setSignaturePreview(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}