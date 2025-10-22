import { Order } from '../../domain/entities/Order';
import { IOrderRepository } from '../ports/repositories/IOrderRespository';
import { IEventDispatcher } from '../ports/messaging/IEventDispatcher';
import { toEnvelope } from '../events/EventFactory';

type CreateOrderInput = {
  id: string;
  orderNumber: string;
  customerId: string;
  items: Array<{ sku: string; qty: number; unitPrice: number; lineTotal: number }>;
};

export class CreateOrderUseCase {
  constructor(
    private readonly repo: IOrderRepository,
    private readonly dispatcher: IEventDispatcher
  ) {}

  async execute(input: CreateOrderInput): Promise<Order> {
    const order = Order.create(input);

    await this.repo.save(order);

    const envelopes = order.getDomainEvents().map((evt: any) => toEnvelope(evt, order.version));
    await this.dispatcher.dispatch(envelopes);

    order.clearDomainEvents();
    return order;
  }
}