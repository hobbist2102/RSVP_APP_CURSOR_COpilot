import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  User, 
  Mail, 
  Lock, 
  Save, 
  Eye, 
  EyeOff, 
  AlertTriangle,
  CheckCircle,
  Camera,
  Trash2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { get, put, post } from "@/lib/api";
import { useNotification } from "@/lib/notification-utils";
import DashboardLayout from "@/components/layout/dashboard-layout";

interface UserProfile {
  id: number;
  username: string;
  email: string;
  name: string;
  bio?: string;
  phone?: string;
  company?: string;
  website?: string;
  location?: string;
  avatar?: string;
  createdAt: string;
  lastLogin?: string;
}

interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function Settings() {
  const [showPasswords, setShowPasswords] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const notification = useNotification();
  const queryClient = useQueryClient();

  // Fetch current user profile
  const { data: user, isLoading } = useQuery<UserProfile>({
    queryKey: ['/api/auth/profile'],
    queryFn: () => get('/api/auth/profile'),
  });

  // Profile form state
  const [profileData, setProfileData] = useState<Partial<UserProfile>>({});
  
  // Password form state
  const [passwordData, setPasswordData] = useState<PasswordChangeData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Update profile form when user data loads
  React.useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name,
        email: user.email,
        bio: user.bio || '',
        phone: user.phone || '',
        company: user.company || '',
        website: user.website || '',
        location: user.location || ''
      });
    }
  }, [user]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: Partial<UserProfile>) => put('/api/auth/profile', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/profile'] });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      notification.success({
        title: "Profile Updated",
        description: "Your profile has been updated successfully."
      });
    },
    onError: (error: any) => {
      notification.error({
        title: "Update Failed",
        description: error.message || "Failed to update profile."
      });
    }
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: (data: PasswordChangeData) => post('/api/auth/change-password', data),
    onSuccess: () => {
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      notification.success({
        title: "Password Changed",
        description: "Your password has been changed successfully."
      });
    },
    onError: (error: any) => {
      notification.error({
        title: "Password Change Failed",
        description: error.message || "Failed to change password."
      });
    }
  });

  const handleProfileSave = () => {
    updateProfileMutation.mutate(profileData);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      notification.error({
        title: "Password Mismatch",
        description: "New password and confirmation don't match."
      });
      return;
    }
    changePasswordMutation.mutate(passwordData);
  };

  const updateProfileField = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const updatePasswordField = (field: keyof PasswordChangeData, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">Loading profile...</div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold">Profile Not Found</h2>
          <p className="text-gray-600">Unable to load your profile information.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-gray-600 mt-2">
            Manage your account information and preferences
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Profile Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center space-x-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="text-lg">
                      {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="flex items-center space-x-2">
                      <Camera className="h-4 w-4" />
                      <span>Change Avatar</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="flex items-center space-x-2 text-red-600">
                      <Trash2 className="h-4 w-4" />
                      <span>Remove</span>
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profileData.name || ''}
                      onChange={(e) => updateProfileField('name', e.target.value)}
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={user.username}
                      disabled
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-gray-500 mt-1">Username cannot be changed</p>
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email || ''}
                      onChange={(e) => updateProfileField('email', e.target.value)}
                      placeholder="Enter your email"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={profileData.phone || ''}
                      onChange={(e) => updateProfileField('phone', e.target.value)}
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profileData.bio || ''}
                    onChange={(e) => updateProfileField('bio', e.target.value)}
                    placeholder="Tell us about yourself..."
                    rows={4}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Brief description for your profile. Maximum 500 characters.
                  </p>
                </div>

                {/* Additional Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      value={profileData.company || ''}
                      onChange={(e) => updateProfileField('company', e.target.value)}
                      placeholder="Your company or organization"
                    />
                  </div>

                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={profileData.location || ''}
                      onChange={(e) => updateProfileField('location', e.target.value)}
                      placeholder="City, Country"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      type="url"
                      value={profileData.website || ''}
                      onChange={(e) => updateProfileField('website', e.target.value)}
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                </div>

                {/* Account Information */}
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Member since:</span>
                    <p>{new Date(user.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="font-medium">Last login:</span>
                    <p>{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}</p>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                  <Button 
                    onClick={handleProfileSave}
                    disabled={updateProfileMutation.isPending}
                    className="flex items-center space-x-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>{updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lock className="h-5 w-5" />
                  <span>Change Password</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-6">
                  <div>
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPasswords ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) => updatePasswordField('currentPassword', e.target.value)}
                        required
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPasswords(!showPasswords)}
                      >
                        {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type={showPasswords ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) => updatePasswordField('newPassword', e.target.value)}
                      required
                      minLength={6}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Password must be at least 6 characters long
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type={showPasswords ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) => updatePasswordField('confirmPassword', e.target.value)}
                      required
                      minLength={6}
                    />
                    {passwordData.newPassword && passwordData.confirmPassword && 
                     passwordData.newPassword !== passwordData.confirmPassword && (
                      <p className="text-xs text-red-600 mt-1">
                        Passwords do not match
                      </p>
                    )}
                  </div>

                  {changePasswordMutation.error && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        {(changePasswordMutation.error as any)?.message || 'Failed to change password'}
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex justify-end">
                    <Button 
                      type="submit"
                      disabled={
                        changePasswordMutation.isPending ||
                        !passwordData.currentPassword ||
                        !passwordData.newPassword ||
                        !passwordData.confirmPassword ||
                        passwordData.newPassword !== passwordData.confirmPassword
                      }
                      className="flex items-center space-x-2"
                    >
                      <Lock className="h-4 w-4" />
                      <span>{changePasswordMutation.isPending ? 'Changing...' : 'Change Password'}</span>
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Security Status */}
            <Card>
              <CardHeader>
                <CardTitle>Security Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-900">Password Protected</p>
                      <p className="text-sm text-green-700">Your account is secured with a password</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-900">Email Verified</p>
                      <p className="text-sm text-blue-700">Your email address is verified</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Preferences</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Preference settings will be implemented in the next update.
                      This will include notification preferences, language settings, and privacy options.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
                 </Tabs>
       </div>
     </DashboardLayout>
   );
 }