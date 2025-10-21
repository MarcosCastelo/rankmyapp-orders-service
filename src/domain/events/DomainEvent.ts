export interface DomainEvent<TPayload = unknown> {
  readonly eventType: string;
  readonly payload: TPayload;
  readonly metadata?: Record<string, unknown>;
}