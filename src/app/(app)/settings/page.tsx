
'use client';

import { useState, useEffect } from 'react';
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
import { useLanguage, type Language } from '@/context/language-context';


export default function SettingsPage() {
  const { language, setLanguage, t, isClient: languageContextIsClient } = useLanguage();
  const [enableNotifications, setEnableNotifications] = useState(true); // Single state for all notifications
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // In a real app, load notification preference from localStorage or backend
    const storedNotificationPref = localStorage.getItem('app-notifications-enabled');
    if (storedNotificationPref !== null) {
      setEnableNotifications(JSON.parse(storedNotificationPref));
    }
  }, []);

  const handleSaveChanges = () => {
    if (!isClient) return;

    // Language is saved by LanguageProvider via setLanguage
    // Theme is saved by ThemeProvider
    localStorage.setItem('app-notifications-enabled', JSON.stringify(enableNotifications));
    console.log({ selectedLanguage: language, notifications: enableNotifications, selectedTheme: theme });
    toast({
      title: t('settingsPage.settingsSaved'),
      description: t('settingsPage.preferencesUpdated'),
    });
  };

  const getLanguageDisplayName = (langCode: Language): string => {
    if (!languageContextIsClient && !isClient) return t('settingsPage.english'); // Default or loading state
    switch(langCode) {
      case 'en': return t('settingsPage.english');
      case 'it': return t('settingsPage.italian');
      case 'es': return t('settingsPage.spanish');
      case 'fr': return t('settingsPage.french');
      default: return langCode;
    }
  }

  return (
    <>
      <PageHeader
        title={t('settingsPage.title')}
        description={t('settingsPage.description')}
      />
      <div className="space-y-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Languages className="w-5 h-5 mr-2 text-primary" />
              {t('settingsPage.localization')}
            </CardTitle>
            <CardDescription>{t('settingsPage.localizationDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full max-w-sm space-y-2">
              <Label htmlFor="language">{t('settingsPage.language')}</Label>
              <Select 
                value={isClient ? language : 'en'} 
                onValueChange={(value) => setLanguage(value as Language)}
                disabled={!isClient}
              >
                <SelectTrigger id="language">
                  <SelectValue placeholder={t('settingsPage.selectLanguage')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">{t('settingsPage.english')}</SelectItem>
                  <SelectItem value="it">{t('settingsPage.italian')}</SelectItem>
                  <SelectItem value="es">{t('settingsPage.spanish')}</SelectItem>
                  <SelectItem value="fr">{t('settingsPage.french')}</SelectItem>
                </SelectContent>
              </Select>
              {isClient && (
                <p className="text-xs text-muted-foreground">
                  {t('settingsPage.selectedLanguageIs')}: {getLanguageDisplayName(language)}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="w-5 h-5 mr-2 text-primary" />
              {t('settingsPage.notifications')}
            </CardTitle>
            <CardDescription>{t('settingsPage.notificationsDescriptionSingle')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-md bg-secondary">
              <Label htmlFor="all-notifications" className="font-normal">{t('settingsPage.allNotificationsLabel')}</Label>
              <Switch id="all-notifications" checked={enableNotifications} onCheckedChange={setEnableNotifications} disabled={!isClient} />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Palette className="w-5 h-5 mr-2 text-primary" />
              {t('settingsPage.appearance')}
            </CardTitle>
            <CardDescription>{t('settingsPage.appearanceDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="w-full max-w-sm space-y-2">
              <Label htmlFor="theme-preference" className="flex items-center">
                {isClient ? (
                  resolvedTheme === 'dark' ? <Moon className="w-4 h-4 mr-2" /> : <Sun className="w-4 h-4 mr-2" />
                ) : (
                  <Palette className="w-4 h-4 mr-2" /> 
                )}
                {t('settingsPage.theme')}
              </Label>
               <Select 
                value={isClient ? theme : 'system'} 
                onValueChange={(value) => setTheme(value as 'light' | 'dark' | 'system')}
                disabled={!isClient}
               >
                <SelectTrigger id="theme-preference">
                  <SelectValue placeholder={t('settingsPage.selectTheme')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">{t('settingsPage.lightTheme')}</SelectItem>
                  <SelectItem value="dark">{t('settingsPage.darkTheme')}</SelectItem>
                  <SelectItem value="system">{t('settingsPage.systemTheme')}</SelectItem>
                </SelectContent>
              </Select>
               {isClient && (
                 <p className="text-xs text-muted-foreground">
                  {t('settingsPage.currentThemePreference')}: {theme.charAt(0).toUpperCase() + theme.slice(1)}. 
                  {theme === 'system' && ` (${t('settingsPage.systemIsApplying')}: ${resolvedTheme})`}
                 </p>
               )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button onClick={handleSaveChanges} disabled={!isClient}>
            <Save className="w-4 h-4 mr-2" />
            {t('settingsPage.saveChanges')}
          </Button>
        </div>
      </div>
    </>
  );
}
