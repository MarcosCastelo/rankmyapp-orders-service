import { RabbitMQEventDispatcher } from '../../../../src/interface/messaging/rabbitmq/RabbitMQEventDispatcher';
import { toEnvelope } from '../../../../src/application/events/EventFactory';
import { buildOrderCreatedEvent, buildOrderStatusUpdatedEvent } from '../../../mocks/orderEvents';

describe('RabbitMQEventDispatcher (integration)', () => {
  function createConnectionMock() {
    const assertExchangeMock = jest.fn().mockResolvedValue(undefined);
    const publishMock = jest.fn().mockReturnValue(true);
    const closeMock = jest.fn().mockResolvedValue(undefined);
    const fakeChannel = {
      assertExchange: assertExchangeMock,
      publish: publishMock,
      close: closeMock,
    } as any;
    const createChannelMock = jest.fn().mockResolvedValue(fakeChannel);
    const connection = { createChannel: createChannelMock } as any;
    return { connection, assertExchangeMock, publishMock, closeMock, createChannelMock, fakeChannel };
  }

  it('publishes events with correct routing key, payload, and options', async () => {
    const { connection, assertExchangeMock, publishMock, closeMock, createChannelMock } = createConnectionMock();
    const dispatcher = new RabbitMQEventDispatcher(connection, 'orders.events');

    const e1 = toEnvelope(buildOrderCreatedEvent(), 1);
    const e2 = toEnvelope(buildOrderStatusUpdatedEvent(), 2);

    await dispatcher.dispatch([e1, e2]);

    expect(createChannelMock).toHaveBeenCalledTimes(1);
    expect(assertExchangeMock).toHaveBeenCalledWith('orders.events', 'topic', { durable: true });

    expect(publishMock).toHaveBeenCalledTimes(2);

    {
      const [exchange, routingKey, content, options] = publishMock.mock.calls[0];
      expect(exchange).toBe('orders.events');
      expect(routingKey).toBe('order.created');

      const body = JSON.parse((content as Buffer).toString('utf8'));
      expect(body).toMatchObject({
        eventId: e1.eventId,
        eventType: e1.eventType,
        aggregateId: e1.aggregateId,
        occurredAt: e1.occurredAt.toISOString(),
        version: e1.version,
        payload: e1.payload,
        metadata: e1.metadata,
      });

      expect(options).toMatchObject({
        persistent: true,
        messageId: e1.eventId,
        timestamp: Math.floor(e1.occurredAt.getTime() / 1000),
        contentType: 'application/json',
        headers: {
          aggregateId: e1.aggregateId,
          eventVersion: e1.version,
        },
      });
    }

    {
      const [exchange, routingKey, content, options] = publishMock.mock.calls[1];
      expect(exchange).toBe('orders.events');
      expect(routingKey).toBe('order.status.updated');

      const body = JSON.parse((content as Buffer).toString('utf8'));
      expect(body).toMatchObject({
        eventId: e2.eventId,
        eventType: e2.eventType,
        aggregateId: e2.aggregateId,
        occurredAt: e2.occurredAt.toISOString(),
        version: e2.version,
        payload: e2.payload,
        metadata: e2.metadata,
      });

      expect(options).toMatchObject({
        persistent: true,
        messageId: e2.eventId,
        timestamp: Math.floor(e2.occurredAt.getTime() / 1000),
        contentType: 'application/json',
        headers: {
          aggregateId: e2.aggregateId,
          eventVersion: e2.version,
        },
      });
    }

    expect(closeMock).toHaveBeenCalledTimes(1);
  });

  it('throws when publish fails and does not close the channel', async () => {
    const assertExchangeMock = jest.fn().mockResolvedValue(undefined);
    const publishMock = jest.fn().mockImplementation(() => {
      throw new Error('publish failed');
    });
    const closeMock = jest.fn().mockResolvedValue(undefined);
    const fakeChannel = {
      assertExchange: assertExchangeMock,
      publish: publishMock,
      close: closeMock,
    } as any;
    const createChannelMock = jest.fn().mockResolvedValue(fakeChannel);
    const connection = { createChannel: createChannelMock } as any;

    const dispatcher = new RabbitMQEventDispatcher(connection, 'orders.events');
    const e1 = toEnvelope(buildOrderCreatedEvent(), 1);

    await expect(dispatcher.dispatch([e1])).rejects.toThrow('publish failed');

    expect(createChannelMock).toHaveBeenCalledTimes(1);
    expect(assertExchangeMock).toHaveBeenCalledTimes(1);
    expect(publishMock).toHaveBeenCalledTimes(1);
    expect(closeMock).not.toHaveBeenCalled(); // publish error aborts before close
  });

  it('creates and closes channel when events list is empty (no publish)', async () => {
    const { connection, assertExchangeMock, publishMock, closeMock, createChannelMock } = createConnectionMock();
    const dispatcher = new RabbitMQEventDispatcher(connection, 'orders.events');

    await dispatcher.dispatch([]);

    expect(createChannelMock).toHaveBeenCalledTimes(1);
    expect(assertExchangeMock).toHaveBeenCalledWith('orders.events', 'topic', { durable: true });
    expect(publishMock).not.toHaveBeenCalled();
    expect(closeMock).toHaveBeenCalledTimes(1);
  });
});