// Mock data for the application

export interface RouterStatus {
  id: string;
  vendorId: string;
  name: string;
  ipAddress: string;
  status: 'online' | 'offline';
  uptime: number;
  activeUsers: number;
  bandwidthUsage: {
    upload: number;
    download: number;
  };
  lastSyncTime: string;
  connectedPackages: number;
  totalSessions: number;
  cpuUsage: number;
  memoryUsage: number;
  errorLog: Array<{ timestamp: string; message: string }>;
  dailyStats: Array<{ date: string; activeUsers: number; bandwidth: number }>;
}

export interface Vendor {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'suspended';
  createdAt: string;
  revenue: number;
  activeUsers: number;
  activeSessions: number;
}

export interface Router {
  id: string;
  vendorId: string;
  name: string;
  ipAddress: string;
  status: 'online' | 'offline';
  activeUsers: number;
}

export interface Package {
  id: string;
  vendorId: string;
  routerId?: string;
  routerName?: string;
  name: string;
  price: number;
  duration: number;
  durationUnit: 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years';
  downloadLimit?: number;
  downloadUnit?: 'Kbps' | 'Mbps';
  uploadLimit?: number;
  uploadUnit?: 'Kbps' | 'Mbps';
  bandwidthLimit?: number;
  maxUsers: number;
  profile?: string;
  status?: 'active' | 'inactive';
  description?: string;
  createdAt: string;
}

export interface HotspotUser {
  id: string;
  vendorId: string;
  username: string;
  password?: string;
  voucherCode?: string;
  phoneNumber?: string;
  email?: string;
  packageId: string;
  packageName?: string;
  routerId: string;
  routerName?: string;
  amount?: number;
  boughtAt?: string;
  createdAt: string;
  status: 'active' | 'inactive' | 'expired';
  expiryDate: string;
  duration?: string;
  lastLogin?: string;
}

export interface Session {
  id: string;
  vendorId: string;
  userId: string;
  username: string;
  routerId: string;
  startTime: string;
  duration: number; // in minutes
  bytesDownloaded: number;
  bytesUploaded: number;
  status: 'active' | 'disconnected';
}

export interface Transaction {
  id: string;
  vendorId: string;
  userId: string;
  packageId: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  date: string;
}

export const mockRoutersData: RouterStatus[] = [
  {
    id: '1',
    vendorId: 'v1',
    name: 'Router Main - District 1',
    ipAddress: '192.168.1.1',
    status: 'online',
    uptime: 99.8,
    activeUsers: 156,
    bandwidthUsage: { upload: 45.2, download: 78.5 },
    lastSyncTime: new Date().toISOString(),
    connectedPackages: 5,
    totalSessions: 234,
    cpuUsage: 35,
    memoryUsage: 52,
    errorLog: [],
    dailyStats: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      activeUsers: Math.floor(Math.random() * 150) + 50,
      bandwidth: Math.floor(Math.random() * 80) + 20,
    })),
  },
  {
    id: '2',
    vendorId: 'v1',
    name: 'Router Secondary - District 2',
    ipAddress: '192.168.2.1',
    status: 'online',
    uptime: 99.5,
    activeUsers: 89,
    bandwidthUsage: { upload: 32.1, download: 65.3 },
    lastSyncTime: new Date().toISOString(),
    connectedPackages: 5,
    totalSessions: 145,
    cpuUsage: 28,
    memoryUsage: 41,
    errorLog: [],
    dailyStats: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      activeUsers: Math.floor(Math.random() * 100) + 30,
      bandwidth: Math.floor(Math.random() * 70) + 15,
    })),
  },
  {
    id: '3',
    vendorId: 'v1',
    name: 'Router Backup - District 3',
    ipAddress: '192.168.3.1',
    status: 'offline',
    uptime: 87.2,
    activeUsers: 0,
    bandwidthUsage: { upload: 0, download: 0 },
    lastSyncTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    connectedPackages: 5,
    totalSessions: 0,
    cpuUsage: 0,
    memoryUsage: 0,
    errorLog: [{ timestamp: new Date().toISOString(), message: 'Connection lost' }],
    dailyStats: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      activeUsers: 0,
      bandwidth: 0,
    })),
  },
  {
    id: '4',
    vendorId: 'v2',
    name: 'Router Premium - City A',
    ipAddress: '10.0.1.1',
    status: 'online',
    uptime: 99.9,
    activeUsers: 234,
    bandwidthUsage: { upload: 89.5, download: 125.3 },
    lastSyncTime: new Date().toISOString(),
    connectedPackages: 6,
    totalSessions: 456,
    cpuUsage: 42,
    memoryUsage: 58,
    errorLog: [],
    dailyStats: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      activeUsers: Math.floor(Math.random() * 250) + 100,
      bandwidth: Math.floor(Math.random() * 130) + 50,
    })),
  },
];

