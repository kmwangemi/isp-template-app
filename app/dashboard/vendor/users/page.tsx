'use client';

import { useAuthStore } from '@/lib/store/auth';
import { useHotspotUsers } from '@/lib/api/queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function UsersPage() {
  const { user } = useAuthStore();
  const { data: users, isLoading } = useHotspotUsers(user?.vendorId);
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const itemsPerPage = 10;

  const activeUsers = users?.filter((u) => u.status === 'active').length || 0;
  const inactiveUsers = users?.filter((u) => u.status === 'inactive').length || 0;
  const expiredUsers = users?.filter((u) => u.status === 'expired').length || 0;

  const filteredAndPaginatedUsers = useMemo(() => {
    if (!users) return { users: [], totalPages: 0 };
    
    const filtered = users.filter((u) =>
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const startIdx = (currentPage - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    
    return {
      users: filtered.slice(startIdx, endIdx),
      totalPages,
      totalCount: filtered.length,
    };
  }, [users, searchTerm, currentPage]);

  const handleDeleteUser = async () => {
    setIsDeletingUser(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      toast({
        title: 'Success',
        description: 'User deleted successfully.',
      });
      setDeleteUserId(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete user.',
        variant: 'destructive',
      });
    } finally {
      setIsDeletingUser(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Hotspot Users</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your hotspot accounts</p>
        </div>
        <Link href="/dashboard/vendor/users/add">
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
            <Plus className="w-4 h-4" />
            Add User
          </Button>
        </Link>
      </div>

      {/* Search */}
      {users && users.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by username or email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-card border-border pl-10"
          />
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Active Users</p>
              <p className="text-2xl font-bold text-foreground">{activeUsers}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Inactive Users</p>
              <p className="text-2xl font-bold text-foreground">{inactiveUsers}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Expired Users</p>
              <p className="text-2xl font-bold text-foreground">{expiredUsers}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg">All Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-muted-foreground font-semibold">
                    Username
                  </th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-semibold">
                    Package
                  </th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-semibold">
                    Router
                  </th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-semibold">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-semibold">
                    Expiry Date
                  </th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-semibold">
                    Last Login
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
                      Loading users...
                    </td>
                  </tr>
                ) : filteredAndPaginatedUsers.users && filteredAndPaginatedUsers.users.length > 0 ? (
                  filteredAndPaginatedUsers.users.map((u) => (
                    <tr key={u.id} className="border-b border-border hover:bg-background/50">
                      <td className="py-3 px-4 text-foreground font-semibold">{u.username}</td>
                      <td className="py-3 px-4 text-muted-foreground">{u.packageId}</td>
                      <td className="py-3 px-4 text-muted-foreground">{u.routerId}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            u.status === 'active'
                              ? 'bg-green-500/20 text-green-500'
                              : u.status === 'inactive'
                                ? 'bg-yellow-500/20 text-yellow-500'
                                : 'bg-red-500/20 text-red-500'
                          }`}
                        >
                          {u.status.charAt(0).toUpperCase() + u.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {new Date(u.expiryDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="py-3 px-4">
                        <Dialog open={deleteUserId === u.id} onOpenChange={(open) => !open && setDeleteUserId(null)}>
                          <DialogTrigger asChild>
                            <button
                              onClick={() => setDeleteUserId(u.id)}
                              className="text-red-500 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </DialogTrigger>
                          <DialogContent className="bg-card border-border">
                            <DialogHeader>
                              <DialogTitle>Delete User: {u.username}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <p className="text-sm text-muted-foreground">
                                Are you sure you want to delete this user? This action cannot be undone.
                              </p>
                              <div className="bg-background/50 p-3 rounded-lg text-xs">
                                <p><span className="text-muted-foreground">Username:</span> <span className="font-semibold">{u.username}</span></p>
                                <p><span className="text-muted-foreground">Email:</span> <span className="font-semibold">{u.email || 'N/A'}</span></p>
                                <p><span className="text-muted-foreground">Status:</span> <span className="font-semibold">{u.status}</span></p>
                              </div>
                            </div>
                            <DialogFooter className="gap-2">
                              <DialogTrigger asChild>
                                <Button variant="outline">Cancel</Button>
                              </DialogTrigger>
                              <Button
                                variant="destructive"
                                onClick={handleDeleteUser}
                                disabled={isDeletingUser}
                              >
                                {isDeletingUser ? 'Deleting...' : 'Delete'}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredAndPaginatedUsers.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Page {currentPage} of {filteredAndPaginatedUsers.totalPages} (
                {filteredAndPaginatedUsers.totalCount} users)
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
                  onClick={() => setCurrentPage(Math.min(filteredAndPaginatedUsers.totalPages, currentPage + 1))}
                  disabled={currentPage === filteredAndPaginatedUsers.totalPages}
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
