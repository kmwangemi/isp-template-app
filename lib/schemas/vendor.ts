import { z } from 'zod';

// Subdomain validation: lowercase letters, numbers, and hyphens only
const subdomainRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const businessInfoSchema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters').max(100, 'Company name must be less than 100 characters'),
  subdomain: z.string()
    .min(3, 'Subdomain must be at least 3 characters')
    .max(50, 'Subdomain must be less than 50 characters')
    .regex(subdomainRegex, 'Subdomain can only contain lowercase letters, numbers, and hyphens')
    .toLowerCase(),
  businessEmail: z.string().email('Invalid business email address'),
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 characters').max(15, 'Phone number must be less than 15 characters'),
  referralCode: z.string().optional(),
});

export const emailVerificationSchema = z.object({
  verificationCode: z.string().length(6, 'Verification code must be 6 digits').regex(/^\d+$/, 'Verification code must contain only numbers'),
});

export const adminInfoSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters').max(50, 'First name must be less than 50 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters').max(50, 'Last name must be less than 50 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const createVendorSchema = z.object({
  businessInfo: businessInfoSchema,
  adminInfo: adminInfoSchema,
  emailVerified: z.boolean(),
  subdomainVerified: z.boolean(),
});

export type BusinessInfoFormData = z.infer<typeof businessInfoSchema>;
export type EmailVerificationFormData = z.infer<typeof emailVerificationSchema>;
export type AdminInfoFormData = z.infer<typeof adminInfoSchema>;
export type CreateVendorFormData = z.infer<typeof createVendorSchema>;
