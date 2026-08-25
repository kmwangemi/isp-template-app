'use client';

import { useAuthStore } from '@/lib/store/auth';
import { usePackages } from '@/lib/api/queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import { SearchFilterControls } from '@/components/dashboard/search-filter-controls';
import { PaginationControls } from '@/components/dashboard/pagination-controls';

export default function PackagesPage() {
  const { user } = useAuthStore();
  const { data: packages, isLoading } = usePackages(user?.vendorId);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const filteredAndPaginatedPackages = useMemo(() => {
    if (!packages) return { packages: [], totalPages: 0 };
    
    const filtered = packages.filter((pkg) =>
      pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.profile.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const startIdx = (currentPage - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    
    return {
      packages: filtered.slice(startIdx, endIdx),
      totalPages,
      totalCount: filtered.length,
    };
  }, [packages, searchTerm, currentPage]);

  const totalPrice = packages?.reduce((sum, p) => sum + p.price, 0) || 0;

  return (
    <div className="p-4 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Packages</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your hotspot packages</p>
        </div>
        <Link href="/dashboard/vendor/packages/add">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
            <Plus className="w-4 h-4" />
            Add Package
          </Button>
        </Link>
      </div>

      {/* Search & Filter Controls */}
      {packages && packages.length > 0 && (
        <SearchFilterControls
          searchTerm={searchTerm}
          onSearchChange={(val) => {
            setSearchTerm(val);
            setCurrentPage(1);
          }}
          searchPlaceholder="Search packages by name or profile..."
        />
      )}

      {/* Stats */}
      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Packages</p>
              <p className="text-2xl font-bold text-foreground">{packages?.length || 0}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Price Value</p>
              <p className="text-2xl font-bold text-foreground">KES {totalPrice.toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Packages Grid */}
      <div>
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading packages...</p>
          </div>
        ) : packages && packages.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAndPaginatedPackages.packages.map((pkg) => (
              <Card key={pkg.id} className="bg-card border-border hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{pkg.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {pkg.duration} {pkg.durationUnit}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">KES {pkg.price.toFixed(2)}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Max Users:</span>
                      <span className="text-foreground font-semibold">{pkg.maxUsers}</span>
                    </div>
                    {pkg.bandwidthLimit && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Bandwidth:</span>
                        <span className="text-foreground font-semibold">
                          {(pkg.bandwidthLimit / 1000).toFixed(0)}GB
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Profile:</span>
                      <span className="text-foreground font-semibold">{pkg.profile}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-4 border-t border-border">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 border-border hover:bg-background gap-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 border-border hover:bg-background gap-2 text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            </div>

            <PaginationControls
              currentPage={currentPage}
              totalPages={filteredAndPaginatedPackages.totalPages}
              totalItems={filteredAndPaginatedPackages.totalCount}
              itemsLabel="packages"
              onPageChange={setCurrentPage}
            />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-64 rounded-lg border border-border bg-card">
            <p className="text-muted-foreground mb-4">No packages yet</p>
            <Link href="/dashboard/vendor/packages/add">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
                <Plus className="w-4 h-4" />
                Create First Package
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
