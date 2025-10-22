# RankMyApp Orders Service

Serviço de pedidos

## Como executar (Docker Compose)

Pré-requisitos:
- Docker e Docker Compose instalados
- Opcional: criar `.env` a partir de `.env.example` para ajustar variáveis

1) Subir os serviços (API, MongoDB, RabbitMQ):

```bash
docker-compose up -d
```

2) Verificar saúde da API:
- `GET http://localhost:3000/health` deve responder `{ "status": "ok" }`

3) RabbitMQ Management UI:
- URL: `http://localhost:15672/` (usuário `guest`, senha `guest`)
- Broker: `amqp://guest:guest@localhost:5672`

4) MongoDB:
- Conexão padrão via `mongodb://localhost:27017`, database `ordersdb`

Variáveis padrão (podem ser sobrescritas via `.env`):
- `PORT=3000`
- `MONGO_URL=mongodb://mongo:27017`
- `MONGO_DB=ordersdb`
- `RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672`
- `LOG_LEVEL=info`

## Stack utilizada

- Runtime: Node.js + TypeScript
- HTTP: Express
- Validação: Zod
- Mensageria: RabbitMQ (`amqplib`)
- Persistência: MongoDB
- Infra: Docker + Docker Compose
- Logging: `pino`
- Testes: Jest (unitários e integração)
- Qualidade: ESLint

## Cobertura de testes e decisões técnicas

Cobertura atual (referência observada):
- Statements: ~87.5%
- Branches: ~69.5%
- Functions: ~87.8%

Principais decisões técnicas:

Como rodar cobertura localmente:
```bash
npm run test:cov
```

## Diagrama de arquitetura

<img width="3107" height="3041" alt="image" src="https://github.com/user-attachments/assets/c30370b9-924e-453d-924a-025e3a7bc0c6" />

O serviço de pedidos se comunica com outros microsserviços de forma assíncrona via RabbitMQ.
Eventos de domínio, como OrderCreated e OrderStatusUpdated, são gerados no domínio e empacotados como EventEnvelope pelo EventFactory.
Esses eventos são enviados para a porta IEventDispatcher, cuja implementação RabbitMQEventDispatcher publica no exchange orders.events (tipo topic, durable: true).
A routing key é derivada do nome do evento (OrderCreated → order.created).
Outros microsserviços, como billing e shipping, criam filas com bindings para o exchange.
Cada serviço consome mensagens conforme o tipo de evento que lhe interessa.
A comunicação é totalmente desacoplada: o produtor não conhece os consumidores.

O serviço HTTP é stateless, permitindo escalar réplicas atrás de um Load Balancer com health checks. O RabbitMQ usa exchanges duráveis e filas próprias por microsserviço; múltiplos consumidores com prefetch adequado aumentam throughput, com DLQ e retries para falhas. O MongoDB deve ter replica set e índices nas queries críticas, com sharding se necessário.

Estrutura de pastas principal:

```
src/
├─ domain/            (entidades, VOs, eventos, erros)
├─ application/       (use-cases, dto, events, ports)
├─ interface/
│  ├─ http/           (controllers, routes, presenters)
│  ├─ messaging/      (rabbitmq dispatcher)
│  └─ persistence/    (mongo repository)
└─ infra/
   ├─ server/         (createApp + middleware)
   ├─ health/         (healthcheck)
   ├─ config/         (dotenv + defaults)
   └─ logger.ts       (logging)
```

## Endpoints principais

- `GET /health`: verificação de saúde
- `GET /orders/:id`: retorna pedido
- `POST /orders`: cria pedido
- `PATCH /orders/:id/status`: atualiza status do pedido
