export class InvalidOrderStateError extends Error {
    constructor(
        message = 'Invalid order state',
        public readonly currentState?: string,
        public readonly attemptedState?: string
    ) {
        super(message);
        this.name = 'InvalidOrderStateError';
        Object.setPrototypeOf(this, new.target.prototype);
    }

    public static forInvalidTransition(from: string, to: string): InvalidOrderStateError {
        return new InvalidOrderStateError(
            `Cannot transition from ${from} to ${to}`,
            from,
            to
        );
    }

    public static forInvalidStatus(status: string): InvalidOrderStateError {
        return new InvalidOrderStateError(
            `Invalid order status: ${status}`,
            undefined,
            status
        );
    }
}