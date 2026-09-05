'use client';

import { useState, useMemo } from 'react';
import { useAuthStore } from '@/lib/store/auth';
import { usePackages } from '@/lib/api/queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { SearchFilterControls } from '@/components/dashboard/search-filter-controls';
import { PaginationControls } from '@/components/dashboard/pagination-controls';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Ticket, Send, RefreshCw, Ban, Copy, Plus, Calendar, X, Check } from 'lucide-react';

interface Voucher {
  id: string;
  code: string;
  packageName: string;
  price: number;
  recipient: string;
  sendMethod: 'sms' | 'email';
  status: 'active' | 'used' | 'revoked' | 'expired';
  createdAt: string;
  expiryDate: string;
}

const mockVouchersList: Voucher[] = [
  {
    id: 'v-101',
    code: 'HS-9K2M-2026',
    packageName: '1 Hour Pass',
    price: 50,
    recipient: '+254712345678',
    sendMethod: 'sms',
    status: 'active',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    expiryDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'v-102',
    code: 'HS-4T7P-2026',
    packageName: '24 Hour Pass',
    price: 250,
    recipient: 'john.doe@example.com',
    sendMethod: 'email',
    status: 'active',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    expiryDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'v-103',
    code: 'HS-8X1L-2026',
    packageName: '7 Days Pass',
    price: 1000,
    recipient: '+254798765432',
    sendMethod: 'sms',
    status: 'used',
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'v-104',
    code: 'HS-3Z9V-2026',
    packageName: '1 Hour Pass',
    price: 50,
    recipient: '+254722114455',
    sendMethod: 'sms',
    status: 'revoked',
    createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    expiryDate: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'v-105',
    code: 'HS-5W2K-2026',
    packageName: '30 Days Unlimited',
    price: 3500,
    recipient: 'mary.w@example.com',
    sendMethod: 'email',
    status: 'expired',
    createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
    expiryDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export default function VouchersPage() {
  const { user } = useAuthStore();
  const { data: packages } = usePackages(user?.vendorId);
  const { toast } = useToast();

  const [vouchers, setVouchers] = useState<Voucher[]>(mockVouchersList);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [showCustomRange, setShowCustomRange] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // New Voucher Form State
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState('');
  const [recipient, setRecipient] = useState('');
  const [sendMethod, setSendMethod] = useState<'sms' | 'email'>('sms');
  const [customCode, setCustomCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Revoke Modal State
  const [revokeVoucherId, setRevokeVoucherId] = useState<string | null>(null);

  // Copy Feedback State
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let rand = 'HS-';
    for (let i = 0; i < 4; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    rand += '-2026';
    return rand;
  };

  const handleGenerateVoucher = () => {
    if (!recipient) {
      toast({
        title: 'Recipient Required',
        description: 'Please enter a phone number or email address.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const pkg = packages?.find((p) => p.id === selectedPackageId) || {
        name: 'Standard Pass',
        price: 100,
      };

      const finalCode = customCode.trim() ? customCode.trim().toUpperCase() : generateRandomCode();

      const newVoucher: Voucher = {
        id: `v-${Date.now()}`,
        code: finalCode,
        packageName: pkg.name,
        price: pkg.price,
        recipient,
        sendMethod,
        status: 'active',
        createdAt: new Date().toISOString(),
        expiryDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      };

      setVouchers((prev) => [newVoucher, ...prev]);
      setIsSubmitting(false);
      setIsGenerateModalOpen(false);
      setRecipient('');
      setCustomCode('');

      toast({
        title: 'Voucher Generated & Sent!',
        description: `Voucher ${finalCode} sent via ${sendMethod.toUpperCase()} to ${recipient}.`,
      });
    }, 600);
  };

  const handleResendVoucher = (voucher: Voucher) => {
    toast({
      title: 'Voucher Resent',
      description: `Voucher ${voucher.code} successfully resent to ${voucher.recipient} via ${voucher.sendMethod.toUpperCase()}.`,
    });
  };

  const handleRevokeVoucher = (voucherId: string) => {
    setVouchers((prev) =>
      prev.map((v) => (v.id === voucherId ? { ...v, status: 'revoked' } : v))
    );
    const vObj = vouchers.find((v) => v.id === voucherId);
    setRevokeVoucherId(null);
    toast({
      title: 'Voucher Revoked',
      description: `Voucher ${vObj?.code || ''} has been voided.`,
      variant: 'destructive',
    });
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
    toast({
      title: 'Copied to Clipboard',
      description: `Code ${code} copied.`,
    });
  };

  // Calculations & Stats
  const activeCount = vouchers.filter((v) => v.status === 'active').length;
  const usedCount = vouchers.filter((v) => v.status === 'used').length;
  const revokedCount = vouchers.filter((v) => v.status === 'revoked').length;

  const filteredAndPaginatedVouchers = useMemo(() => {
    const filtered = vouchers.filter((v) => {
      const matchesSearch =
        v.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.packageName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || v.status === statusFilter;

      let matchesDate = true;
      if (dateRange !== 'all') {
        const vDate = new Date(v.createdAt);
        if (dateRange.includes('_')) {
          const [startStr, endStr] = dateRange.split('_');
          const start = new Date(startStr);
          const end = new Date(endStr);
          end.setHours(23, 59, 59, 999);
          matchesDate = vDate >= start && vDate <= end;
        } else {
          const days = parseInt(dateRange, 10);
          if (!isNaN(days)) {
            const pastDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
            matchesDate = vDate >= pastDate;
          }
        }
      }

      return matchesSearch && matchesStatus && matchesDate;
    });

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const startIdx = (currentPage - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;

    return {
      vouchers: filtered.slice(startIdx, endIdx),
      totalPages,
      totalCount: filtered.length,
    };
  }, [vouchers, searchTerm, statusFilter, dateRange, currentPage]);

  return (
    <div className="p-4 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Ticket className="w-8 h-8 text-primary" />
            Hotspot Vouchers
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Generate, send, resend, and manage user access vouchers
          </p>
        </div>
        <div className="flex items-center gap-3">
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

          <Dialog open={isGenerateModalOpen} onOpenChange={setIsGenerateModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
                <Plus className="w-4 h-4" />
                Generate Voucher
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-primary" />
                  Generate & Send Voucher
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">
                    Select Package
                  </label>
                  <Select value={selectedPackageId} onValueChange={setSelectedPackageId}>
                    <SelectTrigger className="bg-background border-border w-full">
                      <SelectValue placeholder="Choose package..." />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {packages && packages.length > 0 ? (
                        packages.map((pkg) => (
                          <SelectItem key={pkg.id} value={pkg.id}>
                            {pkg.name} — KES {pkg.price.toFixed(2)}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="default">1 Hour Pass — KES 50.00</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">
                    Recipient (Phone or Email)
                  </label>
                  <Input
                    placeholder="+2547... or user@example.com"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="bg-background border-border"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">
                    Send Channel
                  </label>
                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant={sendMethod === 'sms' ? 'default' : 'outline'}
                      className="flex-1"
                      onClick={() => setSendMethod('sms')}
                    >
                      SMS
                    </Button>
                    <Button
                      type="button"
                      variant={sendMethod === 'email' ? 'default' : 'outline'}
                      className="flex-1"
                      onClick={() => setSendMethod('email')}
                    >
                      Email
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">
                    Custom Code (Optional)
                  </label>
                  <Input
                    placeholder="Leave empty for auto-generated code"
                    value={customCode}
                    onChange={(e) => setCustomCode(e.target.value)}
                    className="bg-background border-border font-mono uppercase"
                  />
                </div>
              </div>

              <DialogFooter className="gap-2 pt-2">
                <Button variant="outline" onClick={() => setIsGenerateModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleGenerateVoucher}
                  disabled={isSubmitting}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting ? 'Generating...' : 'Generate & Send'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Custom Date Range Card */}
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

      {/* Stats Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Vouchers</p>
              <p className="text-2xl font-bold text-foreground">{vouchers.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Active</p>
              <p className="text-2xl font-bold text-green-500">{activeCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Used</p>
              <p className="text-2xl font-bold text-blue-500">{usedCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Revoked / Expired</p>
              <p className="text-2xl font-bold text-red-500">{revokedCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter Controls */}
      <SearchFilterControls
        searchTerm={searchTerm}
        onSearchChange={(val) => {
          setSearchTerm(val);
          setCurrentPage(1);
        }}
        searchPlaceholder="Search by code, recipient, or package..."
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
              { label: "Used", value: "used" },
              { label: "Revoked", value: "revoked" },
              { label: "Expired", value: "expired" },
            ],
          },
        ]}
      />

      {/* Vouchers Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg">All Vouchers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-muted-foreground font-semibold">
                    Code
                  </th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-semibold">
                    Package
                  </th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-semibold">
                    Price
                  </th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-semibold">
                    Recipient
                  </th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-semibold">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-semibold">
                    Created
                  </th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAndPaginatedVouchers.vouchers &&
                filteredAndPaginatedVouchers.vouchers.length > 0 ? (
                  filteredAndPaginatedVouchers.vouchers.map((voucher) => (
                    <tr key={voucher.id} className="border-b border-border hover:bg-background/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <code className="bg-background px-2 py-1 rounded text-primary font-mono font-semibold border border-border">
                            {voucher.code}
                          </code>
                          <button
                            title="Copy Code"
                            onClick={() => handleCopyCode(voucher.code)}
                            className="text-muted-foreground hover:text-foreground transition-colors p-1"
                          >
                            {copiedCode === voucher.code ? (
                              <Check className="w-4 h-4 text-green-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-foreground font-medium">
                        {voucher.packageName}
                      </td>
                      <td className="py-3 px-4 text-foreground font-semibold">
                        KES {voucher.price.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        <span className="font-mono text-xs">{voucher.recipient}</span>
                        <span className="text-[10px] ml-2 px-1.5 py-0.5 rounded bg-background border border-border uppercase">
                          {voucher.sendMethod}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          className={
                            voucher.status === 'active'
                              ? 'bg-green-500/20 text-green-500 border-0'
                              : voucher.status === 'used'
                                ? 'bg-blue-500/20 text-blue-500 border-0'
                                : voucher.status === 'revoked'
                                  ? 'bg-red-500/20 text-red-500 border-0'
                                  : 'bg-muted text-muted-foreground border-0'
                          }
                        >
                          {voucher.status.charAt(0).toUpperCase() + voucher.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground text-xs">
                        {new Date(voucher.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {/* Resend Action */}
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1 h-8 px-2 text-xs"
                            onClick={() => handleResendVoucher(voucher)}
                            title="Resend Voucher"
                            disabled={voucher.status === 'revoked'}
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            Resend
                          </Button>

                          {/* Revoke Action */}
                          {voucher.status === 'active' && (
                            <Dialog
                              open={revokeVoucherId === voucher.id}
                              onOpenChange={(open) => !open && setRevokeVoucherId(null)}
                            >
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="gap-1 h-8 px-2 text-xs"
                                  onClick={() => setRevokeVoucherId(voucher.id)}
                                >
                                  <Ban className="w-3.5 h-3.5" />
                                  Revoke
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="bg-card border-border">
                                <DialogHeader>
                                  <DialogTitle className="text-destructive flex items-center gap-2">
                                    <Ban className="w-5 h-5" />
                                    Revoke Voucher: {voucher.code}
                                  </DialogTitle>
                                </DialogHeader>
                                <div className="space-y-3 py-2 text-sm text-muted-foreground">
                                  <p>
                                    Are you sure you want to revoke this active voucher? Once revoked, the code cannot be redeemed by the recipient.
                                  </p>
                                  <div className="bg-background/50 p-3 rounded-lg text-xs space-y-1">
                                    <p>
                                      <span className="text-muted-foreground">Code:</span>{' '}
                                      <span className="font-mono font-semibold text-foreground">
                                        {voucher.code}
                                      </span>
                                    </p>
                                    <p>
                                      <span className="text-muted-foreground">Recipient:</span>{' '}
                                      <span className="font-semibold text-foreground">
                                        {voucher.recipient}
                                      </span>
                                    </p>
                                    <p>
                                      <span className="text-muted-foreground">Package:</span>{' '}
                                      <span className="font-semibold text-foreground">
                                        {voucher.packageName} (KES {voucher.price.toFixed(2)})
                                      </span>
                                    </p>
                                  </div>
                                </div>
                                <DialogFooter className="gap-2">
                                  <Button
                                    variant="outline"
                                    onClick={() => setRevokeVoucherId(null)}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    onClick={() => handleRevokeVoucher(voucher.id)}
                                  >
                                    Revoke Code
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                      No vouchers found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <PaginationControls
            currentPage={currentPage}
            totalPages={filteredAndPaginatedVouchers.totalPages}
            totalItems={filteredAndPaginatedVouchers.totalCount}
            itemsLabel="vouchers"
            onPageChange={setCurrentPage}
          />
        </CardContent>
      </Card>
    </div>
  );
}
