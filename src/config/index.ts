import { Connection, PublicKey } from "@solana/web3.js";

export const SOLANA_NETWORK = process.env.NEXT_PUBLIC_SOLANA_NETWORK!;
export const SOLANA_PROGRAM_ID = process.env.NEXT_PUBLIC_SOLANA_PROGRAM_ID!;

export const connection = new Connection(SOLANA_NETWORK, "confirmed");
export const programPublicKey = new PublicKey(SOLANA_PROGRAM_ID);