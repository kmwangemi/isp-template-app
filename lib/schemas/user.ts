import { z } from 'zod';

export const hotspotUserFormSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, hyphens, and underscores'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional(),
  packageId: z.string().min(1, 'Please select a package'),
  routerId: z.string().min(1, 'Please select a router'),
  expiryDate: z.string().min(1, 'Expiry date is required'),
  maxSessions: z.coerce.number().positive('Max sessions must be greater than 0').optional(),
  notes: z.string().optional(),
  status: z.enum(['active', 'inactive']).default('active'),
});

export type HotspotUserForm = z.infer<typeof hotspotUserFormSchema>;
