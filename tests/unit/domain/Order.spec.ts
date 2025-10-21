import { Order } from '../../../src/domain/entities/Order';
import { OrderStatus } from '../../../src/domain/value-objects/OrderStatus';
import { InvalidOrderStateError } from '../../../src/domain/errors/InvalidOrderStateError';
import { OrderCreatedEvent } from '../../../src/domain/events/OrderCreated';
import { OrderStatusUpdatedEvent } from '../../../src/domain/events/OrderStatusUpdated';
import { sampleItems, makeOrder, nextProcessingStatus } from '../../mocks/orders';

describe('Order (domain)', () => {
  describe('create', () => {
    it('emit OrderCreatedEvent with right payload', () => {
      const order = makeOrder();

      const events = order.getDomainEvents();
      expect(events.length).toBe(1);

      const evt = events[0] as OrderCreatedEvent;
      expect(evt).toBeInstanceOf(OrderCreatedEvent);
      expect(evt.eventType).toBe('OrderCreated');
      expect(evt.payload.orderId).toBe(order.id);
      expect(evt.payload.orderNumber).toBe(order.orderNumber);
      expect(evt.payload.customerId).toBe(order.customerId);
      expect(evt.payload.total).toBe(order.total);
      expect(isNaN(Date.parse(evt.payload.createdAt))).toBe(false);

      expect(evt.aggregateId).toBe(order.id);
      expect(evt.metadata).toEqual({});
      expect('eventId' in evt).toBe(false);
      expect('occurredAt' in evt).toBe(false);
      expect('version' in evt).toBe(false);
    });

    it('calculate total as sum of lineTotal', () => {
      const order = makeOrder();
      const expectedTotal = sampleItems.reduce((sum, i) => sum + i.lineTotal, 0);
      expect(order.total).toBe(expectedTotal);
    });

    it('getDomainEvents returns defensive copy', () => {
      const order = makeOrder();
      const events = order.getDomainEvents();
      events.push('mutation' as any);

      const after = order.getDomainEvents();
      expect(after.length).toBe(1);
      expect(after[0]).toBeInstanceOf(OrderCreatedEvent);
    });
  });

  describe('clearDomainEvents', () => {
    it('clear event queue', () => {
      const order = makeOrder();
      expect(order.getDomainEvents().length).toBe(1);

      order.clearDomainEvents();
      expect(order.getDomainEvents().length).toBe(0);
    });
  });

  describe('changeStatus', () => {
    it('update status, version and emit OrderStatusUpdatedEvent', () => {
      const order = makeOrder();
      order.clearDomainEvents();

      const next = nextProcessingStatus();
      order.changeStatus(next);

      expect(order.status.equals(next)).toBe(true);
      expect(order.version).toBe(2);
      expect(order.updatedAt.getTime()).toBeGreaterThanOrEqual(order.createdAt.getTime());

      const events = order.getDomainEvents();
      expect(events.length).toBe(1);

      const evt = events[0] as OrderStatusUpdatedEvent;
      expect(evt).toBeInstanceOf(OrderStatusUpdatedEvent);
      expect(evt.eventType).toBe('OrderStatusUpdated');
      expect(evt.payload.orderId).toBe(order.id);
      expect(evt.payload.orderNumber).toBe(order.orderNumber);
      expect(evt.payload.from).toBe('CREATED');
      expect(evt.payload.to).toBe('PROCESSING');
      expect(isNaN(Date.parse(evt.payload.changedAt))).toBe(false);
      expect(evt.aggregateId).toBe(order.id);
      expect(evt.metadata).toEqual({});
      expect('eventId' in evt).toBe(false);
      expect('occurredAt' in evt).toBe(false);
      expect('version' in evt).toBe(false);
    });

    it('throw InvalidOrderStateError on invalid transition and do not emit event', () => {
      const order = makeOrder();
      order.clearDomainEvents();

      expect(() => order.changeStatus(OrderStatus.DELIVERED())).toThrow(InvalidOrderStateError);
      expect(order.getDomainEvents().length).toBe(0);
      expect(order.status.isCreated()).toBe(true);
    });
  });

  describe('reconstruct + invariants', () => {
    it('throw error when total does not match sum of line totals', () => {
      const wrongTotal = 999;
      const status = OrderStatus.CREATED();
      const now = new Date();

      expect(() =>
        Order.reconstruct(
          'order-2',
          'ORD-0002',
          'cust-99',
          sampleItems,
          wrongTotal,
          status,
          [{ status, changedAt: now }],
          now,
          now,
          1
        )
      ).toThrow('total does not match sum of line totals');
    });

    describe('statusHistory', () => {
      it('registra histórico ao mudar status', () => {
        const order = makeOrder();
        order.clearDomainEvents();
  
        const next = OrderStatus.PROCESSING();
        const beforeLen = order.statusHistory.length;
        order.changeStatus(next);
  
        const after = order.statusHistory;
        expect(after.length).toBe(beforeLen + 1);
        const last = after[after.length - 1];
        expect(last.status.equals(next)).toBe(true);
        expect(last.changedAt.getTime()).toBeGreaterThanOrEqual(order.createdAt.getTime());
      });
    });
  
    describe('invariants (ensureInvariants)', () => {
      it('throw error if orderNumber is empty', () => {
        const status = OrderStatus.CREATED();
        const now = new Date();
        expect(() =>
          Order.reconstruct(
            'order-x',
            '',
            'cust-1',
            [{ sku: 'a', qty: 1, unitPrice: 1, lineTotal: 1 }],
            1,
            status,
            [{ status, changedAt: now }],
            now,
            now,
            1
          )
        ).toThrow('orderNumber is required');
      });
  
      it('throw error if customerId is empty', () => {
        const status = OrderStatus.CREATED();
        const now = new Date();
        expect(() =>
          Order.reconstruct(
            'order-x',
            'ORD-X',
            '',
            [{ sku: 'a', qty: 1, unitPrice: 1, lineTotal: 1 }],
            1,
            status,
            [{ status, changedAt: now }],
            now,
            now,
            1
          )
        ).toThrow('customerId is required');
      });
  
      it('throw error if items is empty', () => {
        const status = OrderStatus.CREATED();
        const now = new Date();
        expect(() =>
          Order.reconstruct(
            'order-x',
            'ORD-X',
            'cust-1',
            [],
            0,
            status,
            [{ status, changedAt: now }],
            now,
            now,
            1
          )
        ).toThrow('items must contain at least one item');
      });
  
      it('throw error if total is negative', () => {
        const status = OrderStatus.CREATED();
        const now = new Date();
        expect(() =>
          Order.reconstruct(
            'order-x',
            'ORD-X',
            'cust-1',
            [{ sku: 'a', qty: 1, unitPrice: 1, lineTotal: 1 }],
            -1,
            status,
            [{ status, changedAt: now }],
            now,
            now,
            1
          )
        ).toThrow('total must be >= 0');
      });
    });
  
    describe('getters', () => {
      it('expose getters with defensive copy', () => {
        const order = makeOrder();
        expect(order.id).toBeDefined();
        expect(order.orderNumber).toMatch(/^ORD-/);
        expect(order.customerId).toBeDefined();
  
        const items = order.items;
        expect(Array.isArray(items)).toBe(true);
        expect(items).not.toBe(order['items']); // cópia defensiva
  
        const history = order.statusHistory;
        expect(history.length).toBeGreaterThan(0);
        expect(history).not.toBe(order['statusHistory']); // cópia defensiva
  
        expect(typeof order.total).toBe('number');
        expect(order.createdAt).toBeInstanceOf(Date);
        expect(order.updatedAt).toBeInstanceOf(Date);
        expect(typeof order.version).toBe('number');
      });
    });
  });
});