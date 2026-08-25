'use client';

import { useAuthStore } from '@/lib/store/auth';
import { useTransactions } from '@/lib/api/queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useMemo } from 'react';

export default function TransactionsPage() {
  const { user } = useAuthStore();
  const { data: transactions, isLoading } = useTransactions(user?.vendorId);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalRevenue = transactions?.filter((t) => t.status === 'completed').reduce((sum, t) => sum + t.amount, 0) || 0;
  const completedCount = transactions?.filter((t) => t.status === 'completed').length || 0;
  const pendingCount = transactions?.filter((t) => t.status === 'pending').length || 0;
  const failedCount = transactions?.filter((t) => t.status === 'failed').length || 0;

  const filteredAndPaginatedTransactions = useMemo(() => {
    if (!transactions) return { transactions: [], totalPages: 0 };
    
    const filtered = transactions.filter((t) =>
      t.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.transactionId.includes(searchTerm) ||
      t.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const startIdx = (currentPage - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    
    return {
      transactions: filtered.slice(startIdx, endIdx),
      totalPages,
      totalCount: filtered.length,
    };
  }, [transactions, searchTerm, currentPage]);

  return (
    <div className="p-4 sm:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Transactions</h1>
        <p className="text-sm text-muted-foreground mt-1">Payment history and transaction details</p>
      </div>

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

      {/* Search */}
      {transactions && transactions.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by username, transaction ID or payment method..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-card border-border pl-10"
          />
        </div>
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

          {/* Pagination */}
          {filteredAndPaginatedTransactions.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Page {currentPage} of {filteredAndPaginatedTransactions.totalPages} (
                {filteredAndPaginatedTransactions.totalCount} transactions)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => setCurrentPage(Math.min(filteredAndPaginatedTransactions.totalPages, currentPage + 1))}
                  disabled={currentPage === filteredAndPaginatedTransactions.totalPages}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
