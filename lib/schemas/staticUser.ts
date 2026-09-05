import { z } from 'zod';

export const staticUserFormSchema = z.object({
  name: z.string().min(2, 'Customer name must be at least 2 characters'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().min(8, 'Phone number must be at least 8 characters'),
  staticIp: z.string().regex(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/, 'Invalid IPv4 address'),
  packageId: z.string().min(1, 'Please select a package'),
  routerId: z.string().min(1, 'Please select a target router'),
  expiryDate: z.string().optional(),
  status: z.enum(['active', 'suspended', 'expired']).default('active'),
  notes: z.string().optional(),
});

export type StaticUserForm = z.infer<typeof staticUserFormSchema>;
