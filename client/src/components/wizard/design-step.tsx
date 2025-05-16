import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Loader2, Image, Upload, Palette, Type, Trash2 } from "lucide-react";
import { WeddingEvent } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";

// Define schema for design styles
const designStyleSchema = z.object({
  colorPrimary: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
    message: "Must be a valid hex color code",
  }),
  colorSecondary: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
    message: "Must be a valid hex color code",
  }),
  colorAccent: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
    message: "Must be a valid hex color code",
  }),
  fontPrimary: z.string(),
  fontSecondary: z.string(),
  styleTheme: z.enum(["classic", "modern", "traditional", "minimalist", "custom"]),
});

// Define schema for digital assets
const digitalAssetsSchema = z.object({
  bannerImage: z.string().optional(),
  logoImage: z.string().optional(),
  backgroundPattern: z.string().optional(),
  couplePhoto: z.string().optional(),
  emailHeader: z.string().optional(),
  emailFooter: z.string().optional(),
});

// Define schema for customization options
const customizationSchema = z.object({
  rsvpButtonStyle: z.enum(["rounded", "square", "pill"]).default("rounded"),
  cardStyle: z.enum(["bordered", "filled", "minimal"]).default("bordered"),
  animationsEnabled: z.boolean().default(true),
  customCss: z.string().optional(),
});

// Define combined schema for design settings
const designStepSchema = z.object({
  designStyle: designStyleSchema,
  digitalAssets: digitalAssetsSchema,
  customization: customizationSchema,
});

type DesignStyleData = z.infer<typeof designStyleSchema>;
type DigitalAssetsData = z.infer<typeof digitalAssetsSchema>;
type CustomizationData = z.infer<typeof customizationSchema>;
type DesignStepData = z.infer<typeof designStepSchema>;

interface DesignStepProps {
  eventId: string;
  currentEvent: WeddingEvent | undefined;
  onComplete: (data: DesignStepData) => void;
  isCompleted: boolean;
}

