'use client';

import { useAuthStore } from '@/lib/store/auth';
import { useRouters } from '@/lib/api/queries';
import { RouterStatusCard } from '@/components/dashboard/router-status-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useState, useMemo } from 'react';

export default function RoutersPage() {
  const { user } = useAuthStore();
  const { data: routers, isLoading } = useRouters(user?.vendorId);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const filteredAndPaginatedRouters = useMemo(() => {
    if (!routers) return { routers: [], totalPages: 0 };
    
    const filtered = routers.filter((router) =>
      router.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      router.ipAddress.includes(searchTerm)
    );
    
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const startIdx = (currentPage - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    
    return {
      routers: filtered.slice(startIdx, endIdx),
      totalPages,
      totalCount: filtered.length,
    };
  }, [routers, searchTerm, currentPage]);

  return (
    <div className="p-4 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Routers</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your hotspot routers</p>
        </div>
        <Link href="/dashboard/vendor/routers/add">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
            <Plus className="w-4 h-4" />
            Add Router
          </Button>
        </Link>
      </div>

      {/* Search */}
      {routers && routers.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or IP address..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-card border-border pl-10"
          />
        </div>
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

          {/* Pagination */}
          {filteredAndPaginatedRouters.totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Page {currentPage} of {filteredAndPaginatedRouters.totalPages} (
                {filteredAndPaginatedRouters.totalCount} routers)
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
                  onClick={() =>
                    setCurrentPage(Math.min(filteredAndPaginatedRouters.totalPages, currentPage + 1))
                  }
                  disabled={currentPage === filteredAndPaginatedRouters.totalPages}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 rounded-lg border border-border bg-card">
          <p className="text-muted-foreground mb-4">No routers yet</p>
          <Link href="/dashboard/vendor/routers/add">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
              <Plus className="w-4 h-4" />
              Add First Router
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
