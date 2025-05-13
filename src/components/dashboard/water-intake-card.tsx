'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Droplet, PlusCircle, MinusCircle, RotateCcw } from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import { useToast } from '@/hooks/use-toast';

const DAILY_WATER_GOAL_ML = 2500; // Default goal, can be made configurable
const WATER_INCREMENT_ML = 250;

export default function WaterIntakeCard() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [currentWaterIntake, setCurrentWaterIntake] = useState(0);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // In a real app, load this from localStorage or backend
  }, []);

  const addWater = (amount: number) => {
    setCurrentWaterIntake(prev => Math.max(0, prev + amount));
  };

  const resetWater = () => {
    setCurrentWaterIntake(0);
    toast({
      title: t('waterIntakeCard.waterResetTitle'),
      description: t('waterIntakeCard.waterResetDescription'),
    });
  };

  const progressPercentage = DAILY_WATER_GOAL_ML > 0 ? (currentWaterIntake / DAILY_WATER_GOAL_ML) * 100 : 0;

  if (!isClient) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Droplet className="w-5 h-5 mr-2 text-blue-500" />
            {t('waterIntakeCard.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-10 bg-muted rounded-md animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Droplet className="w-5 h-5 mr-2 text-blue-500" />
            {t('waterIntakeCard.title')}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={resetWater} aria-label={t('waterIntakeCard.resetWaterButton')}>
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
        <CardDescription>{t('waterIntakeCard.description', { goal: DAILY_WATER_GOAL_ML / 1000 })}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-muted-foreground">
              {t('waterIntakeCard.currentIntakeLabel', { current: currentWaterIntake, goal: DAILY_WATER_GOAL_ML })} ml
            </span>
            <span className="text-sm font-medium">{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="w-full h-2" />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Button onClick={() => addWater(WATER_INCREMENT_ML)} variant="outline">
            <PlusCircle className="w-4 h-4 mr-2" /> {WATER_INCREMENT_ML}ml
          </Button>
          <Button onClick={() => addWater(WATER_INCREMENT_ML * 2)} variant="outline">
            <PlusCircle className="w-4 h-4 mr-2" /> {WATER_INCREMENT_ML * 2}ml
          </Button>
           <Button onClick={() => addWater(WATER_INCREMENT_ML * -1)} variant="outline" disabled={currentWaterIntake < WATER_INCREMENT_ML}>
            <MinusCircle className="w-4 h-4 mr-2" /> {WATER_INCREMENT_ML}ml
          </Button>
           <Button onClick={() => addWater(WATER_INCREMENT_ML * -2)} variant="outline" disabled={currentWaterIntake < WATER_INCREMENT_ML * 2}>
            <MinusCircle className="w-4 h-4 mr-2" /> {WATER_INCREMENT_ML * 2}ml
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
