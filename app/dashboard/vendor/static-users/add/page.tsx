'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { staticUserFormSchema } from '@/lib/schemas/staticUser';
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
import { useAddStaticUser, useStaticPackages, useRouters } from '@/lib/api/queries';
import { useAuthStore } from '@/lib/store/auth';

export default function AddStaticUserPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { data: staticPackages } = useStaticPackages(user?.vendorId);
  const { data: routers } = useRouters(user?.vendorId);
  const { toast } = useToast();
  const addStaticUserMutation = useAddStaticUser();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(staticUserFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      staticIp: '',
      packageId: '',
      routerId: '',
      expiryDate: '',
      status: 'active' as const,
      notes: '',
    },
  });

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      await addStaticUserMutation.mutateAsync({
        ...data,
        vendorId: user?.vendorId || 'v1',
      });
      toast({
        title: 'Success',
        description: 'Static IP customer created successfully.',
      });
      router.push('/dashboard/vendor/static-users');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to create static customer.',
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
          <Link href="/dashboard/vendor/static-users">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add Static IP Customer</h1>
          <p className="text-muted-foreground">Assign a static IP address & tier package to a client line.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Details</CardTitle>
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
                      <FormLabel>Customer / Business Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Apex Enterprises Ltd." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="staticIp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Static IPv4 Address *</FormLabel>
                      <FormControl>
                        <Input className="font-mono" placeholder="e.g. 192.168.10.45" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number *</FormLabel>
                      <FormControl>
                        <Input placeholder="+254 7..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address (Optional)</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="contact@company.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="packageId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assigned Static Package *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Static Package Tier" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {staticPackages?.map((pkg) => (
                            <SelectItem key={pkg.id} value={pkg.id}>
                              {pkg.name} ({pkg.tier} - KES {pkg.price.toFixed(2)})
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
                  name="routerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Router *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Target Router" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="expiryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subscription Expiry Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Initial Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="suspended">Suspended</SelectItem>
                          <SelectItem value="expired">Expired</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes / Installation Details</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter location, CPE details, or client notes..."
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
                  <Link href="/dashboard/vendor/static-users">Cancel</Link>
                </Button>
                <Button type="submit" disabled={isLoading} className="gap-2">
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" /> Save Customer
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
