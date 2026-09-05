import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  mockRoutersData,
  mockVendorsData,
  mockPackagesData,
  mockHotspotUsersData,
  mockSessionsData,
  mockTransactionsData,
  mockStaticPackagesData,
  mockStaticUsersData,
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
  type StaticPackage,
  type StaticUser,
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
      return new Promise<Package>((resolve) => {
        setTimeout(() => {
          const selectedRouter = mockRoutersData.find((r) => r.id === data.routerId);
          const newPackage: Package = {
            id: `pkg_${Date.now()}`,
            vendorId: data.vendorId || 'v1',
            routerId: data.routerId && data.routerId !== 'all' ? data.routerId : undefined,
            routerName: selectedRouter ? selectedRouter.name : 'All Routers',
            name: data.name,
            price: Number(data.price),
            duration: Number(data.duration),
            durationUnit: data.durationUnit || 'hours',
            downloadLimit: data.downloadLimit ? Number(data.downloadLimit) : undefined,
            downloadUnit: data.downloadUnit || 'Mbps',
            uploadLimit: data.uploadLimit ? Number(data.uploadLimit) : undefined,
            uploadUnit: data.uploadUnit || 'Mbps',
            maxUsers: Number(data.maxSessions || 1),
            createdAt: new Date().toISOString(),
          };
          mockPackagesData.unshift(newPackage);
          resolve(newPackage);
        }, 300);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
    },
  });
};

export const useUpdatePackage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Package> }) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          const index = mockPackagesData.findIndex((p) => p.id === id);
          if (index !== -1) {
            mockPackagesData[index] = { ...mockPackagesData[index], ...data };
          }
          resolve({ id, ...data });
        }, 300);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
    },
  });
};

export const useDeletePackage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (packageId: string) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          const index = mockPackagesData.findIndex((p) => p.id === packageId);
          if (index !== -1) {
            mockPackagesData.splice(index, 1);
          }
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

// Static Package queries
export const useStaticPackages = (vendorId?: string) => {
  return useQuery({
    queryKey: ['static-packages', vendorId],
    queryFn: () => {
      return new Promise<StaticPackage[]>((resolve) => {
        setTimeout(() => {
          const packages = vendorId
            ? mockStaticPackagesData.filter((p) => p.vendorId === vendorId)
            : mockStaticPackagesData;
          resolve(packages);
        }, 200);
      });
    },
  });
};

export const useAddStaticPackage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      return new Promise<StaticPackage>((resolve) => {
        setTimeout(() => {
          const selectedRouter = mockRoutersData.find((r) => r.id === data.routerId);
          const newPackage: StaticPackage = {
            id: `spkg_${Date.now()}`,
            vendorId: data.vendorId || 'v1',
            routerId: data.routerId && data.routerId !== 'all' ? data.routerId : undefined,
            routerName: selectedRouter ? selectedRouter.name : 'All Routers',
            name: data.name,
            tier: data.tier || 'Gold',
            price: Number(data.price),
            duration: Number(data.duration),
            durationUnit: data.durationUnit || 'months',
            downloadLimit: data.downloadLimit ? Number(data.downloadLimit) : undefined,
            downloadUnit: data.downloadUnit || 'Mbps',
            uploadLimit: data.uploadLimit ? Number(data.uploadLimit) : undefined,
            uploadUnit: data.uploadUnit || 'Mbps',
            ipPool: data.ipPool,
            status: data.status || 'active',
            description: data.description,
            createdAt: new Date().toISOString().split('T')[0],
          };
          mockStaticPackagesData.unshift(newPackage);
          resolve(newPackage);
        }, 300);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['static-packages'] });
    },
  });
};

export const useUpdateStaticPackage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<StaticPackage> }) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          const index = mockStaticPackagesData.findIndex((p) => p.id === id);
          if (index !== -1) {
            if (data.routerId) {
              const r = mockRoutersData.find((router) => router.id === data.routerId);
              data.routerName = r ? r.name : 'All Routers';
            }
            mockStaticPackagesData[index] = { ...mockStaticPackagesData[index], ...data };
          }
          resolve({ id, ...data });
        }, 300);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['static-packages'] });
    },
  });
};

export const useDeleteStaticPackage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (packageId: string) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          const index = mockStaticPackagesData.findIndex((p) => p.id === packageId);
          if (index !== -1) {
            mockStaticPackagesData.splice(index, 1);
          }
          resolve({ success: true });
        }, 300);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['static-packages'] });
    },
  });
};

// Static User queries
export const useStaticUsers = (vendorId?: string) => {
  return useQuery({
    queryKey: ['static-users', vendorId],
    queryFn: () => {
      return new Promise<StaticUser[]>((resolve) => {
        setTimeout(() => {
          const users = vendorId
            ? mockStaticUsersData.filter((u) => u.vendorId === vendorId)
            : mockStaticUsersData;
          resolve(users);
        }, 200);
      });
    },
  });
};

export const useAddStaticUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      return new Promise<StaticUser>((resolve) => {
        setTimeout(() => {
          const selectedRouter = mockRoutersData.find((r) => r.id === data.routerId);
          const selectedPkg = mockStaticPackagesData.find((p) => p.id === data.packageId);
          const newUser: StaticUser = {
            id: `susr_${Date.now()}`,
            vendorId: data.vendorId || 'v1',
            name: data.name,
            email: data.email || undefined,
            phone: data.phone,
            staticIp: data.staticIp,
            packageId: data.packageId,
            packageName: selectedPkg ? selectedPkg.name : 'Static Package',
            packageTier: selectedPkg ? selectedPkg.tier : 'Gold',
            price: selectedPkg ? selectedPkg.price : 0,
            routerId: data.routerId,
            routerName: selectedRouter ? selectedRouter.name : 'Unknown Router',
            status: data.status || 'active',
            subscribedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
            expiryDate: data.expiryDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            notes: data.notes,
          };
          mockStaticUsersData.unshift(newUser);
          resolve(newUser);
        }, 300);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['static-users'] });
    },
  });
};

export const useUpdateStaticUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<StaticUser> }) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          const index = mockStaticUsersData.findIndex((u) => u.id === id);
          if (index !== -1) {
            if (data.routerId) {
              const r = mockRoutersData.find((router) => router.id === data.routerId);
              data.routerName = r ? r.name : undefined;
            }
            if (data.packageId) {
              const p = mockStaticPackagesData.find((pkg) => pkg.id === data.packageId);
              if (p) {
                data.packageName = p.name;
                data.packageTier = p.tier;
                data.price = p.price;
              }
            }
            mockStaticUsersData[index] = { ...mockStaticUsersData[index], ...data };
          }
          resolve({ id, ...data });
        }, 300);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['static-users'] });
    },
  });
};

export const useDeleteStaticUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          const index = mockStaticUsersData.findIndex((u) => u.id === userId);
          if (index !== -1) {
            mockStaticUsersData.splice(index, 1);
          }
          resolve({ success: true });
        }, 300);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['static-users'] });
    },
  });
};
