import { z } from 'zod';
import { CATEGORIES } from '@/types/quotation';

const itemSchema = z.object({
  category: z.string().min(1),
  item_name: z.string().trim().min(1, 'Item name is required').max(300),
  description: z.preprocess((value) => value ?? '', z.string().max(1000)),
  quantity: z.number().positive('Quantity must be greater than 0'),
  unit: z.string().trim().min(1).max(50).default('pcs'),
  unit_price: z.number().nonnegative('Unit price cannot be negative'),
  sort_order: z.number().int().nonnegative().default(0),
}).superRefine((value, ctx) => {
  if (value.category === 'Others' && !value.item_name.trim()) {
    ctx.addIssue({ code: 'custom', path: ['item_name'], message: 'Custom item name is required' });
  }
});

export const quotationPayloadSchema = z.object({
  id: z.string().uuid().optional(),
  customer_name: z.string().trim().min(1, 'Customer name is required').max(200),
  customer_company: z.string().max(200).optional().default(''),
  customer_phone: z.string().max(40).optional().default(''),
  customer_email: z.string().email('Enter a valid email').or(z.literal('')).optional().default(''),
  customer_address: z.string().max(1000).optional().default(''),
  customer_reference: z.string().max(200).optional().default(''),
  quotation_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  validity_days: z.number().int().positive().max(365),
  discount: z.number().nonnegative(),
  tax: z.number().nonnegative(),
  terms_and_conditions: z.string().trim().min(1, 'Terms & Conditions are required').max(10000),
  items: z.array(itemSchema).min(1, 'Add at least one quotation item').max(500),
  status: z.enum(['Draft', 'Generated', 'Sent', 'Approved', 'Rejected', 'Cancelled']).optional(),
});

export function isKnownCategory(category: string) {
  return (CATEGORIES as readonly string[]).includes(category);
}