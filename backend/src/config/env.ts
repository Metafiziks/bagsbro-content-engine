import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(8080),
  HOST: z.string().default('0.0.0.0'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),

  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // Redis
  REDIS_URL: z.string().default('redis://localhost:6379'),

  // Frontend
  FRONTEND_URL: z.string().default('http://localhost:3000'),

  // Chain
  CHAIN_RPC_URL: z.string().default('https://mainnet.base.org'),
  CHAIN_ID: z.coerce.number().default(8453),

  // Oracle (optional until contracts deployed)
  ORACLE_PRIVATE_KEY: z.string().optional(),

  // Contract addresses (optional until deployed)
  BALLERS_TOKEN_ADDRESS: z.string().optional(),
  NFT_STAKING_ADDRESS: z.string().optional(),
  TOKEN_STAKING_ADDRESS: z.string().optional(),
  SEASON_MANAGER_ADDRESS: z.string().optional(),
  GOVERNANCE_VOTING_ADDRESS: z.string().optional(),
  PREDICTION_MARKET_ADDRESS: z.string().optional(),
  BOOST_MANAGER_ADDRESS: z.string().optional(),
  TREASURY_ADDRESS: z.string().optional(),

  // Twitter (optional until Phase 5)
  TWITTER_API_KEY: z.string().optional(),
  TWITTER_API_SECRET: z.string().optional(),
  TWITTER_ACCESS_TOKEN: z.string().optional(),
  TWITTER_ACCESS_SECRET: z.string().optional(),
  TWITTER_BEARER_TOKEN: z.string().optional(),

  // AI (optional until Phase 4)
  OPENAI_API_KEY: z.string().optional(),
  ELEVENLABS_API_KEY: z.string().optional(),

  // GCP
  GCP_PROJECT_ID: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;

export type Env = z.infer<typeof envSchema>;
