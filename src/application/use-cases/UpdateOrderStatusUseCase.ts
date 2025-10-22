import { OrderStatus } from '../../domain/value-objects/OrderStatus';
import { IOrderRepository } from '../ports/repositories/IOrderRespository';
import { IEventDispatcher } from '../ports/messaging/IEventDispatcher';
import { toEnvelope } from '../events/EventFactory';
import { OrderNotFoundError } from '../../domain/errors';

type ChangeOrderStatusInput = {
  orderId: string;
  newStatus: string;
};

export class UpdateOrderStatusUseCase {
  constructor(
    private readonly repo: IOrderRepository,
    private readonly dispatcher: IEventDispatcher
  ) {}

  async execute(input: ChangeOrderStatusInput): Promise<void> {
    const order = await this.repo.findById(input.orderId);
    if (!order) {
      throw new OrderNotFoundError(`Order ${input.orderId} not found`);
    }

    const next = OrderStatus.create(input.newStatus);
    order.changeStatus(next);

    await this.repo.save(order);

    const envelopes = order.getDomainEvents().map((evt: any) => toEnvelope(evt, order.version));
    await this.dispatcher.dispatch(envelopes);

    order.clearDomainEvents();
  }
}