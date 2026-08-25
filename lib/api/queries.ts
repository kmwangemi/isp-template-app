import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  mockRoutersData,
  mockVendorsData,
  mockPackagesData,
  mockHotspotUsersData,
  mockSessionsData,
  mockTransactionsData,
  generateRevenueData,
  generateUserGrowthData,
  generateSessionData,
  generateDailyActiveUsersData,
  generateTopPackagesData,
  generateConversionRateData,
  generateTransactionVolumeData,
  type RouterStatus,
  type Package,
  type HotspotUser,
  type Session,
  type Vendor,
  type Transaction,
} from './mockData';

// Router queries
export const useRouters = (vendorId?: string) => {
  return useQuery({
    queryKey: ['routers', vendorId],
    queryFn: () => {
      return new Promise<RouterStatus[]>((resolve) => {
        setTimeout(() => {
          const routers = vendorId
            ? mockRoutersData.filter((r) => r.vendorId === vendorId)
            : mockRoutersData;
          resolve(routers);
        }, 300);
      });
    },
  });
};

export const useRouter = (routerId: string) => {
  return useQuery({
    queryKey: ['router', routerId],
    queryFn: () => {
      return new Promise<RouterStatus | undefined>((resolve) => {
        setTimeout(() => {
          resolve(mockRoutersData.find((r) => r.id === routerId));
        }, 200);
      });
    },
  });
};

export const useAddRouter = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ id: Date.now().toString(), ...data });
        }, 300);
      });
    },
    onSuccess: (newRouter) => {
      queryClient.invalidateQueries({ queryKey: ['routers'] });
    },
  });
};

export const useUpdateRouter = (routerId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ id: routerId, ...data });
        }, 300);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['router', routerId] });
      queryClient.invalidateQueries({ queryKey: ['routers'] });
    },
  });
};

export const useDeleteRouter = (routerId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ success: true });
        }, 300);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routers'] });
    },
  });
};

// Package queries
export const usePackages = (vendorId?: string) => {
  return useQuery({
    queryKey: ['packages', vendorId],
    queryFn: () => {
      return new Promise<Package[]>((resolve) => {
        setTimeout(() => {
          const packages = vendorId
            ? mockPackagesData.filter((p) => p.vendorId === vendorId)
            : mockPackagesData;
          resolve(packages);
        }, 200);
      });
    },
  });
};

export const useAddPackage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ id: Date.now().toString(), ...data, createdAt: new Date().toISOString() });
        }, 300);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
    },
  });
};

export const useUpdatePackage = (packageId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ id: packageId, ...data });
        }, 300);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
    },
  });
};

export const useDeletePackage = (packageId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ success: true });
        }, 300);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
    },
  });
};

// Hotspot user queries
export const useHotspotUsers = (vendorId?: string) => {
  return useQuery({
    queryKey: ['hotspot-users', vendorId],
    queryFn: () => {
      return new Promise<HotspotUser[]>((resolve) => {
        setTimeout(() => {
          const users = vendorId
            ? mockHotspotUsersData.filter((u) => u.vendorId === vendorId)
            : mockHotspotUsersData;
          resolve(users);
        }, 200);
      });
    },
  });
};

export const useAddHotspotUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            id: Date.now().toString(),
            ...data,
            status: 'active',
            createdAt: new Date().toISOString(),
            expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          });
        }, 300);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotspot-users'] });
    },
  });
};

export const useDeleteHotspotUser = (userId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ success: true });
        }, 300);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotspot-users'] });
    },
  });
};

// Session queries
export const useSessions = (vendorId?: string) => {
  return useQuery({
    queryKey: ['sessions', vendorId],
    queryFn: () => {
      return new Promise<Session[]>((resolve) => {
        setTimeout(() => {
          const sessions = vendorId
            ? mockSessionsData.filter((s) => s.vendorId === vendorId)
            : mockSessionsData;
          resolve(sessions);
        }, 200);
      });
    },
    refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
  });
};

export const useKickSession = (sessionId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ success: true });
        }, 300);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
};

// Transaction queries
export const useTransactions = (vendorId?: string) => {
  return useQuery({
    queryKey: ['transactions', vendorId],
    queryFn: () => {
      return new Promise<Transaction[]>((resolve) => {
        setTimeout(() => {
          const transactions = vendorId
            ? mockTransactionsData.filter((t) => t.vendorId === vendorId)
            : mockTransactionsData;
          resolve(transactions);
        }, 200);
      });
    },
  });
};

// Vendor queries
export const useVendors = () => {
  return useQuery({
    queryKey: ['vendors'],
    queryFn: () => {
      return new Promise<Vendor[]>((resolve) => {
        setTimeout(() => {
          resolve(mockVendorsData);
        }, 200);
      });
    },
  });
};

export const useVendor = (vendorId: string) => {
  return useQuery({
    queryKey: ['vendor', vendorId],
    queryFn: () => {
      return new Promise<Vendor | undefined>((resolve) => {
        setTimeout(() => {
          resolve(mockVendorsData.find((v) => v.id === vendorId));
        }, 200);
      });
    },
  });
};

export const useVendorDetails = (vendorId: string) => {
  return useQuery({
    queryKey: ['vendor-details', vendorId],
    queryFn: () => {
      return new Promise<Vendor | undefined>((resolve) => {
        setTimeout(() => {
          resolve(mockVendorsData.find((v) => v.id === vendorId));
        }, 300);
      });
    },
  });
};

// Analytics queries
export const useRevenueData = (vendorId?: string) => {
  return useQuery({
    queryKey: ['analytics', 'revenue', vendorId],
    queryFn: () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(generateRevenueData(vendorId));
        }, 300);
      });
    },
  });
};

export const useUserGrowthData = () => {
  return useQuery({
    queryKey: ['analytics', 'user-growth'],
    queryFn: () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(generateUserGrowthData());
        }, 300);
      });
    },
  });
};

export const useSessionDistributionData = () => {
  return useQuery({
    queryKey: ['analytics', 'session-distribution'],
    queryFn: () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(generateSessionData());
        }, 200);
      });
    },
  });
};

export const useDailyActiveUsersData = () => {
  return useQuery({
    queryKey: ['analytics', 'daily-active-users'],
    queryFn: () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(generateDailyActiveUsersData());
        }, 300);
      });
    },
  });
};

export const useTopPackagesData = () => {
  return useQuery({
    queryKey: ['analytics', 'top-packages'],
    queryFn: () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(generateTopPackagesData());
        }, 200);
      });
    },
  });
};

export const useConversionRateData = () => {
  return useQuery({
    queryKey: ['analytics', 'conversion-rate'],
    queryFn: () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(generateConversionRateData());
        }, 300);
      });
    },
  });
};

export const useTransactionVolumeData = () => {
  return useQuery({
    queryKey: ['analytics', 'transaction-volume'],
    queryFn: () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(generateTransactionVolumeData());
        }, 300);
      });
    },
  });
};
