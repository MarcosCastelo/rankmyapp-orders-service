import { UpdateOrderStatusUseCase } from '../../../src/application/use-cases/UpdateOrderStatusUseCase';
import { Order } from '../../../src/domain/entities/Order';
import { OrderStatus } from '../../../src/domain/value-objects/OrderStatus';
import { OrderNotFoundError, InvalidOrderStateError } from '../../../src/domain/errors';
import { createEventDispatcherMock } from '../../mocks/eventDispatcher';
import { createOrderRepositoryMock } from '../../mocks/orderRepository';

describe('UpdateOrderStatusUseCase', () => {
  const baseOrder = Order.create({
    id: 'order-1',
    orderNumber: 'ORD-1',
    customerId: 'cust-1',
    items: [{ sku: 'SKU-1', qty: 1, unitPrice: 10, lineTotal: 10 }],
  });

  it('updates status, persists, publishes OrderStatusUpdated envelope, and clears events', async () => {
    baseOrder.clearDomainEvents();
    const { repo, saveMock } = createOrderRepositoryMock({ findById: baseOrder });
    const { dispatcher, dispatchMock } = createEventDispatcherMock();

    const uc = new UpdateOrderStatusUseCase(repo, dispatcher);
    await uc.execute({ orderId: baseOrder.id, newStatus: 'PROCESSING' });

    expect(baseOrder.status.equals(OrderStatus.PROCESSING())).toBe(true);
    expect(baseOrder.version).toBe(2);

    expect(saveMock).toHaveBeenCalledTimes(1);
    expect(saveMock).toHaveBeenCalledWith(baseOrder);

    expect(dispatcher.dispatch).toHaveBeenCalledTimes(1);
    const [envelopes] = dispatchMock.mock.calls[0];
    expect(Array.isArray(envelopes)).toBe(true);
    expect(envelopes.length).toBeGreaterThanOrEqual(1);

    const updatedEnvelope = envelopes[0];
    expect(updatedEnvelope.eventType).toBe('OrderStatusUpdated');
    expect(updatedEnvelope.aggregateId).toBe(baseOrder.id);
    expect(updatedEnvelope.version).toBe(baseOrder.version);
    expect(updatedEnvelope.occurredAt).toBeInstanceOf(Date);
    expect(updatedEnvelope.payload).toMatchObject({
      orderId: baseOrder.id,
      orderNumber: baseOrder.orderNumber,
      from: 'CREATED',
      to: 'PROCESSING',
    });
    expect(updatedEnvelope.metadata).toEqual({});

    expect(baseOrder.getDomainEvents()).toEqual([]);
  });

  it('throws OrderNotFoundError when order does not exist', async () => {
    const { repo, saveMock } = createOrderRepositoryMock({ findById: null });
    const { dispatcher, dispatchMock } = createEventDispatcherMock();

    const uc = new UpdateOrderStatusUseCase(repo, dispatcher);

    await expect(
      uc.execute({ orderId: 'unknown', newStatus: 'PROCESSING' })
    ).rejects.toBeInstanceOf(OrderNotFoundError);

    expect(saveMock).not.toHaveBeenCalled();
    expect(dispatchMock).not.toHaveBeenCalled();
  });

  it('throws InvalidOrderStateError for invalid new status', async () => {
    const order = Order.create({
      id: 'order-2',
      orderNumber: 'ORD-2',
      customerId: 'cust-2',
      items: [{ sku: 'SKU-2', qty: 1, unitPrice: 20, lineTotal: 20 }],
    });

    const { repo, saveMock } = createOrderRepositoryMock({ findById: order });
    const { dispatcher, dispatchMock } = createEventDispatcherMock();

    const uc = new UpdateOrderStatusUseCase(repo, dispatcher);

    await expect(
      uc.execute({ orderId: order.id, newStatus: 'INVALID' })
    ).rejects.toBeInstanceOf(InvalidOrderStateError);

    expect(saveMock).not.toHaveBeenCalled();
    expect(dispatchMock).not.toHaveBeenCalled();
  });
});