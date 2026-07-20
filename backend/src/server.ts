// ============================================
// Bags Bro! — Autonomous Content Engine Server
// ============================================

import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import multipart from '@fastify/multipart';
import cookie from '@fastify/cookie';
import session from '@fastify/session';
import { env } from './config/env';
import { registerAuthRoutes } from './api/handlers/auth';
import { registerFarmerRoutes } from './services/farmer/routes';
import { startWorkers } from './jobs';

async function main() {
  const app = Fastify({
    logger: {
      level: env.LOG_LEVEL,
      ...(env.NODE_ENV === 'development'
        ? { transport: { target: 'pino-pretty', options: { colorize: true } } }
        : {}),
    },
    trustProxy: true,
  });

  // ---- Plugins ----

  await app.register(cors, {
    origin: [env.FRONTEND_URL, 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-secret'],
    credentials: true,
  });

  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
    allowList: (req) => req.url === '/health',
  });

  await app.register(multipart, { limits: { fileSize: 10 * 1024 * 1024 } });
  await app.register(cookie);
  await app.register(session, {
    secret: process.env.SESSION_SECRET!,
    cookie: { secure: env.NODE_ENV === 'production', httpOnly: true, sameSite: 'lax' },
    saveUninitialized: false,
  });

  // ---- Health ----
  app.get('/health', async () => ({ ok: true }));

  // ---- Routes ----
  await registerAuthRoutes(app);
  await registerFarmerRoutes(app);

  // ---- Workers ----
  startWorkers();

  await app.listen({ port: env.PORT, host: env.HOST });
  console.log(`🌾 Bags Bro! Content Engine running on ${env.HOST}:${env.PORT} [${env.NODE_ENV}]`);
}

main().catch((err) => {
  console.error('❌ Server failed to start:', err);
  process.exit(1);
});
