import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, Dumbbell, CalendarDays, Bot, BarChart3, Settings, Users } from 'lucide-react';

export interface NavItem {
  titleKey: string; // Changed from title to titleKey
  href: string;
  icon: LucideIcon;
  label?: string;
  disabled?: boolean;
  external?: boolean;
}

export const navItems: NavItem[] = [
  {
    titleKey: 'nav.dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    titleKey: 'nav.exercises',
    href: '/exercises',
    icon: Dumbbell,
  },
  {
    titleKey: 'nav.workoutPlans',
    href: '/workouts',
    icon: Users, 
  },
  {
    titleKey: 'nav.calendar',
    href: '/calendar',
    icon: CalendarDays,
  },
  {
    titleKey: 'nav.aiSplitSuggester',
    href: '/ai-split',
    icon: Bot,
  },
  {
    titleKey: 'nav.progress',
    href: '/progress',
    icon: BarChart3,
  },
  {
    titleKey: 'nav.settings',
    href: '/settings',
    icon: Settings,
  },
];
