
'use client';

import { useState, useEffect, type ChangeEvent } from 'react';
import Image from 'next/image';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { Languages, Bell, Save, UserCircle, Shield, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage, type Language } from '@/context/language-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


export default function SettingsPage() {
  const { language, setLanguage, t, isClient: languageContextIsClient } = useLanguage();
  const [enableNotifications, setEnableNotifications] = useState(true);
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);

  // New state for profile settings
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // New state for password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);


  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
        const storedNotificationPref = localStorage.getItem('app-notifications-enabled');
        if (storedNotificationPref !== null) {
          setEnableNotifications(JSON.parse(storedNotificationPref));
        }
        // Mock fetching user data
        setName(localStorage.getItem('app-user-name') || 'User Name');
        setEmail(localStorage.getItem('app-user-email') || 'user@example.com');
        setProfilePicture(localStorage.getItem('app-user-profile-picture') || null);

    }
  }, []);

  const handleProfilePictureChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({
            title: t('settingsPage.toastErrorTitle'),
            description: t('settingsPage.photoSizeError'),
            variant: "destructive"
        });
        return;
      }
      setProfilePictureFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = () => {
    if (!isClient) return;
    let changesMade = false;
    const updatedPreferences: string[] = [];

    // Save general settings
    if (typeof window !== 'undefined') {
        const currentNotificationPref = JSON.parse(localStorage.getItem('app-notifications-enabled') || 'true');
        if (enableNotifications !== currentNotificationPref) {
            localStorage.setItem('app-notifications-enabled', JSON.stringify(enableNotifications));
            updatedPreferences.push(t('settingsPage.notifications'));
            changesMade = true;
        }
    }

    // Save profile information
    if (name.trim() !== (localStorage.getItem('app-user-name') || 'User Name')) {
        localStorage.setItem('app-user-name', name.trim());
        updatedPreferences.push(t('settingsPage.nameLabel'));
        changesMade = true;
    }
    if (profilePicture && profilePicture !== (localStorage.getItem('app-user-profile-picture') || null)) {
        localStorage.setItem('app-user-profile-picture', profilePicture);
        updatedPreferences.push(t('settingsPage.uploadProfilePictureLabel'));
        // In a real app, you'd upload profilePictureFile to a server here
        changesMade = true;
    }

    // Handle password change
    if (newPassword && currentPassword) {
        if (newPassword !== confirmNewPassword) {
            toast({
                title: t('settingsPage.toastErrorTitle'),
                description: t('settingsPage.passwordMismatchError'),
                variant: 'destructive',
            });
            return;
        }
        // Mock password change logic
        console.log('Attempting to change password...');
        // In a real app, you'd send currentPassword and newPassword to your backend for verification and update.
        localStorage.setItem('app-user-password-placeholder', newPassword); // NOT FOR REAL USE
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        updatedPreferences.push(t('settingsPage.newPasswordLabel'));
        changesMade = true;
    } else if (newPassword && !currentPassword) {
         toast({
            title: t('settingsPage.toastErrorTitle'),
            description: t('settingsPage.currentPasswordRequiredError'),
            variant: 'destructive',
        });
        return;
    }


    if (changesMade) {
        toast({
          title: t('settingsPage.settingsSaved'),
          description: `${t('settingsPage.preferencesUpdated')}: ${updatedPreferences.join(', ')}.`,
        });
    } else {
         toast({
          title: t('settingsPage.noChangesMadeTitle'),
          description: t('settingsPage.noChangesMadeDescription'),
        });
    }
  };

  if (!isClient) {
    return (
      <>
        <PageHeader title={t('settingsPage.title')} />
        <div className="space-y-8">
          {/* Using ShadCN Skeleton components or simple divs for placeholders */}
          <Card className="shadow-lg"><CardContent className="p-6 h-40 animate-pulse bg-muted rounded-lg"></CardContent></Card>
          <Card className="shadow-lg"><CardContent className="p-6 h-56 animate-pulse bg-muted rounded-lg"></CardContent></Card>
          <Card className="shadow-lg"><CardContent className="p-6 h-32 animate-pulse bg-muted rounded-lg"></CardContent></Card>
          <Card className="shadow-lg"><CardContent className="p-6 h-24 animate-pulse bg-muted rounded-lg"></CardContent></Card>
           <div className="flex justify-center">
             <Button size="lg" disabled>
                <Save className="w-4 h-4 mr-2" />
                {t('settingsPage.saveChanges')}
            </Button>
           </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={t('settingsPage.title')}
      />
      <div className="space-y-8">
        {/* Profile Information Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserCircle className="w-5 h-5 mr-2 text-primary" />
              {t('settingsPage.profileInformationTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <Avatar className="w-24 h-24 text-lg">
                <AvatarImage src={profilePicture || undefined} alt={t('settingsPage.profilePictureAlt')} data-ai-hint="profile avatar" />
                <AvatarFallback>{name ? name.charAt(0).toUpperCase() : 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex-grow w-full sm:w-auto">
                <Label htmlFor="profile-picture-upload" className="text-sm font-medium">{t('settingsPage.uploadProfilePictureLabel')}</Label>
                <Input
                  id="profile-picture-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  className="mt-1 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
                <p className="mt-1 text-xs text-muted-foreground">{t('settingsPage.photoSizeLimit')}</p>
              </div>
            </div>
            <div>
              <Label htmlFor="name">{t('settingsPage.nameLabel')}</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('settingsPage.namePlaceholder')}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="email">{t('settingsPage.emailLabel')}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                readOnly
                className="mt-1 bg-muted/50 cursor-not-allowed"
              />
              <CardDescription className="mt-1 text-xs">{t('settingsPage.emailCannotBeChanged')}</CardDescription>
            </div>
          </CardContent>
        </Card>

        {/* Account Security Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2 text-primary" />
              {t('settingsPage.accountSecurityTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="relative">
                <Label htmlFor="current-password">{t('settingsPage.currentPasswordLabel')}</Label>
                <Input
                    id="current-password"
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="********"
                    className="mt-1 pr-10"
                    autoComplete="current-password"
                />
                <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-7 h-7 w-7" onClick={() => setShowCurrentPassword(!showCurrentPassword)} aria-label={showCurrentPassword ? t('settingsPage.hidePassword') : t('settingsPage.showPassword')}>
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
            </div>
            <div className="relative">
                <Label htmlFor="new-password">{t('settingsPage.newPasswordLabel')}</Label>
                <Input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={t('settingsPage.newPasswordPlaceholder')}
                    className="mt-1 pr-10"
                    autoComplete="new-password"
                />
                <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-7 h-7 w-7" onClick={() => setShowNewPassword(!showNewPassword)} aria-label={showNewPassword ? t('settingsPage.hidePassword') : t('settingsPage.showPassword')}>
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
            </div>
            <div className="relative">
                <Label htmlFor="confirm-new-password">{t('settingsPage.confirmNewPasswordLabel')}</Label>
                <Input
                    id="confirm-new-password"
                    type={showConfirmNewPassword ? "text" : "password"}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder={t('settingsPage.confirmNewPasswordPlaceholder')}
                    className="mt-1 pr-10"
                    autoComplete="new-password"
                />
                 <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-7 h-7 w-7" onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)} aria-label={showConfirmNewPassword ? t('settingsPage.hidePassword') : t('settingsPage.showPassword')}>
                    {showConfirmNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
            </div>
          </CardContent>
        </Card>

        {/* Language Settings Card */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Languages className="w-5 h-5 mr-2 text-primary" />
              {t('settingsPage.language')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
                 <Label htmlFor="language" className="whitespace-nowrap text-sm font-medium">{t('settingsPage.language')}</Label>
                <div className="w-auto">
                    <Select
                        value={languageContextIsClient ? language : 'en'}
                        onValueChange={(value) => setLanguage(value as Language)}
                        disabled={!languageContextIsClient}
                    >
                        <SelectTrigger id="language-select" className="min-w-[200px]" aria-label={t('settingsPage.selectLanguage')}>
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
          </CardContent>
        </Card>

        {/* Notification Settings Card */}
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
          <Button onClick={handleSaveChanges} disabled={!isClient} size="lg">
            <Save className="w-4 h-4 mr-2" />
            {t('settingsPage.saveChanges')}
          </Button>
        </div>
      </div>
    </>
  );
}
