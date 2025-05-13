
'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Languages, Bell, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage, type Language } from '@/context/language-context';


export default function SettingsPage() {
  const { language, setLanguage, t, isClient: languageContextIsClient } = useLanguage();
  const [enableNotifications, setEnableNotifications] = useState(true); 
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const storedNotificationPref = localStorage.getItem('app-notifications-enabled');
    if (storedNotificationPref !== null) {
      setEnableNotifications(JSON.parse(storedNotificationPref));
    }
  }, []);

  const handleSaveChanges = () => {
    if (!isClient) return;

    localStorage.setItem('app-notifications-enabled', JSON.stringify(enableNotifications));
    console.log({ selectedLanguage: language, notifications: enableNotifications });
    toast({
      title: t('settingsPage.settingsSaved'),
      description: t('settingsPage.preferencesUpdated'),
    });
  };

  const getLanguageDisplayName = (langCode: Language): string => {
    if (!languageContextIsClient && !isClient) return t('settingsPage.english'); 
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
              {t('settingsPage.language')} 
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
                <div className="flex items-center justify-between gap-4">
                    <Label htmlFor="language" className="whitespace-nowrap">{t('settingsPage.language')}</Label>
                    <div className="w-auto min-w-[180px]">
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
                    </div>
                </div>
                {isClient && (
                    <p className="text-xs text-muted-foreground">
                    {t('settingsPage.selectedLanguageIs')}: {getLanguageDisplayName(language)}
                    </p>
                )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center">
              <Bell className="w-5 h-5 mr-2 text-primary" />
              {t('settingsPage.notifications')}
            </CardTitle>
            <Switch 
              id="all-notifications" 
              aria-label={t('settingsPage.allNotificationsLabel')}
              checked={enableNotifications} 
              onCheckedChange={setEnableNotifications} 
              disabled={!isClient}
            />
          </CardHeader>
          <CardContent className="pt-0"> 
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
