import { OrderController } from '../../../../../src/interface/http/controllers/OrderController';
import { Order } from '../../../../../src/domain/entities/Order';

function makeRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
    send: jest.fn(),
  } as any;
}

describe('OrderController', () => {
  it('create retorna 201 com id e orderNumber', async () => {
    const createOrder = { execute: jest.fn().mockResolvedValue({ id: 'order-1', orderNumber: 'ORD-1' }) } as any;
    const updateOrderStatus = { execute: jest.fn() } as any;
    const getOrderById = { execute: jest.fn() } as any;

    const controller = new OrderController(createOrder, updateOrderStatus, getOrderById);
    const req = { body: { /* validado na rota */ } } as any;
    const res = makeRes();

    await controller.create(req, res);

    expect(createOrder.execute).toHaveBeenCalledWith(req.body);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ id: 'order-1', orderNumber: 'ORD-1' });
  });

  it('updateStatus retorna 204', async () => {
    const createOrder = { execute: jest.fn() } as any;
    const updateOrderStatus = { execute: jest.fn().mockResolvedValue(undefined) } as any;
    const getOrderById = { execute: jest.fn() } as any;

    const controller = new OrderController(createOrder, updateOrderStatus, getOrderById);
    const req = { params: { id: 'order-1' }, body: { status: 'PROCESSING' } } as any;
    const res = makeRes();

    await controller.updateStatus(req, res);

    expect(updateOrderStatus.execute).toHaveBeenCalledWith({ orderId: 'order-1', newStatus: 'PROCESSING' });
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });

  it('getById retorna 200 com OrderViewDTO', async () => {
    const order = Order.create({
      id: 'order-1',
      orderNumber: 'ORD-1',
      customerId: 'cust-1',
      items: [{ sku: 'SKU-1', qty: 1, unitPrice: 10, lineTotal: 10 }],
    });

    const createOrder = { execute: jest.fn() } as any;
    const updateOrderStatus = { execute: jest.fn() } as any;
    const getOrderById = { execute: jest.fn().mockResolvedValue(order) } as any;

    const controller = new OrderController(createOrder, updateOrderStatus, getOrderById);
    const req = { params: { id: 'order-1' } } as any;
    const res = makeRes();

    await controller.getById(req, res);

    expect(getOrderById.execute).toHaveBeenCalledWith({ orderId: 'order-1' });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();

    const [view] = res.json.mock.calls[0];
    expect(view).toMatchObject({
      id: 'order-1',
      orderNumber: 'ORD-1',
      customerId: 'cust-1',
      status: 'CREATED',
      total: 10,
      version: order.version,
    });
    expect(view.items[0]).toMatchObject({ sku: 'SKU-1', qty: 1, unitPrice: 10, lineTotal: 10 });
  });
});