export const mockVendorsData: Vendor[] = [
  {
    id: 'v1',
    name: 'District WiFi Services',
    email: 'contact@districtwifi.com',
    phone: '+1-555-0100',
    status: 'active',
    createdAt: '2024-01-15',
    revenue: 45000,
    activeUsers: 245,
    activeSessions: 234,
  },
  {
    id: 'v2',
    name: 'Premium Networks Ltd',
    email: 'info@premiumnetworks.com',
    phone: '+1-555-0200',
    status: 'active',
    createdAt: '2024-02-10',
    revenue: 78000,
    activeUsers: 512,
    activeSessions: 456,
  },
  {
    id: 'v3',
    name: 'Community Internet Hub',
    email: 'support@communityinternet.io',
    phone: '+1-555-0300',
    status: 'active',
    createdAt: '2024-03-05',
    revenue: 32000,
    activeUsers: 189,
    activeSessions: 145,
  },
];

export const mockPackagesData: Package[] = [
  {
    id: 'pkg1',
    vendorId: 'v1',
    routerId: '1',
    routerName: 'Router Main - District 1',
    name: 'Basic - 1 Hour',
    price: 50.00,
    duration: 1,
    durationUnit: 'hours',
    downloadLimit: 10,
    downloadUnit: 'Mbps',
    uploadLimit: 5,
    uploadUnit: 'Mbps',
    maxUsers: 1,
    status: 'active',
    description: 'High-speed 1 hour pass for quick browsing and streaming.',
    createdAt: '2024-01-20',
  },
  {
    id: 'pkg2',
    vendorId: 'v1',
    routerId: 'all',
    routerName: 'All Routers',
    name: 'Standard - 1 Day',
    price: 200.00,
    duration: 1,
    durationUnit: 'days',
    downloadLimit: 20,
    downloadUnit: 'Mbps',
    uploadLimit: 10,
    uploadUnit: 'Mbps',
    maxUsers: 2,
    status: 'active',
    description: 'Full day access valid across all network routers.',
    createdAt: '2024-01-20',
  },
  {
    id: 'pkg3',
    vendorId: 'v1',
    routerId: '2',
    routerName: 'Router Secondary - District 2',
    name: 'Premium - 7 Days',
    price: 750.00,
    duration: 7,
    durationUnit: 'days',
    downloadLimit: 50,
    downloadUnit: 'Mbps',
    uploadLimit: 25,
    uploadUnit: 'Mbps',
    maxUsers: 3,
    status: 'active',
    description: '7-day premium pass with ultra-fast download speeds.',
    createdAt: '2024-01-20',
  },
  {
    id: 'pkg4',
    vendorId: 'v1',
    routerId: 'all',
    routerName: 'All Routers',
    name: 'Monthly Pass',
    price: 2500.00,
    duration: 30,
    durationUnit: 'days',
    downloadLimit: 100,
    downloadUnit: 'Mbps',
    uploadLimit: 50,
    uploadUnit: 'Mbps',
    maxUsers: 5,
    status: 'active',
    description: 'Unrestricted monthly access for power users.',
    createdAt: '2024-01-20',
  },
  {
    id: 'pkg5',
    vendorId: 'v2',
    name: 'Express - 2 Hours',
    price: 3.49,
    duration: 2,
    durationUnit: 'hours',
    maxUsers: 1,
    profile: 'express-2h',
    createdAt: '2024-02-15',
  },
  {
    id: 'pkg6',
    vendorId: 'v2',
    name: 'Family - 30 Days',
    price: 39.99,
    duration: 30,
    durationUnit: 'days',
    bandwidthLimit: 100000,
    maxUsers: 10,
    profile: 'family-30d',
    createdAt: '2024-02-15',
  },
];

