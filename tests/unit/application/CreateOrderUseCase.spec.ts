import { CreateOrderUseCase } from '../../../src/application/use-cases/CreateOrderUseCase';
import { IEventDispatcher } from '../../../src/application/ports/messaging/IEventDispatcher';
import { Order } from '../../../src/domain/entities/Order';
import { createEventDispatcherMock } from '../../mocks/eventDispatcher';
import { createOrderRepositoryMock } from '../../mocks/orderRepository';

describe('CreateOrderUseCase', () => {
  const input = {
    id: 'order-1',
    orderNumber: 'ORD-1',
    customerId: 'cust-1',
    items: [{ sku: 'SKU-1', qty: 1, unitPrice: 10, lineTotal: 10 }],
  };

  it('persists order, publishes OrderCreated envelope, and clears domain events', async () => {
    const { repo } = createOrderRepositoryMock();
    const { dispatcher, dispatchMock } = createEventDispatcherMock();

    const uc = new CreateOrderUseCase(repo, dispatcher);
    const order = await uc.execute(input);

    expect(order).toBeInstanceOf(Order);
    expect(repo.save).toHaveBeenCalledTimes(1);
    expect(repo.save).toHaveBeenCalledWith(order);

    expect(dispatcher.dispatch).toHaveBeenCalledTimes(1);
    const [envelopes] = dispatchMock.mock.calls[0];
    expect(Array.isArray(envelopes)).toBe(true);
    expect(envelopes.length).toBeGreaterThanOrEqual(1);

    const createdEnvelope = envelopes[0];
    expect(createdEnvelope.eventType).toBe('OrderCreated');
    expect(createdEnvelope.aggregateId).toBe(order.id);
    expect(createdEnvelope.version).toBe(order.version);
    expect(createdEnvelope.occurredAt).toBeInstanceOf(Date);
    expect(createdEnvelope.payload).toMatchObject({
      orderId: input.id,
      orderNumber: input.orderNumber,
      customerId: input.customerId,
      total: 10,
    });
    expect(createdEnvelope.metadata).toEqual({});

    expect(order.getDomainEvents()).toEqual([]);
  });
});