import { Router } from 'express';
import { OrderController } from '../controllers/OrderController';
import { createOrderSchema, updateStatusSchema } from '../validators/orderSchema';
import { presentError } from '../presenters/ErrorPresenter';

export function buildOrderRoutes(controller: OrderController): Router {
  const router = Router();

  router.get('/orders/:id', async (req, res) => {
    try {
      await controller.getById(req, res);
    } catch (err) {
      presentError(err, res);
    }
  });

  router.post('/orders', async (req, res) => {
    try {
      const parsed = createOrderSchema.parse(req.body);
      const order = await controller.create({ body: parsed } as any, res);
      return order;
    } catch (err) {
      presentError(err, res);
    }
  });

  router.patch('/orders/:id/status', async (req, res) => {
    try {
      const parsed = updateStatusSchema.parse(req.body);
      await controller.updateStatus({ params: req.params, body: parsed } as any, res);
    } catch (err) {
      presentError(err, res);
    }
  });

  return router;
}