export const mockHotspotUsersData: HotspotUser[] = [
  {
    id: 'user1',
    vendorId: 'v1',
    username: 'john_doe',
    voucherCode: 'HS-9K2M-2026',
    phoneNumber: '+254 712 345 678',
    email: 'john@example.com',
    packageId: 'pkg1',
    packageName: 'Basic - 1 Hour',
    routerId: '1',
    routerName: 'Router Main - District 1',
    amount: 50.00,
    duration: '1 Hour',
    boughtAt: '2026-09-05 08:30',
    createdAt: '2026-09-05T08:30:00Z',
    status: 'active',
    expiryDate: '2026-09-05T09:30:00Z',
    lastLogin: '2026-09-05T08:31:00Z',
  },
  {
    id: 'user2',
    vendorId: 'v1',
    username: 'jane_smith',
    voucherCode: 'HS-4V8P-9012',
    phoneNumber: '+254 722 987 654',
    email: 'jane@example.com',
    packageId: 'pkg2',
    packageName: 'Standard - 1 Day',
    routerId: '1',
    routerName: 'Router Main - District 1',
    amount: 200.00,
    duration: '24 Hours',
    boughtAt: '2026-09-05 07:15',
    createdAt: '2026-09-05T07:15:00Z',
    status: 'active',
    expiryDate: '2026-09-06T07:15:00Z',
    lastLogin: '2026-09-05T07:16:00Z',
  },
  {
    id: 'user3',
    vendorId: 'v1',
    username: 'alex_k',
    voucherCode: 'HS-7W1X-3490',
    phoneNumber: '+254 733 112 233',
    email: 'alex@example.com',
    packageId: 'pkg3',
    packageName: 'Premium - 7 Days',
    routerId: '2',
    routerName: 'Router Secondary - District 2',
    amount: 750.00,
    duration: '7 Days',
    boughtAt: '2026-09-01 10:00',
    createdAt: '2026-09-01T10:00:00Z',
    status: 'active',
    expiryDate: '2026-09-08T10:00:00Z',
    lastLogin: '2026-09-05T06:45:00Z',
  },
  {
    id: 'user4',
    vendorId: 'v1',
    username: 'user_temp',
    voucherCode: 'HS-2B9N-5612',
    phoneNumber: '+254 701 445 566',
    email: 'temp@example.com',
    packageId: 'pkg1',
    packageName: 'Basic - 1 Hour',
    routerId: '2',
    routerName: 'Router Secondary - District 2',
    amount: 50.00,
    duration: '1 Hour',
    boughtAt: '2026-09-04 14:20',
    createdAt: '2026-09-04T14:20:00Z',
    status: 'expired',
    expiryDate: '2026-09-04T15:20:00Z',
    lastLogin: '2026-09-04T14:21:00Z',
  },
];

export const mockSessionsData: Session[] = [
  {
    id: 'sess1',
    vendorId: 'v1',
    userId: 'user1',
    username: 'john_doe',
    routerId: '1',
    startTime: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    duration: 45,
    bytesDownloaded: 250000000,
    bytesUploaded: 45000000,
    status: 'active',
  },
  {
    id: 'sess2',
    vendorId: 'v1',
    userId: 'user2',
    username: 'jane_smith',
    routerId: '1',
    startTime: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    duration: 120,
    bytesDownloaded: 520000000,
    bytesUploaded: 89000000,
    status: 'active',
  },
];

