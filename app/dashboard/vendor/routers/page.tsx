'use client';

import { useAuthStore } from '@/lib/store/auth';
import { useRouters } from '@/lib/api/queries';
import { RouterStatusCard } from '@/components/dashboard/router-status-card';
import { useState, useMemo } from 'react';
import { SearchFilterControls } from '@/components/dashboard/search-filter-controls';
import { PaginationControls } from '@/components/dashboard/pagination-controls';

export default function RoutersPage() {
  const { user } = useAuthStore();
  const { data: routers, isLoading } = useRouters(user?.vendorId);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [statusFilter, setStatusFilter] = useState('all');

  const filteredAndPaginatedRouters = useMemo(() => {
    if (!routers) return { routers: [], totalPages: 0, totalCount: 0 };
    
    const filtered = routers.filter((router) => {
      const matchesSearch =
        router.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        router.ipAddress.includes(searchTerm);
      const matchesStatus = statusFilter === 'all' || router.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
    
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const startIdx = (currentPage - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    
    return {
      routers: filtered.slice(startIdx, endIdx),
      totalPages,
      totalCount: filtered.length,
    };
  }, [routers, searchTerm, statusFilter, currentPage]);

  return (
    <div className="p-4 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Routers</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage and view your hotspot routers</p>
        </div>
      </div>

      {/* Search & Filter */}
      {routers && routers.length > 0 && (
        <SearchFilterControls
          searchTerm={searchTerm}
          onSearchChange={(val) => {
            setSearchTerm(val);
            setCurrentPage(1);
          }}
          searchPlaceholder="Search by name or IP address..."
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
                { label: "Online", value: "online" },
                { label: "Offline", value: "offline" },
              ],
            },
          ]}
        />
      )}

      {/* Routers Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading routers...</p>
        </div>
      ) : routers && routers.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAndPaginatedRouters.routers.map((router) => (
              <RouterStatusCard
                key={router.id}
                router={router}
                href={`/dashboard/vendor/routers/${router.id}`}
              />
            ))}
          </div>

          <PaginationControls
            currentPage={currentPage}
            totalPages={filteredAndPaginatedRouters.totalPages}
            totalItems={filteredAndPaginatedRouters.totalCount}
            itemsLabel="routers"
            onPageChange={setCurrentPage}
          />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 rounded-lg border border-border bg-card">
          <p className="text-muted-foreground">No routers available</p>
        </div>
      )}
    </div>
  );
}
