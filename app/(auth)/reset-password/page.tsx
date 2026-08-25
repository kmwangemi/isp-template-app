'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema, type ResetPasswordFormData } from '@/lib/schemas/auth';
import { Button } from '@/components/ui/button';
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
import { ArrowLeft, Check, X } from 'lucide-react';

function ResetPasswordForm() {
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [isLoading, setIsLoading] = useState(false);

  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isTokenValid, setIsTokenValid] = useState<boolean | null>(null);

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  // Verify token validity on mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setIsTokenValid(false);
        return;
      }

      try {
        // Simulate API call to verify token
        await new Promise((resolve) => setTimeout(resolve, 300));
        // In real app, call backend to verify token validity
        setIsTokenValid(true);
      } catch (error) {
        setIsTokenValid(false);
      }
    };

    verifyToken();
  }, [token]);

  // Calculate password strength
  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    setPasswordStrength(strength);
  };

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      toast({
        title: 'Error',
        description: 'Reset token is missing. Please request a new password reset.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 600));

      toast({
        title: 'Success',
        description: 'Your password has been reset successfully. Redirecting to login...',
      });

      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reset password. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrengthColor = (strength: number) => {
    if (strength === 0) return 'bg-gray-600';
    if (strength <= 2) return 'bg-red-500';
    if (strength <= 3) return 'bg-yellow-500';
    if (strength <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = (strength: number) => {
    if (strength === 0) return '';
    if (strength <= 2) return 'Weak';
    if (strength <= 3) return 'Fair';
    if (strength <= 4) return 'Good';
    return 'Strong';
  };

  // Token validation state
  if (isTokenValid === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/80 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-card border border-border rounded-lg p-8 space-y-6 text-center">
            <div className="flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-muted-foreground">Verifying reset token...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isTokenValid || !token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/80 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-card border border-border rounded-lg p-8 space-y-6 text-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-red-500/20 mx-auto">
              <X className="w-6 h-6 text-red-500" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">Invalid or Expired Link</h1>
              <p className="text-sm text-muted-foreground">
                This password reset link is invalid or has expired. Please request a new one.
              </p>
            </div>
            <Link href="/forgot-password">
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                Request New Reset Link
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" className="w-full gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/80 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-lg p-8 space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/20 mx-auto">
              <div className="w-6 h-6 bg-primary rounded-md"></div>
            </div>
            <h1 className="text-2xl font-bold text-foreground text-center">Reset Password</h1>
            <p className="text-sm text-muted-foreground text-center">
              Enter your new password below. Make sure it&apos;s strong and unique.
            </p>
          </div>

          {/* Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Password Field */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <PasswordInput
                        placeholder="Enter new password"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          calculatePasswordStrength(e.target.value);
                        }}
                        className="bg-background border-border"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />

                    {/* Password Strength Indicator */}
                    {field.value && (
                      <div className="space-y-2 mt-3">
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className={`flex-1 h-2 rounded-full transition-colors ${
                                i < passwordStrength ? getPasswordStrengthColor(passwordStrength) : 'bg-border'
                              }`}
                            />
                          ))}
                        </div>
                        {passwordStrength > 0 && (
                          <p className="text-xs text-muted-foreground">
                            Strength: <span className="font-semibold">{getPasswordStrengthText(passwordStrength)}</span>
                          </p>
                        )}
                      </div>
                    )}

                    {/* Password Requirements */}
                    {field.value && (
                      <div className="mt-3 space-y-2 text-xs">
                        <div className={`flex items-center gap-2 ${field.value.length >= 8 ? 'text-green-500' : 'text-muted-foreground'}`}>
                          {field.value.length >= 8 ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <X className="w-4 h-4" />
                          )}
                          At least 8 characters
                        </div>
                        <div className={`flex items-center gap-2 ${/[A-Z]/.test(field.value) ? 'text-green-500' : 'text-muted-foreground'}`}>
                          {/[A-Z]/.test(field.value) ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <X className="w-4 h-4" />
                          )}
                          Uppercase letter
                        </div>
                        <div className={`flex items-center gap-2 ${/[a-z]/.test(field.value) ? 'text-green-500' : 'text-muted-foreground'}`}>
                          {/[a-z]/.test(field.value) ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <X className="w-4 h-4" />
                          )}
                          Lowercase letter
                        </div>
                        <div className={`flex items-center gap-2 ${/[0-9]/.test(field.value) ? 'text-green-500' : 'text-muted-foreground'}`}>
                          {/[0-9]/.test(field.value) ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <X className="w-4 h-4" />
                          )}
                          Number
                        </div>
                        <div className={`flex items-center gap-2 ${/[^A-Za-z0-9]/.test(field.value) ? 'text-green-500' : 'text-muted-foreground'}`}>
                          {/[^A-Za-z0-9]/.test(field.value) ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <X className="w-4 h-4" />
                          )}
                          Special character
                        </div>
                      </div>
                    )}
                  </FormItem>
                )}
              />

              {/* Confirm Password Field */}
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <PasswordInput
                        placeholder="Confirm password"
                        {...field}
                        className="bg-background border-border"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />

                    {/* Password Match Indicator */}
                    {form.watch('password') && field.value && (
                      <div className="mt-2 flex items-center gap-2 text-xs">
                        {form.watch('password') === field.value ? (
                          <>
                            <Check className="w-4 h-4 text-green-500" />
                            <span className="text-green-500">Passwords match</span>
                          </>
                        ) : (
                          <>
                            <X className="w-4 h-4 text-red-500" />
                            <span className="text-red-500">Passwords don&apos;t match</span>
                          </>
                        )}
                      </div>
                    )}
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={isLoading}
              >
                {isLoading ? 'Resetting password...' : 'Reset Password'}
              </Button>
            </form>
          </Form>

          {/* Back to Login Link */}
          <div className="text-center">
            <Link href="/login" className="text-sm text-primary hover:text-primary/90 transition-colors flex items-center justify-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/80 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-card border border-border rounded-lg p-8 space-y-6 text-center">
            <div className="flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-muted-foreground">Loading reset form...</p>
          </div>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
