import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Loader2, Save } from 'lucide-react';

// Schema for email style form
const emailStyleSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  headerLogo: z.string().optional(),
  headerBackground: z.string().optional(),
  bodyBackground: z.string().optional(),
  textColor: z.string().default('#000000'),
  linkColor: z.string().default('#0000FF'),
  buttonColor: z.string().default('#D4AF37'),
  buttonTextColor: z.string().default('#FFFFFF'),
  fontFamily: z.string().default('Arial, sans-serif'),
  fontSize: z.string().default('16px'),
  borderColor: z.string().default('#DDDDDD'),
  footerText: z.string().optional(),
  footerBackground: z.string().optional(),
  css: z.string().optional(),
  isDefault: z.boolean().default(false)
});

type EmailStyleFormValues = z.infer<typeof emailStyleSchema>;

interface EmailStyleEditorProps {
  eventId: number;
  style: any | null; // The style to edit, null for new style
  onClose: () => void;
}

export default function EmailStyleEditor({ eventId, style, onClose }: EmailStyleEditorProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Create form
  const form = useForm<EmailStyleFormValues>({
    resolver: zodResolver(emailStyleSchema),
    defaultValues: {
      name: style?.name || '',
      description: style?.description || '',
      headerLogo: style?.headerLogo || '',
      headerBackground: style?.headerBackground || '#FFFFFF',
      bodyBackground: style?.bodyBackground || '#FFFFFF',
      textColor: style?.textColor || '#000000',
      linkColor: style?.linkColor || '#0000FF',
      buttonColor: style?.buttonColor || '#D4AF37',
      buttonTextColor: style?.buttonTextColor || '#FFFFFF',
      fontFamily: style?.fontFamily || 'Arial, sans-serif',
      fontSize: style?.fontSize || '16px',
      borderColor: style?.borderColor || '#DDDDDD',
      footerText: style?.footerText || '© {{eventYear}} {{eventName}}. All rights reserved.',
      footerBackground: style?.footerBackground || '#F8F8F8',
      css: style?.css || '',
      isDefault: style?.isDefault || false
    }
  });

  // Create style mutation
  const createStyleMutation = useMutation({
    mutationFn: (data: EmailStyleFormValues) => 
      apiRequest('POST', `/api/events/${eventId}/email-styles`, {
        ...data,
        eventId
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}/email-styles`] });
      toast({
        title: 'Style created',
        description: 'The email style has been created successfully.',
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to create style: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  // Update style mutation
  const updateStyleMutation = useMutation({
    mutationFn: (data: EmailStyleFormValues) => 
      apiRequest('PUT', `/api/events/${eventId}/email-styles/${style.id}`, {
        ...data,
        eventId
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}/email-styles`] });
      toast({
        title: 'Style updated',
        description: 'The email style has been updated successfully.',
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to update style: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  // Handle form submission
  const onSubmit = (values: EmailStyleFormValues) => {
    if (style) {
      updateStyleMutation.mutate(values);
    } else {
      createStyleMutation.mutate(values);
    }
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{style ? 'Edit Email Style' : 'Create Email Style'}</DialogTitle>
          <DialogDescription>
            {style 
              ? 'Update the style settings below.' 
              : 'Create a new email style for your event communications.'}
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
                    <FormLabel>Style Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Classic Gold" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Elegant style with gold accents"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="headerLogo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Header Logo URL</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="URL to your logo image"
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
                name="fontFamily"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Font Family</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Arial, sans-serif"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="headerBackground"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Header Background</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input 
                          type="text"
                          placeholder="#FFFFFF"
                          {...field} 
                        />
                      </FormControl>
                      <Input 
                        type="color"
                        className="w-10 p-1"
                        value={field.value || '#FFFFFF'}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bodyBackground"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Body Background</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input 
                          type="text"
                          placeholder="#FFFFFF"
                          {...field} 
                        />
                      </FormControl>
                      <Input 
                        type="color"
                        className="w-10 p-1"
                        value={field.value || '#FFFFFF'}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="footerBackground"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Footer Background</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input 
                          type="text"
                          placeholder="#F8F8F8"
                          {...field} 
                          value={field.value || ''}
                        />
                      </FormControl>
                      <Input 
                        type="color"
                        className="w-10 p-1"
                        value={field.value || '#F8F8F8'}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="textColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Text Color</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input 
                          type="text"
                          placeholder="#000000"
                          {...field} 
                        />
                      </FormControl>
                      <Input 
                        type="color"
                        className="w-10 p-1"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="linkColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link Color</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input 
                          type="text"
                          placeholder="#0000FF"
                          {...field} 
                        />
                      </FormControl>
                      <Input 
                        type="color"
                        className="w-10 p-1"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="borderColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Border Color</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input 
                          type="text"
                          placeholder="#DDDDDD"
                          {...field} 
                        />
                      </FormControl>
                      <Input 
                        type="color"
                        className="w-10 p-1"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="buttonColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Button Color</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input 
                          type="text"
                          placeholder="#D4AF37"
                          {...field} 
                        />
                      </FormControl>
                      <Input 
                        type="color"
                        className="w-10 p-1"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="buttonTextColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Button Text Color</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input 
                          type="text"
                          placeholder="#FFFFFF"
                          {...field} 
                        />
                      </FormControl>
                      <Input 
                        type="color"
                        className="w-10 p-1"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fontSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Base Font Size</FormLabel>
                    <FormControl>
                      <Input 
                        type="text"
                        placeholder="16px"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="footerText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Footer Text</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., © {{eventYear}} {{eventName}}. All rights reserved."
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
              name="css"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Custom CSS</FormLabel>
                  <FormControl>
                    <Textarea 
                      className="font-mono h-[120px]"
                      placeholder="Additional CSS for advanced styling"
                      {...field} 
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormDescription>
                    For advanced users: Custom CSS to fine-tune the email appearance.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isDefault"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Default Style</FormLabel>
                    <FormDescription>
                      Set as the default style for new email templates
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
                type="submit"
                disabled={createStyleMutation.isPending || updateStyleMutation.isPending}
              >
                {(createStyleMutation.isPending || updateStyleMutation.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                <Save className="mr-2 h-4 w-4" />
                {style ? 'Update Style' : 'Create Style'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}