export const mockTransactionsData: Transaction[] = [
  {
    id: 'TXN-9842',
    vendorId: 'v1',
    userId: 'john_doe',
    packageId: 'Basic - 1 Hour',
    amount: 50.00,
    status: 'completed',
    date: '2026-09-05',
  },
  {
    id: 'TXN-9841',
    vendorId: 'v1',
    userId: 'jane_smith',
    packageId: 'Standard - 1 Day',
    amount: 200.00,
    status: 'completed',
    date: '2026-09-05',
  },
  {
    id: 'TXN-9840',
    vendorId: 'v1',
    userId: 'alex_k',
    packageId: 'Premium - 7 Days',
    amount: 750.00,
    status: 'completed',
    date: '2026-09-01',
  },
  {
    id: 'TXN-9839',
    vendorId: 'v1',
    userId: 'user_temp',
    packageId: 'Basic - 1 Hour',
    amount: 50.00,
    status: 'failed',
    date: '2026-09-04',
  },
  {
    id: 'TXN-9838',
    vendorId: 'v1',
    userId: 'peter_m',
    packageId: 'Monthly Pass',
    amount: 2500.00,
    status: 'pending',
    date: '2026-09-03',
  },
  {
    id: 'TXN-9835',
    vendorId: 'v1',
    userId: 'david_r',
    packageId: 'Standard - 1 Day',
    amount: 200.00,
    status: 'completed',
    date: '2026-08-20',
  },
  {
    id: 'TXN-9830',
    vendorId: 'v1',
    userId: 'sarah_w',
    packageId: 'Premium - 7 Days',
    amount: 750.00,
    status: 'completed',
    date: '2026-08-05',
  },
  {
    id: 'TXN-9810',
    vendorId: 'v1',
    userId: 'michael_b',
    packageId: 'Monthly Pass',
    amount: 2500.00,
    status: 'completed',
    date: '2026-06-15',
  },
];

// Static IP Package & Customer interfaces and mock data
export interface StaticPackage {
  id: string;
  vendorId: string;
  routerId?: string;
  routerName?: string;
  name: string;
  tier: 'Gold' | 'Silver' | 'Bronze' | 'Custom';
  price: number;
  duration: number;
  durationUnit: 'days' | 'months' | 'years';
  downloadLimit?: number;
  downloadUnit?: 'Kbps' | 'Mbps';
  uploadLimit?: number;
  uploadUnit?: 'Kbps' | 'Mbps';
  ipPool?: string;
  status: 'active' | 'inactive';
  description?: string;
  createdAt: string;
}

export interface StaticUser {
  id: string;
  vendorId: string;
  name: string;
  email?: string;
  phone: string;
  staticIp: string;
  packageId: string;
  packageName?: string;
  packageTier?: 'Gold' | 'Silver' | 'Bronze' | 'Custom';
  price?: number;
  routerId: string;
  routerName?: string;
  status: 'active' | 'suspended' | 'expired';
  subscribedAt: string;
  expiryDate: string;
  notes?: string;
}

export const mockStaticPackagesData: StaticPackage[] = [
  {
    id: 'spkg_gold',
    vendorId: 'v1',
    routerId: '1',
    routerName: 'Router Main - District 1',
    name: 'Gold Tier - 50Mbps',
    tier: 'Gold',
    price: 5000.00,
    duration: 1,
    durationUnit: 'months',
    downloadLimit: 50,
    downloadUnit: 'Mbps',
    uploadLimit: 25,
    uploadUnit: 'Mbps',
    ipPool: '192.168.10.100-192.168.10.200',
    status: 'active',
    description: 'High-speed dedicated static IP line with priority support and 50Mbps bandwidth.',
    createdAt: '2026-01-15',
  },
  {
    id: 'spkg_silver',
    vendorId: 'v1',
    routerId: '1',
    routerName: 'Router Main - District 1',
    name: 'Silver Tier - 25Mbps',
    tier: 'Silver',
    price: 3200.00,
    duration: 1,
    durationUnit: 'months',
    downloadLimit: 25,
    downloadUnit: 'Mbps',
    uploadLimit: 12,
    uploadUnit: 'Mbps',
    ipPool: '192.168.10.100-192.168.10.200',
    status: 'active',
    description: 'Standard dedicated connection for medium business offices.',
    createdAt: '2026-01-15',
  },
  {
    id: 'spkg_bronze',
    vendorId: 'v1',
    routerId: '2',
    routerName: 'Router Secondary - District 2',
    name: 'Bronze Tier - 10Mbps',
    tier: 'Bronze',
    price: 1800.00,
    duration: 1,
    durationUnit: 'months',
    downloadLimit: 10,
    downloadUnit: 'Mbps',
    uploadLimit: 5,
    uploadUnit: 'Mbps',
    ipPool: '192.168.20.50-192.168.20.150',
    status: 'active',
    description: 'Basic static IP connectivity package ideal for small shops and residential users.',
    createdAt: '2026-01-20',
  },
];

