import React, { useState, useRef } from 'react';
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
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Loader2, Image, Upload, Trash2, Link, Pencil } from 'lucide-react';

interface EmailAssetManagerProps {
  eventId: number;
}

type EmailAsset = {
  id: number;
  name: string;
  type: string;
  url: string;
  altText?: string;
  tags?: string;
  createdAt: string;
};

export default function EmailAssetManager({ eventId }: EmailAssetManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [uploadType, setUploadType] = useState('image');
  const [assetName, setAssetName] = useState('');
  const [assetAltText, setAssetAltText] = useState('');
  const [assetTags, setAssetTags] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<EmailAsset | null>(null);
  const [isAssetDetailOpen, setIsAssetDetailOpen] = useState(false);
  const [assetTypeFilter, setAssetTypeFilter] = useState('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch assets
  const { data: assetsData, isLoading: assetsLoading } = useQuery({
    queryKey: [`/api/events/${eventId}/email-assets`],
    queryFn: () => apiRequest('GET', `/api/events/${eventId}/email-assets`).then(res => res.json()),
  });

  // Delete asset mutation
  const deleteAssetMutation = useMutation({
    mutationFn: (assetId: number) => 
      apiRequest('DELETE', `/api/events/${eventId}/email-assets/${assetId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}/email-assets`] });
      toast({
        title: 'Asset deleted',
        description: 'The asset has been deleted successfully.',
      });
      setSelectedAsset(null);
      setIsAssetDetailOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to delete asset: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    
    // Basic validation
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file (JPEG, PNG, GIF, or SVG).',
        variant: 'destructive',
      });
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: 'File too large',
        description: 'Maximum file size is 5MB.',
        variant: 'destructive',
      });
      return;
    }
    
    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', assetName || file.name);
      formData.append('type', uploadType);
      formData.append('altText', assetAltText || assetName || file.name);
      formData.append('tags', assetTags);
      
      const response = await fetch(`/api/events/${eventId}/email-assets`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload asset');
      }
      
      const result = await response.json();
      
      // Reset form
      setAssetName('');
      setAssetAltText('');
      setAssetTags('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Refresh assets list
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}/email-assets`] });
      
      toast({
        title: 'Asset uploaded',
        description: 'The asset has been uploaded successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload asset',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  // Handle asset click to view details
  const handleAssetClick = (asset: EmailAsset) => {
    setSelectedAsset(asset);
    setIsAssetDetailOpen(true);
  };

  // Copy asset URL to clipboard
  const copyAssetUrl = (url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      toast({
        title: 'URL copied',
        description: 'Asset URL copied to clipboard.',
      });
    });
  };

  // Filter assets based on type
  const filteredAssets = assetsData?.assets
    ? assetTypeFilter === 'all'
      ? assetsData.assets
      : assetsData.assets.filter((asset: EmailAsset) => asset.type === assetTypeFilter)
    : [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Email Assets</h2>
      </div>

      <Tabs defaultValue="assets" className="space-y-4">
        <TabsList>
          <TabsTrigger value="assets">Manage Assets</TabsTrigger>
          <TabsTrigger value="upload">Upload New Asset</TabsTrigger>
        </TabsList>

        <TabsContent value="assets" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Label htmlFor="asset-type-filter">Filter by type:</Label>
              <Select
                value={assetTypeFilter}
                onValueChange={setAssetTypeFilter}
              >
                <SelectTrigger id="asset-type-filter" className="w-[180px]">
                  <SelectValue placeholder="All asset types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All assets</SelectItem>
                  <SelectItem value="logo">Logos</SelectItem>
                  <SelectItem value="banner">Banners</SelectItem>
                  <SelectItem value="background">Backgrounds</SelectItem>
                  <SelectItem value="image">Images</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-gray-500">
              {filteredAssets.length} {filteredAssets.length === 1 ? 'asset' : 'assets'} found
            </div>
          </div>

          {assetsLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredAssets.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredAssets.map((asset: EmailAsset) => (
                <Card 
                  key={asset.id} 
                  className="overflow-hidden cursor-pointer hover:border-primary"
                  onClick={() => handleAssetClick(asset)}
                >
                  <CardContent className="p-0 relative aspect-square">
                    <img 
                      src={asset.url} 
                      alt={asset.altText || asset.name} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors">
                      <div className="absolute bottom-2 right-2 opacity-0 hover:opacity-100 transition-opacity">
                        <Button 
                          size="icon" 
                          variant="secondary" 
                          onClick={(e) => {
                            e.stopPropagation();
                            copyAssetUrl(asset.url);
                          }}
                        >
                          <Link className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-2">
                    <div className="w-full overflow-hidden">
                      <p className="text-sm font-medium truncate">{asset.name}</p>
                      <p className="text-xs text-gray-500 truncate">{asset.type}</p>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center p-10 border rounded-lg">
              <Image className="h-10 w-10 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium">No assets found</h3>
              <p className="text-sm text-gray-500 mb-4">
                {assetTypeFilter === 'all'
                  ? "You haven't uploaded any assets yet."
                  : `No ${assetTypeFilter} assets found.`}
              </p>
              <Button
                onClick={() => document.getElementById('upload-tab-trigger')?.click()}
              >
                <Upload className="h-4 w-4 mr-2" /> Upload Asset
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload New Asset</CardTitle>
              <CardDescription>
                Upload images to use in your email templates. Maximum file size is 5MB.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="asset-type">Asset Type</Label>
                <Select
                  value={uploadType}
                  onValueChange={setUploadType}
                >
                  <SelectTrigger id="asset-type">
                    <SelectValue placeholder="Select asset type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="logo">Logo</SelectItem>
                    <SelectItem value="banner">Banner</SelectItem>
                    <SelectItem value="background">Background</SelectItem>
                    <SelectItem value="image">General Image</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="asset-name">Asset Name</Label>
                <Input
                  id="asset-name"
                  value={assetName}
                  onChange={(e) => setAssetName(e.target.value)}
                  placeholder="Enter a descriptive name"
                />
              </div>

              <div>
                <Label htmlFor="asset-alt">Alt Text</Label>
                <Input
                  id="asset-alt"
                  value={assetAltText}
                  onChange={(e) => setAssetAltText(e.target.value)}
                  placeholder="Alternative text for accessibility"
                />
              </div>

              <div>
                <Label htmlFor="asset-tags">Tags</Label>
                <Input
                  id="asset-tags"
                  value={assetTags}
                  onChange={(e) => setAssetTags(e.target.value)}
                  placeholder="Comma-separated tags (e.g., wedding, flowers, decoration)"
                />
              </div>

              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="asset-file">File</Label>
                <Input
                  id="asset-file"
                  type="file"
                  ref={fileInputRef}
                  accept="image/jpeg,image/png,image/gif,image/svg+xml"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                disabled={uploading} 
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" /> Upload
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Asset Detail Dialog */}
      {selectedAsset && (
        <Dialog open={isAssetDetailOpen} onOpenChange={setIsAssetDetailOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{selectedAsset.name}</DialogTitle>
              <DialogDescription>
                Uploaded as {selectedAsset.type}
                {selectedAsset.tags && ` • Tags: ${selectedAsset.tags}`}
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/2 flex-shrink-0">
                <img 
                  src={selectedAsset.url} 
                  alt={selectedAsset.altText || selectedAsset.name}
                  className="w-full rounded-md object-contain max-h-[300px]"
                />
              </div>

              <div className="md:w-1/2 space-y-4">
                <div className="space-y-2">
                  <Label>Asset URL</Label>
                  <div className="flex">
                    <Input 
                      value={selectedAsset.url}
                      readOnly
                      className="rounded-r-none"
                    />
                    <Button 
                      className="rounded-l-none"
                      variant="secondary"
                      onClick={() => copyAssetUrl(selectedAsset.url)}
                    >
                      <Link className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Alt Text</Label>
                  <Input 
                    value={selectedAsset.altText || ''}
                    readOnly
                  />
                </div>

                <div className="space-y-2">
                  <Label>Template Usage</Label>
                  <div className="text-sm">
                    <p className="font-medium">HTML Usage:</p>
                    <pre className="bg-gray-100 p-2 rounded overflow-x-auto text-xs mt-1">
                      {`<img src="${selectedAsset.url}" alt="${selectedAsset.altText || selectedAsset.name}" />`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="flex justify-between">
              <Button 
                variant="destructive"
                onClick={() => {
                  if (confirm('Are you sure you want to delete this asset? This action cannot be undone.')) {
                    deleteAssetMutation.mutate(selectedAsset.id);
                  }
                }}
                disabled={deleteAssetMutation.isPending}
              >
                {deleteAssetMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                Delete Asset
              </Button>
              <Button onClick={() => setIsAssetDetailOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}