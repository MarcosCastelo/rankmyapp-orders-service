import { randomUUID } from 'crypto';
import { DomainEvent } from '../../domain/events/DomainEvent';
import { EventEnvelope } from '../ports/messaging/IEventDispatcher';

export function toEnvelope<TPayload>(
  event: DomainEvent<TPayload> & { aggregateId: string },
  version = 1
): EventEnvelope<TPayload> {
  return {
    eventId: randomUUID(),
    eventType: event.eventType,
    aggregateId: event.aggregateId,
    occurredAt: new Date(),
    version,
    payload: event.payload,
    metadata: event.metadata ?? {}
  };
}