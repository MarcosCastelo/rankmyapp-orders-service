import { toOrderView } from '../../../../../src/interface/http/presenters/OrderPresenter';
import { buildCreateOrderData, makeOrder } from '../../../../mocks/orders';

describe('OrderPresenter', () => {
  it('map Order to OrderViewDTO correctly', () => {
    const data = buildCreateOrderData({
      id: 'order-1',
      orderNumber: 'ORD-1',
      customerId: 'cust-1',
      items: [
        { sku: 'SKU-1', qty: 2, unitPrice: 15, lineTotal: 30 },
        { sku: 'SKU-2', qty: 1, unitPrice: 20, lineTotal: 20 }
      ],
    });
    const order = makeOrder(data);

    const view = toOrderView(order);

    expect(view).toMatchObject({
      id: order.id,
      orderNumber: order.orderNumber,
      customerId: order.customerId,
      total: order.total,
      status: order.status.toString(),
      version: order.version,
    });

    expect(Array.isArray(view.items)).toBe(true);
    expect(view.items[0]).toMatchObject({
      sku: 'SKU-1',
      qty: 2,
      unitPrice: 15,
      lineTotal: 30,
    });

    expect(Array.isArray(view.statusHistory)).toBe(true);
    expect(view.statusHistory[0].status).toBe('CREATED');
    expect(typeof view.statusHistory[0].changedAt).toBe('string');

    expect(typeof view.createdAt).toBe('string');
    expect(typeof view.updatedAt).toBe('string');
  });
});