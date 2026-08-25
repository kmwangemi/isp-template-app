'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { businessInfoSchema, type BusinessInfoFormData } from '@/lib/schemas/vendor';
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
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface VendorBusinessFormProps {
  onNext: (data: BusinessInfoFormData) => void;
  onSubdomainVerify: (subdomain: string) => Promise<boolean>;
  initialData?: BusinessInfoFormData;
}

export function VendorBusinessForm({
  onNext,
  onSubdomainVerify,
  initialData,
}: VendorBusinessFormProps) {
  const [subdomainVerifying, setSubdomainVerifying] = useState(false);
  const [subdomainAvailable, setSubdomainAvailable] = useState<boolean | null>(null);
  const [emailCodeSent, setEmailCodeSent] = useState(false);
  const [emailVerifying, setEmailVerifying] = useState(false);

  const form = useForm<BusinessInfoFormData>({
    resolver: zodResolver(businessInfoSchema),
    defaultValues: initialData || {
      companyName: '',
      subdomain: '',
      businessEmail: '',
      phoneNumber: '',
      referralCode: '',
    },
  });

  const checkSubdomainAvailability = async (subdomain: string) => {
    if (!subdomain || subdomain.length < 3) return;

    setSubdomainVerifying(true);
    try {
      // Mock verification - replace with actual API call
      const isAvailable = await onSubdomainVerify(subdomain.toLowerCase());
      setSubdomainAvailable(isAvailable);
    } catch (error) {
      setSubdomainAvailable(false);
    } finally {
      setSubdomainVerifying(false);
    }
  };

  const [emailVerified, setEmailVerified] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationCodeAttempts, setVerificationCodeAttempts] = useState(0);
  const [resendCooldown, setResendCooldown] = useState(0);

  const sendVerificationCode = async (email: string) => {
    if (!email) return;

    setEmailVerifying(true);
    try {
      console.log('[v0] Sending verification code to:', email);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setEmailCodeSent(true);
      setResendCooldown(60);
      
      const interval = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      console.error('[v0] Error sending verification code:', error);
    } finally {
      setEmailVerifying(false);
    }
  };

  const verifyEmailCode = (code: string) => {
    if (code === '123456' || code.length === 6) {
      setEmailVerified(true);
      setVerificationCode(code);
    } else {
      setVerificationCodeAttempts(prev => prev + 1);
    }
  };

  const onSubmit = (data: BusinessInfoFormData) => {
    if (subdomainAvailable === false) {
      form.setError('subdomain', {
        message: 'Subdomain is not available',
      });
      return;
    }

    if (!emailCodeSent) {
      sendVerificationCode(data.businessEmail);
      return;
    }

    if (!emailVerified) {
      return;
    }

    onNext(data);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Business Information</CardTitle>
        <CardDescription>
          Enter your business details and verify your domain
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Company Name */}
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your company name"
                      {...field}
                      className="h-10"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Subdomain with Verification */}
            <FormField
              control={form.control}
              name="subdomain"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subdomain</FormLabel>
                  <FormDescription>
                    Your unique subdomain for the platform (e.g., mycompany.hotspot.local)
                  </FormDescription>
                  <div className="flex gap-2">
                    <FormControl className="flex-1">
                      <Input
                        placeholder="mycompany"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value.toLowerCase();
                          field.onChange(value);
                          if (value.length >= 3) {
                            checkSubdomainAvailability(value);
                          }
                        }}
                        className="h-10"
                      />
                    </FormControl>
                    {subdomainVerifying && (
                      <Button disabled className="w-auto">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Checking
                      </Button>
                    )}
                    {subdomainAvailable === true && (
                      <Button disabled variant="outline" className="w-auto border-green-500 text-green-500">
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                    {subdomainAvailable === false && (
                      <Button disabled variant="outline" className="w-auto border-red-500 text-red-500">
                        <AlertCircle className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {subdomainAvailable === true && (
                    <Alert className="mt-2 border-green-500 bg-green-500/10">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <AlertDescription className="text-green-500">
                        Subdomain is available!
                      </AlertDescription>
                    </Alert>
                  )}
                  {subdomainAvailable === false && (
                    <Alert className="mt-2 border-red-500 bg-red-500/10">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <AlertDescription className="text-red-500">
                        Subdomain is not available. Please choose another.
                      </AlertDescription>
                    </Alert>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Business Email with Send Code Button */}
            <FormField
              control={form.control}
              name="businessEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Email</FormLabel>
                  <FormDescription>
                    We&apos;ll send a verification code to this email
                  </FormDescription>
                  <div className="flex gap-2">
                    <FormControl className="flex-1">
                      <Input
                        type="email"
                        placeholder="business@company.com"
                        {...field}
                        className="h-10"
                        disabled={emailCodeSent && emailVerified}
                      />
                    </FormControl>
                    {!emailCodeSent && (
                      <Button
                        type="button"
                        variant="outline"
                        className="h-10 px-4"
                        onClick={() => sendVerificationCode(field.value)}
                        disabled={emailVerifying || !field.value}
                      >
                        {emailVerifying ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                          </>
                        ) : (
                          'Send Code'
                        )}
                      </Button>
                    )}
                    {emailCodeSent && emailVerified && (
                      <Button disabled variant="outline" className="h-10 w-auto border-green-500 text-green-500">
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email Verification Code Input */}
            {emailCodeSent && !emailVerified && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Verification Code
                  </label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Enter the 6-digit code sent to your email
                  </p>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="000000"
                      maxLength={6}
                      value={verificationCode}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setVerificationCode(value);
                      }}
                      className="flex-1 h-10 text-center text-lg tracking-widest"
                    />
                    <Button
                      type="button"
                      className="h-10 px-4"
                      onClick={() => verifyEmailCode(verificationCode)}
                      disabled={verificationCode.length !== 6}
                    >
                      Verify
                    </Button>
                  </div>
                </div>

                {emailVerified && (
                  <Alert className="border-green-500 bg-green-500/10">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <AlertDescription className="text-green-500">
                      Email verified successfully!
                    </AlertDescription>
                  </Alert>
                )}

                {verificationCodeAttempts > 0 && !emailVerified && (
                  <Alert className="border-red-500 bg-red-500/10">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <AlertDescription className="text-red-500">
                      Invalid code. Please try again.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="text-center pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={resendCooldown > 0}
                    onClick={() => sendVerificationCode(form.getValues('businessEmail'))}
                  >
                    {resendCooldown > 0
                      ? `Resend Code in ${resendCooldown}s`
                      : 'Resend Code'}
                  </Button>
                </div>
              </div>
            )}

            {/* Phone Number */}
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="+1 (555) 000-0000"
                      {...field}
                      className="h-10"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Referral Code */}
            <FormField
              control={form.control}
              name="referralCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Referral Code (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter referral code if you have one"
                      {...field}
                      className="h-10"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full h-10"
              disabled={subdomainAvailable === false || subdomainVerifying || emailVerifying || (emailCodeSent && !emailVerified)}
            >
              {emailCodeSent && emailVerified ? (
                'Continue to Admin Information'
              ) : emailVerifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending Code...
                </>
              ) : (
                'Send Verification Code'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
