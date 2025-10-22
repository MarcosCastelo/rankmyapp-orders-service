import { Connection, Channel } from 'amqplib';
import { IEventDispatcher, EventEnvelope } from '../../../application/ports/messaging/IEventDispatcher';

export class RabbitMQEventDispatcher implements IEventDispatcher {
  constructor(
    private readonly connection: Connection,
    private readonly exchangeName: string
  ) {}

  async dispatch(events: EventEnvelope[]): Promise<void> {
    const channel: Channel = await this.connection.createChannel();
    await channel.assertExchange(this.exchangeName, 'topic', { durable: true });

    for (const evt of events) {
      const routingKey = evt.eventType.replace(/([a-z])([A-Z])/g, '$1.$2').toLowerCase();
      const body = Buffer.from(JSON.stringify({
        eventId: evt.eventId,
        eventType: evt.eventType,
        aggregateId: evt.aggregateId,
        occurredAt: evt.occurredAt.toISOString(),
        version: evt.version,
        payload: evt.payload,
        metadata: evt.metadata
      }));

      channel.publish(this.exchangeName, routingKey, body, {
        persistent: true,
        messageId: evt.eventId,
        timestamp: Math.floor(evt.occurredAt.getTime() / 1000),
        contentType: 'application/json',
        headers: {
          aggregateId: evt.aggregateId,
          eventVersion: evt.version,
        }
      });
    }

    await channel.close();
  }
}