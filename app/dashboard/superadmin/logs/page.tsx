'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download } from 'lucide-react';
import { SearchFilterControls } from '@/components/dashboard/search-filter-controls';
import { PaginationControls } from '@/components/dashboard/pagination-controls';

interface ActivityLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  category: 'user_management' | 'vendor_management' | 'router_management' | 'auth' | 'settings';
  details: string;
  status: 'success' | 'error' | 'warning';
  ipAddress: string;
}

const mockLogs: ActivityLog[] = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
    user: 'Admin User',
    action: 'Created New Vendor',
    category: 'vendor_management',
    details: 'Vendor "TechFlow Communications" created successfully',
    status: 'success',
    ipAddress: '192.168.1.100',
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
    user: 'Admin User',
    action: 'Updated Router Configuration',
    category: 'router_management',
    details: 'Router "Main-Router-01" configuration updated',
    status: 'success',
    ipAddress: '192.168.1.100',
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
    user: 'Vendor Admin',
    action: 'Failed Login Attempt',
    category: 'auth',
    details: 'Failed login attempt for user: vendor@example.com',
    status: 'error',
    ipAddress: '203.0.113.42',
  },
];

export default function LogsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredLogs = useMemo(() => {
    let filtered = mockLogs;
    if (searchTerm) {
      filtered = filtered.filter((log) =>
        log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((log) => log.category === categoryFilter);
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter((log) => log.status === statusFilter);
    }
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const startIdx = (currentPage - 1) * itemsPerPage;
    return { logs: filtered.slice(startIdx, startIdx + itemsPerPage), totalPages, totalCount: filtered.length };
  }, [searchTerm, categoryFilter, statusFilter, currentPage]);

  return (
    <div className="p-4 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Activity Logs</h1>
          <p className="text-sm text-muted-foreground mt-1">Monitor system and user activities</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
          <Download className="w-4 h-4" />
          Export
        </Button>
      </div>

      <SearchFilterControls
        searchTerm={searchTerm}
        onSearchChange={(val) => {
          setSearchTerm(val);
          setCurrentPage(1);
        }}
        searchPlaceholder="Search logs..."
        filters={[
          {
            value: categoryFilter,
            onValueChange: (val) => {
              setCategoryFilter(val);
              setCurrentPage(1);
            },
            placeholder: "Filter Category",
            options: [
              { label: "All Categories", value: "all" },
              { label: "Vendor Management", value: "vendor_management" },
              { label: "Authentication", value: "auth" },
            ],
          },
          {
            value: statusFilter,
            onValueChange: (val) => {
              setStatusFilter(val);
              setCurrentPage(1);
            },
            placeholder: "Filter Status",
            options: [
              { label: "All Status", value: "all" },
              { label: "Success", value: "success" },
              { label: "Error", value: "error" },
            ],
          },
        ]}
      />

      <Card className="bg-card border-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-background/50">
                  <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground">Timestamp</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground">User</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground">Action</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.logs.length > 0 ? (
                  filteredLogs.logs.map((log) => (
                    <tr key={log.id} className="border-b border-border hover:bg-background/50">
                      <td className="py-3 px-4 text-sm text-muted-foreground whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-sm text-foreground font-semibold">{log.user}</td>
                      <td className="py-3 px-4 text-sm text-foreground">{log.action}</td>
                      <td className="py-3 px-4">
                        <Badge className={log.status === 'success' ? 'bg-green-500/20 text-green-500 border-0' : 'bg-red-500/20 text-red-500 border-0'}>
                          {log.status}
                        </Badge>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-muted-foreground">
                      No logs found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-border">
            <PaginationControls
              currentPage={currentPage}
              totalPages={filteredLogs.totalPages}
              totalItems={filteredLogs.totalCount}
              itemsLabel="logs"
              onPageChange={setCurrentPage}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
