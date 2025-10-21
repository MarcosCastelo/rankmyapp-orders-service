import { OrderStatus } from '../../../src/domain/value-objects/OrderStatus';
import { InvalidOrderStateError } from '../../../src/domain/errors/InvalidOrderStateError';

describe('OrderStatus (value object)', () => {
  it('create valid status and compare equality', () => {
    const s1 = OrderStatus.CREATED();
    const s2 = OrderStatus.create('created');
    const s3 = OrderStatus.PROCESSING();

    expect(s1.equals(s2)).toBe(true);
    expect(s1.equals(s3)).toBe(false);
    expect(s1.toString()).toBe('CREATED');
    expect(s1.toJSON()).toBe('CREATED');
  });

  it('allow valid transitions', () => {
    const created = OrderStatus.CREATED();
    const processing = OrderStatus.PROCESSING();
    const shipped = OrderStatus.SHIPPED();
    const delivered = OrderStatus.DELIVERED();

    expect(created.canTransitionTo(processing)).toBe(true);
    expect(processing.canTransitionTo(shipped)).toBe(true);
    expect(shipped.canTransitionTo(delivered)).toBe(true);
  });

  it('reject invalid transitions with detailed error', () => {
    const created = OrderStatus.CREATED();
    const delivered = OrderStatus.DELIVERED();

    expect(() => created.assertCanTransitionTo(delivered)).toThrow(InvalidOrderStateError);
  });

  it('isFinal identify terminal states', () => {
    expect(OrderStatus.DELIVERED().isFinal()).toBe(true);
    expect(OrderStatus.CANCELLED().isFinal()).toBe(true);
    expect(OrderStatus.CREATED().isFinal()).toBe(false);
  });

  it('transitionTo execute transition without error', () => {
    const processing = OrderStatus.PROCESSING();
    const shipped = OrderStatus.SHIPPED();
    expect(() => processing.assertCanTransitionTo(shipped)).not.toThrow();
  });

  it('canTransitionTo return false for invalid transition', () => {
    const cancelled = OrderStatus.CANCELLED();
    const created = OrderStatus.CREATED();
    expect(cancelled.canTransitionTo(created)).toBe(false);
  });

  it('create throw error for invalid status', () => {
    expect(() => OrderStatus.create('INVALID')).toThrow(InvalidOrderStateError);
  });

  it('isCancelled and isDelivered reflect correct states', () => {
    expect(OrderStatus.CANCELLED().isCancelled()).toBe(true);
    expect(OrderStatus.DELIVERED().isDelivered()).toBe(true);
  });
});