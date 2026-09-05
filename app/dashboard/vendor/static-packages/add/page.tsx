'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { staticPackageFormSchema } from '@/lib/schemas/staticPackage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAddStaticPackage, useRouters } from '@/lib/api/queries';
import { useAuthStore } from '@/lib/store/auth';

export default function AddStaticPackagePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { data: routers } = useRouters(user?.vendorId);
  const { toast } = useToast();
  const addStaticPackageMutation = useAddStaticPackage();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(staticPackageFormSchema),
    defaultValues: {
      name: '',
      tier: 'Gold' as const,
      price: undefined as any,
      duration: 1,
      durationUnit: 'months' as const,
      routerId: 'all',
      downloadLimit: undefined as any,
      downloadUnit: 'Mbps' as const,
      uploadLimit: undefined as any,
      uploadUnit: 'Mbps' as const,
      ipPool: '',
      description: '',
      status: 'active' as const,
    },
  });

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      await addStaticPackageMutation.mutateAsync({
        ...data,
        vendorId: user?.vendorId || 'v1',
      });
      toast({
        title: 'Success',
        description: 'Static package created successfully.',
      });
      router.push('/dashboard/vendor/static-packages');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to create static package.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-4xl mx-auto">
      {/* Back button & Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/vendor/static-packages">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Static Package</h1>
          <p className="text-muted-foreground">Add a new dedicated static IP package tier for clients.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Package Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Package Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Gold Tier - 50Mbps Dedicated" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Package Tier *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Tier" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Gold">Gold Tier</SelectItem>
                          <SelectItem value="Silver">Silver Tier</SelectItem>
                          <SelectItem value="Bronze">Bronze Tier</SelectItem>
                          <SelectItem value="Custom">Custom Tier</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (KES) *</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="5000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration *</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="durationUnit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration Unit *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Unit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="days">Days</SelectItem>
                          <SelectItem value="months">Months</SelectItem>
                          <SelectItem value="years">Years</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="routerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Router</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Target Router" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="all">All Routers</SelectItem>
                          {routers?.map((router) => (
                            <SelectItem key={router.id} value={router.id}>
                              {router.name} ({router.ipAddress})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ipPool"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>IP Pool Range (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 192.168.10.100-192.168.10.200" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex gap-2 items-end">
                  <FormField
                    control={form.control}
                    name="downloadLimit"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Download Speed</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="50" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="downloadUnit"
                    render={({ field }) => (
                      <FormItem className="w-28">
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Mbps">Mbps</SelectItem>
                            <SelectItem value="Kbps">Kbps</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex gap-2 items-end">
                  <FormField
                    control={form.control}
                    name="uploadLimit"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Upload Speed</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="25" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="uploadUnit"
                    render={({ field }) => (
                      <FormItem className="w-28">
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Mbps">Mbps</SelectItem>
                            <SelectItem value="Kbps">Kbps</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="max-w-xs">
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description / SLA Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter additional details or service specifications..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-4 pt-4 border-t">
                <Button variant="outline" type="button" asChild disabled={isLoading}>
                  <Link href="/dashboard/vendor/static-packages">Cancel</Link>
                </Button>
                <Button type="submit" disabled={isLoading} className="gap-2">
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" /> Save Package
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
