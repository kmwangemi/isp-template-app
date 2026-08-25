'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Router,
  Package,
  Users,
  Activity,
  BarChart3,
  LogOut,
  User,
  Menu,
  X,
  FileText,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function MobileNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const isSuperAdmin = user?.role === 'superadmin';

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const baseItems = [
    {
      label: 'Dashboard',
      href: isSuperAdmin ? '/dashboard/superadmin' : '/dashboard/vendor',
      icon: LayoutDashboard,
    },
  ];

  const superAdminItems = [
    {
      label: 'Vendors',
      href: '/dashboard/superadmin/vendors',
      icon: Users,
    },
    {
      label: 'Routers',
      href: '/dashboard/superadmin/routers',
      icon: Router,
    },
    {
      label: 'Analytics',
      href: '/dashboard/superadmin/analytics',
      icon: BarChart3,
    },
    {
      label: 'Logs',
      href: '/dashboard/superadmin/logs',
      icon: FileText,
    },
  ];

  const vendorItems = [
    {
      label: 'Routers',
      href: '/dashboard/vendor/routers',
      icon: Router,
    },
    {
      label: 'Packages',
      href: '/dashboard/vendor/packages',
      icon: Package,
    },
    {
      label: 'Users',
      href: '/dashboard/vendor/users',
      icon: Users,
    },
    {
      label: 'Sessions',
      href: '/dashboard/vendor/sessions',
      icon: Activity,
    },
    {
      label: 'Transactions',
      href: '/dashboard/vendor/transactions',
      icon: BarChart3,
    },
    {
      label: 'Analytics',
      href: '/dashboard/vendor/analytics',
      icon: BarChart3,
    },
  ];

  const items = isSuperAdmin ? superAdminItems : vendorItems;

  return (
    <>
      <div className="flex items-center gap-4 p-4 bg-sidebar border-b border-sidebar-border md:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="text-sidebar-foreground hover:bg-sidebar-accent/20"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </Button>
        <div className="flex-1">
          <h1 className="text-sm font-semibold text-sidebar-foreground">HotSpot Manager</h1>
        </div>
      </div>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed top-0 left-0 right-0 bottom-0 z-40 md:hidden overflow-hidden">
            <div className="bg-sidebar w-64 h-full overflow-y-auto pt-12 flex flex-col">
              <nav className="flex-1 space-y-2 px-4 py-6">
                <div className="space-y-2">
                  {baseItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || pathname.startsWith(item.href);

                    return (
                      <Link key={item.href} href={item.href}>
                        <Button
                          variant="ghost"
                          className={cn(
                            'w-full justify-start gap-3',
                            isActive
                              ? 'bg-sidebar-primary/20 text-sidebar-primary'
                              : 'text-sidebar-foreground hover:bg-sidebar-accent/20'
                          )}
                          onClick={() => setIsOpen(false)}
                        >
                          <Icon className="w-5 h-5" />
                          <span>{item.label}</span>
                        </Button>
                      </Link>
                    );
                  })}
                </div>

                <div className="border-t border-sidebar-border pt-2 mt-2">
                  {items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || pathname.startsWith(item.href);

                    return (
                      <Link key={item.href} href={item.href}>
                        <Button
                          variant="ghost"
                          className={cn(
                            'w-full justify-start gap-3',
                            isActive
                              ? 'bg-sidebar-primary/20 text-sidebar-primary'
                              : 'text-sidebar-foreground hover:bg-sidebar-accent/20'
                          )}
                          onClick={() => setIsOpen(false)}
                        >
                          <Icon className="w-5 h-5" />
                          <span>{item.label}</span>
                        </Button>
                      </Link>
                    );
                  })}
                </div>
              </nav>

              <div className="border-t border-sidebar-border p-4 space-y-2">
                <div className="px-2 py-2">
                  <p className="text-xs text-sidebar-foreground font-semibold">{user?.name}</p>
                  <p className="text-xs text-sidebar-accent-foreground/70">{user?.email}</p>
                </div>
                <Link href={isSuperAdmin ? '/dashboard/superadmin/profile' : '/dashboard/vendor/profile'}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent/20"
                    onClick={() => setIsOpen(false)}
                  >
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent/20"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
