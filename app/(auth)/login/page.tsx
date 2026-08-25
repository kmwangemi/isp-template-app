'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '@/lib/schemas/auth';
import { useAuthStore } from '@/lib/store/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { login } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      // Mock authentication - in production, verify against backend
      const mockUser = {
        id: '1',
        email: data.email,
        name: data.email.split('@')[0],
        role: data.email.includes('admin') ? ('superadmin' as const) : ('vendor_admin' as const),
        vendorId: data.email.includes('admin') ? undefined : 'v1',
      };
      login(mockUser);
      toast({
        title: 'Success',
        description: 'Logged in successfully',
      });
      // Redirect based on role
      router.push(mockUser.role === 'superadmin' ? '/dashboard/superadmin' : '/dashboard/vendor');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to login. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-background/80 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-lg p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/20 mx-auto mb-4">
              <div className="w-6 h-6 bg-primary rounded-md"></div>
            </div>
            <h1 className="text-2xl font-bold text-foreground">HotSpot Manager</h1>
            <p className="text-sm text-muted-foreground">
              Sign in to your account
            </p>
          </div>
          {/* Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="you@example.com"
                        type="email"
                        disabled={isLoading}
                        {...field}
                        className="bg-background border-border"
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
                    <div className="flex items-center justify-between">
                      <FormLabel>Password</FormLabel>
                      <Link
                        href="/forgot-password"
                        className="text-xs text-primary hover:text-secondary transition-colors"
                      >
                        Forgot Password?
                      </Link>
                    </div>
                    <FormControl>
                      <PasswordInput
                        placeholder="••••••"
                        disabled={isLoading}
                        {...field}
                        className="bg-background border-border"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>
          </Form>
          {/* Demo credentials */}
          <div className="pt-4 border-t border-border space-y-3">
            <p className="text-xs text-muted-foreground">Demo credentials:</p>
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground">
                <p><span className="font-semibold">SuperAdmin:</span> admin@example.com</p>
              </div>
              <div className="text-xs text-muted-foreground">
                <p><span className="font-semibold">Vendor:</span> vendor@example.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
