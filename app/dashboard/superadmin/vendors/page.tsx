'use client';

import { useVendors } from '@/lib/api/queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/dashboard/stat-card';
import { Button } from '@/components/ui/button';
import { Building2, DollarSign, Users, TrendingUp, Plus } from 'lucide-react';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import { SearchFilterControls } from '@/components/dashboard/search-filter-controls';
import { PaginationControls } from '@/components/dashboard/pagination-controls';

export default function VendorsPage() {
  const { data: vendors, isLoading } = useVendors();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredVendors = useMemo(() => {
    if (!vendors) return [];
    return vendors.filter((v) => {
      const matchesSearch =
        v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [vendors, searchTerm, statusFilter]);

  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(filteredVendors.length / itemsPerPage);
    const startIdx = (currentPage - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    return {
      paginatedVendors: filteredVendors.slice(startIdx, endIdx),
      totalPages,
    };
  }, [filteredVendors, currentPage]);

  const totalRevenue = vendors?.reduce((sum, v) => sum + v.revenue, 0) || 0;
  const totalUsers = vendors?.reduce((sum, v) => sum + v.activeUsers, 0) || 0;
  const activeVendors = vendors?.filter((v) => v.status === 'active').length || 0;

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Vendor Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage all vendors on the platform
          </p>
        </div>
        <Link href="/dashboard/superadmin/vendors/add">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
            <Plus className="w-4 h-4" />
            Add Vendor
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Vendors"
          value={vendors?.length || 0}
          icon={Building2}
          trend={{ value: 2, direction: 'up' }}
        />
        <StatCard
          label="Platform Revenue"
          value={`KES ${(totalRevenue / 1000).toFixed(1)}k`}
          icon={DollarSign}
          trend={{ value: 18, direction: 'up' }}
        />
        <StatCard
          label="Total Users"
          value={totalUsers}
          icon={Users}
          trend={{ value: 12, direction: 'up' }}
        />
        <StatCard
          label="Active Vendors"
          value={activeVendors}
          icon={TrendingUp}
          trend={{ value: 1, direction: 'up' }}
        />
      </div>

      {/* Search & Filter Controls */}
      <SearchFilterControls
        searchTerm={searchTerm}
        onSearchChange={(val) => {
          setSearchTerm(val);
          setCurrentPage(1);
        }}
        searchPlaceholder="Search vendors..."
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
              { label: "Active", value: "active" },
              { label: "Inactive", value: "inactive" },
            ],
          },
        ]}
      />

      {/* Vendors Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg">All Vendors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-muted-foreground font-semibold">
                    Vendor Name
                  </th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-semibold">
                    Contact Email
                  </th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-semibold">
                    Revenue
                  </th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-semibold">
                    Users
                  </th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-semibold">
                    Sessions
                  </th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-semibold">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-semibold">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                      Loading vendors...
                    </td>
                  </tr>
                ) : paginationData.paginatedVendors && paginationData.paginatedVendors.length > 0 ? (
                  paginationData.paginatedVendors.map((vendor) => (
                    <tr key={vendor.id} className="border-b border-border hover:bg-background/50">
                      <td className="py-3 px-4">
                        <span className="text-foreground font-semibold">{vendor.name}</span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{vendor.email}</td>
                      <td className="py-3 px-4 text-foreground font-semibold">
                        KES {vendor.revenue.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-foreground">{vendor.activeUsers}</td>
                      <td className="py-3 px-4 text-foreground">{vendor.activeSessions}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            vendor.status === 'active'
                              ? 'bg-green-500/20 text-green-500'
                              : 'bg-red-500/20 text-red-500'
                          }`}
                        >
                          {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Link
                          href={`/dashboard/superadmin/vendors/${vendor.id}`}
                          className="text-primary hover:text-secondary transition-colors font-semibold text-xs"
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                      No vendors found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
                   <PaginationControls
            currentPage={currentPage}
            totalPages={paginationData.totalPages}
            totalItems={filteredVendors.length}
            itemsLabel="vendors"
            onPageChange={setCurrentPage}
          />
        </CardContent>
      </Card>
    </div>
  );
}
