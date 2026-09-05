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
  Ticket,
  ShieldCheck,
  Layers,
  Wifi,
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
      label: 'Static Packages',
      href: '/dashboard/vendor/static-packages',
      icon: Layers,
    },
    {
      label: 'Users',
      href: '/dashboard/vendor/users',
      icon: Users,
    },
    {
      label: 'Static Customers',
      href: '/dashboard/vendor/static-users',
      icon: ShieldCheck,
    },
    {
      label: 'Vouchers',
      href: '/dashboard/vendor/vouchers',
      icon: Ticket,
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
      {/* Mobile Top Header */}
      <div className="flex items-center justify-between p-4 bg-sidebar border-b border-sidebar-border md:hidden">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-primary text-primary-foreground rounded-lg flex items-center justify-center shadow-sm">
            <Wifi className="w-4 h-4" />
          </div>
          <span className="font-bold text-base tracking-tight text-sidebar-foreground">
            Hotspot <span className="text-primary">Manager</span>
          </span>
        </Link>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="text-sidebar-foreground hover:bg-sidebar-accent/20"
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </Button>
      </div>

      {/* Mobile Menu Overlay & Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop - Click outside to close */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Side Drawer Content */}
          <div className="relative w-72 max-w-[80vw] bg-sidebar h-full z-50 shadow-2xl flex flex-col overflow-hidden border-r border-sidebar-border">
            {/* Drawer Header with Logo & Close Icon */}
            <div className="h-16 border-b border-sidebar-border flex items-center justify-between px-4 shrink-0">
              <Link href="/" className="flex items-center gap-2.5" onClick={() => setIsOpen(false)}>
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-lg flex items-center justify-center shadow-sm">
                  <Wifi className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-sm tracking-tight text-sidebar-foreground leading-tight">
                    Hotspot <span className="text-primary">Manager</span>
                  </span>
                  <span className="text-[9px] text-muted-foreground font-medium uppercase tracking-wider">
                    ISP Enterprise
                  </span>
                </div>
              </Link>

              {/* Close Menu Icon */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent/20"
                onClick={() => setIsOpen(false)}
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Navigation items */}
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-2">
              <div className="space-y-1">
                {baseItems.map((item) => {
                  const Icon = item.icon;
                  const isDashboardHome = item.href === '/dashboard/superadmin' || item.href === '/dashboard/vendor';
                  const isActive = isDashboardHome
                    ? pathname === item.href
                    : pathname === item.href || pathname.startsWith(item.href + '/');

                  return (
                    <Link key={item.href} href={item.href}>
                      <Button
                        variant={isActive ? 'default' : 'ghost'}
                        className={cn(
                          'w-full justify-start gap-3',
                          isActive
                            ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                            : 'text-sidebar-foreground hover:bg-sidebar-accent/20'
                        )}
                        onClick={() => setIsOpen(false)}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </Button>
                    </Link>
                  );
                })}
              </div>

              <div className="border-t border-sidebar-border pt-2 mt-2 space-y-1">
                {items.map((item) => {
                  const Icon = item.icon;
                  const isDashboardHome = item.href === '/dashboard/superadmin' || item.href === '/dashboard/vendor';
                  const isActive = isDashboardHome
                    ? pathname === item.href
                    : pathname === item.href || pathname.startsWith(item.href + '/');

                  return (
                    <Link key={item.href} href={item.href}>
                      <Button
                        variant={isActive ? 'default' : 'ghost'}
                        className={cn(
                          'w-full justify-start gap-3',
                          isActive
                            ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                            : 'text-sidebar-foreground hover:bg-sidebar-accent/20'
                        )}
                        onClick={() => setIsOpen(false)}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </Button>
                    </Link>
                  );
                })}
              </div>
            </nav>

            {/* Footer */}
            <div className="border-t border-sidebar-border p-4 space-y-2 shrink-0">
              <div className="px-3 py-2 rounded-lg bg-muted/50 border border-border/60">
                <p className="text-xs text-sidebar-foreground font-bold truncate">{user?.name || 'Vendor Admin'}</p>
                <p
                  className="text-xs text-foreground font-medium truncate mt-0.5 opacity-90"
                  title={user?.email || 'vendor@example.com'}
                >
                  {user?.email || 'vendor@example.com'}
                </p>
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
                className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent/20 text-destructive hover:text-destructive"
                onClick={() => {
                  setIsOpen(false);
                  handleLogout();
                }}
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
