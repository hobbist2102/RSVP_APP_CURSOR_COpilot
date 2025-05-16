import React, { useState } from 'react';
import { useParams } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Plus, Edit, Trash2, Copy, Eye, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import EmailTemplateEditor from '@/components/email/email-template-editor';
import EmailStyleEditor from '@/components/email/email-style-editor';
import EmailAssetManager from '@/components/email/email-asset-manager';
import EmailSignatureEditor from '@/components/email/email-signature-editor';
import EmailTemplatePreview from '@/components/email/email-template-preview';

type EmailTemplate = {
  id: number;
  name: string;
  description: string;
  subject: string;
  category: string;
  isDefault: boolean;
  isSystem: boolean;
};

type EmailStyle = {
  id: number;
  name: string;
  description: string;
  headerLogo?: string;
  headerBackground?: string;
  bodyBackground?: string;
  isDefault: boolean;
};

export default function EmailTemplatesPage() {
  const { eventId } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('templates');
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<EmailStyle | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // Fetch email templates
  const { data: templatesData, isLoading: templatesLoading } = useQuery({
    queryKey: [`/api/events/${eventId}/email-templates`],
    queryFn: () => apiRequest('GET', `/api/events/${eventId}/email-templates`).then(res => res.json()),
  });

  // Fetch email styles
  const { data: stylesData, isLoading: stylesLoading } = useQuery({
    queryKey: [`/api/events/${eventId}/email-styles`],
    queryFn: () => apiRequest('GET', `/api/events/${eventId}/email-styles`).then(res => res.json()),
  });

  // Delete template mutation
  const deleteTemplateMutation = useMutation({
    mutationFn: (templateId: number) => 
      apiRequest('DELETE', `/api/events/${eventId}/email-templates/${templateId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}/email-templates`] });
      toast({
        title: 'Template deleted',
        description: 'The email template has been deleted successfully.',
      });
      setSelectedTemplate(null);
      setEditMode(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to delete template: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Delete style mutation
  const deleteStyleMutation = useMutation({
    mutationFn: (styleId: number) => 
      apiRequest('DELETE', `/api/events/${eventId}/email-styles/${styleId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}/email-styles`] });
      toast({
        title: 'Style deleted',
        description: 'The email style has been deleted successfully.',
      });
      setSelectedStyle(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to delete style: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Duplicate template mutation
  const duplicateTemplateMutation = useMutation({
    mutationFn: (template: EmailTemplate) => 
      apiRequest('POST', `/api/events/${eventId}/email-templates`, {
        ...template,
        name: `${template.name} (Copy)`,
        isDefault: false,
        isSystem: false,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}/email-templates`] });
      toast({
        title: 'Template duplicated',
        description: 'The email template has been duplicated successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to duplicate template: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Handle template selection
  const handleTemplateSelect = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setEditMode(false);
    setPreviewMode(false);
  };

  // Handle style selection
  const handleStyleSelect = (style: EmailStyle) => {
    setSelectedStyle(style);
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSelectedTemplate(null);
    setSelectedStyle(null);
    setEditMode(false);
    setPreviewMode(false);
  };

  // Edit template
  const handleEditTemplate = () => {
    setEditMode(true);
    setPreviewMode(false);
  };

  // Preview template
  const handlePreviewTemplate = () => {
    setPreviewMode(true);
    setEditMode(false);
  };

  // Handle template editor close
  const handleEditorClose = () => {
    setEditMode(false);
    queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}/email-templates`] });
  };

  // Handle template preview close
  const handlePreviewClose = () => {
    setPreviewMode(false);
  };

  // Render template card
  const renderTemplateCard = (template: EmailTemplate) => {
    const isSelected = selectedTemplate?.id === template.id;
    
    return (
      <Card 
        key={template.id} 
        className={`mb-4 cursor-pointer hover:bg-gray-50 ${isSelected ? 'border-primary' : ''}`}
        onClick={() => handleTemplateSelect(template)}
      >
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">{template.name}</CardTitle>
              <CardDescription>{template.category}</CardDescription>
            </div>
            <div className="flex space-x-2">
              {template.isDefault && (
                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">Default</span>
              )}
              {template.isSystem && (
                <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">System</span>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <p className="text-sm text-gray-500">{template.description || 'No description'}</p>
          <p className="text-sm mt-2"><span className="font-semibold">Subject:</span> {template.subject}</p>
        </CardContent>
        <CardFooter className="pt-0 flex justify-end">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={(e) => {
              e.stopPropagation();
              handleTemplateSelect(template);
              handlePreviewTemplate();
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={(e) => {
              e.stopPropagation();
              handleTemplateSelect(template);
              handleEditTemplate();
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={(e) => {
              e.stopPropagation();
              duplicateTemplateMutation.mutate(template);
            }}
            disabled={duplicateTemplateMutation.isPending}
          >
            <Copy className="h-4 w-4" />
          </Button>
          {!template.isSystem && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={(e) => {
                e.stopPropagation();
                if (confirm('Are you sure you want to delete this template?')) {
                  deleteTemplateMutation.mutate(template.id);
                }
              }}
              disabled={deleteTemplateMutation.isPending}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      </Card>
    );
  };

  // Render style card
  const renderStyleCard = (style: EmailStyle) => {
    const isSelected = selectedStyle?.id === style.id;
    
    return (
      <Card 
        key={style.id} 
        className={`mb-4 cursor-pointer hover:bg-gray-50 ${isSelected ? 'border-primary' : ''}`}
        onClick={() => handleStyleSelect(style)}
      >
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">{style.name}</CardTitle>
              <CardDescription>{style.description || 'No description'}</CardDescription>
            </div>
            {style.isDefault && (
              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">Default</span>
            )}
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="flex space-x-2 mt-2">
            {style.headerBackground && (
              <div 
                className="w-6 h-6 rounded border"
                style={{ backgroundColor: style.headerBackground }}
                title="Header Background"
              />
            )}
            {style.bodyBackground && (
              <div 
                className="w-6 h-6 rounded border"
                style={{ backgroundColor: style.bodyBackground }}
                title="Body Background"
              />
            )}
          </div>
        </CardContent>
        <CardFooter className="pt-0 flex justify-end">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={(e) => {
              e.stopPropagation();
              // Handle edit style
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={(e) => {
              e.stopPropagation();
              if (confirm('Are you sure you want to delete this style?')) {
                deleteStyleMutation.mutate(style.id);
              }
            }}
            disabled={deleteStyleMutation.isPending}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Email Design</h1>
        <Button 
          variant="default" 
          size="sm" 
          onClick={() => {
            if (activeTab === 'templates') {
              setSelectedTemplate(null);
              setEditMode(true);
            } else if (activeTab === 'styles') {
              // Open style editor
            }
          }}
        >
          <Plus className="h-4 w-4 mr-2" /> 
          {activeTab === 'templates' ? 'New Template' : 
           activeTab === 'styles' ? 'New Style' : 
           activeTab === 'assets' ? 'Upload Asset' : 'New Signature'}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="styles">Styles</TabsTrigger>
          <TabsTrigger value="assets">Assets</TabsTrigger>
          <TabsTrigger value="signatures">Signatures</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          {templatesLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : templatesData?.templates?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templatesData.templates.map((template: EmailTemplate) => renderTemplateCard(template))}
            </div>
          ) : (
            <div className="text-center py-10">
              <h3 className="text-lg font-medium">No email templates found</h3>
              <p className="text-gray-500 mt-2">Create your first email template to get started.</p>
              <Button 
                className="mt-4" 
                onClick={() => {
                  setSelectedTemplate(null);
                  setEditMode(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" /> Create Template
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="styles" className="space-y-4">
          {stylesLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : stylesData?.styles?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stylesData.styles.map((style: EmailStyle) => renderStyleCard(style))}
            </div>
          ) : (
            <div className="text-center py-10">
              <h3 className="text-lg font-medium">No email styles found</h3>
              <p className="text-gray-500 mt-2">Create your first email style to get started.</p>
              <Button className="mt-4">
                <Plus className="h-4 w-4 mr-2" /> Create Style
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="assets">
          <EmailAssetManager eventId={Number(eventId)} />
        </TabsContent>

        <TabsContent value="signatures">
          <EmailSignatureEditor eventId={Number(eventId)} />
        </TabsContent>
      </Tabs>

      {editMode && (
        <EmailTemplateEditor 
          eventId={Number(eventId)} 
          template={selectedTemplate} 
          onClose={handleEditorClose} 
        />
      )}

      {previewMode && selectedTemplate && (
        <EmailTemplatePreview
          eventId={Number(eventId)}
          templateId={selectedTemplate.id}
          onClose={handlePreviewClose}
        />
      )}
    </div>
  );
}