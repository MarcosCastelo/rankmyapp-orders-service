import { InvalidOrderStateError } from '../errors/InvalidOrderStateError';

export const ORDER_STATUS_VALUES = [
    'CREATED',
    'PROCESSING', 
    'SHIPPED',
    'DELIVERED',
    'CANCELLED',
] as const;

export type OrderStatusValue = typeof ORDER_STATUS_VALUES[number];

export class OrderStatus {
    private static readonly ALLOWED_TRANSITIONS: Record<OrderStatusValue, OrderStatusValue[]> = {
        CREATED: ['PROCESSING', 'CANCELLED'],
        PROCESSING: ['SHIPPED', 'CANCELLED'],
        SHIPPED: ['DELIVERED'],
        DELIVERED: [],
        CANCELLED: [],
    } as const;

    private constructor(private readonly _value: OrderStatusValue) {}

    public static create(value: string): OrderStatus {
        const upperValue = value.toUpperCase();
        
        if (!this.isValidStatus(upperValue)) {
            throw new InvalidOrderStateError(`Invalid order status: ${value}`);
        }
        
        return new OrderStatus(upperValue as OrderStatusValue);
    }

    public static CREATED(): OrderStatus {
        return new OrderStatus('CREATED');
    }

    public static PROCESSING(): OrderStatus {
        return new OrderStatus('PROCESSING');
    }

    public static SHIPPED(): OrderStatus {
        return new OrderStatus('SHIPPED');
    }

    public static DELIVERED(): OrderStatus {
        return new OrderStatus('DELIVERED');
    }

    public static CANCELLED(): OrderStatus {
        return new OrderStatus('CANCELLED');
    }

    private static isValidStatus(value: string): value is OrderStatusValue {
        return (ORDER_STATUS_VALUES as readonly string[]).includes(value);
    }

    public canTransitionTo(newStatus: OrderStatus): boolean {
        const allowedTransitions = OrderStatus.ALLOWED_TRANSITIONS[this._value];
        return allowedTransitions.includes(newStatus._value);
    }

    public assertCanTransitionTo(newStatus: OrderStatus): void {
        if (!this.canTransitionTo(newStatus)) {
            throw InvalidOrderStateError.forInvalidTransition(this._value, newStatus._value);
        }
    }

    public get value(): OrderStatusValue {
        return this._value;
    }

    public equals(other: OrderStatus): boolean {
        return this._value === other._value;
    }

    public toString(): string {
        return this._value;
    }

    public toJSON(): string {
        return this._value;
    }

    public isCreated(): boolean { return this._value === 'CREATED'; }
    public isProcessing(): boolean { return this._value === 'PROCESSING'; }
    public isShipped(): boolean { return this._value === 'SHIPPED'; }
    public isDelivered(): boolean { return this._value === 'DELIVERED'; }
    public isCancelled(): boolean { return this._value === 'CANCELLED'; }
    public isFinal(): boolean { return this.isDelivered() || this.isCancelled(); }
}