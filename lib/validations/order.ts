import { z } from 'zod'

export const OrderStatusEnum = z.enum(['NEW', 'PROCESSING', 'SHIPPED', 'CANCELLED'])
export const CurrencyEnum = z.enum(['EUR', 'USD'])

export const createOrderSchema = z.object({
  orderNo: z.string().min(1, 'Order number is required'),
  customerId: z.string().uuid('Invalid customer ID'),
  status: OrderStatusEnum.default('NEW'),
  amountDecimal: z.number().min(0, 'Amount must be positive'),
  currency: CurrencyEnum.default('EUR'),
})

export const updateOrderSchema = createOrderSchema.partial().extend({
  id: z.string().uuid('Invalid order ID'),
})

export const orderFiltersSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(25),
  sort: z.string().optional(),
  q: z.string().optional(),
  status: z.array(OrderStatusEnum).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  customerId: z.string().uuid().optional(),
  amountMin: z.coerce.number().min(0).optional(),
  amountMax: z.coerce.number().min(0).optional(),
  currency: CurrencyEnum.optional(),
  tags: z.array(z.string()).optional(),
})

export type CreateOrderData = z.infer<typeof createOrderSchema>
export type UpdateOrderData = z.infer<typeof updateOrderSchema>
export type OrderFilters = z.infer<typeof orderFiltersSchema>