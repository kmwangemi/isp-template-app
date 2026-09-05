'use client';

import { useAuthStore } from '@/lib/store/auth';
import { usePackages, useRouters, useUpdatePackage, useDeletePackage } from '@/lib/api/queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Edit2, Loader2, Router as RouterIcon } from 'lucide-react';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import { SearchFilterControls } from '@/components/dashboard/search-filter-controls';
import { PaginationControls } from '@/components/dashboard/pagination-controls';
import { useToast } from '@/hooks/use-toast';
import { type Package } from '@/lib/api/mockData';
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

export default function PackagesPage() {
  const { user } = useAuthStore();
  const { data: packages, isLoading } = usePackages(user?.vendorId);
  const { data: routers } = useRouters(user?.vendorId);
  const updatePackageMutation = useUpdatePackage();
  const deletePackageMutation = useDeletePackage();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Edit State
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editDuration, setEditDuration] = useState('');
  const [editDurationUnit, setEditDurationUnit] = useState<'minutes' | 'hours' | 'days'>('hours');
  const [editMaxUsers, setEditMaxUsers] = useState('');
  const [editRouterId, setEditRouterId] = useState('all');
  const [editDownloadLimit, setEditDownloadLimit] = useState('');
  const [editDownloadUnit, setEditDownloadUnit] = useState<'Mbps' | 'Kbps'>('Mbps');
  const [editUploadLimit, setEditUploadLimit] = useState('');
  const [editUploadUnit, setEditUploadUnit] = useState<'Mbps' | 'Kbps'>('Mbps');
  const [editStatus, setEditStatus] = useState<'active' | 'inactive'>('active');
  const [editDescription, setEditDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete State
  const [deletingPackage, setDeletingPackage] = useState<Package | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredAndPaginatedPackages = useMemo(() => {
    if (!packages) return { packages: [], totalPages: 0, totalCount: 0 };
    
    const filtered = packages.filter((pkg) =>
      pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (pkg.routerName && pkg.routerName.toLowerCase().includes(searchTerm.toLowerCase()))
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

  const handleOpenEdit = (pkg: Package) => {
    setEditingPackage(pkg);
    setEditName(pkg.name);
    setEditPrice(pkg.price.toString());
    setEditDuration(pkg.duration.toString());
    setEditDurationUnit((pkg.durationUnit || 'hours') as 'minutes' | 'hours' | 'days');
    setEditMaxUsers(pkg.maxUsers.toString());
    setEditRouterId(pkg.routerId || 'all');
    setEditDownloadLimit(pkg.downloadLimit ? pkg.downloadLimit.toString() : '');
    setEditDownloadUnit(pkg.downloadUnit || 'Mbps');
    setEditUploadLimit(pkg.uploadLimit ? pkg.uploadLimit.toString() : '');
    setEditUploadUnit(pkg.uploadUnit || 'Mbps');
    setEditStatus((pkg.status as 'active' | 'inactive') || 'active');
    setEditDescription(pkg.description || '');
  };

  const handleSaveEdit = async () => {
    if (!editingPackage) return;
    setIsSubmitting(true);
    try {
      const selectedRouter = routers?.find((r) => r.id === editRouterId);
      await updatePackageMutation.mutateAsync({
        id: editingPackage.id,
        data: {
          name: editName,
          price: Number(editPrice),
          duration: Number(editDuration),
          durationUnit: editDurationUnit,
          maxUsers: Number(editMaxUsers),
          routerId: editRouterId !== 'all' ? editRouterId : undefined,
          routerName: selectedRouter ? selectedRouter.name : 'All Routers',
          downloadLimit: editDownloadLimit ? Number(editDownloadLimit) : undefined,
          downloadUnit: editDownloadUnit,
          uploadLimit: editUploadLimit ? Number(editUploadLimit) : undefined,
          uploadUnit: editUploadUnit,
          status: editStatus,
          description: editDescription,
        },
      });
      toast({
        title: 'Success',
        description: 'Package updated successfully.',
      });
      setEditingPackage(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update package.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingPackage) return;
    setIsDeleting(true);
    try {
      await deletePackageMutation.mutateAsync(deletingPackage.id);
      toast({
        title: 'Success',
        description: 'Package deleted successfully.',
      });
      setDeletingPackage(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete package.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

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
          searchPlaceholder="Search packages by name or router..."
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
                <Card key={pkg.id} className="bg-card border-border hover:border-primary/50 transition-colors flex flex-col justify-between">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">{pkg.name}</CardTitle>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                              (pkg.status || 'active') === 'active'
                                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                            }`}
                          >
                            {pkg.status || 'active'}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 font-medium">
                          Duration: <span className="text-foreground font-semibold">{pkg.duration} {pkg.durationUnit}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-primary">KES {pkg.price.toFixed(2)}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-0">
                    <div className="space-y-2 text-sm bg-background/50 p-3 rounded-lg border border-border/50">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Target Router:</span>
                        <span className="text-foreground font-semibold flex items-center gap-1">
                          <RouterIcon className="w-3.5 h-3.5 text-primary" />
                          {pkg.routerName || 'All Routers'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Max Sessions:</span>
                        <span className="text-foreground font-semibold">{pkg.maxUsers}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Download Limit:</span>
                        <span className="text-foreground font-semibold">
                          {pkg.downloadLimit ? `${pkg.downloadLimit} ${pkg.downloadUnit || 'Mbps'}` : 'Unlimited'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Upload Limit:</span>
                        <span className="text-foreground font-semibold">
                          {pkg.uploadLimit ? `${pkg.uploadLimit} ${pkg.uploadUnit || 'Mbps'}` : 'Unlimited'}
                        </span>
                      </div>
                    </div>

                    {pkg.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 px-1 italic">
                        {pkg.description}
                      </p>
                    )}

                    <div className="flex gap-2 pt-2 border-t border-border">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenEdit(pkg)}
                        className="flex-1 border-border hover:bg-background gap-2"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDeletingPackage(pkg)}
                        className="flex-1 border-border hover:bg-background gap-2 text-red-500 hover:text-red-600 hover:border-red-500/50"
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

      {/* Edit Package Modal */}
      <Dialog open={!!editingPackage} onOpenChange={(open) => !open && setEditingPackage(null)}>
        <DialogContent className="bg-card border-border sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">Edit Package</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Update details for {editingPackage?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Basic Info: Name & Price */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Package Name</Label>
                <Input
                  id="edit-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="bg-background border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-price">Price (KES)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  className="bg-background border-border"
                />
              </div>
            </div>

            {/* Target Router - Full Width */}
            <div className="space-y-2 w-full">
              <Label htmlFor="edit-router">Target Router</Label>
              <Select value={editRouterId} onValueChange={setEditRouterId}>
                <SelectTrigger id="edit-router" className="bg-background border-border w-full">
                  <SelectValue placeholder="Select router" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="all">All Routers (Global)</SelectItem>
                  {routers?.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name} ({r.ipAddress})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Duration (Value + Unit on ONE line) & Max Sessions */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Duration</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="1"
                    value={editDuration}
                    onChange={(e) => setEditDuration(e.target.value)}
                    className="bg-background border-border flex-1"
                  />
                  <Select
                    value={editDurationUnit}
                    onValueChange={(val) => setEditDurationUnit(val as 'minutes' | 'hours' | 'days')}
                  >
                    <SelectTrigger className="bg-background border-border w-28">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="minutes">Minutes</SelectItem>
                      <SelectItem value="hours">Hours</SelectItem>
                      <SelectItem value="days">Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-max-users">Max Sessions</Label>
                <Input
                  id="edit-max-users"
                  type="number"
                  value={editMaxUsers}
                  onChange={(e) => setEditMaxUsers(e.target.value)}
                  className="bg-background border-border"
                />
              </div>
            </div>

            {/* Download & Upload Limits */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Download Limit (Optional)</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="No limit"
                    value={editDownloadLimit}
                    onChange={(e) => setEditDownloadLimit(e.target.value)}
                    className="bg-background border-border flex-1"
                  />
                  <Select
                    value={editDownloadUnit}
                    onValueChange={(val) => setEditDownloadUnit(val as 'Mbps' | 'Kbps')}
                  >
                    <SelectTrigger className="bg-background border-border w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="Mbps">Mbps</SelectItem>
                      <SelectItem value="Kbps">Kbps</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Upload Limit (Optional)</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="No limit"
                    value={editUploadLimit}
                    onChange={(e) => setEditUploadLimit(e.target.value)}
                    className="bg-background border-border flex-1"
                  />
                  <Select
                    value={editUploadUnit}
                    onValueChange={(val) => setEditUploadUnit(val as 'Mbps' | 'Kbps')}
                  >
                    <SelectTrigger className="bg-background border-border w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="Mbps">Mbps</SelectItem>
                      <SelectItem value="Kbps">Kbps</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Status - Full Width */}
            <div className="space-y-2 w-full">
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={editStatus}
                onValueChange={(val) => setEditStatus(val as 'active' | 'inactive')}
              >
                <SelectTrigger id="edit-status" className="bg-background border-border w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Description - Full Width */}
            <div className="space-y-2 w-full">
              <Label htmlFor="edit-description">Description (Optional)</Label>
              <Input
                id="edit-description"
                placeholder="Package description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="bg-background border-border w-full"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingPackage(null)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Package Modal */}
      <Dialog open={!!deletingPackage} onOpenChange={(open) => !open && setDeletingPackage(null)}>
        <DialogContent className="bg-card border-border sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-foreground">Delete Package</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Are you sure you want to delete package <span className="font-semibold text-foreground">{deletingPackage?.name}</span>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeletingPackage(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="gap-2"
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
