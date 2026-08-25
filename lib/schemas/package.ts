import { z } from 'zod';

export const packageFormSchema = z.object({
  name: z.string().min(2, 'Package name must be at least 2 characters'),
  price: z.coerce.number().positive('Price must be greater than 0'),
  duration: z.coerce.number().positive('Duration must be greater than 0'),
  durationUnit: z.enum(['days', 'weeks', 'months', 'years']),
  maxSessions: z.coerce.number().positive('Max sessions must be greater than 0'),
  downloadLimit: z.coerce.number().int('Download limit must be a whole number').optional(),
  uploadLimit: z.coerce.number().int('Upload limit must be a whole number').optional(),
  profileName: z.string().min(1, 'Profile name is required'),
  description: z.string().optional(),
  status: z.enum(['active', 'inactive']).default('active'),
});

export type PackageForm = z.infer<typeof packageFormSchema>;
