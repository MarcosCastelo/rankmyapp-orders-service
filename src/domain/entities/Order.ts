import { OrderStatus } from '../value-objects/OrderStatus';
import { OrderCreatedEvent } from '../events/OrderCreated';
import { OrderStatusUpdatedEvent } from '../events/OrderStatusUpdated';
 
 export type OrderItem = {
    sku: string;
    qty: number;
    unitPrice: number;
    lineTotal: number;
 }

 export class Order {
    private _domainEvents: any[] = [];

    private constructor(
        private readonly _id: string,
        private readonly _orderNumber: string,
        private readonly _customerId: string,
        private readonly _items: OrderItem[],
        private _total: number,
        private _status: OrderStatus,
        private _statusHistory: Array<{ status: OrderStatus; changedAt: Date }>,
        private readonly _createdAt: Date,
        private _updatedAt: Date,
        private _version = 1
    ) {
        this.ensureInvariants();
    }

    public static create(data: { id: string; orderNumber: string; customerId: string; items: OrderItem[] }): Order {
        const now = new Date();
        const total = Order.calculateTotal(data.items);
        const initialStatus = OrderStatus.CREATED();

        const order = new Order(
            data.id,
            data.orderNumber,
            data.customerId,
            data.items,
            total,
            initialStatus,
            [{ status: initialStatus, changedAt: now }],
            now,
            now
        );

        order.addDomainEvent(new OrderCreatedEvent({
            orderId: data.id,
            orderNumber: data.orderNumber,
            customerId: data.customerId,
            total,
            createdAt: now.toISOString()
        }));

        return order;
    }

    public static reconstruct(
        id: string,
        orderNumber: string,
        customerId: string,
        items: OrderItem[],
        total: number,
        status: OrderStatus,
        statusHistory: Array<{ status: OrderStatus; changedAt: Date }>,
        createdAt: Date,
        updatedAt: Date,
        version = 1
    ): Order {
        return new Order(id, orderNumber, customerId, items, total, status, statusHistory, createdAt, updatedAt, version);
    }

    private static calculateTotal(items: OrderItem[]): number {
        return items.reduce((sum, item) => sum + item.lineTotal, 0);
    }

    private ensureInvariants() {
        if (!this._orderNumber || this._orderNumber.trim().length === 0) {
            throw new Error('orderNumber is required');
        }
        if (!this._customerId || this._customerId.trim().length === 0) {
            throw new Error('customerId is required');
        }
        if (!Array.isArray(this._items) || this._items.length === 0) {
            throw new Error('items must contain at least one item');
        }
        if (this._total < 0) {
            throw new Error('total must be >= 0');
        }
        const calculatedTotal = Order.calculateTotal(this._items);
        if (Math.abs(this._total - calculatedTotal) > 0.01) {
            throw new Error('total does not match sum of line totals');
        }
    }

    public changeStatus(newStatus: OrderStatus): void {
        this._status.assertCanTransitionTo(newStatus);

        const previous = this._status;
        this._status = newStatus;
        const changedAt = new Date();
        this._statusHistory.push({ status: newStatus, changedAt });
        this._updatedAt = changedAt;
        this._version += 1;

        this.addDomainEvent(new OrderStatusUpdatedEvent({
            orderId: this._id,
            orderNumber: this._orderNumber,
            from: previous.value,
            to: newStatus.value,
            changedAt: changedAt.toISOString()
        }));
    }

    private addDomainEvent(event: unknown): void {
        this._domainEvents.push(event);
    }

    public getDomainEvents(): unknown[] {
        return [...this._domainEvents];
    }

    public clearDomainEvents(): void {
        this._domainEvents = [];
    }

    public get id(): string { return this._id; }
    public get orderNumber(): string { return this._orderNumber; }
    public get customerId(): string { return this._customerId; }
    public get items(): OrderItem[] { return [...this._items]; }
    public get total(): number { return this._total; }
    public get status(): OrderStatus { return this._status; }
    public get statusHistory(): Array<{ status: OrderStatus; changedAt: Date }> { return [...this._statusHistory]; }
    public get createdAt(): Date { return this._createdAt; }
    public get updatedAt(): Date { return this._updatedAt; }
    public get version(): number { return this._version; }
 }