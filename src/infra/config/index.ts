import dotenv from 'dotenv';
dotenv.config();

export const config = {
    PORT: process.env.PORT || '3000',
    MONGO_URL: process.env.MONGO_URL || 'mongodb://mongo:27017',
    MONGO_DB: process.env.MONGO_DB || 'ordersdb',
    RABBITMQ_URL: process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672',
    LOG_LEVEL: process.env.LOG_LEVEL || 'info'
}