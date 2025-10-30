import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth/auth-context";
import { APP_NAME, navItems } from "@/config/nav"; // Importa navItems
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { MenuIcon } from "lucide-react"; // Importa l'icona del menu

export function GlobalHeader() {
  const { user, signOut } = useAuth();

  return (
    <header className="fixed top-0 w-full z-50 bg-primary text-primary-foreground p-4 flex justify-between items-center" suppressHydrationWarning={true}>
      <Link href="/" className="text-lg font-bold">
        {APP_NAME}
      </Link>
      <nav className="flex items-center space-x-4"> {/* Aggiungi space-x-4 per spaziatura */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <MenuIcon className="h-5 w-5" /> {/* Icona del menu */}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="start" forceMount> {/* Allinea a 'start' per il menu di navigazione */}
            {navItems.map((item) => (
              <DropdownMenuItem key={item.href} className="cursor-pointer" asChild>
                <Link href={item.href}>
                  {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                  {item.titleKey}
                </Link>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            {user ? (
              <>
                <DropdownMenuItem className="cursor-pointer" asChild>
                  <Link href="/settings">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onClick={signOut}>
                  Sign Out
                </DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuItem className="cursor-pointer" asChild>
                <Link href="/login">Sign In</Link>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.image || ""} alt={user.name || "User"} />
                  <AvatarFallback>{user.name ? user.name[0] : "U"}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuItem className="cursor-pointer" asChild>
                <Link href="/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer" onClick={signOut}>
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        {!user && (
          <Link href="/login">
            <Button variant="ghost">
              Sign In
            </Button>
          </Link>
        )}
      </nav>
    </header>
  );
}