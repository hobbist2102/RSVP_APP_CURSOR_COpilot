import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { WeddingEvent } from "@shared/schema";
import { Check, Palette, Upload, XCircle } from "lucide-react";
import { COLOR_THEMES, FONT_FAMILIES } from "@/lib/constants";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DesignStepProps {
  eventId: string;
  currentEvent: WeddingEvent | undefined;
  onComplete: (data: any) => void;
  isCompleted: boolean;
}

export default function DesignStep({
  eventId,
  currentEvent,
  onComplete,
  isCompleted
}: DesignStepProps) {
  const [isEditing, setIsEditing] = useState(!isCompleted);
  const [selectedTheme, setSelectedTheme] = useState(COLOR_THEMES[0].name);
  const [primaryColor, setPrimaryColor] = useState("#F9C4D2");
  const [secondaryColor, setSecondaryColor] = useState("#B6E5D8");
  const [accentColor, setAccentColor] = useState("#FBB917");
  const [headerFont, setHeaderFont] = useState("Playfair Display");
  const [bodyFont, setBodyFont] = useState("Montserrat");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerImage, setBannerImage] = useState<File | null>(null);
  
  // Simplified file upload handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<File | null>>) => {
    if (e.target.files && e.target.files[0]) {
      setter(e.target.files[0]);
    }
  };
  
  // Clear file selection
  const clearFile = (setter: React.Dispatch<React.SetStateAction<File | null>>) => {
    setter(null);
  };

  // Design settings 
  const designSettings = {
    theme: selectedTheme,
    colors: {
      primary: primaryColor,
      secondary: secondaryColor,
      accent: accentColor
    },
    fonts: {
      header: headerFont,
      body: bodyFont
    },
    logo: logoFile ? URL.createObjectURL(logoFile) : null,
    banner: bannerImage ? URL.createObjectURL(bannerImage) : null,
    customCSS: ""
  };
  
  // Handle form submission
  const handleComplete = () => {
    onComplete(designSettings);
    setIsEditing(false);
  };

  // If step is completed and not editing, show summary view
  if (isCompleted && !isEditing) {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <h3 className="font-medium text-sm">Theme:</h3>
              <p className="col-span-3">{designSettings.theme}</p>
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <h3 className="font-medium text-sm">Colors:</h3>
              <div className="col-span-3 flex gap-2">
                <div className="flex flex-col items-center">
                  <div 
                    className="w-8 h-8 rounded-full border" 
                    style={{ backgroundColor: designSettings.colors.primary }}
                  ></div>
                  <span className="text-xs mt-1">Primary</span>
                </div>
                <div className="flex flex-col items-center">
                  <div 
                    className="w-8 h-8 rounded-full border" 
                    style={{ backgroundColor: designSettings.colors.secondary }}
                  ></div>
                  <span className="text-xs mt-1">Secondary</span>
                </div>
                <div className="flex flex-col items-center">
                  <div 
                    className="w-8 h-8 rounded-full border" 
                    style={{ backgroundColor: designSettings.colors.accent }}
                  ></div>
                  <span className="text-xs mt-1">Accent</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <h3 className="font-medium text-sm">Header Font:</h3>
              <p className="col-span-3">{designSettings.fonts.header}</p>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <h3 className="font-medium text-sm">Body Font:</h3>
              <p className="col-span-3">{designSettings.fonts.body}</p>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <h3 className="font-medium text-sm">Logo:</h3>
              <p className="col-span-3">
                {designSettings.logo ? 
                  <img src={designSettings.logo} alt="Logo" className="w-16 h-16 object-contain" /> : 
                  "No logo uploaded"
                }
              </p>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <h3 className="font-medium text-sm">Banner:</h3>
              <p className="col-span-3">
                {designSettings.banner ? 
                  <img src={designSettings.banner} alt="Banner" className="h-16 w-auto object-cover rounded" /> : 
                  "No banner uploaded"
                }
              </p>
            </div>
          </div>
        </div>
        
        <Button type="button" onClick={() => setIsEditing(true)}>
          Edit Design Settings
        </Button>
      </div>
    );
  }

  // Editing interface
  return (
    <div className="space-y-6">
      <Tabs defaultValue="theme">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="theme">Theme & Colors</TabsTrigger>
          <TabsTrigger value="typography">Typography</TabsTrigger>
          <TabsTrigger value="assets">Assets & Branding</TabsTrigger>
        </TabsList>
        
        <TabsContent value="theme" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Theme Selection</CardTitle>
                <CardDescription>
                  Choose a base theme for your wedding website
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {COLOR_THEMES.map((theme) => (
                    <Card 
                      key={theme.name}
                      className={`cursor-pointer hover:border-primary/50 ${
                        selectedTheme === theme.name ? 'border-2 border-primary' : ''
                      }`}
                      onClick={() => setSelectedTheme(theme.name)}
                    >
                      <CardContent className="p-4 text-center">
                        <div className="h-16 bg-muted rounded-md flex items-center justify-center mb-2">
                          <Palette className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <p className="text-sm font-medium">{theme}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Color Palette</CardTitle>
                <CardDescription>
                  Customize the colors for your event design
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="primary-color">Primary Color</Label>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded-full" 
                      style={{ backgroundColor: primaryColor }}
                    ></div>
                    <Input 
                      id="primary-color" 
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-full h-10"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="secondary-color">Secondary Color</Label>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded-full" 
                      style={{ backgroundColor: secondaryColor }}
                    ></div>
                    <Input 
                      id="secondary-color" 
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-full h-10"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="accent-color">Accent Color</Label>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-8 h-8 rounded-full" 
                      style={{ backgroundColor: accentColor }}
                    ></div>
                    <Input 
                      id="accent-color" 
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-full h-10"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="bg-muted/30 p-4 rounded-md">
            <h3 className="text-sm font-medium mb-2">Theme Preview</h3>
            <div className="h-32 border rounded-md bg-gradient-to-r p-4"
              style={{ backgroundImage: `linear-gradient(to right, ${primaryColor}40, ${secondaryColor}40)` }}
            >
              <div className="flex flex-col h-full justify-between">
                <h4 className="text-lg font-semibold" style={{ color: primaryColor }}>
                  {currentEvent?.brideName || 'Bride'} & {currentEvent?.groomName || 'Groom'}
                </h4>
                <div className="flex justify-between items-end">
                  <p className="text-sm">Join us for our special day</p>
                  <Button size="sm" style={{ backgroundColor: accentColor, borderColor: accentColor }}>
                    RSVP Now
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="typography" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Typography Settings</CardTitle>
              <CardDescription>
                Choose fonts for your wedding website
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="header-font">Header Font</Label>
                <Select value={headerFont} onValueChange={setHeaderFont}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a font" />
                  </SelectTrigger>
                  <SelectContent>
                    {FONT_FAMILIES.map((font) => (
                      <SelectItem key={font} value={font}>
                        {font}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="bg-muted/20 p-3 rounded mt-2">
                  <p className="text-xl" style={{ fontFamily: headerFont }}>
                    Header Sample - {headerFont}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="body-font">Body Font</Label>
                <Select value={bodyFont} onValueChange={setBodyFont}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a font" />
                  </SelectTrigger>
                  <SelectContent>
                    {FONT_FAMILIES.map((font) => (
                      <SelectItem key={font} value={font}>
                        {font}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="bg-muted/20 p-3 rounded mt-2">
                  <p style={{ fontFamily: bodyFont }}>
                    This is a sample paragraph text in {bodyFont}. The quick brown fox jumps over the lazy dog.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="assets" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Logo</CardTitle>
              <CardDescription>
                Upload your wedding logo or monogram
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center space-y-4">
                {logoFile ? (
                  <div className="relative">
                    <img 
                      src={URL.createObjectURL(logoFile)} 
                      alt="Logo Preview" 
                      className="w-32 h-32 object-contain border rounded p-2" 
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-white"
                      onClick={() => clearFile(setLogoFile)}
                    >
                      <XCircle className="h-5 w-5" />
                    </Button>
                  </div>
                ) : (
                  <div className="w-32 h-32 border border-dashed rounded flex items-center justify-center bg-muted/30">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Input 
                    type="file"
                    id="logo-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, setLogoFile)}
                  />
                  <Label 
                    htmlFor="logo-upload" 
                    className="cursor-pointer bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium"
                  >
                    {logoFile ? "Change Logo" : "Upload Logo"}
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Banner Image</CardTitle>
              <CardDescription>
                Upload a header banner for your wedding website
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center space-y-4">
                {bannerImage ? (
                  <div className="relative">
                    <img 
                      src={URL.createObjectURL(bannerImage)} 
                      alt="Banner Preview" 
                      className="w-full h-32 object-cover border rounded" 
                    />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-white"
                      onClick={() => clearFile(setBannerImage)}
                    >
                      <XCircle className="h-5 w-5" />
                    </Button>
                  </div>
                ) : (
                  <div className="w-full h-32 border border-dashed rounded flex items-center justify-center bg-muted/30">
                    <div className="text-center">
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mt-2">Recommended size: 1500 x 500px</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Input 
                    type="file"
                    id="banner-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, setBannerImage)}
                  />
                  <Label 
                    htmlFor="banner-upload" 
                    className="cursor-pointer bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium"
                  >
                    {bannerImage ? "Change Banner" : "Upload Banner"}
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end mt-8">
        <Button onClick={handleComplete} className="flex items-center gap-2">
          <Check className="h-4 w-4" />
          Save Design Settings
        </Button>
      </div>
    </div>
  );
}