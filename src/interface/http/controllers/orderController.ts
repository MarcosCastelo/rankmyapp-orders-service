import { Request, Response } from 'express';
import { CreateOrderUseCase } from '../../../application/use-cases/CreateOrderUseCase';
import { UpdateOrderStatusUseCase } from '../../../application/use-cases/UpdateOrderStatusUseCase';

export class OrderController {
  constructor(
    private readonly createOrder: CreateOrderUseCase,
    private readonly updateOrderStatus: UpdateOrderStatusUseCase 
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
}