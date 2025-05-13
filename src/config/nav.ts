import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, Dumbbell, CalendarDays, Bot, BarChart3, Settings, Users } from 'lucide-react';

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  label?: string;
  disabled?: boolean;
  external?: boolean;
}

export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'Exercises',
    href: '/exercises',
    icon: Dumbbell,
  },
  {
    title: 'Workout Plans',
    href: '/workouts',
    icon: Users, // Using Users as a proxy for workout plans / groups of exercises
  },
  {
    title: 'Calendar',
    href: '/calendar',
    icon: CalendarDays,
  },
  {
    title: 'AI Split Suggester',
    href: '/ai-split',
    icon: Bot,
  },
  {
    title: 'Progress',
    href: '/progress',
    icon: BarChart3,
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];