export default function DesignStep({
  eventId,
  currentEvent,
  onComplete,
  isCompleted,
}: DesignStepProps) {
  // Fetch existing design settings
  const { 
    data: designSettings, 
    isLoading: isLoadingSettings 
  } = useQuery({
    queryKey: [`/api/events/${eventId}/design-settings`],
    enabled: !!eventId,
  });

  // State for file uploads
  const [uploads, setUploads] = useState<{[key: string]: string}>({});
  const [isUploading, setIsUploading] = useState<{[key: string]: boolean}>({});

  // Create form
  const form = useForm<DesignStepData>({
    resolver: zodResolver(designStepSchema),
    defaultValues: {
      designStyle: {
        colorPrimary: designSettings?.colorPrimary || "#F472B6", // Pink
        colorSecondary: designSettings?.colorSecondary || "#4F46E5", // Indigo
        colorAccent: designSettings?.colorAccent || "#F59E0B", // Amber
        fontPrimary: designSettings?.fontPrimary || "Playfair Display",
        fontSecondary: designSettings?.fontSecondary || "Lato",
        styleTheme: designSettings?.styleTheme || "classic",
      },
      digitalAssets: {
        bannerImage: designSettings?.bannerImage || "",
        logoImage: designSettings?.logoImage || "",
        backgroundPattern: designSettings?.backgroundPattern || "",
        couplePhoto: designSettings?.couplePhoto || "",
        emailHeader: designSettings?.emailHeader || "",
        emailFooter: designSettings?.emailFooter || "",
      },
      customization: {
        rsvpButtonStyle: designSettings?.rsvpButtonStyle || "rounded",
        cardStyle: designSettings?.cardStyle || "bordered",
        animationsEnabled: designSettings?.animationsEnabled ?? true,
        customCss: designSettings?.customCss || "",
      },
    },
  });

  // Handle file upload
  const handleFileUpload = async (field: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    setIsUploading({...isUploading, [field]: true});
    
    // Create FormData
    const formData = new FormData();
    formData.append('file', file);
    formData.append('eventId', eventId);
    formData.append('type', field);
    
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Update form value
        form.setValue(`digitalAssets.${field}` as any, data.url);
        // Update preview
        setUploads({...uploads, [field]: data.url});
      } else {
        console.error('Upload failed:', data.message);
      }
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading({...isUploading, [field]: false});
    }
  };

  // Submit handler
  function onSubmit(data: DesignStepData) {
    onComplete(data);
  }

  // Set theme
  const setTheme = (theme: string) => {
    switch(theme) {
      case 'classic':
        form.setValue('designStyle.colorPrimary', '#F472B6'); // Pink
        form.setValue('designStyle.colorSecondary', '#4F46E5'); // Indigo
        form.setValue('designStyle.colorAccent', '#F59E0B'); // Amber
        form.setValue('designStyle.fontPrimary', 'Playfair Display');
        form.setValue('designStyle.fontSecondary', 'Lato');
        break;
      case 'modern':
        form.setValue('designStyle.colorPrimary', '#10B981'); // Emerald
        form.setValue('designStyle.colorSecondary', '#3B82F6'); // Blue
        form.setValue('designStyle.colorAccent', '#EC4899'); // Pink
        form.setValue('designStyle.fontPrimary', 'Montserrat');
        form.setValue('designStyle.fontSecondary', 'Roboto');
        break;
      case 'traditional':
        form.setValue('designStyle.colorPrimary', '#B91C1C'); // Red
        form.setValue('designStyle.colorSecondary', '#9D174D'); // Pink
        form.setValue('designStyle.colorAccent', '#D97706'); // Amber
        form.setValue('designStyle.fontPrimary', 'Cormorant Garamond');
        form.setValue('designStyle.fontSecondary', 'Source Sans Pro');
        break;
      case 'minimalist':
        form.setValue('designStyle.colorPrimary', '#1F2937'); // Gray
        form.setValue('designStyle.colorSecondary', '#6B7280'); // Gray
        form.setValue('designStyle.colorAccent', '#4B5563'); // Gray
        form.setValue('designStyle.fontPrimary', 'Inter');
        form.setValue('designStyle.fontSecondary', 'Inter');
        break;
    }
    form.setValue('designStyle.styleTheme', theme as any);
  };

  if (isLoadingSettings) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2">Loading design settings...</p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="colors" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="colors">Colors & Fonts</TabsTrigger>
            <TabsTrigger value="assets">Digital Assets</TabsTrigger>
            <TabsTrigger value="custom">Customization</TabsTrigger>
          </TabsList>

          <TabsContent value="colors" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Design Theme</CardTitle>
                <CardDescription>
                  Choose a pre-defined theme or customize your own
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div 
                    className={`cursor-pointer p-3 rounded-md border hover:border-primary ${form.watch('designStyle.styleTheme') === 'classic' ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => setTheme('classic')}
                  >
                    <div className="h-12 rounded overflow-hidden grid grid-cols-3">
                      <div className="bg-[#F472B6]"></div>
                      <div className="bg-[#4F46E5]"></div>
                      <div className="bg-[#F59E0B]"></div>
                    </div>
                    <p className="mt-2 text-center text-sm font-medium">Classic</p>
                  </div>
                  <div 
                    className={`cursor-pointer p-3 rounded-md border hover:border-primary ${form.watch('designStyle.styleTheme') === 'modern' ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => setTheme('modern')}
                  >
                    <div className="h-12 rounded overflow-hidden grid grid-cols-3">
                      <div className="bg-[#10B981]"></div>
                      <div className="bg-[#3B82F6]"></div>
                      <div className="bg-[#EC4899]"></div>
                    </div>
                    <p className="mt-2 text-center text-sm font-medium">Modern</p>
                  </div>
                  <div 
                    className={`cursor-pointer p-3 rounded-md border hover:border-primary ${form.watch('designStyle.styleTheme') === 'traditional' ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => setTheme('traditional')}
                  >
                    <div className="h-12 rounded overflow-hidden grid grid-cols-3">
                      <div className="bg-[#B91C1C]"></div>
                      <div className="bg-[#9D174D]"></div>
                      <div className="bg-[#D97706]"></div>
                    </div>
                    <p className="mt-2 text-center text-sm font-medium">Traditional</p>
                  </div>
                  <div 
                    className={`cursor-pointer p-3 rounded-md border hover:border-primary ${form.watch('designStyle.styleTheme') === 'minimalist' ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => setTheme('minimalist')}
                  >
                    <div className="h-12 rounded overflow-hidden grid grid-cols-3">
                      <div className="bg-[#1F2937]"></div>
                      <div className="bg-[#6B7280]"></div>
                      <div className="bg-[#4B5563]"></div>
                    </div>
                    <p className="mt-2 text-center text-sm font-medium">Minimalist</p>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="designStyle.colorPrimary"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Primary Color</FormLabel>
                          <div className="flex space-x-2">
                            <div 
                              className="w-8 h-8 rounded border" 
                              style={{ backgroundColor: field.value }}
                            />
                            <FormControl>
                              <Input {...field} type="text" />
                            </FormControl>
                          </div>
                          <FormDescription>
                            Main color for headings and buttons
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="designStyle.colorSecondary"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Secondary Color</FormLabel>
                          <div className="flex space-x-2">
                            <div 
                              className="w-8 h-8 rounded border" 
                              style={{ backgroundColor: field.value }}
                            />
                            <FormControl>
                              <Input {...field} type="text" />
                            </FormControl>
                          </div>
                          <FormDescription>
                            Supporting color for backgrounds
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="designStyle.colorAccent"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Accent Color</FormLabel>
                          <div className="flex space-x-2">
                            <div 
                              className="w-8 h-8 rounded border" 
                              style={{ backgroundColor: field.value }}
                            />
                            <FormControl>
                              <Input {...field} type="text" />
                            </FormControl>
                          </div>
                          <FormDescription>
                            Highlight color for special elements
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="designStyle.fontPrimary"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Primary Font</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select primary font" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Playfair Display">Playfair Display</SelectItem>
                              <SelectItem value="Montserrat">Montserrat</SelectItem>
                              <SelectItem value="Roboto">Roboto</SelectItem>
                              <SelectItem value="Cormorant Garamond">Cormorant Garamond</SelectItem>
                              <SelectItem value="Dancing Script">Dancing Script</SelectItem>
                              <SelectItem value="Great Vibes">Great Vibes</SelectItem>
                              <SelectItem value="Inter">Inter</SelectItem>
                              <SelectItem value="Poppins">Poppins</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Used for headings and titles
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="designStyle.fontSecondary"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Secondary Font</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select secondary font" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Lato">Lato</SelectItem>
                              <SelectItem value="Roboto">Roboto</SelectItem>
                              <SelectItem value="Open Sans">Open Sans</SelectItem>
                              <SelectItem value="Source Sans Pro">Source Sans Pro</SelectItem>
                              <SelectItem value="Inter">Inter</SelectItem>
                              <SelectItem value="Poppins">Poppins</SelectItem>
                              <SelectItem value="Nunito">Nunito</SelectItem>
                              <SelectItem value="Raleway">Raleway</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Used for body text and paragraphs
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assets" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Digital Assets</CardTitle>
                <CardDescription>
                  Upload images and graphics for your event communications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="text-sm font-medium">Banner Image</div>
                    <div className="h-40 bg-muted rounded-md flex flex-col items-center justify-center border border-dashed relative">
                      {form.watch('digitalAssets.bannerImage') ? (
                        <>
                          <img 
                            src={form.watch('digitalAssets.bannerImage')} 
                            alt="Banner" 
                            className="h-full w-full object-cover rounded-md"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2"
                            onClick={() => {
                              form.setValue('digitalAssets.bannerImage', '');
                              setUploads({...uploads, bannerImage: ''});
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Image className="h-10 w-10 text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">Banner image (1200×400)</p>
                          <div className="mt-2">
                            <label className="cursor-pointer">
                              <span className="relative inline-block">
                                <Button 
                                  type="button"
                                  size="sm"
                                  disabled={isUploading['bannerImage']}
                                >
                                  {isUploading['bannerImage'] ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Uploading...
                                    </>
                                  ) : (
                                    <>
                                      <Upload className="mr-2 h-4 w-4" />
                                      Upload
                                    </>
                                  )}
                                </Button>
                                <input 
                                  type="file" 
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                                  accept="image/*"
                                  onChange={(e) => handleFileUpload('bannerImage', e)}
                                  disabled={isUploading['bannerImage']}
                                />
                              </span>
                            </label>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="text-sm font-medium">Logo or Monogram</div>
                    <div className="h-40 bg-muted rounded-md flex flex-col items-center justify-center border border-dashed relative">
                      {form.watch('digitalAssets.logoImage') ? (
                        <>
                          <img 
                            src={form.watch('digitalAssets.logoImage')} 
                            alt="Logo" 
                            className="h-full w-full object-contain p-4 rounded-md"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2"
                            onClick={() => {
                              form.setValue('digitalAssets.logoImage', '');
                              setUploads({...uploads, logoImage: ''});
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Type className="h-10 w-10 text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">Logo or monogram (300×300)</p>
                          <div className="mt-2">
                            <label className="cursor-pointer">
                              <span className="relative inline-block">
                                <Button 
                                  type="button"
                                  size="sm"
                                  disabled={isUploading['logoImage']}
                                >
                                  {isUploading['logoImage'] ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Uploading...
                                    </>
                                  ) : (
                                    <>
                                      <Upload className="mr-2 h-4 w-4" />
                                      Upload
                                    </>
                                  )}
                                </Button>
                                <input 
                                  type="file" 
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                                  accept="image/*"
                                  onChange={(e) => handleFileUpload('logoImage', e)}
                                  disabled={isUploading['logoImage']}
                                />
                              </span>
                            </label>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="text-sm font-medium">Background Pattern</div>
                    <div className="h-40 bg-muted rounded-md flex flex-col items-center justify-center border border-dashed relative">
                      {form.watch('digitalAssets.backgroundPattern') ? (
                        <>
                          <img 
                            src={form.watch('digitalAssets.backgroundPattern')} 
                            alt="Background Pattern" 
                            className="h-full w-full object-cover rounded-md"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2"
                            onClick={() => {
                              form.setValue('digitalAssets.backgroundPattern', '');
                              setUploads({...uploads, backgroundPattern: ''});
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Palette className="h-10 w-10 text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">Background pattern</p>
                          <div className="mt-2">
                            <label className="cursor-pointer">
                              <span className="relative inline-block">
                                <Button 
                                  type="button"
                                  size="sm"
                                  disabled={isUploading['backgroundPattern']}
                                >
                                  {isUploading['backgroundPattern'] ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Uploading...
                                    </>
                                  ) : (
                                    <>
                                      <Upload className="mr-2 h-4 w-4" />
                                      Upload
                                    </>
                                  )}
                                </Button>
                                <input 
                                  type="file" 
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                                  accept="image/*"
                                  onChange={(e) => handleFileUpload('backgroundPattern', e)}
                                  disabled={isUploading['backgroundPattern']}
                                />
                              </span>
                            </label>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="text-sm font-medium">Couple Photo</div>
                    <div className="h-40 bg-muted rounded-md flex flex-col items-center justify-center border border-dashed relative">
                      {form.watch('digitalAssets.couplePhoto') ? (
                        <>
                          <img 
                            src={form.watch('digitalAssets.couplePhoto')} 
                            alt="Couple Photo" 
                            className="h-full w-full object-cover rounded-md"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2"
                            onClick={() => {
                              form.setValue('digitalAssets.couplePhoto', '');
                              setUploads({...uploads, couplePhoto: ''});
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Image className="h-10 w-10 text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">Couple photo</p>
                          <div className="mt-2">
                            <label className="cursor-pointer">
                              <span className="relative inline-block">
                                <Button 
                                  type="button"
                                  size="sm"
                                  disabled={isUploading['couplePhoto']}
                                >
                                  {isUploading['couplePhoto'] ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Uploading...
                                    </>
                                  ) : (
                                    <>
                                      <Upload className="mr-2 h-4 w-4" />
                                      Upload
                                    </>
                                  )}
                                </Button>
                                <input 
                                  type="file" 
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                                  accept="image/*"
                                  onChange={(e) => handleFileUpload('couplePhoto', e)}
                                  disabled={isUploading['couplePhoto']}
                                />
                              </span>
                            </label>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="custom" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>UI Customization</CardTitle>
                <CardDescription>
                  Customize the appearance of your event website and communications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="customization.rsvpButtonStyle"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>RSVP Button Style</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <div className="flex items-center space-x-3">
                            <RadioGroupItem value="rounded" id="rounded" />
                            <label
                              htmlFor="rounded"
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              Rounded
                            </label>
                            <div className="w-24 h-10 bg-primary text-primary-foreground rounded-md flex items-center justify-center text-sm font-medium">
                              Rounded
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <RadioGroupItem value="square" id="square" />
                            <label
                              htmlFor="square"
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              Square
                            </label>
                            <div className="w-24 h-10 bg-primary text-primary-foreground rounded-none flex items-center justify-center text-sm font-medium">
                              Square
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <RadioGroupItem value="pill" id="pill" />
                            <label
                              htmlFor="pill"
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              Pill
                            </label>
                            <div className="w-24 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                              Pill
                            </div>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormDescription>
                        The style of buttons on your RSVP form
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator />

                <FormField
                  control={form.control}
                  name="customization.cardStyle"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Card Style</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <div className="flex items-center space-x-3">
                            <RadioGroupItem value="bordered" id="bordered" />
                            <label
                              htmlFor="bordered"
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              Bordered
                            </label>
                            <div className="w-24 h-10 bg-card text-card-foreground border rounded-md flex items-center justify-center text-sm font-medium">
                              Bordered
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <RadioGroupItem value="filled" id="filled" />
                            <label
                              htmlFor="filled"
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              Filled
                            </label>
                            <div className="w-24 h-10 bg-muted text-muted-foreground rounded-md flex items-center justify-center text-sm font-medium">
                              Filled
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <RadioGroupItem value="minimal" id="minimal" />
                            <label
                              htmlFor="minimal"
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              Minimal
                            </label>
                            <div className="w-24 h-10 bg-transparent text-foreground border-b rounded-none flex items-center justify-center text-sm font-medium">
                              Minimal
                            </div>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormDescription>
                        The style of cards and containers
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customization.customCss"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Custom CSS</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Add custom CSS rules here..." 
                          {...field} 
                          rows={5}
                          className="font-mono text-sm"
                        />
                      </FormControl>
                      <FormDescription>
                        Advanced: Add custom CSS for fine-grained styling
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={form.formState.isSubmitting || isCompleted}
          >
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : isCompleted ? (
              "Completed"
            ) : (
              "Complete & Continue"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}