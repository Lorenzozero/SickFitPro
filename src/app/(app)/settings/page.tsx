
'use client';

import { useState, useEffect } from 'react';
import type { ChangeEvent } from 'react'; 
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
import { Switch } from '@/components/ui/switch';
import { Languages, Bell, Palette, Save, Moon, Sun } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/components/theme-provider';

const LANGUAGE_STORAGE_KEY = 'app-language';

export default function SettingsPage() {
  const [language, setLanguage] = useState('en');
  const [notifications, setNotifications] = useState(true);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // Mark client as ready
    
    const storedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (storedLanguage) {
      setLanguage(storedLanguage);
    }
    // Future: Load other persisted settings like notifications
  }, []);

  const handleSaveChanges = () => {
    if (!isClient) return; // Prevent action if not on client

    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    // Theme is saved by ThemeProvider. Language and notifications are local state for now.
    console.log({ language, notifications, selectedTheme: theme });
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
              <Select 
                value={isClient ? language : 'en'} 
                onValueChange={setLanguage}
                disabled={!isClient}
              >
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
              {isClient && (
                <p className="text-xs text-muted-foreground">
                  Selected language: {
                    language === 'en' ? 'English (US)' : 
                    language === 'it' ? 'Italiano (Italian)' : 
                    language === 'es' ? 'Español (Spanish)' : 
                    language === 'fr' ? 'Français (French)' : 'Other'
                  }
                </p>
              )}
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
              <Switch id="workout-reminders" checked={notifications} onCheckedChange={setNotifications} disabled={!isClient} />
            </div>
            <div className="flex items-center justify-between p-3 rounded-md bg-secondary">
              <Label htmlFor="progress-updates" className="font-normal">Progress Updates</Label>
              <Switch id="progress-updates" defaultChecked disabled={!isClient}/>
            </div>
            <div className="flex items-center justify-between p-3 rounded-md bg-secondary">
              <Label htmlFor="new-features" className="font-normal">New Feature Announcements</Label>
              <Switch id="new-features" defaultChecked disabled={!isClient}/>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Palette className="w-5 h-5 mr-2 text-primary" />
              Appearance
            </CardTitle>
            <CardDescription>Customize the look and feel of the app.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="w-full max-w-sm space-y-2">
              <Label htmlFor="theme-preference" className="flex items-center">
                {isClient ? (
                  resolvedTheme === 'dark' ? <Moon className="w-4 h-4 mr-2" /> : <Sun className="w-4 h-4 mr-2" />
                ) : (
                  <Palette className="w-4 h-4 mr-2" /> 
                )}
                Theme
              </Label>
               <Select 
                value={isClient ? theme : 'system'} 
                onValueChange={(value) => setTheme(value as 'light' | 'dark' | 'system')}
                disabled={!isClient}
               >
                <SelectTrigger id="theme-preference">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
               {isClient && (
                 <p className="text-xs text-muted-foreground">
                  Current preference: {theme.charAt(0).toUpperCase() + theme.slice(1)}. 
                  {theme === 'system' && ` (System is currently applying: ${resolvedTheme})`}
                 </p>
               )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSaveChanges} disabled={!isClient}>
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>
    </>
  );
}
