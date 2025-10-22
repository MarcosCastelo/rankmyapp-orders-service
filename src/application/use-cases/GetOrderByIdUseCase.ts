import { IOrderRepository } from '../ports/repositories/IOrderRespository';
import { Order } from '../../domain/entities/Order';
import { OrderNotFoundError } from '../../domain/errors';
import { GetOrderByIdDTO } from '../dto/GetOrderByIdDTO';

export class GetOrderByIdUseCase {
  constructor(private readonly repo: IOrderRepository) {}

  async execute(input: GetOrderByIdDTO): Promise<Order> {
    const order = await this.repo.findById(input.orderId);
    if (!order) {
      throw new OrderNotFoundError(`Order ${input.orderId} not found`);
    }
    return order;
  }
}