/** eslint-disable @typescript-eslint/no-explicit-any */
import type { NextConfig } from 'next';
import fs from 'fs';
// import { config } from 'dotenv';
import path from 'path';

// load contract file root dir
const env = process.env.PROGRAM_ENV || 'development';
const contractPathMap: Record<string, string> = {
  development: 'anchor/target',
  test: 'src/anchor/test',
  production: 'src/anchor/production',
};

console.log("env: ", env);

const sourceContractDir = contractPathMap[env];
if (!sourceContractDir) {
  throw new Error(`Unknown PROGRAM_ENV: ${env}`);
}

console.log("contract dir: ", sourceContractDir);

const targetContractDir = 'src/anchor/run-time';
copyDir(sourceContractDir, targetContractDir);

const nextConfig: NextConfig = {
  allowedDevOrigins: ['10.0.0.128'],
  // Environmental variable
  // env: {
  //   NEXT_PUBLIC_SOLANA_NETWORK: process.env.NEXT_PUBLIC_SOLANA_NETWORK,
  //   NEXT_PUBLIC_SOLANA_PROGRAM_ID: process.env.NEXT_PUBLIC_SOLANA_PROGRAM_ID,
  //   NEXT_PUBLIC_SOLANA_PROGRAM_DIR: process.env.NEXT_PUBLIC_SOLANA_PROGRAM_DIR
  // },
  // contract file root dir used @program
  // webpack: (config) => {
  //   config.resolve = config.resolve || {};
  //   config.resolve.alias = {
  //     ...(config.resolve.alias || {}),
  //     '@program': path.resolve(process.cwd(), programDir),
  //   };
  //   return config;
  // },
}

function copyDir(src: string, dest: string) {
  fs.rmSync(dest, { recursive: true, force: true })
  fs.mkdirSync(dest, { recursive: true })

  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath)
    } else {
      fs.copyFileSync(srcPath, destPath)
    }
  }
}

export default nextConfig;
