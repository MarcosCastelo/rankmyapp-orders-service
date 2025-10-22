import { presentError } from '../../../../../src/interface/http/presenters/ErrorPresenter';
import { InvalidOrderStateError, OrderNotFoundError } from '../../../../../src/domain/errors';
import { z } from 'zod';


jest.mock('../../../../../src/infra/logger', () => ({
  logger: { error: jest.fn() }
}));
import { logger } from '../../../../../src/infra/logger';

function makeRes() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  } as any;
}

describe('ErrorPresenter', () => {
  it('ZodError → 400 ValidationError com details', () => {
    const schema = z.object({ id: z.string() });
    const result = schema.safeParse({ id: 123 });
    expect(result.success).toBe(false);

    const res = makeRes();
    presentError((result as any).error, res);

    expect(res.status).toHaveBeenCalledWith(400);
    const [body] = res.json.mock.calls[0];
    expect(body.error).toBe('ValidationError');
    expect(Array.isArray(body.details)).toBe(true);
  });

  it('InvalidOrderStateError → 400 InvalidOrderState com message e detalhes', () => {
    const err = InvalidOrderStateError.forInvalidTransition('CREATED', 'DELIVERED');
    const res = makeRes();

    presentError(err, res);

    expect(res.status).toHaveBeenCalledWith(400);
    const [body] = res.json.mock.calls[0];
    expect(body).toMatchObject({
      error: 'InvalidOrderState',
      message: err.message,
      current: 'CREATED',
      attempted: 'DELIVERED',
    });
  });

  it('OrderNotFoundError → 404 OrderNotFound com message', () => {
    const err = new OrderNotFoundError('Order 123 not found');
    const res = makeRes();

    presentError(err, res);

    expect(res.status).toHaveBeenCalledWith(404);
    const [body] = res.json.mock.calls[0];
    expect(body).toMatchObject({
      error: 'OrderNotFound',
      message: 'Order 123 not found',
    });
  });

  it('Erro genérico → 500 InternalServerError, log chamado e message preservada', () => {
    const err = new Error('boom');
    const res = makeRes();

    presentError(err, res);

    expect(logger.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    const [body] = res.json.mock.calls[0];
    expect(body).toMatchObject({
      error: 'InternalServerError',
      message: 'boom',
    });
  });

  it('Valor não-Error → 500 InternalServerError com "Unknown error" e log chamado', () => {
    const res = makeRes();

    presentError('oops' as any, res);

    expect(logger.error).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    const [body] = res.json.mock.calls[0];
    expect(body).toMatchObject({
      error: 'InternalServerError',
      message: 'Unknown error',
    });
  });
});