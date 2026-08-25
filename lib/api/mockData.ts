// Mock data for the application

export interface RouterStatus {
  id: string;
  vendorId: string;
  name: string;
  ipAddress: string;
  status: 'online' | 'offline' | 'error';
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
  status: 'online' | 'offline' | 'error';
  activeUsers: number;
}

export interface Package {
  id: string;
  vendorId: string;
  name: string;
  price: number;
  duration: number;
  durationUnit: 'hours' | 'days' | 'months';
  bandwidthLimit?: number;
  maxUsers: number;
  profile: string;
  createdAt: string;
}

export interface HotspotUser {
  id: string;
  vendorId: string;
  username: string;
  password: string;
  packageId: string;
  routerId: string;
  createdAt: string;
  status: 'active' | 'inactive' | 'expired';
  expiryDate: string;
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
    name: 'Basic - 1 Hour',
    price: 1.99,
    duration: 1,
    durationUnit: 'hours',
    maxUsers: 1,
    profile: 'basic-1h',
    createdAt: '2024-01-20',
  },
  {
    id: 'pkg2',
    vendorId: 'v1',
    name: 'Standard - 1 Day',
    price: 4.99,
    duration: 1,
    durationUnit: 'days',
    maxUsers: 2,
    profile: 'standard-1d',
    createdAt: '2024-01-20',
  },
  {
    id: 'pkg3',
    vendorId: 'v1',
    name: 'Premium - 7 Days',
    price: 12.99,
    duration: 7,
    durationUnit: 'days',
    bandwidthLimit: 10000,
    maxUsers: 3,
    profile: 'premium-7d',
    createdAt: '2024-01-20',
  },
  {
    id: 'pkg4',
    vendorId: 'v1',
    name: 'Monthly Pass',
    price: 29.99,
    duration: 30,
    durationUnit: 'days',
    bandwidthLimit: 50000,
    maxUsers: 5,
    profile: 'monthly-30d',
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
    password: 'hashed_password_1',
    packageId: 'pkg1',
    routerId: '1',
    createdAt: '2024-04-01',
    status: 'active',
    expiryDate: '2024-05-12',
    lastLogin: '2024-05-06T10:30:00Z',
  },
  {
    id: 'user2',
    vendorId: 'v1',
    username: 'jane_smith',
    password: 'hashed_password_2',
    packageId: 'pkg2',
    routerId: '1',
    createdAt: '2024-04-02',
    status: 'active',
    expiryDate: '2024-05-13',
    lastLogin: '2024-05-06T09:15:00Z',
  },
  {
    id: 'user3',
    vendorId: 'v1',
    username: 'user_temp',
    password: 'hashed_password_3',
    packageId: 'pkg1',
    routerId: '2',
    createdAt: '2024-04-03',
    status: 'inactive',
    expiryDate: '2024-05-10',
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
    id: 'txn1',
    vendorId: 'v1',
    userId: 'user1',
    packageId: 'pkg1',
    amount: 1.99,
    status: 'completed',
    date: '2024-05-06',
  },
  {
    id: 'txn2',
    vendorId: 'v1',
    userId: 'user2',
    packageId: 'pkg2',
    amount: 4.99,
    status: 'completed',
    date: '2024-05-05',
  },
  {
    id: 'txn3',
    vendorId: 'v1',
    userId: 'user3',
    packageId: 'pkg3',
    amount: 12.99,
    status: 'completed',
    date: '2024-05-04',
  },
];

// Analytics data
export const generateRevenueData = (vendorId?: string) => {
  return Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    revenue: Math.floor(Math.random() * 5000) + 2000,
  }));
};

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
