'use client';

import { useAuthStore } from '@/lib/store/auth';
import {
  useStaticPackages,
  useRouters,
  useUpdateStaticPackage,
  useDeleteStaticPackage,
} from '@/lib/api/queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Edit2, Loader2, Router as RouterIcon, ShieldCheck, Layers, Award } from 'lucide-react';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import { SearchFilterControls } from '@/components/dashboard/search-filter-controls';
import { PaginationControls } from '@/components/dashboard/pagination-controls';
import { useToast } from '@/hooks/use-toast';
import { type StaticPackage } from '@/lib/api/mockData';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function StaticPackagesPage() {
  const { user } = useAuthStore();
  const { data: packages, isLoading } = useStaticPackages(user?.vendorId);
  const { data: routers } = useRouters(user?.vendorId);
  const updateMutation = useUpdateStaticPackage();
  const deleteMutation = useDeleteStaticPackage();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Edit State
  const [editingPackage, setEditingPackage] = useState<StaticPackage | null>(null);
  const [editName, setEditName] = useState('');
  const [editTier, setEditTier] = useState<'Gold' | 'Silver' | 'Bronze' | 'Custom'>('Gold');
  const [editPrice, setEditPrice] = useState('');
  const [editDuration, setEditDuration] = useState('');
  const [editDurationUnit, setEditDurationUnit] = useState<'days' | 'months' | 'years'>('months');
  const [editRouterId, setEditRouterId] = useState('all');
  const [editDownloadLimit, setEditDownloadLimit] = useState('');
  const [editDownloadUnit, setEditDownloadUnit] = useState<'Mbps' | 'Kbps'>('Mbps');
  const [editUploadLimit, setEditUploadLimit] = useState('');
  const [editUploadUnit, setEditUploadUnit] = useState<'Mbps' | 'Kbps'>('Mbps');
  const [editIpPool, setEditIpPool] = useState('');
  const [editStatus, setEditStatus] = useState<'active' | 'inactive'>('active');
  const [editDescription, setEditDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete State
  const [deletingPackage, setDeletingPackage] = useState<StaticPackage | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredAndPaginatedPackages = useMemo(() => {
    if (!packages) return { packages: [], totalPages: 0, totalCount: 0 };

    const filtered = packages.filter((pkg) => {
      const matchesSearch =
        pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (pkg.routerName && pkg.routerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (pkg.ipPool && pkg.ipPool.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesTier = tierFilter === 'all' || pkg.tier.toLowerCase() === tierFilter.toLowerCase();
      return matchesSearch && matchesTier;
    });

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const startIdx = (currentPage - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;

    return {
      packages: filtered.slice(startIdx, endIdx),
      totalPages,
      totalCount: filtered.length,
    };
  }, [packages, searchTerm, tierFilter, currentPage]);

  const handleOpenEdit = (pkg: StaticPackage) => {
    setEditingPackage(pkg);
    setEditName(pkg.name);
    setEditTier(pkg.tier);
    setEditPrice(pkg.price.toString());
    setEditDuration(pkg.duration.toString());
    setEditDurationUnit(pkg.durationUnit || 'months');
    setEditRouterId(pkg.routerId || 'all');
    setEditDownloadLimit(pkg.downloadLimit ? pkg.downloadLimit.toString() : '');
    setEditDownloadUnit(pkg.downloadUnit || 'Mbps');
    setEditUploadLimit(pkg.uploadLimit ? pkg.uploadLimit.toString() : '');
    setEditUploadUnit(pkg.uploadUnit || 'Mbps');
    setEditIpPool(pkg.ipPool || '');
    setEditStatus(pkg.status || 'active');
    setEditDescription(pkg.description || '');
  };

  const handleSaveEdit = async () => {
    if (!editingPackage) return;
    if (!editName.trim() || !editPrice || Number(editPrice) <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Please provide valid package name and price.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await updateMutation.mutateAsync({
        id: editingPackage.id,
        data: {
          name: editName,
          tier: editTier,
          price: Number(editPrice),
          duration: Number(editDuration || 1),
          durationUnit: editDurationUnit,
          routerId: editRouterId === 'all' ? undefined : editRouterId,
          downloadLimit: editDownloadLimit ? Number(editDownloadLimit) : undefined,
          downloadUnit: editDownloadUnit,
          uploadLimit: editUploadLimit ? Number(editUploadLimit) : undefined,
          uploadUnit: editUploadUnit,
          ipPool: editIpPool || undefined,
          status: editStatus,
          description: editDescription,
        },
      });
      toast({
        title: 'Static Package Updated',
        description: `Package "${editName}" was updated successfully.`,
      });
      setEditingPackage(null);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err?.message || 'Failed to update package.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingPackage) return;
    setIsDeleting(true);
    try {
      await deleteMutation.mutateAsync(deletingPackage.id);
      toast({
        title: 'Package Deleted',
        description: `Static package "${deletingPackage.name}" has been removed.`,
      });
      setDeletingPackage(null);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err?.message || 'Failed to delete package.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'Gold':
        return <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30">Gold Tier</Badge>;
      case 'Silver':
        return <Badge className="bg-slate-500/15 text-slate-600 dark:text-slate-300 border-slate-500/30">Silver Tier</Badge>;
      case 'Bronze':
        return <Badge className="bg-orange-700/15 text-orange-700 dark:text-orange-400 border-orange-700/30">Bronze Tier</Badge>;
      default:
        return <Badge variant="outline">Custom Tier</Badge>;
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Static IP Packages</h1>
          <p className="text-muted-foreground mt-1">
            Configure dedicated bandwidth & static IP subscription tiers (Gold, Silver, Bronze, Custom).
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/dashboard/vendor/static-packages/add">
            <Plus className="w-4 h-4" />
            Add Static Package
          </Link>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-medium">Total Static Packages</p>
            <p className="text-2xl font-bold mt-1">{packages?.length || 0}</p>
          </div>
          <div className="p-3 bg-primary/10 rounded-xl">
            <Layers className="w-6 h-6 text-primary" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-medium">Active Tiers</p>
            <p className="text-2xl font-bold mt-1">
              {packages?.filter((p) => p.status === 'active').length || 0}
            </p>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-xl">
            <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-medium">Tier Varieties</p>
            <p className="text-2xl font-bold mt-1">
              {new Set(packages?.map((p) => p.tier)).size || 0} Tiers
            </p>
          </div>
          <div className="p-3 bg-amber-500/10 rounded-xl">
            <Award className="w-6 h-6 text-amber-500" />
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <SearchFilterControls
        searchPlaceholder="Search static packages, routers, IP pools..."
        searchValue={searchTerm}
        onSearchChange={(val) => {
          setSearchTerm(val);
          setCurrentPage(1);
        }}
        filterOptions={[
          { label: 'All Tiers', value: 'all' },
          { label: 'Gold', value: 'gold' },
          { label: 'Silver', value: 'silver' },
          { label: 'Bronze', value: 'bronze' },
          { label: 'Custom', value: 'custom' },
        ]}
        filterValue={tierFilter}
        onFilterChange={(val) => {
          setTierFilter(val);
          setCurrentPage(1);
        }}
      />

      {/* Grid List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredAndPaginatedPackages.packages.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          No static IP packages found matching your query.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndPaginatedPackages.packages.map((pkg) => (
            <Card key={pkg.id} className="relative flex flex-col justify-between overflow-hidden border">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    {getTierBadge(pkg.tier)}
                    <CardTitle className="text-xl font-bold mt-2">{pkg.name}</CardTitle>
                  </div>
                  <Badge variant={pkg.status === 'active' ? 'default' : 'secondary'}>
                    {pkg.status || 'active'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 flex-1">
                <div>
                  <span className="text-3xl font-extrabold">KES {pkg.price.toFixed(2)}</span>
                  <span className="text-muted-foreground text-sm ml-1">
                    / {pkg.duration} {pkg.durationUnit}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-muted-foreground pt-2 border-t">
                  <div className="flex justify-between">
                    <span>Speed Limits:</span>
                    <span className="font-semibold text-foreground">
                      ↓ {pkg.downloadLimit ? `${pkg.downloadLimit} ${pkg.downloadUnit}` : 'Unlimited'} / ↑{' '}
                      {pkg.uploadLimit ? `${pkg.uploadLimit} ${pkg.uploadUnit}` : 'Unlimited'}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Target Router:</span>
                    <span className="font-medium text-foreground flex items-center gap-1">
                      <RouterIcon className="w-3.5 h-3.5" />
                      {pkg.routerName || 'All Routers'}
                    </span>
                  </div>

                  {pkg.ipPool && (
                    <div className="flex justify-between">
                      <span>IP Pool:</span>
                      <span className="font-mono text-xs text-foreground bg-muted px-1.5 py-0.5 rounded">
                        {pkg.ipPool}
                      </span>
                    </div>
                  )}

                  {pkg.description && (
                    <p className="text-xs text-muted-foreground italic pt-1 line-clamp-2">
                      {pkg.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-4 border-t mt-auto">
                  <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={() => handleOpenEdit(pkg)}>
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10 gap-1"
                    onClick={() => setDeletingPackage(pkg)}
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {filteredAndPaginatedPackages.totalPages > 1 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={filteredAndPaginatedPackages.totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Edit Modal */}
      <Dialog open={!!editingPackage} onOpenChange={(open) => !open && setEditingPackage(null)}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Static Package</DialogTitle>
            <DialogDescription>Update all values for this static IP package tier.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Package Name *</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="e.g. Gold Tier - 50Mbps"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-tier">Package Tier *</Label>
                <Select
                  value={editTier}
                  onValueChange={(val: any) => setEditTier(val)}
                >
                  <SelectTrigger id="edit-tier">
                    <SelectValue placeholder="Select Tier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Gold">Gold</SelectItem>
                    <SelectItem value="Silver">Silver</SelectItem>
                    <SelectItem value="Bronze">Bronze</SelectItem>
                    <SelectItem value="Custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-price">Price (KES) *</Label>
                <Input
                  id="edit-price"
                  type="number"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  placeholder="5000"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-duration">Duration *</Label>
                <Input
                  id="edit-duration"
                  type="number"
                  value={editDuration}
                  onChange={(e) => setEditDuration(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-unit">Duration Unit *</Label>
                <Select
                  value={editDurationUnit}
                  onValueChange={(val: any) => setEditDurationUnit(val)}
                >
                  <SelectTrigger id="edit-unit">
                    <SelectValue placeholder="Unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="days">Days</SelectItem>
                    <SelectItem value="months">Months</SelectItem>
                    <SelectItem value="years">Years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-router">Target Router</Label>
              <Select value={editRouterId} onValueChange={setEditRouterId}>
                <SelectTrigger id="edit-router">
                  <SelectValue placeholder="Select Router" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Routers</SelectItem>
                  {routers?.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name} ({r.ipAddress})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Download Speed Limit</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={editDownloadLimit}
                    onChange={(e) => setEditDownloadLimit(e.target.value)}
                    placeholder="50"
                  />
                  <Select
                    value={editDownloadUnit}
                    onValueChange={(v: any) => setEditDownloadUnit(v)}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mbps">Mbps</SelectItem>
                      <SelectItem value="Kbps">Kbps</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Upload Speed Limit</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={editUploadLimit}
                    onChange={(e) => setEditUploadLimit(e.target.value)}
                    placeholder="25"
                  />
                  <Select
                    value={editUploadUnit}
                    onValueChange={(v: any) => setEditUploadUnit(v)}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mbps">Mbps</SelectItem>
                      <SelectItem value="Kbps">Kbps</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-ip-pool">IP Pool Range (Optional)</Label>
              <Input
                id="edit-ip-pool"
                value={editIpPool}
                onChange={(e) => setEditIpPool(e.target.value)}
                placeholder="192.168.10.100-192.168.10.200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select value={editStatus} onValueChange={(val: any) => setEditStatus(val)}>
                <SelectTrigger id="edit-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-desc">Description</Label>
              <Input
                id="edit-desc"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Package notes..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingPackage(null)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deletingPackage} onOpenChange={(open) => !open && setDeletingPackage(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Static Package</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete static package "{deletingPackage?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingPackage(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete Package'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
