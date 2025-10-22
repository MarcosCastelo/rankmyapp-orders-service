import { toEnvelope } from '../../../../src/application/events/EventFactory';
import { buildOrderCreatedEvent, buildOrderStatusUpdatedEvent } from '../../../mocks/orderEvents';

describe('EventFactory.toEnvelope', () => {
  it('envelope com metadata default {} quando não fornecida', () => {
    const evt = buildOrderCreatedEvent({ metadata: undefined });
    const envelope = toEnvelope(evt as any, 1);

    expect(envelope.eventId).toBeDefined();
    expect(envelope.eventType).toBe('OrderCreated');
    expect(envelope.aggregateId).toBe(evt.aggregateId);
    expect(envelope.version).toBe(1);
    expect(envelope.occurredAt).toBeInstanceOf(Date);
    expect(envelope.payload).toBe(evt.payload);
    expect(envelope.metadata).toEqual({});
  });

  it('preserva metadata quando fornecida', () => {
    const meta = { source: 'test' };
    const evt = buildOrderStatusUpdatedEvent({ metadata: meta });
    const envelope = toEnvelope(evt as any, 3);

    expect(envelope.eventType).toBe('OrderStatusUpdated');
    expect(envelope.version).toBe(3);
    expect(envelope.metadata).toEqual(meta);
  });
});