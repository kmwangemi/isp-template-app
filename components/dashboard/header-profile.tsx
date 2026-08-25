'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useState } from 'react';
import { LogOut, User, Settings } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function HeaderProfile() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const isSuperAdmin = user?.role === 'superadmin';

  const handleLogout = () => {
    logout();
    router.push('/login');
    setIsOpen(false);
  };

  if (!user) return null;

  const profilePicture = user.profilePicture || null;
  const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-full hover:bg-background/50 transition-colors"
        title="Profile Menu"
      >
        <div className="w-10 h-10 rounded-full overflow-hidden bg-primary/20 border border-border flex items-center justify-center">
          {profilePicture ? (
            <Image
              src={profilePicture}
              alt={user.name || 'Profile'}
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-sm font-semibold text-primary">{initials || 'U'}</span>
          )}
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
            {/* User Info */}
            <div className="px-4 py-3 border-b border-border bg-background/50">
              <p className="text-sm font-semibold text-foreground">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              <Link href={isSuperAdmin ? '/dashboard/superadmin/profile' : '/dashboard/vendor/profile'}>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-background/50 transition-colors"
                >
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span>My Profile</span>
                </button>
              </Link>

              {isSuperAdmin && (
                <Link href="/dashboard/superadmin/logs">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-background/50 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-muted-foreground" />
                    <span>Activity Logs</span>
                  </button>
                </Link>
              )}
            </div>

            {/* Logout */}
            <div className="border-t border-border py-2">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
