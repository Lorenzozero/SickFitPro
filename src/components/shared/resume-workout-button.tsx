// src/components/shared/resume-workout-button.tsx
'use client';

import { useActiveWorkout } from '@/context/active-workout-context';
import { Button } from '@/components/ui/button';
import { PlayCircle } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/context/language-context';

export default function ResumeWorkoutButton() {
  const { activePlanId, activePlanName, isClient } = useActiveWorkout();
  const { t } = useLanguage();
  const pathname = usePathname();

  const isOnActiveWorkoutPage = pathname?.startsWith('/workouts/') && pathname?.endsWith('/active');

  if (!isClient || !activePlanId || isOnActiveWorkoutPage) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button asChild size="lg" className="shadow-xl bg-green-600 hover:bg-green-700 text-white rounded-full px-6 py-6 h-auto">
        <Link href={`/workouts/${activePlanId}/active`} aria-label={t('resumeWorkoutButton.resume', { planName: activePlanName || '' })}>
          <PlayCircle className="w-6 h-6 mr-2 shrink-0" />
          <div className="flex flex-col items-start text-left">
            <span className="font-semibold">{t('resumeWorkoutButton.resumeTitle')}</span>
            {activePlanName && <span className="text-xs opacity-90">{activePlanName}</span>}
          </div>
        </Link>
      </Button>
    </div>
  );
}
