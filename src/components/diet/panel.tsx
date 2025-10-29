"use client";
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/context/language-context';
import { toast } from 'sonner';

interface MacroTarget { protein: number; carbs: number; fats: number }
interface Meal { id: string; name: string; calories: number; protein: number; carbs: number; fats: number }

export default function DietPanel() {
  const { t } = useLanguage();
  const [targets, setTargets] = useState<MacroTarget>({ protein: 150, carbs: 220, fats: 70 });
  const [meals, setMeals] = useState<Meal[]>([]);
  const [newMeal, setNewMeal] = useState<Partial<Meal>>({});

  const totals = meals.reduce((acc, m) => ({
    calories: acc.calories + (m.calories || 0),
    protein: acc.protein + (m.protein || 0),
    carbs: acc.carbs + (m.carbs || 0),
    fats: acc.fats + (m.fats || 0),
  }), { calories: 0, protein: 0, carbs: 0, fats: 0 });

  const onAddMeal = () => {
    if (!newMeal.name || !newMeal.calories) {
      toast.error(t('diet.addMealValidation', { default: 'Please enter at least a name and calories' }));
      return;
    }
    const id = String(Date.now());
    setMeals(prev => [...prev, { id, name: newMeal.name!, calories: Number(newMeal.calories) || 0, protein: Number(newMeal.protein) || 0, carbs: Number(newMeal.carbs) || 0, fats: Number(newMeal.fats) || 0 }]);
    setNewMeal({});
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t('diet.macroTargetsTitle', { default: 'Daily Macro Targets' })}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs block mb-1">{t('diet.protein', { default: 'Protein (g)' })}</label>
            <Input type="number" value={targets.protein} onChange={e => setTargets(v => ({ ...v, protein: Number(e.target.value) }))} />
          </div>
          <div>
            <label className="text-xs block mb-1">{t('diet.carbs', { default: 'Carbs (g)' })}</label>
            <Input type="number" value={targets.carbs} onChange={e => setTargets(v => ({ ...v, carbs: Number(e.target.value) }))} />
          </div>
          <div>
            <label className="text-xs block mb-1">{t('diet.fats', { default: 'Fats (g)' })}</label>
            <Input type="number" value={targets.fats} onChange={e => setTargets(v => ({ ...v, fats: Number(e.target.value) }))} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('diet.mealsToday', { default: 'Meals Today' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 mb-3">
            <Input placeholder={t('diet.mealName', { default: 'Meal name' })} value={newMeal.name || ''} onChange={e => setNewMeal(v => ({ ...v, name: e.target.value }))} />
            <Input placeholder={t('diet.cal', { default: 'kcal' })} type="number" value={newMeal.calories || ''} onChange={e => setNewMeal(v => ({ ...v, calories: Number(e.target.value) }))} />
            <Input placeholder="P" type="number" value={newMeal.protein || ''} onChange={e => setNewMeal(v => ({ ...v, protein: Number(e.target.value) }))} />
            <Input placeholder="C" type="number" value={newMeal.carbs || ''} onChange={e => setNewMeal(v => ({ ...v, carbs: Number(e.target.value) }))} />
            <Input placeholder="F" type="number" value={newMeal.fats || ''} onChange={e => setNewMeal(v => ({ ...v, fats: Number(e.target.value) }))} />
          </div>
          <Button onClick={onAddMeal}>{t('diet.addMeal', { default: 'Add Meal' })}</Button>

          <Separator className="my-4" />

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('diet.meal', { default: 'Meal' })}</TableHead>
                <TableHead>{t('diet.calories', { default: 'Calories' })}</TableHead>
                <TableHead>P</TableHead>
                <TableHead>C</TableHead>
                <TableHead>F</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {meals.map(m => (
                <TableRow key={m.id}>
                  <TableCell>{m.name}</TableCell>
                  <TableCell>{m.calories}</TableCell>
                  <TableCell>{m.protein}</TableCell>
                  <TableCell>{m.carbs}</TableCell>
                  <TableCell>{m.fats}</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell className="font-semibold">{t('diet.total', { default: 'Total' })}</TableCell>
                <TableCell className="font-semibold">{totals.calories}</TableCell>
                <TableCell className="font-semibold">{totals.protein}</TableCell>
                <TableCell className="font-semibold">{totals.carbs}</TableCell>
                <TableCell className="font-semibold">{totals.fats}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
