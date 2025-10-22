import { createOrderSchema, updateStatusSchema } from '../../../../../src/interface/http/validators/orderSchema';

describe('HTTP Validators (Zod)', () => {
  it('createOrderSchema parse valid payload', () => {
    const payload = {
      id: 'order-1',
      orderNumber: 'ORD-1',
      customerId: 'cust-1',
      items: [{ sku: 'SKU-1', qty: 1, unitPrice: 10, lineTotal: 10 }],
    };

    const parsed = createOrderSchema.parse(payload);
    expect(parsed).toEqual(payload);
  });

  it('createOrderSchema fails with empty items', () => {
    const badPayload = {
      id: 'order-1',
      orderNumber: 'ORD-1',
      customerId: 'cust-1',
      items: [],
    };

    expect(() => createOrderSchema.parse(badPayload)).toThrow();
  });

  it('updateStatusSchema accepts valid values', () => {
    const parsed = updateStatusSchema.parse({ status: 'PROCESSING' });
    expect(parsed.status).toBe('PROCESSING');
  });

  it('updateStatusSchema falha com valor inválido', () => {
    expect(() => updateStatusSchema.parse({ status: 'INVALID' as any })).toThrow();
  });
});