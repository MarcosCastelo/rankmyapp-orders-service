import { DomainEvent } from './DomainEvent';

export interface OrderStatusUpdatedEventPayload {
  orderId: string;
  orderNumber: string;
  from: string;
  to: string;
  changedAt: string;
}

export class OrderStatusUpdatedEvent implements DomainEvent<OrderStatusUpdatedEventPayload> {
  public readonly eventType = 'OrderStatusUpdated';

  constructor(
    public readonly payload: OrderStatusUpdatedEventPayload,
    public readonly metadata: Record<string, unknown> = {}
  ) {}

  public get aggregateId(): string {
    return this.payload.orderId;
  }
}