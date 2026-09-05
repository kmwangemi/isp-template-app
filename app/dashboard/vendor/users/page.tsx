'use client';

import { useAuthStore } from '@/lib/store/auth';
import { useHotspotUsers, useRouters } from '@/lib/api/queries';
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
  Ticket,
  Loader2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { type HotspotUser, mockRoutersData } from '@/lib/api/mockData';
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

export default function UsersPage() {
  const { user } = useAuthStore();
  const { data: users, isLoading } = useHotspotUsers(user?.vendorId);
  const { data: routers } = useRouters(user?.vendorId);
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [showCustomRange, setShowCustomRange] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const itemsPerPage = 10;

  // Actions State
  const [sendUser, setSendUser] = useState<HotspotUser | null>(null);
  const [sendChannel, setSendChannel] = useState<'sms' | 'email'>('sms');
  const [sendRecipient, setSendRecipient] = useState('');
  const [isSending, setIsSending] = useState(false);

  const [revokeUser, setRevokeUser] = useState<HotspotUser | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const activeUsersCount = users?.filter((u) => u.status === 'active').length || 0;
  const inactiveUsersCount = users?.filter((u) => u.status === 'inactive').length || 0;
  const expiredUsersCount = users?.filter((u) => u.status === 'expired').length || 0;

  const getRouterName = (userItem: HotspotUser) => {
    if (userItem.routerName && !userItem.routerName.match(/^\d+$/)) {
      return userItem.routerName;
    }
    const match = (routers || mockRoutersData).find((r) => r.id === userItem.routerId);
    return match ? match.name : `Router ${userItem.routerId}`;
  };

  const filteredAndPaginatedUsers = useMemo(() => {
    if (!users) return { users: [], totalPages: 0, totalCount: 0 };
    
    const filtered = users.filter((u) => {
      const routerName = getRouterName(u);
      const matchesSearch =
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.voucherCode && u.voucherCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (u.phoneNumber && u.phoneNumber.includes(searchTerm)) ||
        (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        routerName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || u.status === statusFilter;

      let matchesDate = true;
      if (dateRange !== 'all') {
        const uDate = new Date(u.expiryDate);
        if (dateRange.includes('_')) {
          const [startStr, endStr] = dateRange.split('_');
          const start = new Date(startStr);
          const end = new Date(endStr);
          end.setHours(23, 59, 59, 999);
          matchesDate = uDate >= start && uDate <= end;
        } else {
          const days = parseInt(dateRange, 10);
          if (!isNaN(days)) {
            const pastDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
            matchesDate = uDate >= pastDate;
          }
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
  }, [users, searchTerm, statusFilter, dateRange, currentPage, routers]);

  const handleOpenSend = (userItem: HotspotUser, channel: 'sms' | 'email') => {
    setSendUser(userItem);
    setSendChannel(channel);
    setSendRecipient(channel === 'sms' ? (userItem.phoneNumber || '') : (userItem.email || ''));
  };

  const handleConfirmSend = async () => {
    if (!sendUser) return;
    setIsSending(true);
    try {
      await new Promise((res) => setTimeout(res, 600));
      toast({
        title: 'Voucher Sent Successfully',
        description: `Sent voucher credentials to ${sendRecipient} via ${sendChannel.toUpperCase()}.`,
      });
      setSendUser(null);
    } catch (err) {
      toast({
        title: 'Failed to Send',
        description: 'Could not send voucher credentials.',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleConfirmRevoke = async () => {
    if (!revokeUser) return;
    setIsRevoking(true);
    try {
      await new Promise((res) => setTimeout(res, 600));
      toast({
        title: 'Session Revoked',
        description: `Session for ${revokeUser.username} has been revoked successfully.`,
      });
      setRevokeUser(null);
    } catch (err) {
      toast({
        title: 'Revoke Failed',
        description: 'Failed to revoke user session.',
        variant: 'destructive',
      });
    } finally {
      setIsRevoking(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast({
      title: 'Copied',
      description: `Voucher code ${text} copied to clipboard.`,
    });
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="p-4 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Hotspot Users</h1>
          <p className="text-sm text-muted-foreground mt-1">Monitor, communicate, and manage user sessions</p>
        </div>
        <Select
          value={dateRange}
          onValueChange={(value) => {
            if (value === 'custom') {
              setShowCustomRange(true);
            } else {
              setDateRange(value);
              setShowCustomRange(false);
              setCurrentPage(1);
            }
          }}
        >
          <SelectTrigger className="w-48 bg-card border-border">
            <SelectValue placeholder="Date Range" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="custom">Custom range</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Custom Date Range Picker */}
      {showCustomRange && (
        <Card className="bg-card border-border p-6">
          <div className="flex flex-col sm:flex-row items-end gap-4">
            <div className="flex-1 w-full">
              <label className="text-sm text-muted-foreground block mb-2">Start Date</label>
              <div className="flex items-center relative">
                <Calendar className="w-4 h-4 text-muted-foreground absolute ml-3" />
                <Input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="bg-background border-border pl-10 w-full"
                />
              </div>
            </div>
            <div className="flex-1 w-full">
              <label className="text-sm text-muted-foreground block mb-2">End Date</label>
              <div className="flex items-center relative">
                <Calendar className="w-4 h-4 text-muted-foreground absolute ml-3" />
                <Input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="bg-background border-border pl-10 w-full"
                />
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                className="bg-primary hover:bg-primary/90 text-primary-foreground flex-1 sm:flex-initial"
                onClick={() => {
                  if (customStartDate && customEndDate) {
                    setDateRange(`${customStartDate}_${customEndDate}`);
                    setShowCustomRange(false);
                    setCurrentPage(1);
                  }
                }}
                disabled={!customStartDate || !customEndDate}
              >
                Apply
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  setShowCustomRange(false);
                  setDateRange('all');
                  setCurrentPage(1);
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Search & Filter Controls */}
      {users && users.length > 0 && (
        <SearchFilterControls
          searchTerm={searchTerm}
          onSearchChange={(val) => {
            setSearchTerm(val);
            setCurrentPage(1);
          }}
          searchPlaceholder="Search by username, voucher code, phone, email, or router..."
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
                { label: "Expired", value: "expired" },
              ],
            },
          ]}
        />
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Active Users</p>
              <p className="text-2xl font-bold text-foreground">{activeUsersCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Inactive Users</p>
              <p className="text-2xl font-bold text-foreground">{inactiveUsersCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Expired Users</p>
              <p className="text-2xl font-bold text-foreground">{expiredUsersCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg">All Users & Voucher Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground bg-background/50">
                  <th className="text-left py-3 px-4 font-semibold">User & Voucher Code</th>
                  <th className="text-left py-3 px-4 font-semibold">Contact (Phone / Email)</th>
                  <th className="text-left py-3 px-4 font-semibold">Target Router Name</th>
                  <th className="text-left py-3 px-4 font-semibold">Amount & Duration</th>
                  <th className="text-left py-3 px-4 font-semibold">Bought At</th>
                  <th className="text-left py-3 px-4 font-semibold">Expires At</th>
                  <th className="text-left py-3 px-4 font-semibold">Status</th>
                  <th className="text-center py-3 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-muted-foreground">
                      Loading users...
                    </td>
                  </tr>
                ) : filteredAndPaginatedUsers.users && filteredAndPaginatedUsers.users.length > 0 ? (
                  filteredAndPaginatedUsers.users.map((u) => {
                    const routerNameStr = getRouterName(u);
                    const voucherCodeStr = u.voucherCode || `VOUCH-${u.id.toUpperCase()}`;
                    const phoneStr = u.phoneNumber || '+254 700 000 000';
                    const amountVal = u.amount || 50.0;
                    const boughtAtStr = u.boughtAt || (u.createdAt ? new Date(u.createdAt).toLocaleString() : 'N/A');
                    const expiresAtStr = u.expiryDate ? new Date(u.expiryDate).toLocaleString() : 'N/A';
                    const durationStr = u.duration || '1 Hour';

                    return (
                      <tr key={u.id} className="hover:bg-background/40 transition-colors">
                        {/* Username & Voucher Code */}
                        <td className="py-3 px-4">
                          <div className="font-semibold text-foreground">{u.username}</div>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                              {voucherCodeStr}
                            </span>
                            <button
                              onClick={() => copyToClipboard(voucherCodeStr, u.id)}
                              className="text-muted-foreground hover:text-foreground p-0.5 rounded"
                              title="Copy Voucher Code"
                            >
                              {copiedId === u.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* Phone & Email */}
                        <td className="py-3 px-4">
                          <div className="text-foreground font-medium text-xs flex items-center gap-1">
                            <Phone className="w-3 h-3 text-muted-foreground" />
                            {phoneStr}
                          </div>
                          {u.email && (
                            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Mail className="w-3 h-3 text-muted-foreground" />
                              {u.email}
                            </div>
                          )}
                        </td>

                        {/* Router Name */}
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1.5 text-foreground font-medium text-xs bg-background px-2.5 py-1 rounded-md border border-border">
                            <RouterIcon className="w-3.5 h-3.5 text-primary" />
                            {routerNameStr}
                          </span>
                        </td>

                        {/* Amount & Duration */}
                        <td className="py-3 px-4">
                          <div className="font-bold text-foreground">KES {amountVal.toFixed(2)}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3 text-muted-foreground" />
                            {durationStr}
                          </div>
                        </td>

                        {/* Bought At */}
                        <td className="py-3 px-4 text-xs text-muted-foreground">
                          {boughtAtStr}
                        </td>

                        {/* Expires At */}
                        <td className="py-3 px-4 text-xs text-muted-foreground font-medium">
                          {expiresAtStr}
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              u.status === 'active'
                                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                : u.status === 'inactive'
                                  ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                  : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              u.status === 'active' ? 'bg-emerald-500' : u.status === 'inactive' ? 'bg-amber-500' : 'bg-rose-500'
                            }`}></span>
                            {u.status.charAt(0).toUpperCase() + u.status.slice(1)}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-card border-border w-44">
                              <DropdownMenuItem
                                onClick={() => handleOpenSend(u, 'sms')}
                                className="gap-2 cursor-pointer"
                              >
                                <Phone className="w-4 h-4 text-blue-500" />
                                Send SMS
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleOpenSend(u, 'email')}
                                className="gap-2 cursor-pointer"
                              >
                                <Mail className="w-4 h-4 text-emerald-500" />
                                Send Email
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setRevokeUser(u)}
                                className="gap-2 cursor-pointer text-rose-500 focus:text-rose-500"
                              >
                                <Ban className="w-4 h-4" />
                                Revoke Session
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-muted-foreground">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <PaginationControls
            currentPage={currentPage}
            totalPages={filteredAndPaginatedUsers.totalPages}
            totalItems={filteredAndPaginatedUsers.totalCount}
            itemsLabel="users"
            onPageChange={setCurrentPage}
          />
        </CardContent>
      </Card>

      {/* Send Email/SMS Modal */}
      <Dialog open={!!sendUser} onOpenChange={(open) => !open && setSendUser(null)}>
        <DialogContent className="bg-card border-border sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <Send className="w-5 h-5 text-primary" />
              Send Voucher Details
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Send login voucher credentials for <span className="font-semibold text-foreground">{sendUser?.username}</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Delivery Method</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={sendChannel === 'sms' ? 'default' : 'outline'}
                  onClick={() => {
                    setSendChannel('sms');
                    setSendRecipient(sendUser?.phoneNumber || '+254 712 345 678');
                  }}
                  className={sendChannel === 'sms' ? 'bg-primary text-primary-foreground gap-2' : 'gap-2'}
                >
                  <Phone className="w-4 h-4" /> SMS
                </Button>
                <Button
                  type="button"
                  variant={sendChannel === 'email' ? 'default' : 'outline'}
                  onClick={() => {
                    setSendChannel('email');
                    setSendRecipient(sendUser?.email || `${sendUser?.username}@example.com`);
                  }}
                  className={sendChannel === 'email' ? 'bg-primary text-primary-foreground gap-2' : 'gap-2'}
                >
                  <Mail className="w-4 h-4" /> Email
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="send-recipient">
                {sendChannel === 'sms' ? 'Phone Number' : 'Email Address'}
              </Label>
              <Input
                id="send-recipient"
                value={sendRecipient}
                onChange={(e) => setSendRecipient(e.target.value)}
                placeholder={sendChannel === 'sms' ? '+254 712 345 678' : 'user@example.com'}
                className="bg-background border-border"
              />
            </div>

            <div className="p-3 bg-background rounded-lg border border-border space-y-1 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Voucher Code:</span>
                <span className="font-mono text-foreground font-semibold">{sendUser?.voucherCode || `VOUCH-${sendUser?.id.toUpperCase()}`}</span>
              </div>
              <div className="flex justify-between">
                <span>Duration:</span>
                <span className="text-foreground font-semibold">{sendUser?.duration || '1 Hour'}</span>
              </div>
              <div className="flex justify-between">
                <span>Router:</span>
                <span className="text-foreground font-semibold">{sendUser ? getRouterName(sendUser) : ''}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSendUser(null)} disabled={isSending}>
              Cancel
            </Button>
            <Button onClick={handleConfirmSend} disabled={isSending} className="bg-primary text-primary-foreground gap-2">
              {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Send Credentials
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke Session Modal */}
      <Dialog open={!!revokeUser} onOpenChange={(open) => !open && setRevokeUser(null)}>
        <DialogContent className="bg-card border-border sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <Ban className="w-5 h-5 text-rose-500" />
              Revoke User Session
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Are you sure you want to revoke the active session for <span className="font-semibold text-foreground">{revokeUser?.username}</span>?
              They will be disconnected from <span className="font-semibold text-foreground">{revokeUser ? getRouterName(revokeUser) : ''}</span> immediately.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setRevokeUser(null)} disabled={isRevoking}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmRevoke} disabled={isRevoking} className="gap-2">
              {isRevoking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" />}
              Revoke Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
