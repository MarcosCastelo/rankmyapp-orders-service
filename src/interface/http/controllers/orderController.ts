import { Request, Response } from 'express';
import { CreateOrderUseCase } from '../../../application/use-cases/CreateOrderUseCase';
import { UpdateOrderStatusUseCase } from '../../../application/use-cases/UpdateOrderStatusUseCase';
import { GetOrderByIdUseCase } from '../../../application/use-cases/GetOrderByIdUseCase';

export class OrderController {
  constructor(
    private readonly createOrder: CreateOrderUseCase,
    private readonly updateOrderStatus: UpdateOrderStatusUseCase,
    private readonly getOrderById: GetOrderByIdUseCase
  ) {}

  async create(req: Request, res: Response) {
    const order = await this.createOrder.execute(req.body);
    res.status(201).json({ id: order.id, orderNumber: order.orderNumber });
  }

  async updateStatus(req: Request, res: Response) {
    await this.updateOrderStatus.execute({
      orderId: req.params.id,
      newStatus: req.body.status,
    });
    res.status(204).send();
  }

  async getById(req: Request, res: Response) {
    const order = await this.getOrderById.execute({ orderId: req.params.id });
    res.status(200).json({
      id: order.id,
      orderNumber: order.orderNumber,
      customerId: order.customerId,
      items: order.items,
      total: order.total,
      status: order.status.toString(),
      statusHistory: order.statusHistory.map(h => ({
        status: h.status.toString(),
        changedAt: h.changedAt.toISOString(),
      })),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      version: order.version,
    });
  }
}