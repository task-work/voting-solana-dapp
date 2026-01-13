/* eslint-disable @typescript-eslint/no-require-imports */

import fs from "fs";
import * as anchor from '@coral-xyz/anchor';
import { Program, web3 } from '@coral-xyz/anchor';
import { PublicKey, Keypair } from '@solana/web3.js';
import { beforeAll, describe, expect, it } from 'vitest';
import { Voting } from '../target/types/voting';
import { BankrunProvider, startAnchor } from 'anchor-bankrun';

const IDL = require("../target/idl/voting.json");

//编写智能合约时的ProgramId
// const votingAddress = new PublicKey("JAVuBXeBZqXNtS73azhBDAoYaaAFfo4gWXoZe2e7Jf8H");

//部署后的实际ProgramId（编写时的ProgramId不变则部署后的实际ProgramId也不变）
const votingAddress = new PublicKey("9tXQHgJbzREGBx7FGRBiiY87F2qxBGJabWZ5Zn4wQa94");
describe('Voting', () => {

  let context;
  let provider;
  //仅用于部署前的测试
  // let votingProgram: anchor.Program<Voting>;

  //以下3行代码用于切换智能合约的部署和执行环境
  anchor.setProvider(anchor.AnchorProvider.env());
  console.log("env", anchor.AnchorProvider.env());
  const votingProgram = anchor.workspace.Voting as Program<Voting>;

  // beforeAll(async () => {
  //   //仅用于部署前的测试
  //    context = await startAnchor("", [{name: "voting", programId: votingAddress}], []);
  //    provider = new BankrunProvider(context);
  //    votingProgram = new Program<Voting>(IDL, provider);
  // });

  let pollPublicKey: PublicKey;

  //初始化投票
  it('Initialize Poll', async () => {

    const [pollAddress] = PublicKey.findProgramAddressSync(
      [Buffer.from("poll"), new anchor.BN(1).toArrayLike(Buffer, "le", 8)],
      votingProgram.programId
    );
    pollPublicKey = pollAddress;

    await votingProgram.methods.initializePoll(
      new anchor.BN(1),
      "What is your favorite type of peanut butter?",
      new anchor.BN(0),
      new anchor.BN(1778540744)   
    ).accountsPartial({ poll:  pollAddress}).rpc();

    const poll = await votingProgram.account.poll.fetch(pollAddress);
    console.log("Poll Address:", pollAddress.toBase58());
    console.log("Poll Data:", poll);

    //pollId 是否 = 1 的断言
    expect(poll.pollId.toNumber()).toEqual(1);
    expect(poll.description).toEqual("What is your favorite type of peanut butter?");
    expect(poll.pollStart.toNumber()).toBeLessThan(poll.pollEnd.toNumber());
  });

  //初始化候选人
  it("initialize Candidate", async () => {

    //初始化 Smooth 候选人
    const [smoothAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, 'le', 8), Buffer.from("Smooth")],
      votingAddress
    );
    console.log("Smooth Address:", smoothAddress.toBase58());

    await votingProgram.methods.initializeCandidate(
      "Smooth",
      new anchor.BN(1),
    ).accountsPartial({ 
      poll: pollPublicKey,
    }).rpc();

    const smoothCandidate = await votingProgram.account.candidate.fetch(smoothAddress);
    console.log("Smooth Address:", smoothAddress.toBase58());
    console.log("Smooth Candidate:", smoothCandidate);

    expect(smoothCandidate.candidateName).toEqual("Smooth");
    expect(smoothCandidate.candidateVotes.toNumber()).toEqual(0);

    //初始化 Crunchy 候选人
    const [crunchyAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, 'le', 8), Buffer.from("Crunchy")],
      votingAddress
    );

    await votingProgram.methods.initializeCandidate(
      "Crunchy",
      new anchor.BN(1),
    ).accountsPartial({ 
      poll:  pollPublicKey, 
    }).rpc();

    const crunchyCandidate = await votingProgram.account.candidate.fetch(crunchyAddress);
    console.log("Crunchy Address:", crunchyAddress.toBase58());
    console.log("Crunchy Candidate:", crunchyCandidate);

    expect(crunchyCandidate.candidateName).toEqual("Crunchy");
    expect(crunchyCandidate.candidateVotes.toNumber()).toEqual(0);
  });

  //投票
  it("vote", async () => {
    await votingProgram.methods.vote(
      "Smooth",
      new anchor.BN(1),
    ).rpc();

    const [smoothAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, 'le', 8), Buffer.from("Smooth")],
      votingAddress
    );
    const smoothCandidate = await votingProgram.account.candidate.fetch(smoothAddress);
    console.log("Smooth Address:", smoothAddress.toBase58());
    console.log("Smooth Candidate:", smoothCandidate);
    expect(smoothCandidate.candidateVotes.toNumber()).toEqual(1);
  }); 
})
