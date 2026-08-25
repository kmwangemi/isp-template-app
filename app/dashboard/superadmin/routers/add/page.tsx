'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { routerFormSchema, type RouterFormData } from '@/lib/schemas/router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function AddRouterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [testConnectionLoading, setTestConnectionLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RouterFormData>({
    resolver: zodResolver(routerFormSchema),
    defaultValues: {
      port: 8728,
    },
  });

  const ipAddress = watch('ipAddress');
  const username = watch('username');
  const password = watch('password');

  const createRouterMutation = useMutation({
    mutationFn: async (data: RouterFormData) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(data);
        }, 1500);
      });
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Router added successfully',
      });
      router.push('/dashboard/superadmin/routers');
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to add router',
        variant: 'destructive',
      });
    },
  });

  const testConnection = async () => {
    if (!ipAddress || !username || !password) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in IP address, username, and password',
        variant: 'destructive',
      });
      return;
    }

    setTestConnectionLoading(true);
    setConnectionStatus('testing');

    // Simulate connection test
    setTimeout(() => {
      const isSuccess = Math.random() > 0.3;
      setConnectionStatus(isSuccess ? 'success' : 'error');
      setTestConnectionLoading(false);

      toast({
        title: isSuccess ? 'Connected' : 'Connection Failed',
        description: isSuccess
          ? 'Successfully connected to router'
          : 'Could not connect to router. Check credentials.',
        variant: isSuccess ? 'default' : 'destructive',
      });

      setTimeout(() => setConnectionStatus('idle'), 3000);
    }, 2000);
  };

  const onSubmit = async (data: RouterFormData) => {
    if (connectionStatus !== 'success') {
      toast({
        title: 'Warning',
        description: 'Please test the connection before submitting',
        variant: 'destructive',
      });
      return;
    }
    createRouterMutation.mutate(data);
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <Link href="/dashboard/superadmin/routers">
          <Button variant="outline" className="gap-2 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Routers
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-foreground">Add New Router</h1>
        <p className="text-sm text-muted-foreground mt-1">Configure a new Mikrotik router</p>
      </div>

      {/* Form */}
      <Card className="bg-card border-border max-w-2xl">
        <CardHeader>
          <CardTitle>Router Configuration</CardTitle>
          <CardDescription>Enter router details and credentials</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Basic Information</h3>

              <div>
                <label className="text-sm text-muted-foreground block mb-2">Router Name</label>
                <Input
                  {...register('name')}
                  placeholder="e.g., Router 1, Main Branch"
                  className="bg-background border-border"
                />
                {errors.name && (
                  <p className="text-destructive text-xs mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="text-sm text-muted-foreground block mb-2">IP Address</label>
                <Input
                  {...register('ipAddress')}
                  placeholder="e.g., 192.168.1.1"
                  className="bg-background border-border"
                />
                {errors.ipAddress && (
                  <p className="text-destructive text-xs mt-1">{errors.ipAddress.message}</p>
                )}
              </div>

              <div>
                <label className="text-sm text-muted-foreground block mb-2">Port</label>
                <Input
                  {...register('port', { valueAsNumber: true })}
                  type="number"
                  placeholder="8728"
                  className="bg-background border-border"
                />
                {errors.port && (
                  <p className="text-destructive text-xs mt-1">{errors.port.message}</p>
                )}
              </div>
            </div>

            {/* Credentials */}
            <div className="space-y-4 border-t border-border pt-6">
              <h3 className="text-sm font-semibold text-foreground">Credentials</h3>

              <div>
                <label className="text-sm text-muted-foreground block mb-2">Username</label>
                <Input
                  {...register('username')}
                  placeholder="e.g., admin"
                  className="bg-background border-border"
                />
                {errors.username && (
                  <p className="text-destructive text-xs mt-1">{errors.username.message}</p>
                )}
              </div>

              <div>
                <label className="text-sm text-muted-foreground block mb-2">Password</label>
                <Input
                  {...register('password')}
                  type="password"
                  placeholder="••••••••"
                  className="bg-background border-border"
                />
                {errors.password && (
                  <p className="text-destructive text-xs mt-1">{errors.password.message}</p>
                )}
              </div>
            </div>

            {/* Connection Test */}
            <div className="border-t border-border pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">Test Connection</h3>
                {connectionStatus === 'success' && (
                  <div className="flex items-center gap-2 text-green-500">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-xs font-semibold">Connected</span>
                  </div>
                )}
                {connectionStatus === 'error' && (
                  <div className="flex items-center gap-2 text-red-500">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-xs font-semibold">Failed</span>
                  </div>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full border-border"
                onClick={testConnection}
                disabled={testConnectionLoading || isSubmitting}
              >
                {testConnectionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Testing Connection...
                  </>
                ) : (
                  'Test Connection'
                )}
              </Button>
              <p className="text-xs text-muted-foreground">
                Test the connection before submitting to ensure valid credentials.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-4 border-t border-border pt-6">
              <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Router'
                )}
              </Button>
              <Link href="/dashboard/superadmin/routers" className="flex-1">
                <Button type="button" variant="outline" className="w-full border-border">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
