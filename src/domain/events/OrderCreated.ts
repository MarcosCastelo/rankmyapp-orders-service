import { DomainEvent } from './DomainEvent';

export interface OrderCreatedEventPayload {
  orderId: string;
  orderNumber: string;
  customerId: string;
  total: number;
  createdAt: string;
}

export class OrderCreatedEvent implements DomainEvent<OrderCreatedEventPayload> {
  public readonly eventType = 'OrderCreated';

  constructor(
    public readonly payload: OrderCreatedEventPayload,
    public readonly metadata: Record<string, unknown> = {}
  ) {}

  public get aggregateId(): string {
    return this.payload.orderId;
  }
}