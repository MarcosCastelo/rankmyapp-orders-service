import { OrderCreatedEvent } from '../../src/domain/events/OrderCreated';
import { OrderStatusUpdatedEvent } from '../../src/domain/events/OrderStatusUpdated';

export function buildOrderCreatedEvent(overrides?: Partial<{
  orderId: string;
  orderNumber: string;
  customerId: string;
  total: number;
  createdAt: string;
  metadata: Record<string, unknown>;
}>) {
  const payload = {
    orderId: overrides?.orderId ?? 'order-1',
    orderNumber: overrides?.orderNumber ?? 'ORD-0001',
    customerId: overrides?.customerId ?? 'cust-42',
    total: overrides?.total ?? 125,
    createdAt: overrides?.createdAt ?? new Date().toISOString(),
  };
  const metadata = overrides?.metadata ?? {};
  return new OrderCreatedEvent(payload, metadata);
}

export function buildOrderStatusUpdatedEvent(overrides?: Partial<{
  orderId: string;
  orderNumber: string;
  from: string;
  to: string;
  changedAt: string;
  metadata: Record<string, unknown>;
}>) {
  const payload = {
    orderId: overrides?.orderId ?? 'order-1',
    orderNumber: overrides?.orderNumber ?? 'ORD-0001',
    from: overrides?.from ?? 'CREATED',
    to: overrides?.to ?? 'PROCESSING',
    changedAt: overrides?.changedAt ?? new Date().toISOString(),
  };
  const metadata = overrides?.metadata ?? {};
  return new OrderStatusUpdatedEvent(payload, metadata);
}