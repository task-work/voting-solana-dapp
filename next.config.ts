/** eslint-disable @typescript-eslint/no-explicit-any */
import type { NextConfig } from 'next';
import { config } from 'dotenv';
import path from 'path';

// choose environment file by NODE_ENV
const envFileMap: Record<string, string> = {
  test: '.env.test',
  development: '.env.development',
  production: '.env.production',
}

const envFile = envFileMap[process.env.NODE_ENV || 'development'] || '.env.development';

// load the specified environment file
config({ path: path.resolve(process.cwd(), envFile) })

const nextConfig: NextConfig = {
  allowedDevOrigins: ['10.0.0.128', 'api.devnet.solana.com'],
  env: {
    NEXT_PUBLIC_SOLANA_NETWORK: process.env.NEXT_PUBLIC_SOLANA_NETWORK,
    NEXT_PUBLIC_PROGRAM_ID: process.env.NEXT_PUBLIC_PROGRAM_ID,
  },
}

export default nextConfig;
