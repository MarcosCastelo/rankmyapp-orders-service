import { InvalidOrderStateError } from '../../../../src/domain/errors/InvalidOrderStateError';

describe('InvalidOrderStateError', () => {
  it('use default message and name', () => {
    const err = new InvalidOrderStateError();
    expect(err.name).toBe('InvalidOrderStateError');
    expect(err.message).toBe('Invalid order state');
  });

  it('forInvalidTransition create error with details', () => {
    const err = InvalidOrderStateError.forInvalidTransition('CREATED', 'DELIVERED');
    expect(err.message).toBe('Cannot transition from CREATED to DELIVERED');
    expect(err.currentState).toBe('CREATED');
    expect(err.attemptedState).toBe('DELIVERED');
  });

  it('forInvalidStatus create error with invalid status', () => {
    const err = InvalidOrderStateError.forInvalidStatus('FOO');
    expect(err.message).toBe('Invalid order status: FOO');
    expect(err.currentState).toBeUndefined();
    expect(err.attemptedState).toBe('FOO');
  });
});