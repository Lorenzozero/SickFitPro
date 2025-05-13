
'use client';

import type { FormEvent } from 'react';
import { useState, useEffect } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import type { MuscleMeasurement } from '@/app/(app)/progress/page';

interface AddMeasurementDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (measurement: MuscleMeasurement) => void;
  measurement: Partial<MuscleMeasurement> | null;
  t: (key: string, replacements?: Record<string, string | number>) => string;
}

const muscleOptions = [
  { value: 'Biceps', labelKey: 'progressPage.muscleBiceps' },
  { value: 'Chest', labelKey: 'progressPage.muscleChest' },
  { value: 'Waist', labelKey: 'progressPage.muscleWaist' },
  { value: 'Hips', labelKey: 'progressPage.muscleHips' },
  { value: 'Thigh', labelKey: 'progressPage.muscleThigh' },
  { value: 'Calf', labelKey: 'progressPage.muscleCalf' },
  { value: 'Other', labelKey: 'exercisesPage.muscleGroupOther' }, // Reusing existing translation key
];

export function AddMeasurementDialog({ isOpen, onOpenChange, onSave, measurement, t }: AddMeasurementDialogProps) {
  const [date, setDate] = useState('');
  const [muscle, setMuscle] = useState('');
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState<'cm' | 'in'>('cm');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (measurement) {
      setDate(measurement.date || new Date().toISOString().split('T')[0]);
      setMuscle(measurement.muscle || '');
      setValue(measurement.value?.toString() || '');
      setUnit(measurement.unit || 'cm');
      setNotes(measurement.notes || '');
    } else {
      // Reset form for new measurement
      setDate(new Date().toISOString().split('T')[0]);
      setMuscle('');
      setValue('');
      setUnit('cm');
      setNotes('');
    }
  }, [measurement, isOpen]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!date || !muscle || !value) {
      // Basic validation, can be enhanced with react-hook-form if needed
      alert('Please fill in date, muscle, and measurement value.');
      return;
    }
    onSave({
      id: measurement?.id || String(Date.now()), // Keep existing id or generate new
      date,
      muscle,
      value: parseFloat(value),
      unit,
      notes,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>
            {measurement?.id ? t('progressPage.measurementDialogEditTitle') : t('progressPage.measurementDialogAddTitle')}
          </DialogTitle>
          <DialogDescription>{t('progressPage.measurementDialogDescription')}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">
                {t('progressPage.formDateLabel')}
              </Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="muscle" className="text-right">
                {t('progressPage.formMuscleLabel')}
              </Label>
              <Select value={muscle} onValueChange={setMuscle} required>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={t('progressPage.selectMusclePlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {muscleOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {t(opt.labelKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="value" className="text-right">
                {t('progressPage.formMeasurementLabel')}
              </Label>
              <Input
                id="value"
                type="number"
                step="0.1"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="col-span-2"
                required
              />
              <Select value={unit} onValueChange={(val) => setUnit(val as 'cm' | 'in')}>
                <SelectTrigger className="col-span-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cm">{t('progressPage.unitCm')}</SelectItem>
                  <SelectItem value="in">{t('progressPage.unitIn')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                {t('progressPage.formNotesLabel')}
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="col-span-3"
                placeholder={t('progressPage.formNotesLabel')}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                {t('progressPage.cancelButton')}
              </Button>
            </DialogClose>
            <Button type="submit">{t('progressPage.saveMeasurementButton')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
