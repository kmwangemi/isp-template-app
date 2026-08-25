import { z } from 'zod';

export const routerFormSchema = z.object({
  name: z.string().min(1, 'Router name is required'),
  ipAddress: z.string().ip('Invalid IP address'),
  port: z.number().min(1).max(65535).default(8728),
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export const packageFormSchema = z.object({
  name: z.string().min(1, 'Package name is required'),
  price: z.number().min(0, 'Price must be positive'),
  duration: z.number().min(1, 'Duration must be positive'),
  durationUnit: z.enum(['hours', 'days', 'months']),
  bandwidthLimit: z.number().optional(),
  maxUsers: z.number().min(1, 'Max users must be at least 1'),
  profile: z.string().min(1, 'Profile name is required'),
});

export const hotspotUserFormSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  packageId: z.string().min(1, 'Package is required'),
  routerId: z.string().min(1, 'Router is required'),
});

export type RouterFormData = z.infer<typeof routerFormSchema>;
export type PackageFormData = z.infer<typeof packageFormSchema>;
export type HotspotUserFormData = z.infer<typeof hotspotUserFormSchema>;
