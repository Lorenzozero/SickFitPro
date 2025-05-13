
import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, Dumbbell, CalendarDays, BarChart3, Users } from 'lucide-react'; // Removed Bot

export interface NavItem {
  titleKey: string; 
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
  // {  // Removed AI Split Suggester
  //   titleKey: 'nav.aiSplitSuggester',
  //   href: '/ai-split',
  //   icon: Bot,
  // },
  {
    titleKey: 'nav.progress',
    href: '/progress',
    icon: BarChart3,
  },
];
