import { Commitment, PublicKey } from "@solana/web3.js";

export const DEFAULT_COMMITMENT: Commitment = "finalized";
export const GLOBAL_ACCOUNT_SEED = "global";
export const PUMP_FUN_PROGRAM_ID = new PublicKey('6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P');
export const mplTokenMetadata = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');
export const eventAuthority = new PublicKey('Ce6TQqeHC9p8KetsN6JsjHK7UTZk7nasjjnr7XxXp9F1');
export const pumpFeeRecipient = new PublicKey("68yFSZxzLWJXkxxRGydZ63C6mHx1NLEDWmwN9Lb5yySg");


export enum MemeError {
    ExceedsMaxAmount = 6000,
    ContributorAlreadyExists = 6001,
    FundClosed = 6002,
    InvalidMemeId = 6003,
    ArithmeticOverflow = 6004,
    Unauthorized = 6005,
    FundExpired = 6006,
    FundStillActive = 6007,
    ExceedsMaxAllowedAmount = 6008,
    CommissionRateTooHigh = 6009,
    InvalidFundDuration = 6010,
    InsufficientBalance = 6011,
    SameWalletAddress = 6012,
    MaxContributorsReached = 6013,
    ExceedsMaxFundLimit = 6014,
    BelowMinAmount = 6015,
    BelowMinAllowedAmount = 6016,
    ExceedsMaxBuyAmount = 6017,
    InvalidBuyAmount = 6018,
    SymbolTooLong = 6019,
    NameTooLong = 6020,
    InvalidFeeRecipient = 6021,
    ATACreationFailed = 6022,
    AlreadyClaimed = 6023,
    ZeroClaimAmount = 6024,
    InsufficientVaultBalance = 6025,
    ZeroContributionAmount = 6026,
    NoFundsInRegistry = 6027,
    NotAllTokensClaimed = 6028,
    NoRewardsToClaim = 6029,
    ClaimTimeNotReached = 6030,
}

export const MemeErrorMessage: Record<MemeError, string> = {
    [MemeError.ExceedsMaxAmount]: "Contribution exceeds maximum allowed amount.",
    [MemeError.ContributorAlreadyExists]: "This contributor has already participated",
    [MemeError.FundClosed]: "Fund is closed",
    [MemeError.InvalidMemeId]: "Invalid meme id",
    [MemeError.ArithmeticOverflow]: "Arithmetic overflow",
    [MemeError.Unauthorized]: "Unauthorized",
    [MemeError.FundExpired]: "Fund has expired",
    [MemeError.FundStillActive]: "Fund is still active",
    [MemeError.ExceedsMaxAllowedAmount]: "Contribution exceeds maximum allowed amount",
    [MemeError.CommissionRateTooHigh]: "Commission rate too high",
    [MemeError.InvalidFundDuration]: "Invalid fund duration",
    [MemeError.InsufficientBalance]: "Insufficient balance",
    [MemeError.SameWalletAddress]: "Same wallet address",
    [MemeError.MaxContributorsReached]: "Maximum contributors reached",
    [MemeError.ExceedsMaxFundLimit]: "Exceeds maximum fund limit",
    [MemeError.BelowMinAmount]: "Contribution is below the minimum allowed amount",
    [MemeError.BelowMinAllowedAmount]: "Below minimum allowed amount",
    [MemeError.ExceedsMaxBuyAmount]: "Exceeds maximum buy amount",
    [MemeError.InvalidBuyAmount]: "Invalid buy amount",
    [MemeError.SymbolTooLong]: "Symbol is too long",
    [MemeError.NameTooLong]: "Name is too long",  
    [MemeError.InvalidFeeRecipient]: "Invalid fee recipient",
    [MemeError.ATACreationFailed]: "ATA creation failed",
    [MemeError.AlreadyClaimed]: "Already claimed",
    [MemeError.ZeroClaimAmount]: "Zero claim amount",
    [MemeError.InsufficientVaultBalance]: "Insufficient vault balance",
    [MemeError.ZeroContributionAmount]: "Zero contribution amount",
    [MemeError.NoFundsInRegistry]: "No funds in registry",
    [MemeError.NotAllTokensClaimed]: "Not all tokens have been claimed yet",
    [MemeError.NoRewardsToClaim]: "No rewards to claim",
    [MemeError.ClaimTimeNotReached]: "Claim time not reached",
  };
