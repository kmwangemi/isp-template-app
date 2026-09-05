'use client';

import { useAuthStore } from '@/lib/store/auth';
import { useTransactions } from '@/lib/api/queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useMemo } from 'react';
import { SearchFilterControls } from '@/components/dashboard/search-filter-controls';
import { PaginationControls } from '@/components/dashboard/pagination-controls';
import { Calendar, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function TransactionsPage() {
  const { user } = useAuthStore();
  const { data: transactions, isLoading } = useTransactions(user?.vendorId);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [showCustomRange, setShowCustomRange] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const itemsPerPage = 10;

  // Filtered transactions computation
  const filteredTransactionsAll = useMemo(() => {
    if (!transactions) return [];

    return transactions.filter((t) => {
      const matchesSearch =
        t.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.packageId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || t.status === statusFilter;

      let matchesDate = true;
      if (dateRange !== 'all') {
        const txnDate = new Date(t.date);
        if (dateRange.includes('_')) {
          const [startStr, endStr] = dateRange.split('_');
          const start = new Date(startStr);
          const end = new Date(endStr);
          end.setHours(23, 59, 59, 999);
          matchesDate = txnDate >= start && txnDate <= end;
        } else {
          const days = parseInt(dateRange, 10);
          if (!isNaN(days)) {
            const pastDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
            matchesDate = txnDate >= pastDate;
          }
        }
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [transactions, searchTerm, statusFilter, dateRange]);

  const totalRevenue = useMemo(() => {
    return filteredTransactionsAll
      .filter((t) => t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactionsAll]);

  const completedCount = useMemo(() => {
    return filteredTransactionsAll.filter((t) => t.status === 'completed').length;
  }, [filteredTransactionsAll]);

  const pendingCount = useMemo(() => {
    return filteredTransactionsAll.filter((t) => t.status === 'pending').length;
  }, [filteredTransactionsAll]);

  const failedCount = useMemo(() => {
    return filteredTransactionsAll.filter((t) => t.status === 'failed').length;
  }, [filteredTransactionsAll]);

  const filteredAndPaginatedTransactions = useMemo(() => {
    const totalPages = Math.ceil(filteredTransactionsAll.length / itemsPerPage);
    const startIdx = (currentPage - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;

    return {
      transactions: filteredTransactionsAll.slice(startIdx, endIdx),
      totalPages,
      totalCount: filteredTransactionsAll.length,
    };
  }, [filteredTransactionsAll, currentPage]);

  return (
    <div className="p-4 sm:p-8 space-y-6">
      {/* Header & Date Range Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Transactions</h1>
          <p className="text-sm text-muted-foreground mt-1">Payment history and transaction details</p>
        </div>
        <Select
          value={dateRange}
          onValueChange={(value) => {
            if (value === 'custom') {
              setShowCustomRange(true);
            } else {
              setDateRange(value);
              setShowCustomRange(false);
              setCurrentPage(1);
            }
          }}
        >
          <SelectTrigger className="w-48 bg-card border-border">
            <SelectValue placeholder="Date Range" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="custom">Custom range</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Custom Date Range Picker */}
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
                    setCurrentPage(1);
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
                  setDateRange('all');
                  setCurrentPage(1);
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold text-foreground">KES {totalRevenue.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold text-green-500">{completedCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold text-yellow-500">{pendingCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Failed</p>
              <p className="text-2xl font-bold text-red-500">{failedCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter Controls */}
      {transactions && transactions.length > 0 && (
        <SearchFilterControls
          searchTerm={searchTerm}
          onSearchChange={(val) => {
            setSearchTerm(val);
            setCurrentPage(1);
          }}
          searchPlaceholder="Search by transaction ID, user ID or package..."
          filters={[
            {
              value: statusFilter,
              onValueChange: (val) => {
                setStatusFilter(val);
                setCurrentPage(1);
              },
              placeholder: "Filter Status",
              options: [
                { label: "All Statuses", value: "all" },
                { label: "Completed", value: "completed" },
                { label: "Pending", value: "pending" },
                { label: "Failed", value: "failed" },
              ],
            },
          ]}
        />
      )}

      {/* Transactions Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg">All Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-muted-foreground font-semibold">
                    Transaction ID
                  </th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-semibold">
                    User ID
                  </th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-semibold">
                    Package
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
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      Loading transactions...
                    </td>
                  </tr>
                ) : filteredAndPaginatedTransactions.transactions && filteredAndPaginatedTransactions.transactions.length > 0 ? (
                  filteredAndPaginatedTransactions.transactions.map((txn) => (
                    <tr key={txn.id} className="border-b border-border hover:bg-background/50">
                      <td className="py-3 px-4 text-foreground font-semibold font-mono text-xs">
                        {txn.id}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{txn.userId}</td>
                      <td className="py-3 px-4 text-muted-foreground">{txn.packageId}</td>
                      <td className="py-3 px-4 text-foreground font-semibold">
                        KES {txn.amount.toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          className={
                            txn.status === 'completed'
                              ? 'bg-green-500/20 text-green-500 border-0'
                              : txn.status === 'pending'
                                ? 'bg-yellow-500/20 text-yellow-500 border-0'
                                : 'bg-red-500/20 text-red-500 border-0'
                          }
                        >
                          {txn.status.charAt(0).toUpperCase() + txn.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{txn.date}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      No transactions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <PaginationControls
            currentPage={currentPage}
            totalPages={filteredAndPaginatedTransactions.totalPages}
            totalItems={filteredAndPaginatedTransactions.totalCount}
            itemsLabel="transactions"
            onPageChange={setCurrentPage}
          />
        </CardContent>
      </Card>
    </div>
  );
}
