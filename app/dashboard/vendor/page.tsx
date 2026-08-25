'use client';

import { useAuthStore } from '@/lib/store/auth';
import { useRevenueData, useRouters, useSessions, useTransactions } from '@/lib/api/queries';
import { StatCard } from '@/components/dashboard/stat-card';
import { RevenueChart } from '@/components/charts/revenue-chart';
import { DailyActiveUsersChart } from '@/components/charts/daily-active-users-chart';
import { TopPackagesChart } from '@/components/charts/top-packages-chart';
import { SessionDistributionChart } from '@/components/charts/session-distribution-chart';
import { RouterStatusCard } from '@/components/dashboard/router-status-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import {
  generateDailyActiveUsersData,
  generateSessionData,
  generateTopPackagesData,
} from '@/lib/api/mockData';
import { DollarSign, Users, Activity, TrendingUp, Calendar, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useState } from 'react';

export default function VendorDashboard() {
  const { user } = useAuthStore();
  const vendorId = user?.vendorId;
  const [dateRange, setDateRange] = useState('30');
  const [showCustomRange, setShowCustomRange] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const { data: revenueData } = useRevenueData(vendorId);
  const { data: routers } = useRouters(vendorId);
  const { data: sessions } = useSessions(vendorId);
  const { data: transactions } = useTransactions(vendorId);

  const { data: dailyActiveUsersData } = useQuery({
    queryKey: ['analytics', 'daily-active-users'],
    queryFn: async () => generateDailyActiveUsersData(),
  });

  const { data: sessionDistributionData } = useQuery({
    queryKey: ['analytics', 'session-distribution'],
    queryFn: async () => generateSessionData(),
  });

  const { data: topPackagesData } = useQuery({
    queryKey: ['analytics', 'top-packages'],
    queryFn: async () => generateTopPackagesData(),
  });

  // Calculate totals
  const totalRevenue =
    transactions?.reduce((sum, t) => sum + (t.status === 'completed' ? t.amount : 0), 0) || 0;
  const activeUsers = routers?.reduce((sum, r) => sum + r.activeUsers, 0) || 0;
  const activeSessions = sessions?.filter((s) => s.status === 'active').length || 0;

  return (
    <div className="p-4 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Welcome back, {user?.name}</p>
        </div>
        <Select
          value={dateRange}
          onValueChange={(value) => {
            if (value === 'custom') {
              setShowCustomRange(true);
            } else {
              setDateRange(value);
              setShowCustomRange(false);
            }
          }}
        >
          <SelectTrigger className="w-48 bg-card border-border">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="custom">Custom range</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Custom Date Range */}
      {showCustomRange && (
        <Card className="bg-card border-border p-6">
          <div className="flex flex-col sm:flex-row items-end gap-4">
            <div className="flex-1 w-full">
              <label className="text-sm text-muted-foreground block mb-2">Start Date</label>
              <div className="flex items-center relative">
                <Calendar className="w-4 h-4 text-muted-foreground absolute ml-3" />
                <Input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="bg-background border-border pl-10 w-full"
                />
              </div>
            </div>
            <div className="flex-1 w-full">
              <label className="text-sm text-muted-foreground block mb-2">End Date</label>
              <div className="flex items-center relative">
                <Calendar className="w-4 h-4 text-muted-foreground absolute ml-3" />
                <Input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="bg-background border-border pl-10 w-full"
                />
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                className="bg-primary hover:bg-primary/90 text-primary-foreground flex-1 sm:flex-initial"
                onClick={() => {
                  if (customStartDate && customEndDate) {
                    setDateRange(`${customStartDate}_${customEndDate}`);
                    setShowCustomRange(false);
                  }
                }}
                disabled={!customStartDate || !customEndDate}
              >
                Apply
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  setShowCustomRange(false);
                  setDateRange('30');
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Revenue"
          value={`KES ${totalRevenue.toFixed(2)}`}
          icon={DollarSign}
          trend={{ value: 12, direction: 'up' }}
        />
        <StatCard
          label="Active Users"
          value={activeUsers}
          icon={Users}
          trend={{ value: 8, direction: 'up' }}
        />
        <StatCard
          label="Active Sessions"
          value={activeSessions}
          icon={Activity}
          trend={{ value: 5, direction: 'up' }}
        />
        <StatCard
          label="Monthly Growth"
          value="+23%"
          icon={TrendingUp}
          trend={{ value: 3, direction: 'up' }}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart data={revenueData || []} title="Revenue Trend" />
        <DailyActiveUsersChart
          data={dailyActiveUsersData || []}
          title="Daily Active Users"
        />
        <TopPackagesChart data={topPackagesData || []} title="Top Packages" />
        <SessionDistributionChart
          data={sessionDistributionData || []}
          title="Session Duration Distribution"
        />
      </div>

      {/* Routers Section */}
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground">Router Status</h2>
          <p className="text-sm text-muted-foreground mt-1">Monitor your hotspot routers</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {routers?.map((router) => (
            <RouterStatusCard
              key={router.id}
              router={router}
              href={`/dashboard/vendor/routers/${router.id}`}
            />
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground">Recent Transactions</h2>
          <p className="text-sm text-muted-foreground mt-1">Latest payments and purchases</p>
        </div>
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Last 5 Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-muted-foreground font-semibold">
                      User ID
                    </th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-semibold">
                      Amount
                    </th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-semibold">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-semibold">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {transactions?.slice(0, 5).map((txn) => (
                    <tr key={txn.id} className="border-b border-border hover:bg-background/50">
                      <td className="py-3 px-4 text-foreground">{txn.userId}</td>
                      <td className="py-3 px-4 text-foreground font-semibold">
                        KES {txn.amount.toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            txn.status === 'completed'
                              ? 'bg-green-500/20 text-green-500'
                              : txn.status === 'pending'
                                ? 'bg-yellow-500/20 text-yellow-500'
                                : 'bg-red-500/20 text-red-500'
                          }`}
                        >
                          {txn.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{txn.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
