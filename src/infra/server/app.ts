import express from 'express';
import { Router } from 'express';
import { buildHealthRoutes } from '../health/healthcheck';

export function createApp(orderRoutes: Router) {
  const app = express();

  app.use(express.json());
  app.use(buildHealthRoutes());
  app.use(orderRoutes);

  return app;
}