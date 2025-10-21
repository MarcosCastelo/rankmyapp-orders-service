import { Order } from '../../src/domain/entities/Order';
import { OrderStatus } from '../../src/domain/value-objects/OrderStatus';

export type OrderItemMock = {
  sku: string;
  qty: number;
  unitPrice: number;
  lineTotal: number;
};

export const sampleItems: OrderItemMock[] = [
  { sku: 'sku-1', qty: 2, unitPrice: 50, lineTotal: 100 },
  { sku: 'sku-2', qty: 1, unitPrice: 25, lineTotal: 25 },
];

export function buildOrderItem(overrides?: Partial<OrderItemMock>): OrderItemMock {
  return {
    sku: 'sku-default',
    qty: 1,
    unitPrice: 10,
    lineTotal: 10,
    ...overrides,
  };
}

export function buildOrderItems(overrides?: Partial<OrderItemMock>[]): OrderItemMock[] {
  if (!overrides || overrides.length === 0) return [...sampleItems];
  return overrides.map(o => buildOrderItem(o));
}

export function buildCreateOrderData(overrides?: Partial<{
  id: string;
  orderNumber: string;
  customerId: string;
  items: OrderItemMock[];
}>) {
  return {
    id: 'order-1',
    orderNumber: 'ORD-0001',
    customerId: 'cust-42',
    items: sampleItems,
    ...overrides,
  };
}

export function makeOrder(overrides?: Partial<{
  id: string;
  orderNumber: string;
  customerId: string;
  items: OrderItemMock[];
}>) {
  return Order.create(buildCreateOrderData(overrides));
}

export const nextProcessingStatus = () => OrderStatus.PROCESSING();
export const createdStatus = () => OrderStatus.CREATED();
export const deliveredStatus = () => OrderStatus.DELIVERED();