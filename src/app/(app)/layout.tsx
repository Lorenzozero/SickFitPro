
'use client'; 

import type { ReactNode } from 'react';
import Link from 'next/link';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarTrigger,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/icons/logo';
import { navItems } from '@/config/nav';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Settings, LogOut, Moon, Sun } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/components/theme-provider';
import { useLanguage } from '@/context/language-context';

export default function AppLayout({ children }: { children: ReactNode }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { t } = useLanguage();

  return (
    <SidebarProvider defaultOpen>
      <Sidebar>
        <SidebarHeader className="p-4">
          <Link href="/" className="block">
            <Logo />
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  tooltip={{ children: t(item.titleKey), className: 'group-data-[collapsible=icon]:block hidden' }}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{t(item.titleKey)}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-4 border-t border-sidebar-border">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center justify-start w-full gap-2 p-2 text-left h-auto">
                <Avatar className="w-8 h-8">
                  <AvatarImage src="https://picsum.photos/40/40" alt="User Avatar" data-ai-hint="user avatar" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <div className="group-data-[collapsible=icon]:hidden">
                  <p className="text-sm font-medium">User Name</p> 
                  <p className="text-xs text-sidebar-foreground/70">user@example.com</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="start" className="w-56">
              <DropdownMenuLabel>{t('userDropdown.myAccount')}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <Settings className="w-4 h-4 mr-2" />
                  <span>{t('userDropdown.settings')}</span>
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  {resolvedTheme === 'dark' ? <Moon className="w-4 h-4 mr-2" /> : <Sun className="w-4 h-4 mr-2" />}
                  <span>{t('userDropdown.theme')}</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuRadioGroup value={theme} onValueChange={(value) => setTheme(value as 'light' | 'dark' | 'system')}>
                      <DropdownMenuRadioItem value="light">{t('userDropdown.light')}</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="dark">{t('userDropdown.dark')}</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="system">{t('userDropdown.system')}</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>

              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut className="w-4 h-4 mr-2" />
                <span>{t('userDropdown.logout')}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 bg-background/80 backdrop-blur-sm border-b md:px-6">
          <SidebarTrigger className="md:hidden" />
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" aria-label={t('header.toggleTheme')} onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}>
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">{t('header.toggleTheme')}</span>
            </Button>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
