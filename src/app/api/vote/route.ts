/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-require-imports */

import type { ActionGetResponse, ActionPostRequest } from "@solana/actions";
import { ACTIONS_CORS_HEADERS, createPostResponse } from "@solana/actions";
import { PublicKey, Transaction } from '@solana/web3.js';
import { BN, Program, AnchorProvider } from '@coral-xyz/anchor';
import { NextRequest } from "next/server";
import { connection, programPublicKey } from "@/config/index";

// localnet env
// import { Voting } from "@/../anchor/target/types/voting";                   
// const IDL = require('@/../anchor/target/idl/voting.json');             

import { Voting } from "@/anchor/test/types/voting";               //copy from /anchor/target/types
const IDL = require('@/anchor/test/idl/voting.json');              //copy from /anchor/target/idl

export const OPTIONS = async (req: NextRequest) => {
  return new Response(null, {
    status: 204,
    headers: ACTIONS_CORS_HEADERS
  });
};

export async function GET(request: Request) {
    const actionMetadata: ActionGetResponse = {
        icon: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSJWHgdc9FkIl1zWA3g9h7HvChErXQJAuXAIw&s",
        title: "Vote for your favorite type of peanut butter!",
        description: "Vote between crunchy and smooth peanut butter.",
        label: "Vote",
        links: {
            actions: [
                {
                    label: "Vote for Crunchy",
                    href: "/api/vote?candidate=Crunchy",
                    type: 'post'
                },
                {
                    label: "Vote for Smooth",
                    href: "/api/vote?candidate=Smooth",
                    type: 'post'
                }
            ]
        }
    };

    return Response.json(actionMetadata, {headers: ACTIONS_CORS_HEADERS});
}

export async function POST(request: Request) {
    console.log("programId: ", programPublicKey);
    try {
        const url = new URL(request.url);
        const candidate = url.searchParams.get("candidate");

        if(candidate != 'Crunchy' && candidate != 'Smooth') {
            return new Response("Invalid candidate", {status: 400, headers: ACTIONS_CORS_HEADERS});
        }

        // local connection and program for local env
        // const program: Program<Voting> = new Program(IDL, {connection});

        // online env
        const provider = new AnchorProvider(connection, {} as any, { commitment: 'confirmed' });
        const program: Program<Voting> = new Program(IDL, provider);

        const body: ActionPostRequest = await request.json();
        let voter;

        try {
            voter = new PublicKey(body.account);
            console.log("voter: ", voter.toBase58());
        } catch(error) {
            return new Response(`Invalid account: ${error}`, {status: 400, headers: ACTIONS_CORS_HEADERS});
        }

        try {
            const [candidatePda] = PublicKey.findProgramAddressSync(
                [new BN(1).toArrayLike(Buffer, "le", 8), Buffer.from(candidate)],
                programPublicKey
            );
            console.log("candidatePda: ", candidatePda);
        }
        catch (e) {
            console.log("candidatePda error: ", e);
        }

        const instruction = await program!.methods
        .vote(candidate, new BN(1))
        .accounts({
            signer: voter,
        })
        .instruction();

        const blockHash = await connection.getLatestBlockhash();
        const transaction = new Transaction({
            feePayer: voter,
            blockhash: blockHash.blockhash,
            lastValidBlockHeight: blockHash.lastValidBlockHeight
        }).add(instruction);

        const response = await createPostResponse({
            fields: {
                type: "transaction",
                transaction: transaction
            }
        });

        return Response.json(response, {headers: ACTIONS_CORS_HEADERS});
    }
    catch (e) {
        console.error('[vote action error]', e);
        return new Response(
            JSON.stringify({ error: String(e) }),
            { status: 500, headers: ACTIONS_CORS_HEADERS }
        );
    }
}