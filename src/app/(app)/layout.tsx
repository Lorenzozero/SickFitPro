'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/icons/logo';
import { navItems } from '@/config/nav';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Settings, LogOut, Moon, Sun, Menu as MenuIcon, UserCircle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/components/theme-provider';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/language-context';
import ResumeWorkoutButton from '@/components/shared/resume-workout-button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';

export default function AppLayout({ children }: { children: ReactNode }) {
  const { setTheme, resolvedTheme } = useTheme();
  const { t, isClient } = useLanguage();
  const router = useRouter();

  const UserProfileDropdown = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center justify-start gap-2 p-1 md:p-2 text-left h-auto">
          <Avatar className="w-8 h-8">
            <AvatarImage src="https://placehold.co/40x40.png" alt={t('userDropdown.myAccount', { default: 'User Avatar' })} data-ai-hint="user avatar" />
            <AvatarFallback>{isClient ? (t('userDropdown.myAccount', { default: 'My Account' }).charAt(0) || 'U') : 'U'}</AvatarFallback>
          </Avatar>
          <span className="hidden lg:inline text-sm font-medium">{t('userDropdown.myAccount', { default: 'My Account' })}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" align="end" className="w-56">
        <DropdownMenuLabel>{t('userDropdown.myAccount', { default: 'My Account' })}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/settings">
            <Settings className="w-4 h-4 mr-2" />
            <span>{t('userDropdown.settings', { default: 'Settings' })}</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <LogOut className="w-4 h-4 mr-2" />
          <span>{t('userDropdown.logout', { default: 'Log out' })}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const ThemeToggleButton = () => (
    <Button variant="ghost" size="icon" aria-label={t('header.toggleTheme', { default: 'Toggle theme' })} onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}>
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">{t('header.toggleTheme', { default: 'Toggle theme' })}</span>
    </Button>
  );

  const NavLinks = ({ mobile = false }: { mobile?: boolean }) => (
    navItems.map((item) => (
      <Button
        key={item.href}
        asChild
        variant="ghost"
        className={mobile ? "justify-start w-full text-base py-3" : "text-sm"}
      >
        <Link href={item.href} className="flex items-center">
          <item.icon className={mobile ? "mr-3 h-5 w-5" : "mr-1.5 h-4 w-4"} />
          {t(item.titleKey, { default: item.titleKey.replace('nav.', '').replace(/([A-Z])/g, ' $1') })}
        </Link>
      </Button>
    ))
  );

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="mr-2">
                  <MenuIcon className="h-6 w-6" />
                  <span className="sr-only">{t('header.openMenu', { default: 'Open menu' })}</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[340px] p-0 flex flex-col">
                 <SheetTitle className="sr-only">{t('header.mobileNavTitle', { default: 'Navigation Menu' })}</SheetTitle>
                 <div className="p-6 border-b">
                    <Link href="/" className="block group" aria-label={t('nav.home', { default: 'Home' })}>
                      <Logo />
                    </Link>
                  </div>
                  <nav className="flex-grow p-4 space-y-1.5 overflow-y-auto">
                    <NavLinks mobile />
                  </nav>
                  <div className="p-4 mt-auto border-t">
                    <UserProfileDropdown />
                  </div>
              </SheetContent>
            </Sheet>
             <Link href="/" className="block group md:hidden" aria-label={t('nav.home', { default: 'Home' })}>
                <Logo />
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="block group" aria-label={t('nav.home', { default: 'Home' })}>
              <Logo />
            </Link>
            <nav className="flex items-center gap-1">
              <NavLinks />
            </nav>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <ThemeToggleButton />
            <Button variant="ghost" size="icon" onClick={() => router.push('/settings')}>
              <UserCircle className="w-5 h-5" />
            </Button>
            <div className="hidden md:block">
              <UserProfileDropdown />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6">
        {children}
      </main>
      <ResumeWorkoutButton />
    </div>
  );
}
