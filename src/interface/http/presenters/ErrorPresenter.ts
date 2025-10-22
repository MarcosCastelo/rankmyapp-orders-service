import { Response } from 'express';
import { ZodError } from 'zod';
import { InvalidOrderStateError, OrderNotFoundError } from '../../../domain/errors';
import { logger } from '../../../infra/logger';

export function presentError(err: unknown, res: Response): void {
  if (err instanceof ZodError) {
    res.status(400).json({ error: 'ValidationError', details: err.errors });
    return;
  }

  if (err instanceof InvalidOrderStateError) {
    res.status(400).json({ error: 'InvalidOrderState', message: err.message, current: err.currentState, attempted: err.attemptedState });
    return;
  }

  if (err instanceof OrderNotFoundError) {
    res.status(404).json({ error: 'OrderNotFound', message: err.message });
    return;
  }

  const message = err instanceof Error ? err.message : 'Unknown error';
  logger.error({ err }, 'Unhandled error');
  res.status(500).json({ error: 'InternalServerError', message });
}