import { connect as connectAmqp } from 'amqplib';
import { config } from './infra/config';
import { logger } from './infra/logger';
import { connectMongo } from './infra/db/mongoClient';
import { MongoOrderRepository } from './interface/persistence/mongo/MongoOrderRepository';
import { RabbitMQEventDispatcher } from './interface/messaging/rabbitmq/RabbitMQEventDispatcher';
import { CreateOrderUseCase } from './application/use-cases/CreateOrderUseCase';
import { UpdateOrderStatusUseCase } from './application/use-cases/UpdateOrderStatusUseCase';
import { GetOrderByIdUseCase } from './application/use-cases/GetOrderByIdUseCase';
import { OrderController } from './interface/http/controllers/orderController';
import { buildOrderRoutes } from './interface/http/routes';
import { createApp } from './infra/server/app';

async function main() {
  try {
    const db = await connectMongo();
    const amqp = await connectAmqp(config.RABBITMQ_URL);

    const repo = new MongoOrderRepository(db);
    const dispatcher = new RabbitMQEventDispatcher(amqp, 'orders.events');

    const createOrder = new CreateOrderUseCase(repo, dispatcher);
    const updateOrderStatus = new UpdateOrderStatusUseCase(repo, dispatcher);
    const getOrderById = new GetOrderByIdUseCase(repo);

    const controller = new OrderController(createOrder, updateOrderStatus, getOrderById);

    const routes = buildOrderRoutes(controller);
    const app = createApp(routes);

    const port = Number(config.PORT);
    app.listen(port, () => {
      logger.info({ port }, 'HTTP server listening');
    });
  } catch (err) {
    logger.error({ err }, 'Startup failed');
    process.exit(1);
  }
}

main();