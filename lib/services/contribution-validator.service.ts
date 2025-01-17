import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import MemeArenaSession from "../database/models/meme-arena-session.model";
import SystemConfig from "../database/models/system-config.model";

export class ContributionValidator {
    static async validateContribution(sessionId: string, amount: number): Promise<{
        isValid: boolean;
        error?: string;
        remainingAmount?: number;
    }> {
        const session = await MemeArenaSession.findById(sessionId);
        if (!session) {
            return { isValid: false, error: 'Session not found' };
        }

        const config = await SystemConfig.getConfig();
        const totalFundLimit = config.totalFundLimit;

        // Get current total contributions for the session
        const currentTotal = session.totalContributions || 0;

        // Calculate remaining available amount
        const remainingAmount = Math.max(0, totalFundLimit - currentTotal);

        if (remainingAmount === 0) {
            return { 
                isValid: false, 
                error: 'Maximum session contribution limit reached',
                remainingAmount: 0
            };
        }

        // Check if new contribution would exceed limit
        if (amount > remainingAmount) {
            return { 
                isValid: false, 
                error: `Contribution would exceed session limit. Maximum available: ${remainingAmount / LAMPORTS_PER_SOL} SOL`,
                remainingAmount
            };
        }

        // Check minimum contribution
        if (amount < config.minContributionSol * LAMPORTS_PER_SOL) {
            return { 
                isValid: false, 
                error: `Minimum contribution is ${config.minContributionSol} SOL`,
                remainingAmount
            };
        }

        // Check maximum contribution
        const maxUserContribution = Math.min(
            config.maxContributionSol * LAMPORTS_PER_SOL,
            remainingAmount
        );
        if (amount > maxUserContribution) {
            return { 
                isValid: false, 
                error: `Maximum contribution is ${maxUserContribution / LAMPORTS_PER_SOL} SOL`,
                remainingAmount
            };
        }

        const newRemainingAmount = remainingAmount - amount;

        return { isValid: true, remainingAmount: newRemainingAmount };
    }
}