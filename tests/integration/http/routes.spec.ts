import http from 'http';
import { Router } from 'express';
import { createApp } from '../../../src/infra/server/app';
import { buildOrderRoutes } from '../../../src/interface/http/routes';
import { OrderNotFoundError } from '../../../src/domain/errors';

class FakeOrderController {
  async getById(req: any, res: any) {
    const id = req.params.id;
    if (id === 'missing') {
      throw new OrderNotFoundError('Order missing not found');
    }
    if (id === 'boom') {
      throw new Error('boom');
    }
    if (id === 'oops') {
      throw 'oops';
    }
    res.status(200).json({ id, orderNumber: 'ORD-OK' });
  }

  async create(req: any, res: any) {    
    if (req.body.signal === 'error') {
      throw new Error('boom');
    }
    if (req.body.signal === 'nonerror') {
      throw 'oops';
    }
    if (req.body.id === 'order-error') {
      throw new Error('boom');
    }
    if (req.body.id === 'order-nonerror') {
      throw 'oops';
    }
    res.status(201).json({ id: 'order-1', orderNumber: 'ORD-1' });
  }

  async updateStatus(req: any, res: any) {
    res.status(204).send();
  }
}

function startServer(router: Router) {
  const app = createApp(router);
  const server = app.listen(0);
  const address = server.address();
  const port = typeof address === 'string' ? 0 : address?.port || 0;
  return {
    port,
    close: () => new Promise<void>(resolve => server.close(() => resolve())),
  };
}

function httpRequest(
  port: number,
  method: string,
  path: string,
  body?: unknown
): Promise<{ status: number; json: any }> {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : undefined;
    const opts = {
      hostname: '127.0.0.1',
      port,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
      } as Record<string, any>,
    };
    const req = http.request(opts, res => {
      const chunks: Buffer[] = [];
      res.on('data', d => chunks.push(d));
      res.on('end', () => {
        const buf = Buffer.concat(chunks);
        const text = buf.toString('utf-8');
        const json = text ? JSON.parse(text) : undefined;
        resolve({ status: res.statusCode || 0, json });
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

describe('HTTP Routes (integration)', () => {
  let port = 0;
  let close: () => Promise<void>;

  beforeAll(() => {
    const controller = new FakeOrderController();
    const router = buildOrderRoutes(controller as any);
    const srv = startServer(router);
    port = srv.port;
    close = srv.close;
  });

  afterAll(async () => {
    await close();
  });

  it('GET /health -> 200 with status ok', async () => {
    const { status, json } = await httpRequest(port, 'GET', '/health');
    expect(status).toBe(200);
    expect(json).toEqual({ status: 'ok' });
  });

  it('GET /orders/:id success -> 200 with payload', async () => {
    const { status, json } = await httpRequest(port, 'GET', '/orders/order-123');
    expect(status).toBe(200);
    expect(json).toEqual({ id: 'order-123', orderNumber: 'ORD-OK' });
  });

  it('GET /orders/:id not found -> 404 via ErrorPresenter', async () => {
    const { status, json } = await httpRequest(port, 'GET', '/orders/missing');
    expect(status).toBe(404);
    expect(json).toMatchObject({ error: 'OrderNotFound' });
    expect(typeof json.message).toBe('string');
  });

  it('GET /orders/:id generic error -> 500 via ErrorPresenter', async () => {
    const { status, json } = await httpRequest(port, 'GET', '/orders/boom');
    expect(status).toBe(500);
    expect(json).toMatchObject({ error: 'InternalServerError', message: 'boom' });
  });

  it('GET /orders/:id non-Error value -> 500 "Unknown error" via ErrorPresenter', async () => {
    const { status, json } = await httpRequest(port, 'GET', '/orders/oops');
    expect(status).toBe(500);
    expect(json).toMatchObject({ error: 'InternalServerError', message: 'Unknown error' });
  });

  it('POST /orders success -> 201 with id and orderNumber', async () => {
    const body = {
      id: 'order-1',
      orderNumber: 'ORD-1',
      customerId: 'cust-1',
      items: [{ sku: 'SKU-1', qty: 1, unitPrice: 10, lineTotal: 10 }],
    };
    const { status, json } = await httpRequest(port, 'POST', '/orders', body);
    expect(status).toBe(201);
    expect(json).toEqual({ id: 'order-1', orderNumber: 'ORD-1' });
  });

  it('POST /orders invalid payload -> 400 via Zod + ErrorPresenter', async () => {
    const badBody = { id: 'order-1', orderNumber: 'ORD-1', customerId: 'cust-1', items: [] };
    const { status, json } = await httpRequest(port, 'POST', '/orders', badBody);
    expect(status).toBe(400);
    expect(json.error).toBe('ValidationError');
    expect(Array.isArray(json.details)).toBe(true);
  });

  it('POST /orders generic error in controller -> 500 via ErrorPresenter', async () => {
    const body = {
      id: 'order-error',
      orderNumber: 'ORD-1',
      customerId: 'cust-1',
      items: [{ sku: 'SKU-1', qty: 1, unitPrice: 10, lineTotal: 10 }],
    };
    const { status, json } = await httpRequest(port, 'POST', '/orders', body);
    expect(status).toBe(500);
    expect(json).toMatchObject({ error: 'InternalServerError', message: 'boom' });
  });

  it('POST /orders non-Error value in controller -> 500 "Unknown error"', async () => {
    const body = {
      id: 'order-nonerror',
      orderNumber: 'ORD-1',
      customerId: 'cust-1',
      items: [{ sku: 'SKU-1', qty: 1, unitPrice: 10, lineTotal: 10 }],
    };
    const { status, json } = await httpRequest(port, 'POST', '/orders', body);
    expect(status).toBe(500);
    expect(json).toMatchObject({ error: 'InternalServerError', message: 'Unknown error' });
  });

  it('PATCH /orders/:id/status success -> 204', async () => {
    const { status } = await httpRequest(port, 'PATCH', '/orders/order-1/status', { status: 'PROCESSING' });
    expect(status).toBe(204);
  });

  it('PATCH /orders/:id/status invalid payload -> 400 via Zod + ErrorPresenter', async () => {
    const { status, json } = await httpRequest(port, 'PATCH', '/orders/order-1/status', { status: 'INVALID' });
    expect(status).toBe(400);
    expect(json.error).toBe('ValidationError');
  });
});