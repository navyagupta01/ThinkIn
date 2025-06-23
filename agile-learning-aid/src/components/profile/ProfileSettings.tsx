
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { toast } from '@/hooks/use-toast';

const ProfileSettings: React.FC = () => {
  const { user } = useAuth();
  const { currentLanguage, setLanguage, languages } = useLanguage();
  const { isDarkMode, toggleTheme, fontSize, setFontSize, isHighContrast, toggleHighContrast } = useTheme();
  
  const [displayName, setDisplayName] = useState(user?.name || '');
  const [notifications, setNotifications] = useState({
    email: true,
    inApp: true,
    webcam: false,
  });

  const handleSaveProfile = () => {
    toast({
      title: "Profile updated",
      description: "Your profile settings have been saved successfully.",
    });
  };

  const fontSizeOptions = [
    { value: 'small', label: 'Small' },
    { value: 'medium', label: 'Medium' },
    { value: 'large', label: 'Large' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Profile & Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your account and preferences</p>
      </div>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your basic profile information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your display name"
              />
            </div>
            <div>
              <Label htmlFor="email">Email (Read-only)</Label>
              <Input
                id="email"
                value={user?.email || ''}
                disabled
                className="bg-gray-100 dark:bg-gray-800"
              />
            </div>
            <div>
              <Label htmlFor="role">Role (Read-only)</Label>
              <Input
                id="role"
                value={user?.role === 'student' ? 'Student' : 'Teacher'}
                disabled
                className="bg-gray-100 dark:bg-gray-800"
              />
            </div>
          </div>
          <Button onClick={handleSaveProfile}>Save Changes</Button>
        </CardContent>
      </Card>

      {/* Language Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Language Preferences</CardTitle>
          <CardDescription>Choose your preferred language for the interface and AI responses</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="language">Interface Language</Label>
            <Select value={currentLanguage} onValueChange={setLanguage}>
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.nativeName} ({lang.name})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Accessibility Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Accessibility Settings</CardTitle>
          <CardDescription>Customize the interface for better accessibility</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="darkMode">Dark Mode</Label>
              <p className="text-sm text-gray-600 dark:text-gray-400">Switch to dark theme</p>
            </div>
            <Switch
              id="darkMode"
              checked={isDarkMode}
              onCheckedChange={toggleTheme}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="highContrast">High Contrast Mode</Label>
              <p className="text-sm text-gray-600 dark:text-gray-400">Increase contrast for better visibility</p>
            </div>
            <Switch
              id="highContrast"
              checked={isHighContrast}
              onCheckedChange={toggleHighContrast}
            />
          </div>

          <div>
            <Label htmlFor="fontSize">Font Size</Label>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Adjust text size throughout the app</p>
            <Select value={fontSize} onValueChange={setFontSize}>
              <SelectTrigger>
                <SelectValue placeholder="Select font size" />
              </SelectTrigger>
              <SelectContent>
                {fontSizeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>Choose how you want to receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="emailNotifications">Email Notifications</Label>
              <p className="text-sm text-gray-600 dark:text-gray-400">Receive updates via email</p>
            </div>
            <Switch
              id="emailNotifications"
              checked={notifications.email}
              onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, email: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="inAppNotifications">In-App Notifications</Label>
              <p className="text-sm text-gray-600 dark:text-gray-400">Show notifications within the app</p>
            </div>
            <Switch
              id="inAppNotifications"
              checked={notifications.inApp}
              onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, inApp: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="webcamAccess">Webcam Access for Engagement</Label>
              <p className="text-sm text-gray-600 dark:text-gray-400">Allow webcam for engagement monitoring</p>
            </div>
            <Switch
              id="webcamAccess"
              checked={notifications.webcam}
              onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, webcam: checked }))}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSettings;
