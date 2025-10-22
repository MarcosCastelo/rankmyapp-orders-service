export interface EventEnvelope<TPayload = unknown> {
  eventId: string;
  eventType: string;
  aggregateId: string;
  occurredAt: Date;
  version: number;
  payload: TPayload;
  metadata: Record<string, unknown>;
}

export interface IEventDispatcher {
  dispatch(events: EventEnvelope[]): Promise<void>;
}