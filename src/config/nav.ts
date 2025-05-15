
import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, Dumbbell, CalendarDays, BarChart3, Users, Utensils, Clock } from 'lucide-react';

export interface NavItem {
  titleKey: string;
  href: string;
  icon: LucideIcon;
  label?: string;
  disabled?: boolean;
  external?: boolean;
}

export const navItems: NavItem[] = [
  // Voce Home rimossa
  {
    titleKey: 'nav.workoutPlans', // "Schede"
    href: '/workouts',
    icon: Users,
  },
  {
    titleKey: 'nav.calendar',
    href: '/calendar',
    icon: CalendarDays,
  },
  {
    titleKey: 'nav.progress',
    href: '/progress',
    icon: BarChart3,
  },
  {
    titleKey: 'nav.diet',
    href: '/diet',
    icon: Utensils,
  },
];

