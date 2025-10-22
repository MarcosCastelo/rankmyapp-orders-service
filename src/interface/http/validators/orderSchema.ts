import { z } from 'zod';
import { ORDER_STATUS_VALUES } from '../../../domain/value-objects/OrderStatus';

export const createOrderSchema = z.object({
  id: z.string().min(1),
  orderNumber: z.string().min(1),
  customerId: z.string().min(1),
  items: z.array(z.object({
    sku: z.string().min(1),
    qty: z.number().int().positive(),
    unitPrice: z.number().nonnegative(),
    lineTotal: z.number().nonnegative(),
  })).min(1),
});

export const updateStatusSchema = z.object({
  status: z.enum(ORDER_STATUS_VALUES),
});

export type CreateOrderDTO = z.infer<typeof createOrderSchema>;
export type UpdateStatusDTO = z.infer<typeof updateStatusSchema>;