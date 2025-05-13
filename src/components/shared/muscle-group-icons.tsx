
// src/components/shared/muscle-group-icons.tsx
'use client';

import type { LucideIcon } from 'lucide-react';
import { Heart, UserSquare, Footprints, Shield, Dumbbell, Activity, Bike, Users, HelpCircle, Minus } from 'lucide-react';
import { cn } from "@/lib/utils";

export type MuscleGroup = 
  | 'Chest' 
  | 'Back' 
  | 'Legs' 
  | 'Shoulders' 
  | 'Biceps' 
  | 'Triceps' 
  | 'Abs' 
  | 'Core' 
  | 'Cardio' 
  | 'Full Body' 
  | 'Upper Body' 
  | 'Lower Body';

// Using a broader set of icons for muscle groups for better visual representation
export const muscleIconMap: Record<MuscleGroup, LucideIcon> = {
  'Chest': Heart, // Represents chest area
  'Back': UserSquare, // Represents torso/back
  'Legs': Footprints, // Represents legs/lower body activity
  'Shoulders': Shield, // Represents broad shoulders
  'Biceps': Dumbbell, // Generic for strength/arms
  'Triceps': Dumbbell, // Generic for strength/arms
  'Abs': Activity, // Core engagement, could also use Minus for "crunches"
  'Core': Activity, // General core
  'Cardio': Bike, // Clear cardio icon
  'Full Body': Users, // Represents whole body
  'Upper Body': Users, // Placeholder for general upper body
  'Lower Body': Footprints, // Placeholder for general lower body
};

interface MuscleGroupIconsProps {
  muscleGroups: MuscleGroup[];
  className?: string;
  iconClassName?: string;
}

export function MuscleGroupIcons({ muscleGroups, className, iconClassName = "w-3 h-3 text-muted-foreground" }: MuscleGroupIconsProps) {
  if (!muscleGroups || muscleGroups.length === 0) {
    return null;
  }

  // Limit to a few icons to prevent clutter, e.g., max 3-4 icons
  const displayedGroups = muscleGroups.slice(0, 4);

  return (
    <div className={cn("flex flex-wrap items-center gap-0.5", className)}>
      {displayedGroups.map((group) => {
        const IconComponent = muscleIconMap[group] || HelpCircle; // Fallback for unknown groups
        return (
          <TooltipProviderWrapper key={group} tooltipText={group}>
            <IconComponent className={iconClassName} aria-label={group} />
          </TooltipProviderWrapper>
        );
      })}
      {muscleGroups.length > 4 && (
         <TooltipProviderWrapper tooltipText={muscleGroups.slice(4).join(', ')}>
            <span className={cn("text-xs text-muted-foreground", iconClassName.replace(/w-\d+|h-\d+/g, ''))}>+{muscleGroups.length - 4}</span>
         </TooltipProviderWrapper>
      )}
    </div>
  );
}


// Simple Tooltip Wrapper to avoid direct shadcn/ui import if not always needed for this small component
// For actual tooltips, use shadcn/ui Tooltip directly in consuming components if preferred.
// This is a simplified version for icon title.
const TooltipProviderWrapper = ({ children, tooltipText }: { children: React.ReactNode, tooltipText: string }) => {
  // In a real scenario, you might use shadcn's TooltipProvider here if it's part of your design system for these icons
  // For simplicity, just using title attribute if shadcn Tooltip isn't a hard dependency for this specific icon display
  return <span title={tooltipText}>{children}</span>;
};
