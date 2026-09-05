'use client';

import { useAuthStore } from '@/lib/store/auth';
import { useRevenueData, useRouters, useSessions, useTransactions } from '@/lib/api/queries';
import { RevenueChart } from '@/components/charts/revenue-chart';
import { DailyActiveUsersChart } from '@/components/charts/daily-active-users-chart';
import { TopPackagesChart } from '@/components/charts/top-packages-chart';
import { SessionDistributionChart } from '@/components/charts/session-distribution-chart';
import { RouterStatusCard } from '@/components/dashboard/router-status-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import {
  generateDailyActiveUsersData,
  generateSessionData,
  generateTopPackagesData,
  mockRoutersData,
} from '@/lib/api/mockData';
import {
  DollarSign,
  TrendingUp,
  Wallet,
  Percent,
  Users,
  UserX,
  Receipt,
  Activity,
  CheckCircle2,
  Calendar,
  X,
  Router as RouterIcon,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Zap,
} from 'lucide-react';
import { useState, useMemo } from 'react';

export default function VendorDashboard() {
  const { user } = useAuthStore();
  const vendorId = user?.vendorId;

  // Filter States
  const [selectedRouterId, setSelectedRouterId] = useState<string>('all');
  const [timeframe, setTimeframe] = useState<string>('30');
  const [showCustomRange, setShowCustomRange] = useState<boolean>(false);
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');

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

  // Filtered Routers list
  const activeRoutersList = useMemo(() => {
    const list = routers || mockRoutersData;
    if (selectedRouterId === 'all') return list;
    return list.filter((r) => r.id === selectedRouterId);
  }, [routers, selectedRouterId]);

  // Selected Router Details Name
  const selectedRouterName = useMemo(() => {
    if (selectedRouterId === 'all') return 'All Routers';
    const r = (routers || mockRoutersData).find((item) => item.id === selectedRouterId);
    return r ? r.name : 'Selected Router';
  }, [routers, selectedRouterId]);

  // Calculated 9 Metrics based on selected router
  const metrics = useMemo(() => {
    let multiplier = 1;
    if (selectedRouterId === '1') multiplier = 0.62;
    if (selectedRouterId === '2') multiplier = 0.32;
    if (selectedRouterId === '3') multiplier = 0.06;

    const activeUsersCount = activeRoutersList.reduce((sum, r) => sum + r.activeUsers, 0);
    const offlineUsersCount = selectedRouterId === '3' ? 18 : selectedRouterId === 'all' ? 24 : 6;

    const dailyRev = Math.round(14850 * multiplier);
    const weeklyRev = Math.round(96400 * multiplier);
    const monthlyRev = Math.round(385200 * multiplier);
    const monthlyGrowthPct = selectedRouterId === '3' ? -4.2 : 18.4;

    const dailyTxCount = Math.round(54 * multiplier);
    const weeklyTxCount = Math.round(348 * multiplier);
    const monthlyTxCount = Math.round(1420 * multiplier);

    return {
      dailyRevenue: dailyRev,
      weeklyRevenue: weeklyRev,
      monthlyRevenue: monthlyRev,
      monthlyGrowth: monthlyGrowthPct,
      activeUsers: activeUsersCount,
      offlineUsers: offlineUsersCount,
      dailyTransactions: dailyTxCount,
      weeklyTransactions: weeklyTxCount,
      monthlyTransactions: monthlyTxCount,
    };
  }, [activeRoutersList, selectedRouterId]);

  // Dynamic Chart Data based on selected router and timeframe
  const filteredRevenueChartData = useMemo(() => {
    const days = timeframe === '7' ? 7 : timeframe === '90' ? 90 : 30;
    let multiplier = selectedRouterId === '1' ? 0.62 : selectedRouterId === '2' ? 0.32 : selectedRouterId === '3' ? 0.06 : 1;

    return Array.from({ length: days }, (_, i) => {
      const date = new Date(Date.now() - (days - 1 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const baseRev = Math.floor((Math.sin(i / 2) * 1500 + 4000) * multiplier);
      return { date, revenue: Math.max(200, baseRev) };
    });
  }, [timeframe, selectedRouterId]);

  // Filtered Transactions list
  const recentTransactionsList = useMemo(() => {
    const allTxns = [
      { id: 'TXN-9842', userId: 'user_john', package: '24 Hour Unlimited', router: 'Router Main - District 1', amount: 200.0, status: 'completed', date: '2026-09-05 08:42' },
      { id: 'TXN-9841', userId: 'user_mary', package: '1 Hour Pass', router: 'Router Main - District 1', amount: 50.0, status: 'completed', date: '2026-09-05 08:15' },
      { id: 'TXN-9840', userId: 'user_alex', package: '7 Days Pass', router: 'Router Secondary - District 2', amount: 750.0, status: 'completed', date: '2026-09-05 07:30' },
      { id: 'TXN-9839', userId: 'user_grace', package: '1 Hour Pass', router: 'Router Main - District 1', amount: 50.0, status: 'completed', date: '2026-09-05 06:50' },
      { id: 'TXN-9838', userId: 'user_peter', package: 'Monthly Unlimited', router: 'Router Secondary - District 2', amount: 2500.0, status: 'pending', date: '2026-09-05 06:10' },
      { id: 'TXN-9837', userId: 'user_sam', package: '24 Hour Unlimited', router: 'Router Backup - District 3', amount: 200.0, status: 'failed', date: '2026-09-04 22:15' },
      { id: 'TXN-9836', userId: 'user_linda', package: '7 Days Pass', router: 'Router Secondary - District 2', amount: 750.0, status: 'completed', date: '2026-09-04 19:40' },
    ];

    if (selectedRouterId === 'all') return allTxns;
    const targetRouterObj = (routers || mockRoutersData).find((r) => r.id === selectedRouterId);
    if (!targetRouterObj) return allTxns;

    return allTxns.filter((t) => t.router.includes(targetRouterObj.name));
  }, [routers, selectedRouterId]);

  return (
    <div className="p-4 sm:p-8 space-y-8">
      {/* Top Header & Router Filter Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-card via-card/80 to-card/50 p-6 rounded-2xl border border-border shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Vendor Dashboard</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              Live Overview
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome back, <span className="font-semibold text-foreground">{user?.name || 'Vendor'}</span>! Showing stats for{' '}
            <span className="text-primary font-medium">{selectedRouterName}</span>.
          </p>
        </div>

        {/* Router Selector ABOVE */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <RouterIcon className="w-4 h-4 text-primary" />
            <span className="font-medium text-foreground">Select Router:</span>
          </div>
          <Select value={selectedRouterId} onValueChange={setSelectedRouterId}>
            <SelectTrigger className="w-56 bg-background border-border shadow-sm">
              <SelectValue placeholder="Choose router..." />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="all">All Routers (Global)</SelectItem>
              {(routers || mockRoutersData).map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  {r.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 9 Specific Stat Cards Grid (Captivating 3x3 Layout) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" /> Key Performance Metrics
          </h2>
          <span className="text-xs text-muted-foreground">Updated in real-time</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 1. Daily Revenue */}
          <Card className="bg-card border-border hover:border-primary/50 transition-all shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Daily Revenue</p>
                  <p className="text-2xl font-black text-foreground mt-1">KES {metrics.dailyRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                  <div className="flex items-center gap-1 mt-2 text-xs font-semibold text-emerald-500">
                    <ArrowUpRight className="w-3.5 h-3.5" /> +12.4% vs yesterday
                  </div>
                </div>
                <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/20">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. Weekly Revenue */}
          <Card className="bg-card border-border hover:border-primary/50 transition-all shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Weekly Revenue</p>
                  <p className="text-2xl font-black text-foreground mt-1">KES {metrics.weeklyRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                  <div className="flex items-center gap-1 mt-2 text-xs font-semibold text-emerald-500">
                    <ArrowUpRight className="w-3.5 h-3.5" /> +8.2% vs last week
                  </div>
                </div>
                <div className="p-3 bg-primary/10 text-primary rounded-xl border border-primary/20">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 3. Monthly Revenue */}
          <Card className="bg-card border-border hover:border-primary/50 transition-all shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Monthly Revenue</p>
                  <p className="text-2xl font-black text-foreground mt-1">KES {metrics.monthlyRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                  <div className="flex items-center gap-1 mt-2 text-xs font-semibold text-emerald-500">
                    <ArrowUpRight className="w-3.5 h-3.5" /> +15.6% vs last month
                  </div>
                </div>
                <div className="p-3 bg-indigo-500/10 text-indigo-500 rounded-xl border border-indigo-500/20">
                  <Wallet className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 4. Monthly Growth */}
          <Card className="bg-card border-border hover:border-primary/50 transition-all shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Monthly Growth</p>
                  <p className="text-2xl font-black text-foreground mt-1">
                    {metrics.monthlyGrowth >= 0 ? `+${metrics.monthlyGrowth}%` : `${metrics.monthlyGrowth}%`}
                  </p>
                  <div className={`flex items-center gap-1 mt-2 text-xs font-semibold ${metrics.monthlyGrowth >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {metrics.monthlyGrowth >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                    {metrics.monthlyGrowth >= 0 ? 'Overall steady growth' : 'Slight dip'}
                  </div>
                </div>
                <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl border border-purple-500/20">
                  <Percent className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 5. Active Users */}
          <Card className="bg-card border-border hover:border-primary/50 transition-all shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Active Users</p>
                  <p className="text-2xl font-black text-foreground mt-1">{metrics.activeUsers}</p>
                  <div className="flex items-center gap-1 mt-2 text-xs font-semibold text-emerald-500">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Currently online
                  </div>
                </div>
                <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl border border-blue-500/20">
                  <Users className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 6. Offline Users */}
          <Card className="bg-card border-border hover:border-primary/50 transition-all shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Offline Users</p>
                  <p className="text-2xl font-black text-foreground mt-1">{metrics.offlineUsers}</p>
                  <div className="flex items-center gap-1 mt-2 text-xs font-medium text-muted-foreground">
                    Inactive or expired sessions
                  </div>
                </div>
                <div className="p-3 bg-slate-500/10 text-slate-400 rounded-xl border border-slate-500/20">
                  <UserX className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 7. Daily Transactions */}
          <Card className="bg-card border-border hover:border-primary/50 transition-all shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Daily Transactions</p>
                  <p className="text-2xl font-black text-foreground mt-1">{metrics.dailyTransactions}</p>
                  <div className="flex items-center gap-1 mt-2 text-xs font-semibold text-emerald-500">
                    <ArrowUpRight className="w-3.5 h-3.5" /> +9.4% vs yesterday
                  </div>
                </div>
                <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/20">
                  <Receipt className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 8. Weekly Transactions */}
          <Card className="bg-card border-border hover:border-primary/50 transition-all shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Weekly Transactions</p>
                  <p className="text-2xl font-black text-foreground mt-1">{metrics.weeklyTransactions}</p>
                  <div className="flex items-center gap-1 mt-2 text-xs font-semibold text-emerald-500">
                    <ArrowUpRight className="w-3.5 h-3.5" /> +6.5% vs last week
                  </div>
                </div>
                <div className="p-3 bg-teal-500/10 text-teal-500 rounded-xl border border-teal-500/20">
                  <Activity className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 9. Monthly Transactions */}
          <Card className="bg-card border-border hover:border-primary/50 transition-all shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Monthly Transactions</p>
                  <p className="text-2xl font-black text-foreground mt-1">{metrics.monthlyTransactions.toLocaleString()}</p>
                  <div className="flex items-center gap-1 mt-2 text-xs font-semibold text-emerald-500">
                    <ArrowUpRight className="w-3.5 h-3.5" /> +14.2% vs last month
                  </div>
                </div>
                <div className="p-3 bg-cyan-500/10 text-cyan-500 rounded-xl border border-cyan-500/20">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Timeframe Filter Bar UNDER the Cards */}
      <Card className="bg-card border-border p-4 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Filter className="w-4 h-4 text-primary" />
            <span>Timeframe Filter:</span>
            <span className="text-xs text-muted-foreground">Applies to charts & detailed breakdowns below</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <Button
              size="sm"
              variant={timeframe === '7' && !showCustomRange ? 'default' : 'outline'}
              onClick={() => {
                setTimeframe('7');
                setShowCustomRange(false);
              }}
              className={timeframe === '7' && !showCustomRange ? 'bg-primary text-primary-foreground' : 'border-border'}
            >
              Last 7 Days
            </Button>
            <Button
              size="sm"
              variant={timeframe === '30' && !showCustomRange ? 'default' : 'outline'}
              onClick={() => {
                setTimeframe('30');
                setShowCustomRange(false);
              }}
              className={timeframe === '30' && !showCustomRange ? 'bg-primary text-primary-foreground' : 'border-border'}
            >
              Last 30 Days
            </Button>
            <Button
              size="sm"
              variant={timeframe === '90' && !showCustomRange ? 'default' : 'outline'}
              onClick={() => {
                setTimeframe('90');
                setShowCustomRange(false);
              }}
              className={timeframe === '90' && !showCustomRange ? 'bg-primary text-primary-foreground' : 'border-border'}
            >
              Last 90 Days
            </Button>
            <Button
              size="sm"
              variant={showCustomRange ? 'default' : 'outline'}
              onClick={() => setShowCustomRange(!showCustomRange)}
              className={showCustomRange ? 'bg-primary text-primary-foreground gap-2' : 'border-border gap-2'}
            >
              <Calendar className="w-3.5 h-3.5" />
              Custom Date Range
            </Button>
          </div>
        </div>

        {/* Custom Date Range Picker Dropdown */}
        {showCustomRange && (
          <div className="mt-4 pt-4 border-t border-border flex flex-col sm:flex-row items-end gap-4">
            <div className="flex-1 w-full">
              <label className="text-xs text-muted-foreground block mb-1 font-medium">Start Date</label>
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
              <label className="text-xs text-muted-foreground block mb-1 font-medium">End Date</label>
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
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={() => {
                  if (customStartDate && customEndDate) {
                    setTimeframe('custom');
                  }
                }}
                disabled={!customStartDate || !customEndDate}
              >
                Apply Range
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setShowCustomRange(false);
                  setTimeframe('30');
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Retained Charts Grid (4 Charts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart data={filteredRevenueChartData} title={`Revenue Trend (${selectedRouterName})`} />
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

      {/* Under Charts: Router Status */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Router Status</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Real-time health and load across your hotspot routers</p>
          </div>
          <span className="text-xs text-muted-foreground font-medium">
            Showing {activeRoutersList.length} router{activeRoutersList.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeRoutersList.map((router) => (
            <RouterStatusCard
              key={router.id}
              router={router}
              href={`/dashboard/vendor/routers/${router.id}`}
            />
          ))}
        </div>
      </div>

      {/* Under Charts: Recent Transactions */}
      <div>
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-foreground">Recent Transactions</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Latest voucher redemptions and package purchases</p>
        </div>
        <Card className="bg-card border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Transaction History</span>
              <span className="text-xs font-normal text-muted-foreground">Showing last {recentTransactionsList.length} items</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground bg-background/50">
                    <th className="text-left py-3 px-4 font-semibold">Transaction ID</th>
                    <th className="text-left py-3 px-4 font-semibold">User</th>
                    <th className="text-left py-3 px-4 font-semibold">Package</th>
                    <th className="text-left py-3 px-4 font-semibold">Router</th>
                    <th className="text-left py-3 px-4 font-semibold">Amount</th>
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                    <th className="text-left py-3 px-4 font-semibold">Date & Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentTransactionsList.map((txn) => (
                    <tr key={txn.id} className="hover:bg-background/40 transition-colors">
                      <td className="py-3 px-4 text-foreground font-mono text-xs font-medium">{txn.id}</td>
                      <td className="py-3 px-4 text-foreground">{txn.userId}</td>
                      <td className="py-3 px-4 text-foreground font-medium">{txn.package}</td>
                      <td className="py-3 px-4 text-muted-foreground text-xs">{txn.router}</td>
                      <td className="py-3 px-4 text-foreground font-bold">KES {txn.amount.toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            txn.status === 'completed'
                              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                              : txn.status === 'pending'
                                ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            txn.status === 'completed' ? 'bg-emerald-500' : txn.status === 'pending' ? 'bg-amber-500' : 'bg-rose-500'
                          }`}></span>
                          {txn.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground text-xs">{txn.date}</td>
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
