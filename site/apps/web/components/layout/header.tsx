'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { Moon, Sun, Menu, X, User, LogOut, Settings, LayoutDashboard, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth.store';
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  DropdownSeparator,
  DropdownLabel,
} from '@/components/ui/dropdown';

const navigation = [
  { name: 'NEET', href: '/neet' },
  { name: 'JEE', href: '/jee' },
  { name: 'PYQs', href: '/pyqs' },
  { name: 'Mock Tests', href: '/mock-tests' },
  { name: 'Resources', href: '/resources' },
];

export function Header() {
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { user, isAuthenticated, logout } = useAuthStore();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Mount effect for theme
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b transition-all duration-300',
        scrolled
          ? 'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 shadow-sm'
          : 'bg-background'
      )}
    >
      <nav className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 group">
          <Image
            src="/logo.svg"
            alt="JEENEET Logo"
            width={36}
            height={36}
            className="rounded-lg"
          />
          <span className="text-xl font-bold group-hover:text-foreground/80 transition-colors hidden sm:inline">
            JEENEET
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:gap-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="px-3 py-2 text-sm font-medium text-muted-foreground rounded-md transition-colors hover:text-foreground hover:bg-muted"
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="hidden md:flex"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          )}

          {/* Auth Section */}
          {isAuthenticated && user ? (
            <div className="hidden md:flex items-center gap-2">
              <Dropdown>
                <DropdownTrigger
                  asChild
                  className="flex items-center gap-2 rounded-full p-1 pr-2 hover:bg-muted transition-colors"
                >
                  <button className="flex items-center gap-2">
                    <Avatar
                      src={user.avatarUrl}
                      fallback={user.fullName}
                      size="sm"
                    />
                    <span className="text-sm font-medium hidden lg:inline">
                      {user.fullName.split(' ')[0]}
                    </span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </button>
                </DropdownTrigger>
                <DropdownContent align="end" className="w-56">
                  <DropdownLabel>
                    <div className="flex flex-col">
                      <span className="font-medium">{user.fullName}</span>
                      <span className="text-xs text-muted-foreground">
                        {user.email}
                      </span>
                    </div>
                  </DropdownLabel>
                  <DropdownSeparator />
                  <DropdownItem>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </DropdownItem>
                  <DropdownItem>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownItem>
                  <DropdownItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownItem>
                  <DropdownSeparator />
                  <DropdownItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownItem>
                </DropdownContent>
              </Dropdown>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Sign Up</Link>
              </Button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={cn(
          'md:hidden border-t bg-background transition-all duration-300 overflow-hidden',
          mobileMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="container py-4 space-y-4">
          {/* Navigation Links */}
          <div className="space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block px-3 py-2 text-sm font-medium text-muted-foreground rounded-md transition-colors hover:text-foreground hover:bg-muted"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Theme Toggle for Mobile */}
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-sm font-medium">Theme</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {mounted && theme === 'dark' ? (
                <Sun className="h-4 w-4 mr-2" />
              ) : (
                <Moon className="h-4 w-4 mr-2" />
              )}
              {mounted && theme === 'dark' ? 'Light' : 'Dark'}
            </Button>
          </div>

          {/* Auth Buttons for Mobile */}
          <div className="border-t pt-4">
            {isAuthenticated && user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 px-3">
                  <Avatar
                    src={user.avatarUrl}
                    fallback={user.fullName}
                    size="md"
                  />
                  <div>
                    <p className="font-medium">{user.fullName}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-md"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" className="flex-1" asChild>
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    Login
                  </Link>
                </Button>
                <Button className="flex-1" asChild>
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                    Sign Up
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
