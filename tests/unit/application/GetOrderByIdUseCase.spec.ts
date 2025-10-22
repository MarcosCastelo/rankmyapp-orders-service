import { GetOrderByIdUseCase } from '../../../src/application/use-cases/GetOrderByIdUseCase';
import { createOrderRepositoryMock } from '../../mocks/orderRepository';
import { buildCreateOrderData, makeOrder } from '../../mocks/orders';
import { OrderNotFoundError } from '../../../src/domain/errors';

describe('GetOrderByIdUseCase', () => {
  it('return the order when founded', async () => {
    const data = buildCreateOrderData({ id: 'order-1', orderNumber: 'ORD-1' });
    const order = makeOrder(data);
    const { repo, findByIdMock } = createOrderRepositoryMock({ findById: order });

    const uc = new GetOrderByIdUseCase(repo);
    const result = await uc.execute({ orderId: 'order-1' });

    expect(findByIdMock).toHaveBeenCalledTimes(1);
    expect(findByIdMock).toHaveBeenCalledWith('order-1');
    expect(result).toBe(order);
  });

  it('throws OrderNotFoundError when not found', async () => {
    const { repo, findByIdMock } = createOrderRepositoryMock({ findById: undefined });

    const uc = new GetOrderByIdUseCase(repo);
    await expect(uc.execute({ orderId: 'missing' })).rejects.toBeInstanceOf(OrderNotFoundError);
    expect(findByIdMock).toHaveBeenCalledWith('missing');
  });
});