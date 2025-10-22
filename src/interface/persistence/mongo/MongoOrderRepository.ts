import { Collection, Db } from 'mongodb';
import { IOrderRepository } from '../../../application/ports/repositories/IOrderRespository';
import { Order } from '../../../domain/entities/Order';
import { OrderStatus } from '../../../domain/value-objects/OrderStatus';

type OrderDocument = {
  _id: string;
  orderNumber: string;
  customerId: string;
  items: Array<{ sku: string; qty: number; unitPrice: number; lineTotal: number }>;
  total: number;
  status: string;
  statusHistory: Array<{ status: string; changedAt: Date }>;
  createdAt: Date;
  updatedAt: Date;
  version: number;
};

export class MongoOrderRepository implements IOrderRepository {
  private readonly collection: Collection<OrderDocument>;

  constructor(db: Db) {
    this.collection = db.collection<OrderDocument>('orders');
  }

  async save(order: Order): Promise<void> {
    await this.collection.updateOne(
      { _id: order.id },
      {
        $set: {
          orderNumber: order.orderNumber,
          customerId: order.customerId,
          items: order.items,
          total: order.total,
          status: order.status.value,
          statusHistory: order.statusHistory.map(h => ({ status: h.status.value, changedAt: h.changedAt })),
          createdAt: order.createdAt,
          updatedAt: order.updatedAt,
          version: order.version,
        }
      },
      { upsert: true }
    );
  }

  async findById(id: string): Promise<Order | null> {
    const doc = await this.collection.findOne({ _id: id });
    if (!doc) return null;

    const status = OrderStatus.create(doc.status);
    const statusHistory = (doc.statusHistory ?? []).map(h => ({
      status: OrderStatus.create(h.status),
      changedAt: new Date(h.changedAt),
    }));

    return Order.reconstruct(
      doc._id,
      doc.orderNumber,
      doc.customerId,
      doc.items,
      doc.total,
      status,
      statusHistory,
      new Date(doc.createdAt),
      new Date(doc.updatedAt),
      doc.version ?? 1
    );
  }
}