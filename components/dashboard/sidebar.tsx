'use client';

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
  Settings,
  User,
  FileText,
  Ticket,
  ShieldCheck,
  Layers,
  Wifi,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
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

  const items = isSuperAdmin ? [...baseItems, ...superAdminItems] : [...baseItems, ...vendorItems];

  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col h-full">
      {/* Logo at the top */}
      <div className="h-16 border-b border-sidebar-border flex items-center px-5 shrink-0">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary text-primary-foreground rounded-xl flex items-center justify-center shadow-md shadow-primary/20">
            <Wifi className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-base tracking-tight text-sidebar-foreground leading-tight">
              Hotspot <span className="text-primary">Manager</span>
            </span>
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
              ISP Enterprise
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-2">
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
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/20'
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Button>
            </Link>
          );
        })}
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
          >
            <User className="w-4 h-4" />
            <span>Profile</span>
          </Button>
        </Link>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent/20 text-destructive hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </Button>
      </div>
    </div>
  );
}
