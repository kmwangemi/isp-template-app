'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { adminInfoSchema, type AdminInfoFormData } from '@/lib/schemas/vendor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface VendorAdminFormProps {
  onSubmit: (data: AdminInfoFormData) => void;
  isLoading?: boolean;
  onBack?: () => void;
  initialData?: AdminInfoFormData;
}

export function VendorAdminForm({
  onSubmit,
  isLoading = false,
  onBack,
  initialData,
}: VendorAdminFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'fair' | 'good' | 'strong' | null>(null);

  const form = useForm<AdminInfoFormData>({
    resolver: zodResolver(adminInfoSchema),
    defaultValues: initialData || {
      firstName: '',
      lastName: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onChange',
  });

  const password = form.watch('password');

  // Calculate password strength
  const calculatePasswordStrength = (pwd: string) => {
    if (!pwd) {
      setPasswordStrength(null);
      return;
    }

    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[a-z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) strength++;

    if (strength <= 2) setPasswordStrength('weak');
    else if (strength === 3) setPasswordStrength('fair');
    else if (strength === 4) setPasswordStrength('good');
    else setPasswordStrength('strong');
  };

  const handlePasswordChange = (value: string) => {
    form.setValue('password', value);
    calculatePasswordStrength(value);
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 'weak':
        return 'bg-red-500';
      case 'fair':
        return 'bg-yellow-500';
      case 'good':
        return 'bg-blue-500';
      case 'strong':
        return 'bg-green-500';
      default:
        return 'bg-gray-300';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Admin Information</CardTitle>
        <CardDescription>
          Create an admin account for managing the vendor platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* First Name and Last Name Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John"
                        {...field}
                        className="h-10"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Doe"
                        {...field}
                        className="h-10"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormDescription>
                    Must contain uppercase, lowercase, number, and special character
                  </FormDescription>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter a strong password"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          handlePasswordChange(e.target.value);
                        }}
                        className="h-10 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>

                  {password && (
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Password strength:</span>
                        <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${getPasswordStrengthColor()} transition-all`}
                            style={{
                              width:
                                passwordStrength === 'weak'
                                  ? '25%'
                                  : passwordStrength === 'fair'
                                    ? '50%'
                                    : passwordStrength === 'good'
                                      ? '75%'
                                      : '100%',
                            }}
                          />
                        </div>
                        <span className="text-xs font-medium capitalize">
                          {passwordStrength || 'N/A'}
                        </span>
                      </div>

                      <ul className="text-xs space-y-1 text-muted-foreground">
                        <li className={password.length >= 8 ? 'text-green-500' : ''}>
                          ✓ At least 8 characters
                        </li>
                        <li className={/[A-Z]/.test(password) ? 'text-green-500' : ''}>
                          ✓ Uppercase letter
                        </li>
                        <li className={/[a-z]/.test(password) ? 'text-green-500' : ''}>
                          ✓ Lowercase letter
                        </li>
                        <li className={/[0-9]/.test(password) ? 'text-green-500' : ''}>
                          ✓ Number
                        </li>
                        <li className={/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'text-green-500' : ''}>
                          ✓ Special character
                        </li>
                      </ul>
                    </div>
                  )}

                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Confirm Password */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm your password"
                        {...field}
                        className="h-10 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  {password && form.watch('confirmPassword') && password === form.watch('confirmPassword') && (
                    <Alert className="mt-2 border-green-500 bg-green-500/10">
                      <AlertDescription className="text-green-500 text-sm">
                        ✓ Passwords match
                      </AlertDescription>
                    </Alert>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col gap-2 pt-4">
              <Button
                type="submit"
                className="w-full h-10"
                disabled={isLoading || !form.formState.isValid}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Vendor...
                  </>
                ) : (
                  'Create Vendor'
                )}
              </Button>

              {onBack && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-10"
                  onClick={onBack}
                  disabled={isLoading}
                >
                  Back
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
