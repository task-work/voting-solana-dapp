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

// load contract file root dir
const programEnv = process.env.PROGRAM_ENV || 'dev';
const programPathMap: Record<string, string> = {
  dev: 'anchor/target',
  test: 'src/anchor/test',
  production: 'src/anchor/production',
};
const programDir = programPathMap[programEnv];
if (!programDir) {
  throw new Error(`Unknown PROGRAM_ENV: ${programEnv}`);
}

console.log("programDir", programDir);

const nextConfig: NextConfig = {
  allowedDevOrigins: ['10.0.0.128', 'api.devnet.solana.com'],
  // Environmental variable
  env: {
    NEXT_PUBLIC_SOLANA_NETWORK: process.env.NEXT_PUBLIC_SOLANA_NETWORK,
    NEXT_PUBLIC_PROGRAM_ID: process.env.NEXT_PUBLIC_PROGRAM_ID,
  },
  // contract file root dir used @program
  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@program': path.resolve(process.cwd(), programDir),
    };
    return config;
  },
}

export default nextConfig;
