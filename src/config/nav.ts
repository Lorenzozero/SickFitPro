
import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, Dumbbell, CalendarDays, BarChart3, Users, Utensils } from 'lucide-react'; // Added Utensils for Diet

export interface NavItem {
  titleKey: string;
  href: string;
  icon: LucideIcon;
  label?: string;
  disabled?: boolean;
  external?: boolean;
}

export const navItems: NavItem[] = [
  // {
  //   titleKey: 'nav.dashboard', // "Home" - Removed as per request
  //   href: '/',
  //   icon: LayoutDashboard,
  // },
  {
    titleKey: 'nav.exercises',
    href: '/exercises',
    icon: Dumbbell,
  },
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
    titleKey: 'nav.diet', // New "Diet" item
    href: '/diet',
    icon: Utensils,
  },
];

