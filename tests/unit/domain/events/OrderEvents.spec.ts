import { buildOrderCreatedEvent, buildOrderStatusUpdatedEvent } from '../../../mocks/orderEvents';

describe('Domain Events (Order)', () => {
  it('OrderCreatedEvent has minimum contract and aggregateId derived from orderId', () => {
    const evt = buildOrderCreatedEvent();

    expect(evt.eventType).toBe('OrderCreated');
    expect(evt.payload.orderId).toBe('order-1');
    expect(evt.aggregateId).toBe('order-1');
    expect(evt.metadata).toEqual({});
    expect('eventId' in evt).toBe(false);
    expect('occurredAt' in evt).toBe(false);
    expect('version' in evt).toBe(false);
  });

  it('OrderStatusUpdatedEvent has minimum contract and aggregateId derived from orderId', () => {
    const evt = buildOrderStatusUpdatedEvent();

    expect(evt.eventType).toBe('OrderStatusUpdated');
    expect(evt.payload.to).toBe('PROCESSING');
    expect(evt.aggregateId).toBe('order-1');
    expect(evt.metadata).toEqual({});
    expect('eventId' in evt).toBe(false);
    expect('occurredAt' in evt).toBe(false);
    expect('version' in evt).toBe(false);
  });
});