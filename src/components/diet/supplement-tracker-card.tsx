
'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Edit2, Trash2, Bell, BellOff, PackagePlus } from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '../ui/scroll-area';
import prisma from '@/lib/database';

export interface Supplement {
  id: string;
  name: string;
  timing: string; // e.g., "Mattina", "Post-workout"
  quantity: string; // e.g., "1 compressa", "5g"
  frequency: 'daily' | 'weekly' | 'monthly' | 'custom';
  specificTime?: string; // HH:MM
  notificationsEnabled: boolean;
}

const SUPPLEMENTS_STORAGE_KEY = 'sickfit-pro-supplements';
const SUPPLEMENT_NOTIFICATIONS_GLOBAL_KEY = 'sickfit-pro-supplementNotificationsGlobal';

export default function SupplementTrackerCard() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentSupplement, setCurrentSupplement] = useState<Partial<Supplement> | null>(null);
  const [globalNotificationsEnabled, setGlobalNotificationsEnabled] = useState(true);

  // Form state for the dialog
  const [dialogName, setDialogName] = useState('');
  const [dialogTiming, setDialogTiming] = useState('');
  const [dialogQuantity, setDialogQuantity] = useState('');
  const [dialogFrequency, setDialogFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'custom'>('daily');
  const [dialogSpecificTime, setDialogSpecificTime] = useState('');
  const [dialogNotificationsEnabled, setDialogNotificationsEnabled] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedSupplements = localStorage.getItem(SUPPLEMENTS_STORAGE_KEY);
      if (storedSupplements) {
        try {
          setSupplements(JSON.parse(storedSupplements));
        } catch (e) {
          console.error("Error parsing supplements from localStorage", e);
        }
      }
      const storedGlobalNotifications = localStorage.getItem(SUPPLEMENT_NOTIFICATIONS_GLOBAL_KEY);
      if (storedGlobalNotifications !== null) {
        setGlobalNotificationsEnabled(JSON.parse(storedGlobalNotifications));
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(SUPPLEMENTS_STORAGE_KEY, JSON.stringify(supplements));
    }
  }, [supplements]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(SUPPLEMENT_NOTIFICATIONS_GLOBAL_KEY, JSON.stringify(globalNotificationsEnabled));
    }
  }, [globalNotificationsEnabled]);

  // Moved useEffects for DB interaction (see important note below)
  useEffect(() => {
    // IMPORTANT: Direct Prisma calls in 'use client' components are generally not recommended.
    // This will likely fail as Prisma is meant for server-side execution.
    // Consider moving this logic to a Server Action or an API route.
    const fetchSupplements = async () => {
        // const supplementsFromDB = await prisma.supplement.findMany();
        // setSupplements(supplementsFromDB);
        console.warn("Attempting to fetch supplements with Prisma on client-side. This should be refactored.");
    };
    // fetchSupplements(); // Temporarily commented out to prevent errors
  }, []);

  useEffect(() => {
    // IMPORTANT: Similar to fetching, saving directly with Prisma here is problematic.
    const saveSupplementsToDB = async () => {
        // await prisma.supplement.createMany({ data: supplements });
        console.warn("Attempting to save supplements with Prisma on client-side. This should be refactored.");
    };
    // if (supplements.length > 0) saveSupplementsToDB(); // Temporarily commented out
  }, [supplements]);

  const resetDialogFields = () => {
    setDialogName('');
    setDialogTiming('');
    setDialogQuantity('');
    setDialogFrequency('daily');
    setDialogSpecificTime('');
    setDialogNotificationsEnabled(true);
  };

  const openDialog = (supplement?: Supplement) => {
    if (supplement) {
      setCurrentSupplement(supplement);
      setDialogName(supplement.name);
      setDialogTiming(supplement.timing);
      setDialogQuantity(supplement.quantity);
      setDialogFrequency(supplement.frequency);
      setDialogSpecificTime(supplement.specificTime || '');
      setDialogNotificationsEnabled(supplement.notificationsEnabled);
    } else {
      setCurrentSupplement(null);
      resetDialogFields();
    }
    setIsDialogOpen(true);
  };

  const handleSaveSupplement = (e: FormEvent) => {
    e.preventDefault();
    if (!dialogName.trim() || !dialogTiming.trim() || !dialogQuantity.trim()) {
      toast({
        title: t('toastErrorTitle'),
        description: t('supplements.errorAllFieldsRequired', { default: 'Name, timing, and quantity are required.' }),
        variant: 'destructive',
      });
      return;
    }

    const newSupplement: Supplement = {
      id: currentSupplement?.id || String(Date.now()),
      name: dialogName,
      timing: dialogTiming,
      quantity: dialogQuantity,
      frequency: dialogFrequency,
      specificTime: dialogFrequency === 'daily' || dialogFrequency === 'custom' ? dialogSpecificTime : undefined,
      notificationsEnabled: dialogNotificationsEnabled,
    };

    if (currentSupplement?.id) {
      setSupplements(supplements.map(s => (s.id === newSupplement.id ? newSupplement : s)));
      toast({ title: t('supplements.toastUpdatedTitle', { default: 'Supplement Updated' }) });
    } else {
      setSupplements([...supplements, newSupplement]);
      toast({ title: t('supplements.toastAddedTitle', { default: 'Supplement Added' }) });
    }
    setIsDialogOpen(false);
    resetDialogFields();
  };

  const handleDeleteSupplement = (id: string) => {
    setSupplements(supplements.filter(s => s.id !== id));
    toast({ title: t('supplements.toastDeletedTitle', { default: 'Supplement Deleted' }), variant: 'destructive' });
  };

  const toggleSupplementNotification = (id: string) => {
    setSupplements(
      supplements.map(s =>
        s.id === id ? { ...s, notificationsEnabled: !s.notificationsEnabled } : s
      )
    );
  };

  return (
    <>
      <Card className="shadow-lg rounded-xl border bg-gradient-to-br from-green-500/90 to-emerald-600/90 dark:from-green-700/90 dark:to-emerald-900/90 text-primary-foreground">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center">
            <PackagePlus className="w-5 h-5 mr-2 text-primary-foreground" />
            <CardTitle className="text-primary-foreground">{t('supplements.cardTitle', { default: 'Supplement Tracker' })}</CardTitle>
          </div>
          {/* Actions in Header: Add Supplement and Global Notifications Toggle */}
          <div className="flex items-center space-x-2">
            <Button onClick={() => openDialog()} className="bg-white hover:bg-slate-100 text-black rounded-full" size="icon">
              {/* Icona sempre visibile, testo visibile da md in su - rimosso testo per coerenza con bottone notifiche */}
              <PlusCircle className="w-5 h-5" />
              <span className="sr-only">{t('supplements.addSupplementButton', { default: 'Add Supplement' })}</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setGlobalNotificationsEnabled(!globalNotificationsEnabled)}
              aria-label={globalNotificationsEnabled
                ? t('supplements.disableAllNotificationsAria', { default: 'Disable all supplement notifications' })
                : t('supplements.enableAllNotificationsAria', { default: 'Enable all supplement notifications' })}
              className={`rounded-full
                ${globalNotificationsEnabled // Active state with bright green
                  ? 'bg-lime-400 hover:bg-lime-500 text-lime-900'
                  : 'bg-red-500 hover:bg-red-600 text-white dark:bg-red-600 dark:hover:bg-red-700 dark:text-red-100'}`}
            >
              {globalNotificationsEnabled ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {supplements.length > 0 ? (
            <ScrollArea className="max-h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow className="border-primary-foreground/30">
                    <TableHead className="text-primary-foreground">{t('supplements.tableHeaderName', { default: 'Name' })}</TableHead>
                    <TableHead className="text-primary-foreground">{t('supplements.tableHeaderTiming', { default: 'When' })}</TableHead>
                    <TableHead className="text-primary-foreground">{t('supplements.tableHeaderQuantity', { default: 'Quantity' })}</TableHead>
                    <TableHead className="hidden sm:table-cell text-primary-foreground">{t('supplements.tableHeaderFrequency', { default: 'Frequency' })}</TableHead>
                    <TableHead className="hidden sm:table-cell text-primary-foreground">{t('supplements.tableHeaderTime', { default: 'Time' })}</TableHead>
                    <TableHead className="text-center hidden sm:table-cell text-primary-foreground">{t('supplements.tableHeaderNotifications', { default: 'Notify' })}</TableHead>
                    <TableHead className="text-right w-[100px] text-primary-foreground">{t('exercisesPage.tableHeaderActions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {supplements.map(sup => (
                    <TableRow key={sup.id} className="border-primary-foreground/20 hover:bg-white/10">
                      <TableCell className="font-medium text-primary-foreground">{sup.name}</TableCell>
                      <TableCell className="text-primary-foreground">{sup.timing}</TableCell>
                      <TableCell className="text-primary-foreground">{sup.quantity}</TableCell>
                      <TableCell className="hidden sm:table-cell text-primary-foreground">{t(`supplements.frequency${sup.frequency.charAt(0).toUpperCase() + sup.frequency.slice(1)}`, { default: sup.frequency })}</TableCell>
                      <TableCell className="hidden sm:table-cell text-primary-foreground">{sup.specificTime || 'N/A'}</TableCell>
                      <TableCell className="text-center hidden sm:table-cell">
                        <Button variant="ghost" size="icon" onClick={() => toggleSupplementNotification(sup.id)} className="hover:bg-white/20"
                                aria-label={sup.notificationsEnabled ? t('supplements.disableNotificationAria', {name: sup.name}) : t('supplements.enableNotificationAria', {name: sup.name})}>
                          {globalNotificationsEnabled && sup.notificationsEnabled ? <Bell className="w-4 h-4 text-lime-400" /> : <BellOff className="w-4 h-4 text-primary-foreground/70" />}
                        </Button>
                      </TableCell>
                      <TableCell className="text-right space-x-0 sm:space-x-1 ">
                        <Button variant="ghost" size="icon" onClick={() => openDialog(sup)} className="text-primary-foreground hover:bg-white/20">
                          <Edit2 className="w-4 h-4 " />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteSupplement(sup.id)} className="text-red-400 hover:text-red-300 hover:bg-white/20">
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          ) : (
            <p className="text-sm text-center text-primary-foreground/80 py-4">
              {t('supplements.noSupplementsAdded', { default: 'No supplements added yet. Click "Add Supplement" to start tracking.' })}
            </p>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {currentSupplement?.id
                ? t('supplements.dialogEditTitle', { default: 'Edit Supplement' })
                : t('supplements.dialogAddTitle', { default: 'Add New Supplement' })}
            </DialogTitle>
            <DialogDescription>
              {t('supplements.dialogDescription', { default: 'Fill in the details for your supplement.' })}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveSupplement}>
            <ScrollArea className="max-h-[calc(100vh-20rem)]">
                <div className="grid gap-4 py-4 px-1">
                <div>
                    <Label htmlFor="sup-name">{t('supplements.formNameLabel', { default: 'Name' })}</Label>
                    <Input id="sup-name" value={dialogName} onChange={(e) => setDialogName(e.target.value)} required />
                </div>
                <div>
                    <Label htmlFor="sup-timing">{t('supplements.formTimingLabel', { default: 'When to take (e.g., Morning, Post-workout)' })}</Label>
                    <Input id="sup-timing" value={dialogTiming} onChange={(e) => setDialogTiming(e.target.value)} required />
                </div>
                <div>
                    <Label htmlFor="sup-quantity">{t('supplements.formQuantityLabel', { default: 'Quantity (e.g., 1 scoop, 2 pills)' })}</Label>
                    <Input id="sup-quantity" value={dialogQuantity} onChange={(e) => setDialogQuantity(e.target.value)} required />
                </div>
                <div>
                    <Label htmlFor="sup-frequency">{t('supplements.formFrequencyLabel', { default: 'Frequency' })}</Label>
                    <Select value={dialogFrequency} onValueChange={(v) => setDialogFrequency(v as any)}>
                    <SelectTrigger id="sup-frequency">
                        <SelectValue placeholder={t('supplements.selectFrequencyPlaceholder', { default: 'Select frequency' })} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="daily">{t('supplements.frequencyDaily', { default: 'Daily' })}</SelectItem>
                        <SelectItem value="weekly">{t('supplements.frequencyWeekly', { default: 'Weekly' })}</SelectItem>
                        <SelectItem value="monthly">{t('supplements.frequencyMonthly', { default: 'Monthly' })}</SelectItem>
                        <SelectItem value="custom">{t('supplements.frequencyCustom', { default: 'Custom' })}</SelectItem>
                    </SelectContent>
                    </Select>
                </div>
                {(dialogFrequency === 'daily' || dialogFrequency === 'custom') && (
                    <div>
                    <Label htmlFor="sup-time">{t('supplements.formTimeLabel', { default: 'Specific Time (HH:MM, optional)' })}</Label>
                    <Input id="sup-time" type="time" value={dialogSpecificTime} onChange={(e) => setDialogSpecificTime(e.target.value)} />
                    </div>
                )}
                <div className="flex items-center space-x-2 pt-2">
                    <Switch
                    id="sup-notifications"
                    checked={dialogNotificationsEnabled}
                    onCheckedChange={setDialogNotificationsEnabled}
                    />
                    <Label htmlFor="sup-notifications" className="text-sm">
                    {t('supplements.enableNotificationForSupplement', { default: 'Enable notification for this supplement' })}
                    </Label>
                </div>
                </div>
            </ScrollArea>
            <DialogFooter className="sm:justify-center pt-4 border-t">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  {t('calendarPage.cancelButton')}
                </Button>
              </DialogClose>
              <Button type="submit" className="text-black hover:text-black/90">{t('supplements.saveButton', { default: 'Save Supplement' })}</Button> 
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
