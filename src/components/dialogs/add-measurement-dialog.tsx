
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
import type { BodyMeasurement } from '@/app/(app)/progress/page';

interface AddMeasurementDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSave: (measurement: BodyMeasurement) => void;
  measurement: Partial<BodyMeasurement> | null;
  t: (key: string, replacements?: Record<string, string | number>) => string;
}

const measurementNameOptions = [
  { value: 'Biceps', labelKey: 'progressPage.measurementNameBiceps', units: ['cm', 'in'] },
  { value: 'Chest', labelKey: 'progressPage.measurementNameChest', units: ['cm', 'in'] },
  { value: 'Waist', labelKey: 'progressPage.measurementNameWaist', units: ['cm', 'in'] },
  { value: 'Hips', labelKey: 'progressPage.measurementNameHips', units: ['cm', 'in'] },
  { value: 'Thigh', labelKey: 'progressPage.measurementNameThigh', units: ['cm', 'in'] },
  { value: 'Calf', labelKey: 'progressPage.measurementNameCalf', units: ['cm', 'in'] },
  { value: 'Weight', labelKey: 'progressPage.measurementNameWeight', units: ['kg', 'lbs'] },
  { value: 'Height', labelKey: 'progressPage.measurementNameHeight', units: ['cm', 'in'] }, // Assuming cm/in for height for simplicity
  { value: 'Other', labelKey: 'exercisesPage.muscleGroupOther', units: ['cm', 'in', 'kg', 'lbs'] }, // Allow all for 'Other'
];

type Unit = 'cm' | 'in' | 'kg' | 'lbs';

export function AddMeasurementDialog({ isOpen, onOpenChange, onSave, measurement, t }: AddMeasurementDialogProps) {
  const [date, setDate] = useState('');
  const [measurementName, setMeasurementName] = useState('');
  const [value, setValue] = useState('');
  const [unit, setUnit] = useState<Unit>('cm');
  const [notes, setNotes] = useState('');
  const [availableUnits, setAvailableUnits] = useState<Unit[]>(['cm', 'in']);

  useEffect(() => {
    if (measurement) {
      setDate(measurement.date || new Date().toISOString().split('T')[0]);
      setMeasurementName(measurement.measurementName || '');
      setValue(measurement.value?.toString() || '');
      setUnit(measurement.unit || 'cm');
      setNotes(measurement.notes || '');
    } else {
      // Reset form for new measurement
      setDate(new Date().toISOString().split('T')[0]);
      setMeasurementName('');
      setValue('');
      setUnit('cm'); // Default unit
      setNotes('');
    }
  }, [measurement, isOpen]);

  useEffect(() => {
    const selectedOption = measurementNameOptions.find(opt => opt.value === measurementName);
    if (selectedOption) {
      setAvailableUnits(selectedOption.units as Unit[]);
      // If current unit is not in new available units, reset it
      if (!selectedOption.units.includes(unit)) {
        setUnit(selectedOption.units[0] as Unit);
      }
    } else {
      // Default for unselected or "Other" if not specified with units
      setAvailableUnits(['cm', 'in', 'kg', 'lbs']);
    }
  }, [measurementName, unit]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!date || !measurementName || !value) {
      // Basic validation, can be enhanced with react-hook-form if needed
      alert(t('progressPage.formValidationAlert'));
      return;
    }
    onSave({
      id: measurement?.id || String(Date.now()), // Keep existing id or generate new
      date,
      measurementName,
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
              <Label htmlFor="measurementName" className="text-right">
                {t('progressPage.formMeasurementNameLabel')}
              </Label>
              <Select value={measurementName} onValueChange={setMeasurementName} required>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={t('progressPage.selectMeasurementNamePlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {measurementNameOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {t(opt.labelKey)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="value" className="text-right">
                {t('progressPage.formValueLabel')}
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
              <Select value={unit} onValueChange={(val) => setUnit(val as Unit)}>
                <SelectTrigger className="col-span-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableUnits.map(u => (
                    <SelectItem key={u} value={u}>{t(`progressPage.unit${u.toUpperCase()}`)}</SelectItem>
                  ))}
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
                placeholder={t('progressPage.formNotesPlaceholder')}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                {t('calendarPage.cancelButton')} {/* Reusing cancel button translation */}
              </Button>
            </DialogClose>
            <Button type="submit">{t('progressPage.saveMeasurementButton')}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

