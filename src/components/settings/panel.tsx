"use client";
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/context/language-context';
import { Switch } from '@/components/ui/switch';

export default function SettingsPanel() {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [notify, setNotify] = useState(true);
  const [theme, setTheme] = useState<'system' | 'light' | 'dark'>('system');
  const [lang, setLang] = useState<'en' | 'it' | 'es' | 'fr'>('en');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('settings.profile', { default: 'Profile' })}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs block mb-1">{t('settings.email', { default: 'Email' })}</label>
            <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <div className="flex items-end">
            <Button type="button">{t('settings.save', { default: 'Save' })}</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('settings.preferences', { default: 'Preferences' })}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span>{t('settings.notifications', { default: 'Notifications' })}</span>
            <Switch checked={notify} onCheckedChange={setNotify} aria-label="Toggle notifications" />
          </div>
          <Separator />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs block mb-1">{t('settings.theme', { default: 'Theme' })}</label>
              <select className="w-full rounded border bg-background p-2" value={theme} onChange={e => setTheme(e.target.value as any)} aria-label="Select theme">
                <option value="system">{t('settings.themeSystem', { default: 'System' })}</option>
                <option value="light">{t('settings.themeLight', { default: 'Light' })}</option>
                <option value="dark">{t('settings.themeDark', { default: 'Dark' })}</option>
              </select>
            </div>
            <div>
              <label className="text-xs block mb-1">{t('settings.language', { default: 'Language' })}</label>
              <select className="w-full rounded border bg-background p-2" value={lang} onChange={e => setLang(e.target.value as any)} aria-label="Select language">
                <option value="en">English</option>
                <option value="it">Italiano</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('settings.security', { default: 'Security' })}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" aria-label="Change password">{t('settings.changePassword', { default: 'Change Password' })}</Button>
          <Button variant="destructive" aria-label="Logout sessions">{t('settings.logoutAll', { default: 'Logout from all devices' })}</Button>
        </CardContent>
      </Card>
    </div>
  );
}
