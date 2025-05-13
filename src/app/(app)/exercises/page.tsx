
'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Edit2, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/context/language-context';

// Mock data - replace with actual data fetching and state management
const initialExercises = [
  { id: '1', name: 'Bench Press', muscleGroup: 'Chest', type: 'Strength' },
  { id: '2', name: 'Squat', muscleGroup: 'Legs', type: 'Strength' },
  { id: '3', name: 'Deadlift', muscleGroup: 'Back', type: 'Strength' },
  { id: '4', name: 'Overhead Press', muscleGroup: 'Shoulders', type: 'Strength' },
  { id: '5', name: 'Running', muscleGroup: 'Cardio', type: 'Cardio' },
];

type Exercise = typeof initialExercises[0] & { description?: string };

export default function ExercisesPage() {
  const { t } = useLanguage();
  const [exercises, setExercises] = useState<Exercise[]>(initialExercises);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentExercise, setCurrentExercise] = useState<Partial<Exercise> | null>(null);

  const handleSaveExercise = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newExercise: Exercise = {
      id: currentExercise?.id || String(Date.now()),
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      muscleGroup: formData.get('muscleGroup') as string,
      type: formData.get('type') as string,
    };

    if (currentExercise?.id) {
      setExercises(exercises.map(ex => ex.id === newExercise.id ? newExercise : ex));
    } else {
      setExercises([...exercises, newExercise]);
    }
    setIsDialogOpen(false);
    setCurrentExercise(null);
  };
  
  const openDialog = (exercise?: Exercise) => {
    setCurrentExercise(exercise || {});
    setIsDialogOpen(true);
  }

  const handleDelete = (id: string) => {
    setExercises(exercises.filter(ex => ex.id !== id));
  }

  return (
    <>
      <PageHeader
        title={t('exercisesPage.title')}
        description={t('exercisesPage.description')}
        actions={
          <Button onClick={() => openDialog()}>
            <PlusCircle className="w-4 h-4 mr-2" /> {t('exercisesPage.addNewExerciseButton')}
          </Button>
        }
      />

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>{t('exercisesPage.yourExercisesCardTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('exercisesPage.tableHeaderName')}</TableHead>
                <TableHead>{t('exercisesPage.tableHeaderMuscleGroup')}</TableHead>
                <TableHead>{t('exercisesPage.tableHeaderType')}</TableHead>
                <TableHead className="text-right">{t('exercisesPage.tableHeaderActions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exercises.map((exercise) => (
                <TableRow key={exercise.id}>
                  <TableCell className="font-medium">{exercise.name}</TableCell>
                  <TableCell>{exercise.muscleGroup}</TableCell>
                  <TableCell>{exercise.type}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => openDialog(exercise)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(exercise.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{currentExercise?.id ? t('exercisesPage.dialogEditTitle') : t('exercisesPage.dialogAddTitle')}</DialogTitle>
            <DialogDescription>
              {currentExercise?.id ? t('exercisesPage.dialogEditDescription') : t('exercisesPage.dialogAddDescription')}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveExercise}>
            <div className="grid gap-4 py-4">
              <div className="grid items-center grid-cols-4 gap-4">
                <Label htmlFor="name" className="text-right">
                  {t('exercisesPage.formNameLabel')}
                </Label>
                <Input id="name" name="name" defaultValue={currentExercise?.name || ''} className="col-span-3" required />
              </div>
              <div className="grid items-center grid-cols-4 gap-4">
                <Label htmlFor="description" className="text-right">
                  {t('exercisesPage.formDescriptionLabel')}
                </Label>
                <Textarea id="description" name="description" defaultValue={currentExercise?.description || ''} className="col-span-3" />
              </div>
              <div className="grid items-center grid-cols-4 gap-4">
                <Label htmlFor="muscleGroup" className="text-right">
                  {t('exercisesPage.formMuscleGroupLabel')}
                </Label>
                <Select name="muscleGroup" defaultValue={currentExercise?.muscleGroup}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder={t('exercisesPage.selectMuscleGroupPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Chest">{t('exercisesPage.muscleGroupChest')}</SelectItem>
                    <SelectItem value="Back">{t('exercisesPage.muscleGroupBack')}</SelectItem>
                    <SelectItem value="Legs">{t('exercisesPage.muscleGroupLegs')}</SelectItem>
                    <SelectItem value="Shoulders">{t('exercisesPage.muscleGroupShoulders')}</SelectItem>
                    <SelectItem value="Biceps">{t('exercisesPage.muscleGroupBiceps')}</SelectItem>
                    <SelectItem value="Triceps">{t('exercisesPage.muscleGroupTriceps')}</SelectItem>
                    <SelectItem value="Abs">{t('exercisesPage.muscleGroupAbs')}</SelectItem>
                    <SelectItem value="Cardio">{t('exercisesPage.muscleGroupCardio')}</SelectItem>
                    <SelectItem value="Other">{t('exercisesPage.muscleGroupOther')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid items-center grid-cols-4 gap-4">
                <Label htmlFor="type" className="text-right">
                  {t('exercisesPage.formTypeLabel')}
                </Label>
                 <Select name="type" defaultValue={currentExercise?.type}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder={t('exercisesPage.selectExerciseTypePlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Strength">{t('exercisesPage.typeStrength')}</SelectItem>
                    <SelectItem value="Cardio">{t('exercisesPage.typeCardio')}</SelectItem>
                    <SelectItem value="Flexibility">{t('exercisesPage.typeFlexibility')}</SelectItem>
                    <SelectItem value="Plyometrics">{t('exercisesPage.typePlyometrics')}</SelectItem>
                    <SelectItem value="Other">{t('exercisesPage.typeOther')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>{t('exercisesPage.cancelButton')}</Button>
              <Button type="submit">{t('exercisesPage.saveExerciseButton')}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
