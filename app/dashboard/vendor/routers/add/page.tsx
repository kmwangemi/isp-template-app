'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { routerFormSchema } from '@/lib/schemas/router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { ArrowLeft, Save, Zap } from 'lucide-react';
import Link from 'next/link';

export default function AddRouterVendorPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    status: 'success' | 'error' | null;
    message: string;
  }>({ status: null, message: '' });
  const [connectionTested, setConnectionTested] = useState(false);

  const form = useForm({
    resolver: zodResolver(routerFormSchema),
    defaultValues: {
      name: '',
      ipAddress: '',
      port: 8728,
      username: '',
      password: '',
    },
  });

  const onTestConnection = async () => {
    const ipAddress = form.getValues('ipAddress');
    const port = form.getValues('port');
    const username = form.getValues('username');
    const password = form.getValues('password');

    if (!ipAddress || !username || !password) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields before testing.',
        variant: 'destructive',
      });
      return;
    }

    setIsTesting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setTestResult({
        status: 'success',
        message: 'Connection successful! Router is responsive.',
      });
      setConnectionTested(true);
      toast({
        title: 'Success',
        description: 'Router connection verified successfully.',
      });
    } catch (error) {
      setTestResult({
        status: 'error',
        message: 'Failed to connect to router. Check IP and credentials.',
      });
      toast({
        title: 'Error',
        description: 'Connection test failed.',
        variant: 'destructive',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const onSubmit = async (data: any) => {
    if (!connectionTested) {
      toast({
        title: 'Error',
        description: 'Please test connection first.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      toast({
        title: 'Success',
        description: 'Router added successfully.',
      });
      router.push('/dashboard/vendor/routers');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add router.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/vendor/routers">
          <Button variant="outline" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Add Router</h1>
          <p className="text-sm text-muted-foreground mt-1">Connect a new Mikrotik router</p>
        </div>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Router Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Router Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Router Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Main Router, Branch 1"
                        className="bg-background border-border"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Connection Details */}
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="ipAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>IP Address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="192.168.1.1"
                          className="bg-background border-border"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="port"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>API Port</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="8728"
                          className="bg-background border-border"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Credentials */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="admin"
                          className="bg-background border-border"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter router password"
                          className="bg-background border-border"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Test Result */}
              {testResult.status && (
                <div
                  className={`p-4 rounded-lg border ${
                    testResult.status === 'success'
                      ? 'bg-green-500/10 border-green-500/20 text-green-400'
                      : 'bg-red-500/10 border-red-500/20 text-red-400'
                  }`}
                >
                  <p className="text-sm">{testResult.message}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2"
                  onClick={onTestConnection}
                  disabled={isTesting}
                >
                  <Zap className="w-4 h-4" />
                  {isTesting ? 'Testing...' : 'Test Connection'}
                </Button>
                <Link href="/dashboard/vendor/routers">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 ml-auto"
                  disabled={isLoading || !connectionTested}
                >
                  <Save className="w-4 h-4" />
                  {isLoading ? 'Adding...' : 'Add Router'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