export const mockStaticUsersData: StaticUser[] = [
  {
    id: 'susr_1',
    vendorId: 'v1',
    name: 'Apex Enterprises',
    email: 'contact@apex.co.ke',
    phone: '+254 712 998 877',
    staticIp: '192.168.10.45',
    packageId: 'spkg_gold',
    packageName: 'Gold Tier - 50Mbps',
    packageTier: 'Gold',
    price: 5000.00,
    routerId: '1',
    routerName: 'Router Main - District 1',
    status: 'active',
    subscribedAt: '2026-02-01 09:00',
    expiryDate: '2026-09-30T23:59:59Z',
    notes: 'Main head office static IP connection.',
  },
  {
    id: 'susr_2',
    vendorId: 'v1',
    name: 'Horizon Pharmacy',
    email: 'info@horizonpharmacy.com',
    phone: '+254 722 334 455',
    staticIp: '192.168.10.46',
    packageId: 'spkg_silver',
    packageName: 'Silver Tier - 25Mbps',
    packageTier: 'Silver',
    price: 3200.00,
    routerId: '1',
    routerName: 'Router Main - District 1',
    status: 'active',
    subscribedAt: '2026-02-15 11:30',
    expiryDate: '2026-09-15T23:59:59Z',
    notes: 'POS & Security CCTV camera link.',
  },
  {
    id: 'susr_3',
    vendorId: 'v1',
    name: 'Grand Supermarket',
    email: 'billing@grandmkt.co.ke',
    phone: '+254 733 556 677',
    staticIp: '192.168.20.52',
    packageId: 'spkg_bronze',
    packageName: 'Bronze Tier - 10Mbps',
    packageTier: 'Bronze',
    price: 1800.00,
    routerId: '2',
    routerName: 'Router Secondary - District 2',
    status: 'suspended',
    subscribedAt: '2026-01-10 14:00',
    expiryDate: '2026-08-31T23:59:59Z',
    notes: 'Suspended pending monthly renewal invoice.',
  },
];

export const generateUserGrowthData = () => {
  return Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    newUsers: Math.floor(Math.random() * 50) + 10,
    totalUsers: 150 + i * 5 + Math.floor(Math.random() * 20),
  }));
};

export const generateSessionData = () => {
  return [
    { name: '0-15 mins', value: 35 },
    { name: '15-30 mins', value: 25 },
    { name: '30-60 mins', value: 20 },
    { name: '1-2 hours', value: 12 },
    { name: '2+ hours', value: 8 },
  ];
};

export const generateDailyActiveUsersData = () => {
  return Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    activeUsers: Math.floor(Math.random() * 200) + 100,
  }));
};

export const generateTopPackagesData = () => {
  return [
    { name: 'Monthly Pass', sales: 450, revenue: 13495.5 },
    { name: 'Premium - 7 Days', sales: 320, revenue: 4156.8 },
    { name: 'Standard - 1 Day', sales: 580, revenue: 2895.2 },
    { name: 'Basic - 1 Hour', sales: 890, revenue: 1771.1 },
  ];
};

export const generateConversionRateData = () => {
  return Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    conversionRate: Math.random() * 15 + 5,
  }));
};

export const generateTransactionVolumeData = () => {
  return Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    transactions: Math.floor(Math.random() * 100) + 20,
    value: Math.floor(Math.random() * 5000) + 1000,
  }));
};

export const generateRevenueData = (vendorId?: string) => {
  return Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    revenue: Math.floor(Math.random() * 8000) + 2000,
  }));
};
