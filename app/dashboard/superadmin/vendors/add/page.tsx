'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { VendorBusinessForm } from '@/components/forms/vendor-business-form';
import { VendorAdminForm } from '@/components/forms/vendor-admin-form';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { BusinessInfoFormData, AdminInfoFormData } from '@/lib/schemas/vendor';

type FormStep = 'business' | 'admin';

export default function AddVendorPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<FormStep>('business');
  const [businessData, setBusinessData] = useState<BusinessInfoFormData | null>(null);

  // Mock subdomain verification
  const verifySubdomain = async (subdomain: string): Promise<boolean> => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // Mock: some domains are unavailable
    const unavailableDomains = ['admin', 'api', 'test', 'demo', 'example'];
    return !unavailableDomains.includes(subdomain);
  };



  // Vendor creation mutation
  const createVendorMutation = useMutation({
    mutationFn: async (data: {
      businessInfo: BusinessInfoFormData;
      adminInfo: AdminInfoFormData;
    }) => {
      console.log('[v0] Creating vendor:', data);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return { id: 'vendor-' + Date.now(), ...data };
    },
    onSuccess: () => {
      toast({
        title: 'Vendor created successfully',
        description: 'The new vendor has been added to the platform',
      });
      router.push('/dashboard/superadmin/vendors');
    },
    onError: (error) => {
      toast({
        title: 'Error creating vendor',
        description: 'Please try again or contact support',
        variant: 'destructive',
      });
      console.error('[v0] Error creating vendor:', error);
    },
  });

  const handleBusinessInfoNext = (data: BusinessInfoFormData) => {
    setBusinessData(data);
    setCurrentStep('admin');
    toast({
      title: 'Email verified',
      description: 'Your email has been successfully verified',
    });
  };

  const handleAdminInfoSubmit = (adminData: AdminInfoFormData) => {
    if (!businessData) return;

    createVendorMutation.mutate({
      businessInfo: businessData,
      adminInfo: adminData,
    });
  };

  const handleBack = () => {
    if (currentStep === 'admin') {
      setCurrentStep('business');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex flex-col">
        {/* Header */}
        <div className="border-b border-border bg-card/50">
          <div className="container max-w-2xl mx-auto px-4 py-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="mb-4 -ml-2"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Add New Vendor</h1>
            <p className="text-muted-foreground mt-2">
              Complete the following steps to onboard a new vendor to the platform
            </p>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="border-b border-border">
          <div className="container max-w-2xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              {/* Step 1 */}
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                    currentStep === 'business' || currentStep === 'admin'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  1
                </div>
                <p className="text-xs text-muted-foreground mt-2">Business Info</p>
              </div>

              <div className="flex-1 h-1 mx-2 bg-muted"></div>

              {/* Step 2 */}
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                    currentStep === 'admin'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  2
                </div>
                <p className="text-xs text-muted-foreground mt-2">Admin Info</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1">
          <div className="container max-w-2xl mx-auto px-4 py-8">
            {currentStep === 'business' && (
              <VendorBusinessForm
                onNext={handleBusinessInfoNext}
                onSubdomainVerify={verifySubdomain}
              />
            )}

            {currentStep === 'admin' && (
              <VendorAdminForm
                onSubmit={handleAdminInfoSubmit}
                isLoading={createVendorMutation.isPending}
                onBack={handleBack}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
