'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'superadmin') {
        router.push('/dashboard/superadmin');
      } else {
        router.push('/dashboard/vendor');
      }
    } else {
      router.push('/login');
    }
  }, [isAuthenticated, user, router]);
  return null;
}
