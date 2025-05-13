'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Languages, Bell, Palette, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const [language, setLanguage] = useState('en');
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false); // Placeholder for theme
  const { toast } = useToast();

  const handleSaveChanges = () => {
    // In a real app, save these settings to backend/localStorage
    console.log({ language, notifications, darkMode });
    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated.",
    });
  };

  return (
    <>
      <PageHeader
        title="Settings"
        description="Customize your SickFit Pro experience."
      />
      <div className="space-y-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Languages className="w-5 h-5 mr-2 text-primary" />
              Localization
            </CardTitle>
            <CardDescription>Choose your preferred language for the app.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full max-w-sm space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger id="language">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English (US)</SelectItem>
                  <SelectItem value="it">Italiano (Italian)</SelectItem>
                  <SelectItem value="es">Español (Spanish)</SelectItem>
                  <SelectItem value="fr">Français (French)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Selected language: {language === 'en' ? 'English' : language === 'it' ? 'Italiano' : 'Other'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="w-5 h-5 mr-2 text-primary" />
              Notifications
            </CardTitle>
            <CardDescription>Manage your notification preferences.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-md bg-secondary">
              <Label htmlFor="workout-reminders" className="font-normal">Workout Reminders</Label>
              <Switch id="workout-reminders" checked={notifications} onCheckedChange={setNotifications} />
            </div>
            <div className="flex items-center justify-between p-3 rounded-md bg-secondary">
              <Label htmlFor="progress-updates" className="font-normal">Progress Updates</Label>
              <Switch id="progress-updates" defaultChecked />
            </div>
            <div className="flex items-center justify-between p-3 rounded-md bg-secondary">
              <Label htmlFor="new-features" className="font-normal">New Feature Announcements</Label>
              <Switch id="new-features" defaultChecked />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Palette className="w-5 h-5 mr-2 text-primary" />
              Appearance (Placeholder)
            </CardTitle>
            <CardDescription>Customize the look and feel of the app.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-md bg-secondary">
              <Label htmlFor="dark-mode" className="font-normal">Dark Mode</Label>
              <Switch id="dark-mode" checked={darkMode} onCheckedChange={setDarkMode} disabled /> 
              {/* Dark mode toggle functionality is complex and typically handled at a higher level */}
            </div>
             <p className="text-xs text-muted-foreground">
                Dark mode toggle is a placeholder. Actual theme switching requires app-wide state management.
              </p>
          </CardContent>
        </Card>


        <div className="flex justify-end">
          <Button onClick={handleSaveChanges}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
    </>
  );
}
