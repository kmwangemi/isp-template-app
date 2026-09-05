'use client';

import { useAuthStore } from '@/lib/store/auth';
import {
  useStaticUsers,
  useStaticPackages,
  useRouters,
  useUpdateStaticUser,
  useDeleteStaticUser,
} from '@/lib/api/queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState, useMemo } from 'react';
import { SearchFilterControls } from '@/components/dashboard/search-filter-controls';
import { PaginationControls } from '@/components/dashboard/pagination-controls';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Calendar,
  X,
  Send,
  Ban,
  MoreVertical,
  Copy,
  Check,
  Mail,
  Phone,
  Router as RouterIcon,
  Clock,
  CreditCard,
  Plus,
  Loader2,
  Edit2,
  Trash2,
  Globe,
  ShieldCheck,
  AlertTriangle,
  UserCheck,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { type StaticUser, mockRoutersData, mockStaticPackagesData } from '@/lib/api/mockData';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function StaticUsersPage() {
  const { user } = useAuthStore();
  const { data: users, isLoading } = useStaticUsers(user?.vendorId);
  const { data: packages } = useStaticPackages(user?.vendorId);
  const { data: routers } = useRouters(user?.vendorId);
  const updateMutation = useUpdateStaticUser();
  const deleteMutation = useDeleteStaticUser();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [showCustomRange, setShowCustomRange] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const itemsPerPage = 10;

  // Send credentials / invoice modal state
  const [sendUser, setSendUser] = useState<StaticUser | null>(null);
  const [sendChannel, setSendChannel] = useState<'sms' | 'email'>('sms');
  const [sendRecipient, setSendRecipient] = useState('');
  const [sendMessageText, setSendMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Revoke session / Suspend modal state
  const [revokeUser, setRevokeUser] = useState<StaticUser | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);

  // Edit modal state
  const [editingUser, setEditingUser] = useState<StaticUser | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editStaticIp, setEditStaticIp] = useState('');
  const [editPackageId, setEditPackageId] = useState('');
  const [editRouterId, setEditRouterId] = useState('');
  const [editStatus, setEditStatus] = useState<'active' | 'suspended' | 'expired'>('active');
  const [editNotes, setEditNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Delete modal state
  const [deletingUser, setDeletingUser] = useState<StaticUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const activeCount = users?.filter((u) => u.status === 'active').length || 0;
  const suspendedCount = users?.filter((u) => u.status === 'suspended').length || 0;
  const expiredCount = users?.filter((u) => u.status === 'expired').length || 0;

  const totalMonthlyRev = users
    ?.filter((u) => u.status === 'active')
    .reduce((sum, u) => sum + (u.price || 0), 0) || 0;

  const getRouterName = (u: StaticUser) => {
    if (u.routerName && !u.routerName.match(/^\d+$/)) {
      return u.routerName;
    }
    const match = (routers || mockRoutersData).find((r) => r.id === u.routerId);
    return match ? match.name : `Router ${u.routerId}`;
  };

  const getPackageInfo = (u: StaticUser) => {
    const pkg = (packages || mockStaticPackagesData).find((p) => p.id === u.packageId);
    return {
      name: u.packageName || pkg?.name || 'Static Package',
      tier: u.packageTier || pkg?.tier || 'Gold',
      price: u.price !== undefined ? u.price : pkg?.price || 0,
    };
  };

  const handleCopyIp = (id: string, ip: string) => {
    navigator.clipboard.writeText(ip);
    setCopiedId(id);
    toast({
      title: 'IP Copied',
      description: `Static IP address ${ip} copied to clipboard.`,
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenSendModal = (u: StaticUser, channel: 'sms' | 'email') => {
    setSendUser(u);
    setSendChannel(channel);
    const recipient = channel === 'sms' ? u.phone : u.email || '';
    setSendRecipient(recipient);
    
    const pkgInfo = getPackageInfo(u);
    const routerName = getRouterName(u);
    const text = channel === 'sms'
      ? `ISP STATIC IP ACCESS CREDENTIALS: Customer: ${u.name}, IP: ${u.staticIp}, Package: ${pkgInfo.name} (${pkgInfo.tier}), Price: KES ${pkgInfo.price.toFixed(2)}, Router: ${routerName}, Expiry: ${u.expiryDate ? new Date(u.expiryDate).toLocaleDateString() : 'N/A'}.`
      : `Dear ${u.name},\n\nYour Static IP subscription details on ${routerName}:\n- Dedicated IP: ${u.staticIp}\n- Package: ${pkgInfo.name} (${pkgInfo.tier} Tier)\n- Monthly Rate: KES ${pkgInfo.price.toFixed(2)}\n- Status: ${u.status.toUpperCase()}\n- Renewal Date: ${u.expiryDate ? new Date(u.expiryDate).toLocaleDateString() : 'N/A'}\n\nThank you for choosing our services.`;
    setSendMessageText(text);
  };

  const handleExecuteSend = async () => {
    if (!sendUser || !sendRecipient.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Recipient contact detail is required.',
        variant: 'destructive',
      });
      return;
    }
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      toast({
        title: `${sendChannel.toUpperCase()} Sent Successfully`,
        description: `Credentials sent to ${sendRecipient}.`,
      });
      setSendUser(null);
    }, 600);
  };

  const handleExecuteRevoke = async () => {
    if (!revokeUser) return;
    setIsRevoking(true);
    try {
      const newStatus = revokeUser.status === 'active' ? 'suspended' : 'active';
      await updateMutation.mutateAsync({
        id: revokeUser.id,
        data: { status: newStatus },
      });
      toast({
        title: newStatus === 'suspended' ? 'Session Revoked / Suspended' : 'Customer Reactivated',
        description: `Status for ${revokeUser.name} changed to ${newStatus}.`,
      });
      setRevokeUser(null);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err?.message || 'Failed to update user session status.',
        variant: 'destructive',
      });
    } finally {
      setIsRevoking(false);
    }
  };

  const handleOpenEdit = (u: StaticUser) => {
    setEditingUser(u);
    setEditName(u.name);
    setEditEmail(u.email || '');
    setEditPhone(u.phone);
    setEditStaticIp(u.staticIp);
    setEditPackageId(u.packageId);
    setEditRouterId(u.routerId);
    setEditStatus(u.status);
    setEditNotes(u.notes || '');
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;
    if (!editName.trim() || !editPhone.trim() || !editStaticIp.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Customer name, phone, and static IP are required.',
        variant: 'destructive',
      });
      return;
    }
    setIsUpdating(true);
    try {
      await updateMutation.mutateAsync({
        id: editingUser.id,
        data: {
          name: editName,
          email: editEmail || undefined,
          phone: editPhone,
          staticIp: editStaticIp,
          packageId: editPackageId,
          routerId: editRouterId,
          status: editStatus,
          notes: editNotes,
        },
      });
      toast({
        title: 'Customer Updated',
        description: `Details for ${editName} were updated.`,
      });
      setEditingUser(null);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err?.message || 'Failed to update customer.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingUser) return;
    setIsDeleting(true);
    try {
      await deleteMutation.mutateAsync(deletingUser.id);
      toast({
        title: 'Customer Deleted',
        description: `Static customer ${deletingUser.name} has been removed.`,
      });
      setDeletingUser(null);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err?.message || 'Failed to delete customer.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredAndPaginatedUsers = useMemo(() => {
    if (!users) return { users: [], totalPages: 0, totalCount: 0 };

    const filtered = users.filter((u) => {
      const routerName = getRouterName(u);
      const pkgInfo = getPackageInfo(u);
      const matchesSearch =
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.staticIp.includes(searchTerm) ||
        u.phone.includes(searchTerm) ||
        (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        pkgInfo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        routerName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || u.status === statusFilter;

      // Date Range Filter
      let matchesDate = true;
      if (u.subscribedAt || u.expiryDate) {
        const itemDate = new Date(u.subscribedAt || u.expiryDate).getTime();
        const now = Date.now();

        if (dateRange === '7') {
          matchesDate = itemDate >= now - 7 * 24 * 60 * 60 * 1000;
        } else if (dateRange === '30') {
          matchesDate = itemDate >= now - 30 * 24 * 60 * 60 * 1000;
        } else if (dateRange === '90') {
          matchesDate = itemDate >= now - 90 * 24 * 60 * 60 * 1000;
        } else if (dateRange === 'custom' && customStartDate && customEndDate) {
          const start = new Date(customStartDate).getTime();
          const end = new Date(customEndDate).getTime() + 24 * 60 * 60 * 1000 - 1;
          matchesDate = itemDate >= start && itemDate <= end;
        }
      }

      return matchesSearch && matchesStatus && matchesDate;
    });

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const startIdx = (currentPage - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;

    return {
      users: filtered.slice(startIdx, endIdx),
      totalPages,
      totalCount: filtered.length,
    };
  }, [users, searchTerm, statusFilter, dateRange, customStartDate, customEndDate, currentPage, packages, routers]);

  const getTierBadge = (tier?: string) => {
    switch (tier) {
      case 'Gold':
        return <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30">Gold</Badge>;
      case 'Silver':
        return <Badge className="bg-slate-500/15 text-slate-600 dark:text-slate-300 border-slate-500/30">Silver</Badge>;
      case 'Bronze':
        return <Badge className="bg-orange-700/15 text-orange-700 dark:text-orange-400 border-orange-700/30">Bronze</Badge>;
      default:
        return <Badge variant="outline">Custom</Badge>;
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Static IP Customers</h1>
          <p className="text-muted-foreground mt-1">
            Manage clients assigned dedicated static IP addresses, speed tiers & subscription billing.
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/dashboard/vendor/static-users/add">
            <Plus className="w-4 h-4" />
            Add Static Customer
          </Link>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Static Clients</p>
            <p className="text-2xl font-bold mt-1">{users?.length || 0}</p>
          </div>
          <div className="p-3 bg-primary/10 rounded-xl">
            <Globe className="w-6 h-6 text-primary" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Active Lines</p>
            <p className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">{activeCount}</p>
          </div>
          <div className="p-3 bg-emerald-500/10 rounded-xl">
            <UserCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Suspended / Expired</p>
            <p className="text-2xl font-bold mt-1 text-amber-600 dark:text-amber-400">
              {suspendedCount + expiredCount}
            </p>
          </div>
          <div className="p-3 bg-amber-500/10 rounded-xl">
            <AlertTriangle className="w-6 h-6 text-amber-500" />
          </div>
        </Card>
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Active Monthly Value</p>
            <p className="text-2xl font-bold mt-1">KES {totalMonthlyRev.toFixed(2)}</p>
          </div>
          <div className="p-3 bg-blue-500/10 rounded-xl">
            <CreditCard className="w-6 h-6 text-blue-500" />
          </div>
        </Card>
      </div>

      {/* Filters & Search Header */}
      <div className="space-y-4">
        <SearchFilterControls
          searchPlaceholder="Search customer, static IP, phone, package, router..."
          searchValue={searchTerm}
          onSearchChange={(val) => {
            setSearchTerm(val);
            setCurrentPage(1);
          }}
          filterOptions={[
            { label: 'All Statuses', value: 'all' },
            { label: 'Active', value: 'active' },
            { label: 'Suspended', value: 'suspended' },
            { label: 'Expired', value: 'expired' },
          ]}
          filterValue={statusFilter}
          onFilterChange={(val) => {
            setStatusFilter(val);
            setCurrentPage(1);
          }}
        />

        {/* Date Filter Bar */}
        <div className="flex flex-wrap items-center gap-3 bg-muted/40 p-3 rounded-lg border">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>Filter by Subscription Date:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {[
              { label: 'All Time', value: 'all' },
              { label: 'Last 7 Days', value: '7' },
              { label: 'Last 30 Days', value: '30' },
              { label: 'Last 90 Days', value: '90' },
              { label: 'Custom Range', value: 'custom' },
            ].map((option) => (
              <Button
                key={option.value}
                variant={dateRange === option.value ? 'default' : 'outline'}
                size="sm"
                className="h-8 text-xs"
                onClick={() => {
                  setDateRange(option.value);
                  setShowCustomRange(option.value === 'custom');
                  setCurrentPage(1);
                }}
              >
                {option.label}
              </Button>
            ))}
          </div>

          {showCustomRange && (
            <div className="flex items-center gap-2 ml-auto">
              <Input
                type="date"
                className="h-8 text-xs w-36"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
              />
              <span className="text-xs text-muted-foreground">to</span>
              <Input
                type="date"
                className="h-8 text-xs w-36"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => {
                  setShowCustomRange(false);
                  setDateRange('all');
                  setCustomStartDate('');
                  setCustomEndDate('');
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredAndPaginatedUsers.users.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No static IP customers found matching your criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-muted/50 border-b font-semibold text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Customer Name</th>
                    <th className="px-4 py-3">Static IP</th>
                    <th className="px-4 py-3">Package / Tier</th>
                    <th className="px-4 py-3">Router Name</th>
                    <th className="px-4 py-3">Contact</th>
                    <th className="px-4 py-3">Rate</th>
                    <th className="px-4 py-3">Expires At</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredAndPaginatedUsers.users.map((u) => {
                    const pkgInfo = getPackageInfo(u);
                    const routerName = getRouterName(u);

                    return (
                      <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                        {/* Customer Name */}
                        <td className="px-4 py-3.5 font-medium">
                          <div>
                            <p className="font-semibold text-foreground">{u.name}</p>
                            {u.notes && (
                              <p className="text-xs text-muted-foreground italic truncate max-w-[180px]">
                                {u.notes}
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Static IP */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5 font-mono text-xs bg-muted px-2 py-1 rounded w-fit">
                            <span>{u.staticIp}</span>
                            <button
                              onClick={() => handleCopyIp(u.id, u.staticIp)}
                              className="text-muted-foreground hover:text-foreground transition-colors ml-1"
                              title="Copy IP"
                            >
                              {copiedId === u.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* Package / Tier */}
                        <td className="px-4 py-3.5">
                          <div className="space-y-1">
                            <div className="font-medium text-foreground">{pkgInfo.name}</div>
                            <div>{getTierBadge(pkgInfo.tier)}</div>
                          </div>
                        </td>

                        {/* Router Name */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <RouterIcon className="w-3.5 h-3.5 text-primary shrink-0" />
                            <span className="font-medium text-foreground">{routerName}</span>
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="px-4 py-3.5">
                          <div className="space-y-0.5 text-xs">
                            <div className="flex items-center gap-1 text-foreground font-medium">
                              <Phone className="w-3 h-3 text-muted-foreground" />
                              {u.phone}
                            </div>
                            {u.email && (
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Mail className="w-3 h-3" />
                                {u.email}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Rate */}
                        <td className="px-4 py-3.5 font-semibold text-foreground">
                          KES {pkgInfo.price.toFixed(2)}
                        </td>

                        {/* Expires At */}
                        <td className="px-4 py-3.5 text-xs text-muted-foreground whitespace-nowrap">
                          {u.expiryDate ? new Date(u.expiryDate).toLocaleDateString() : 'N/A'}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3.5">
                          <Badge
                            variant={
                              u.status === 'active'
                                ? 'default'
                                : u.status === 'suspended'
                                ? 'destructive'
                                : 'secondary'
                            }
                            className="capitalize"
                          >
                            {u.status}
                          </Badge>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem
                                onClick={() => handleOpenSendModal(u, 'sms')}
                                className="cursor-pointer gap-2"
                              >
                                <Phone className="w-4 h-4" /> Send SMS Credentials
                              </DropdownMenuItem>

                              {u.email && (
                                <DropdownMenuItem
                                  onClick={() => handleOpenSendModal(u, 'email')}
                                  className="cursor-pointer gap-2"
                                >
                                  <Mail className="w-4 h-4" /> Send Email Credentials
                                </DropdownMenuItem>
                              )}

                              <DropdownMenuItem
                                onClick={() => setRevokeUser(u)}
                                className="cursor-pointer gap-2 text-amber-600 dark:text-amber-400"
                              >
                                <Ban className="w-4 h-4" />
                                {u.status === 'active' ? 'Revoke Session / Suspend' : 'Reactivate Customer'}
                              </DropdownMenuItem>

                              <DropdownMenuItem onClick={() => handleOpenEdit(u)} className="cursor-pointer gap-2">
                                <Edit2 className="w-4 h-4" /> Edit Customer
                              </DropdownMenuItem>

                              <DropdownMenuItem
                                onClick={() => setDeletingUser(u)}
                                className="cursor-pointer gap-2 text-destructive"
                              >
                                <Trash2 className="w-4 h-4" /> Delete Customer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {filteredAndPaginatedUsers.totalPages > 1 && (
        <PaginationControls
          currentPage={currentPage}
          totalPages={filteredAndPaginatedUsers.totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Send Credentials Modal */}
      <Dialog open={!!sendUser} onOpenChange={(open) => !open && setSendUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Send Credentials via {sendChannel.toUpperCase()}</DialogTitle>
            <DialogDescription>
              Dispatch static IP address, router mapping & package invoice to {sendUser?.name}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Recipient {sendChannel === 'sms' ? 'Phone Number' : 'Email Address'}</Label>
              <Input
                value={sendRecipient}
                onChange={(e) => setSendRecipient(e.target.value)}
                placeholder={sendChannel === 'sms' ? '+254 7...' : 'client@company.com'}
              />
            </div>

            <div className="space-y-2">
              <Label>Message Content</Label>
              <textarea
                className="w-full min-h-[120px] p-3 text-sm rounded-md border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                value={sendMessageText}
                onChange={(e) => setSendMessageText(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSendUser(null)} disabled={isSending}>
              Cancel
            </Button>
            <Button onClick={handleExecuteSend} disabled={isSending} className="gap-2">
              {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> Send</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke / Suspend Modal */}
      <Dialog open={!!revokeUser} onOpenChange={(open) => !open && setRevokeUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {revokeUser?.status === 'active' ? 'Revoke Session & Suspend Customer' : 'Reactivate Customer Line'}
            </DialogTitle>
            <DialogDescription>
              {revokeUser?.status === 'active'
                ? `Are you sure you want to disconnect static IP line ${revokeUser?.staticIp} for ${revokeUser?.name}?`
                : `Are you sure you want to reactivate connection line for ${revokeUser?.name}?`}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRevokeUser(null)} disabled={isRevoking}>
              Cancel
            </Button>
            <Button
              variant={revokeUser?.status === 'active' ? 'destructive' : 'default'}
              onClick={handleExecuteRevoke}
              disabled={isRevoking}
            >
              {isRevoking ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : revokeUser?.status === 'active' ? (
                'Confirm Revoke / Suspend'
              ) : (
                'Reactivate Customer'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Customer Modal */}
      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Static Customer</DialogTitle>
            <DialogDescription>Update client configuration and static IP allocation.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Customer Name *</Label>
              <Input id="edit-name" value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-phone">Phone Number *</Label>
                <Input id="edit-phone" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email Address</Label>
                <Input id="edit-email" type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-ip">Assigned Static IP *</Label>
              <Input id="edit-ip" className="font-mono" value={editStaticIp} onChange={(e) => setEditStaticIp(e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-pkg">Static Package *</Label>
                <Select value={editPackageId} onValueChange={setEditPackageId}>
                  <SelectTrigger id="edit-pkg">
                    <SelectValue placeholder="Select Package" />
                  </SelectTrigger>
                  <SelectContent>
                    {(packages || mockStaticPackagesData).map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} ({p.tier})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-rtr">Router *</Label>
                <Select value={editRouterId} onValueChange={setEditRouterId}>
                  <SelectTrigger id="edit-rtr">
                    <SelectValue placeholder="Select Router" />
                  </SelectTrigger>
                  <SelectContent>
                    {(routers || mockRoutersData).map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select value={editStatus} onValueChange={(val: any) => setEditStatus(val)}>
                <SelectTrigger id="edit-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-notes">Notes</Label>
              <Input id="edit-notes" value={editNotes} onChange={(e) => setEditNotes(e.target.value)} placeholder="Client notes..." />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUser(null)} disabled={isUpdating}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={isUpdating}>
              {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Customer Modal */}
      <Dialog open={!!deletingUser} onOpenChange={(open) => !open && setDeletingUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Customer Record</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete static customer record for "{deletingUser?.name}" ({deletingUser?.staticIp})? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingUser(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete Customer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
