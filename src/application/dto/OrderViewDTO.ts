export type OrderViewDTO = {
  id: string;
  orderNumber: string;
  customerId: string;
  items: Array<{ sku: string; qty: number; unitPrice: number; lineTotal: number }>;
  total: number;
  status: string;
  statusHistory: Array<{ status: string; changedAt: string }>;
  createdAt: string;
  updatedAt: string;
  version: number;
};