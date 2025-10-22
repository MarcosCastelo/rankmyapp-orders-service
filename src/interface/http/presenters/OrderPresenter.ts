import { Order } from '../../../domain/entities/Order';
import { OrderViewDTO } from '../../../application/dto/OrderViewDTO';

export function toOrderView(order: Order): OrderViewDTO {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    customerId: order.customerId,
    items: order.items.map(i => ({
      sku: i.sku,
      qty: i.qty,
      unitPrice: i.unitPrice,
      lineTotal: i.lineTotal,
    })),
    total: order.total,
    status: order.status.toString(),
    statusHistory: order.statusHistory.map(h => ({
      status: h.status.toString(),
      changedAt: h.changedAt.toISOString(),
    })),
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    version: order.version,
  };
}