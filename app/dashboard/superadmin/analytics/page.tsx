'use client';

import {
  useRevenueData,
  useUserGrowthData,
  useSessionDistributionData,
  useConversionRateData,
  useDailyActiveUsersData,
  useTopPackagesData,
  useTransactionVolumeData,
} from '@/lib/api/queries';
import { RevenueChart } from '@/components/charts/revenue-chart';
import { UserGrowthChart } from '@/components/charts/user-growth-chart';
import { SessionDistributionChart } from '@/components/charts/session-distribution-chart';
import { ConversionRateChart } from '@/components/charts/conversion-rate-chart';
import { DailyActiveUsersChart } from '@/components/charts/daily-active-users-chart';
import { TopPackagesChart } from '@/components/charts/top-packages-chart';
import { TransactionVolumeChart } from '@/components/charts/transaction-volume-chart';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Calendar, X } from 'lucide-react';
import { useState } from 'react';

export default function SuperAdminAnalyticsPage() {
  const [dateRange, setDateRange] = useState('30');
  const [showCustomRange, setShowCustomRange] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const { data: revenueData } = useRevenueData();
  const { data: userGrowthData } = useUserGrowthData();
  const { data: sessionDistributionData } = useSessionDistributionData();
  const { data: conversionRateData } = useConversionRateData();
  const { data: dailyActiveUsersData } = useDailyActiveUsersData();
  const { data: topPackagesData } = useTopPackagesData();
  const { data: transactionVolumeData } = useTransactionVolumeData();

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Platform Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">System-wide business insights</p>
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
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="text-sm text-muted-foreground block mb-2">Start Date</label>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 text-muted-foreground absolute ml-3" />
                <Input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="bg-background border-border pl-10"
                />
              </div>
            </div>
            <div className="flex-1">
              <label className="text-sm text-muted-foreground block mb-2">End Date</label>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 text-muted-foreground absolute ml-3" />
                <Input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="bg-background border-border pl-10"
                />
              </div>
            </div>
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
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
        </Card>
      )}

      {/* Charts Grid */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueChart data={revenueData || []} title="Platform Revenue" />
          <ConversionRateChart data={conversionRateData || []} title="Conversion Rate" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DailyActiveUsersChart data={dailyActiveUsersData || []} title="Daily Active Users" />
          <UserGrowthChart data={userGrowthData || []} title="User Growth" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopPackagesChart data={topPackagesData || []} title="Top Packages" />
          <SessionDistributionChart
            data={sessionDistributionData || []}
            title="Session Duration Distribution"
          />
        </div>

        <div className="w-full">
          <TransactionVolumeChart
            data={transactionVolumeData || []}
            title="Transaction Volume"
          />
        </div>
      </div>
    </div>
  );
}
