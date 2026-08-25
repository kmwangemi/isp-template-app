'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { emailVerificationSchema, type EmailVerificationFormData } from '@/lib/schemas/vendor';
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
import { Loader2 } from 'lucide-react';

interface EmailVerificationFormProps {
  email: string;
  onVerify: (code: string) => void;
  onResendCode: () => void;
  isVerifying?: boolean;
  onBack?: () => void;
}

export function EmailVerificationForm({
  email,
  onVerify,
  onResendCode,
  isVerifying = false,
  onBack,
}: EmailVerificationFormProps) {
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendAttempts, setResendAttempts] = useState(0);

  const form = useForm<EmailVerificationFormData>({
    resolver: zodResolver(emailVerificationSchema),
    defaultValues: {
      verificationCode: '',
    },
  });

  const handleResendCode = () => {
    if (resendCooldown > 0) return;

    onResendCode();
    setResendAttempts((prev) => prev + 1);
    setResendCooldown(60); // 60 second cooldown

    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const onSubmit = (data: EmailVerificationFormData) => {
    onVerify(data.verificationCode);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Verify Email Address</CardTitle>
        <CardDescription>
          We&apos;ve sent a 6-digit verification code to <span className="font-medium text-foreground">{email}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="verificationCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification Code</FormLabel>
                  <FormDescription>
                    Enter the 6-digit code sent to your email
                  </FormDescription>
                  <FormControl>
                    <Input
                      placeholder="000000"
                      maxLength={6}
                      {...field}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                        field.onChange(value);
                      }}
                      className="h-10 text-center text-xl tracking-widest"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col gap-2">
              <Button
                type="submit"
                className="w-full h-10"
                disabled={isVerifying || form.watch('verificationCode').length !== 6}
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify Email'
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full h-10"
                disabled={resendCooldown > 0}
                onClick={handleResendCode}
              >
                {resendCooldown > 0
                  ? `Resend Code in ${resendCooldown}s`
                  : 'Resend Code'}
              </Button>

              {onBack && (
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full h-10"
                  onClick={onBack}
                  disabled={isVerifying}
                >
                  Back
                </Button>
              )}
            </div>

            {resendAttempts > 2 && (
              <div className="text-sm text-muted-foreground text-center">
                Having trouble? <a href="mailto:support@hotspotmanager.com" className="text-primary hover:underline">Contact support</a>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
