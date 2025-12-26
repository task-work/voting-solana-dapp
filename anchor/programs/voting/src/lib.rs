use anchor_lang::prelude::{borsh::de, *};

declare_id!("JAVuBXeBZqXNtS73azhBDAoYaaAFfo4gWXoZe2e7Jf8H");

#[program]
pub mod voting {
    use super::*;

    /**
     * 初始化投票
     */
    pub fn initialize_poll(_ctx: Context<InitializePoll>, 
        _poll_id: u64, 
        _description: String,
        _poll_start: u64, 
        _poll_end: u64) -> Result<()> {
            
            let poll = &mut _ctx.accounts.poll;
            poll.poll_id = _poll_id;
            poll.description = _description;
            poll.poll_start = _poll_start;
            poll.poll_end = _poll_end;
            poll.candidate_amount = 0;

        Ok(())
    }

    /***
     * 初始化候选人
     */
    pub fn initialize_candidate(_ctx: Context<InitializeCandidate>, 
        _candidate_name: String, 
        _poll_id: u64) -> Result<()> {
            let candidate = &mut _ctx.accounts.candidate;
            let poll = &mut _ctx.accounts.poll;
            poll.candidate_amount += 1;                                         //候选人数量+1
            candidate.candidate_name = _candidate_name;
            candidate.candidate_votes = 0;

        Ok(())
    }
    pub fn vote(_ctx: Context<Vote>, _candidate_name: String, _poll_id: u64) -> Result<()> {
        let candidate = &mut _ctx.accounts.candidate;
        candidate.candidate_votes += 1;                                         //候选人得票数+1
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(candidate_name: String, poll_id: u64)]                    //传入的参数  
pub struct Vote<'info> {
    pub signer: Signer<'info>,                                          // 签名者账户(做投票动作的用户)

    #[account(                                                          
        seeds = [poll_id.to_le_bytes().as_ref()],
        bump
    )]
    pub poll: Account<'info, Poll>,                                     // 投票话题的PDA账户（在创建话题成功时已存在）                

    #[account(                                                          // 该账户要是可变的，票数才会增加, 所以要加 mut 参数
        mut,
        seeds = [poll_id.to_le_bytes().as_ref(), candidate_name.as_bytes()],   
        bump,
    )]
    pub candidate: Account<'info, Candidate>,                           // 候选人的PDA账户（初始化候选人成功时已存在）                       

    pub system_program: Program<'info, System>, 
}

#[derive(Accounts)]
#[instruction(candidate_name: String, poll_id: u64)]                    //传入的参数  
pub struct InitializeCandidate<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,                                          // 签名者账户(为创建候选人的PDA地址, 签名的账户)
    
    #[account(
        mut,                                                            // 该账户要是可变的，候选人数量才会增加, 所以要加 mut 参数
        seeds = [poll_id.to_le_bytes().as_ref()],                       // 投票话题的PDA账户（在创建话题成功时已存在）
        bump
    )]
    pub poll: Account<'info, Poll>,            

    #[account(
        init,
        payer = signer,
        space = 8 + Candidate::INIT_SPACE,
        seeds = [poll_id.to_le_bytes().as_ref(), candidate_name.as_bytes()],    // PDA地址的种子
        bump,
    )]
    pub candidate: Account<'info, Candidate>,                                   // 创建后的候选人账户(PDA地址)

    pub system_program: Program<'info, System>, 
}

#[derive(Accounts)]
#[instruction(poll_id: u64)]                                            //传入的参数  
pub struct InitializePoll<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,                                          // 签名者账户(为创建投票话题（某个投票的）PDA地址, 签名的账户)
    #[account(
        init,
        payer = signer,
        space = 8 + Poll::INIT_SPACE,
        seeds = [poll_id.to_le_bytes().as_ref()],    // PDA地址的种子
        bump,
    )]
    pub poll: Account<'info, Poll>,             // 创建后的投票话题账户(PDA地址),以上的宏，是对该账户的基本定义，如指定了创建这个账户的手续费支付者,保存数据的空间大小
    pub system_program: Program<'info, System>,  // 系统程序账户
}

/**
 * 投票话题账户结构体
 */
#[account]
#[derive(InitSpace)]
pub struct Poll {
    pub poll_id: u64,                           // 投票话题ID
    #[max_len(280)]
    pub description: String,                    // 投票话题描述 
    pub poll_start: u64,                        // 投票开始时间（时间戳）
    pub poll_end: u64,                          // 投票结束时间（时间戳）
    pub candidate_amount: u64,                  // 候选人数量
}

#[account]
#[derive(InitSpace)]
pub struct Candidate {
    #[max_len(100)]
    pub candidate_name: String,                             // 候选人名称
    pub candidate_votes: u64,                               // 得票数
}



