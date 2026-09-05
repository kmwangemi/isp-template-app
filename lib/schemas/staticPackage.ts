import { z } from 'zod';

export const staticPackageFormSchema = z.object({
  name: z.string().min(2, 'Package name must be at least 2 characters'),
  tier: z.enum(['Gold', 'Silver', 'Bronze', 'Custom']).default('Gold'),
  price: z.coerce.number().positive('Price must be greater than 0'),
  duration: z.coerce.number().positive('Duration must be greater than 0'),
  durationUnit: z.enum(['days', 'months', 'years']).default('months'),
  routerId: z.string().optional(),
  downloadLimit: z.coerce.number().positive('Download limit must be greater than 0').optional().or(z.literal('')),
  downloadUnit: z.enum(['Kbps', 'Mbps']).default('Mbps'),
  uploadLimit: z.coerce.number().positive('Upload limit must be greater than 0').optional().or(z.literal('')),
  uploadUnit: z.enum(['Kbps', 'Mbps']).default('Mbps'),
  ipPool: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['active', 'inactive']).default('active'),
});

export type StaticPackageForm = z.infer<typeof staticPackageFormSchema>;
