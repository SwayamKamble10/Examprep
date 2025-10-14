'use client';

import Link from 'next/link';
import { Book, Home, MessageSquare, PanelLeft, User, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Logo from '@/components/logo';
import { useUser } from '@/firebase';
import { signOut } from 'firebase/auth';
import { useAuth } from '@/firebase';

const navLinks = [
  { href: '/dashboard', icon: Home, label: 'Dashboard' },
  { href: '/practice', icon: Book, label: 'New Practice' },
  { href: '/profile', icon: User, label: 'Profile' },
  { href: '/feedback', icon: MessageSquare, label: 'Feedback' },
];

const adminNavLinks = [
    { href: '/admin/add-questions', icon: PlusCircle, label: 'Add Questions' },
];

// Add your Firebase User UIDs here to grant admin access
const adminUids = ['YOUR_ADMIN_UID_HERE'];


export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();

  const handleLogout = async () => {
    await signOut(auth);
    // You might want to redirect the user to the homepage after logout
    window.location.href = '/';
  };
  
  const isAdmin = user && adminUids.includes(user.uid);

  const allNavLinks = [...navLinks, ...(isAdmin ? adminNavLinks : [])];

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-card md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Logo />
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {allNavLinks.map(({ href, icon: Icon, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-accent"
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <SheetTitle>Navigation Menu</SheetTitle>
              <nav className="grid gap-2 text-lg font-medium">
                <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6 mb-4">
                  <Logo />
                </div>
                {allNavLinks.map(({ href, icon: Icon, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                  >
                    <Icon className="h-5 w-5" />
                    {label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            {/* Can add a search bar here if needed */}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <Avatar>
                  <AvatarImage
                    src={user?.photoURL ?? undefined}
                    alt="User Avatar"
                  />
                  <AvatarFallback>
                    {user?.displayName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{user ? user.displayName || user.email : 'My Account'}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem disabled>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
