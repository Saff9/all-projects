'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Timer,
  Bookmark,
  NotebookPen,
  RefreshCw,
  Settings,
  X,
  Flame,
  ChevronLeft,
  ChevronRight,
  User,
  HelpCircle,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { StreakBadge } from '@/components/features/streak-counter';

const sidebarLinks = [
  { 
    name: 'Dashboard', 
    href: '/dashboard', 
    icon: LayoutDashboard,
    description: 'Overview & stats'
  },
  { 
    name: 'NEET Path', 
    href: '/neet', 
    icon: BookOpen,
    badge: 'Medical'
  },
  { 
    name: 'JEE Path', 
    href: '/jee', 
    icon: BookOpen,
    badge: 'Engineering'
  },
  { 
    name: 'PYQs', 
    href: '/pyqs', 
    icon: FileText,
    description: '50K+ questions'
  },
  { 
    name: 'Mock Tests', 
    href: '/mock-tests', 
    icon: Timer,
    description: '100+ tests'
  },
  { 
    name: 'Resources', 
    href: '/resources', 
    icon: Bookmark,
    description: 'Study materials'
  },
  { 
    name: 'Revision Mode', 
    href: '/revision', 
    icon: RefreshCw,
    description: 'Spaced repetition'
  },
  { 
    name: 'Error Notebook', 
    href: '/notes', 
    icon: NotebookPen,
    description: 'Track mistakes'
  },
];

const bottomLinks = [
  { name: 'Profile Settings', href: '/profile', icon: User },
  { name: 'Help & Support', href: '/help', icon: HelpCircle },
  { name: 'Settings', href: '/profile/settings', icon: Settings },
];

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({ open = true, onClose, collapsed = false, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuthStore();

  // Mock data for demo
  const studyStreak = 15;
  const weeklyProgress = 68;

  return (
    <>
      {/* Mobile Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full border-r bg-background transition-all duration-300 md:static md:z-0',
          open ? 'translate-x-0' : '-translate-x-full',
          collapsed ? 'w-20' : 'w-64'
        )}
      >
        {/* Mobile Header */}
        <div className="flex h-16 items-center justify-between border-b px-4 md:hidden">
          <Link href="/" className="flex items-center space-x-1">
            <span className="text-xl font-bold text-primary">NEET</span>
            <span className="text-xl font-bold">JEE</span>
          </Link>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* User Profile Section */}
        <div className={cn(
          "border-b p-4 transition-all",
          collapsed && "p-2"
        )}>
          {collapsed ? (
            <div className="flex flex-col items-center gap-2">
              <Avatar
                src={user?.avatarUrl}
                fallback={user?.fullName || 'User'}
                size="md"
                className="cursor-pointer"
              />
              <StreakBadge streak={studyStreak} className="text-xs px-1.5 py-0.5" />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Avatar
                src={user?.avatarUrl}
                fallback={user?.fullName || 'User'}
                size="lg"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{user?.fullName || 'Student'}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {user?.targetExam || 'NEET'}
                  </Badge>
                  <StreakBadge streak={studyStreak} className="text-xs" />
                </div>
              </div>
            </div>
          )}

          {/* Weekly Progress */}
          {!collapsed && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Weekly Goal</span>
                <span className="font-medium">{weeklyProgress}%</span>
              </div>
              <Progress value={weeklyProgress} size="sm" />
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
            return (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  collapsed && 'justify-center px-2'
                )}
                onClick={onClose}
                title={collapsed ? link.name : undefined}
              >
                <link.icon className={cn("h-5 w-5 shrink-0", collapsed && "h-5 w-5")} />
                {!collapsed && (
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span>{link.name}</span>
                      {link.badge && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {link.badge}
                        </Badge>
                      )}
                    </div>
                    {link.description && (
                      <p className="text-xs text-muted-foreground/70 mt-0.5">
                        {link.description}
                      </p>
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Links */}
        <div className="border-t p-3 space-y-1">
          {bottomLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  collapsed && 'justify-center px-2'
                )}
                onClick={onClose}
                title={collapsed ? link.name : undefined}
              >
                <link.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{link.name}</span>}
              </Link>
            );
          })}
        </div>

        {/* Collapse Toggle - Desktop Only */}
        <button
          onClick={onToggleCollapse}
          className="hidden md:flex items-center justify-center w-8 h-8 rounded-full border bg-background shadow-sm hover:bg-muted transition-colors absolute -right-4 top-1/2 -translate-y-1/2"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </aside>
    </>
  );
}

// Mini sidebar for dashboard layout
export function MiniSidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <aside className={cn('w-16 border-r bg-background flex flex-col items-center py-4 gap-2', className)}>
      {sidebarLinks.slice(0, 6).map((link) => {
        const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
        return (
          <Link
            key={link.name}
            href={link.href}
            className={cn(
              'flex items-center justify-center w-10 h-10 rounded-lg transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
            title={link.name}
          >
            <link.icon className="h-5 w-5" />
          </Link>
        );
      })}
    </aside>
  );
}
