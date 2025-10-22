import { MongoClient, Db } from 'mongodb';
import { config } from '../config';
import { logger } from '../logger';

export async function connectMongo(): Promise<Db> {
  const client = await MongoClient.connect(config.MONGO_URL);
  logger.info({ url: config.MONGO_URL, db: config.MONGO_DB }, 'Connected to MongoDB');
  return client.db(config.MONGO_DB);
}