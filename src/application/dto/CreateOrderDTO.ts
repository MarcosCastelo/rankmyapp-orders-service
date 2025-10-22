export type CreateOrderDTO = {
  id: string;
  orderNumber: string;
  customerId: string;
  items: Array<{ sku: string; qty: number; unitPrice: number; lineTotal: number }>;
};