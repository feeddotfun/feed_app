'use server'

// ** DB
import { connectToDatabase } from "../database/mongoose";
import SystemConfigVotes from "../database/models/system-config-votes.model";
import SystemConfig from "../database/models/system-config.model";

// ** Types
import sanitize from "mongo-sanitize";
import mongoose from "mongoose";
import SystemConfigCommunityVote from "../database/models/system-config-community-vote.model";
import { sendUpdate } from "./sse";


// ** Constants
import { VOTING_PERIOD, SETTINGS_CONFIG } from "@/constants/community-setting.config";
import { updateProgramConfig } from "./program.action";

export async function getSystemConfig() {
  await connectToDatabase();
  
  const config = await SystemConfig.getConfig();
  
  return {
    maxContributionSol: config.maxContributionSol,
    minContributionSol: config.minContributionSol
  };
}

// Get current system config and votes
export async function getSystemConfigAndVotes() {
  await connectToDatabase();
  
  const config = await SystemConfig.getConfig();
  
  const votes = await SystemConfigVotes.find({
    isActive: true
  });

  const mostRecentVote = votes.reduce((latest, current) => 
    latest.lastResetTime > current.lastResetTime ? latest : current
  , { lastResetTime: new Date(0) });

  const votingStartTime = mostRecentVote.lastResetTime;
  const votingEndTime = new Date(votingStartTime.getTime() + VOTING_PERIOD);

  const responseData = { 
    config: config.toObject(), 
    votes: votes.map(vote => vote.toObject()),
    settings: SETTINGS_CONFIG,
    votingStartTime: votingStartTime.toISOString(),
    votingEndTime: votingEndTime.toISOString()
  };

  return JSON.parse(JSON.stringify(responseData));
}

// Submit a vote for a system config setting
export async function submitVote(data: {
  voter: string;
  voterIpAddress: string;
  settingKey: string;
  selectedValue: number;
}) {
  await connectToDatabase();
  const sanitized = sanitize(data);
  const dbSession = await mongoose.startSession();

  try {
    dbSession.startTransaction();

    let latestVote = await SystemConfigVotes.findOne({
      isActive: true
    }).sort({ lastResetTime: -1, _id: -1 });


    if (!latestVote) {
      const now = new Date();
      const votingPeriodId = now.getTime().toString();
      
      const initialVotes = [];
      for (const [settingKey, setting] of Object.entries(SETTINGS_CONFIG)) {
        for (const option of setting.options) {
          initialVotes.push({
            settingKey,
            optionValue: option.value,
            votes: 0,
            lastResetTime: now,
            isActive: true,
            votingPeriodId
          });
        }
      }
      
      await SystemConfigVotes.insertMany(initialVotes, { session: dbSession });
      
      latestVote = await SystemConfigVotes.findOne({
        isActive: true
      }).sort({ lastResetTime: -1, _id: -1 }).session(dbSession);
    }
    
    if (!latestVote) {
      throw new Error('Failed to create voting period');
    }
    
    // Verify the value is valid for this setting
    const setting = SETTINGS_CONFIG[sanitized.settingKey as keyof typeof SETTINGS_CONFIG];
    if (!setting) {
      throw new Error('Invalid setting key');
    }

    const isValidOption = setting.options.some(opt => opt.value === sanitized.selectedValue);
    if (!isValidOption) {
      throw new Error('Invalid option value for this setting');
    }

    // Check if user has already voted for this setting within voting period
    const existingVote = await SystemConfigCommunityVote.findOne({
      $or: [
        { voter: sanitized.voter, settingKey: sanitized.settingKey, votingPeriodId: latestVote.votingPeriodId },
        { voterIpAddress: sanitized.voterIpAddress, settingKey: sanitized.settingKey, votingPeriodId: latestVote.votingPeriodId }
      ],
      isActive: true
    }).session(dbSession);

    if (existingVote) {
      throw new Error('Already voted for this setting in the current period');
    }

    // Create the vote record
    await SystemConfigCommunityVote.create([{
      ...sanitized,
      votedAt: new Date(),
      votingPeriodId: latestVote.votingPeriodId,
      isActive: true
    }], { session: dbSession });

    // Update vote counts
    const updatedVote = await SystemConfigVotes.findOneAndUpdate(
      {
        settingKey: sanitized.settingKey,
        optionValue: sanitized.selectedValue,
        votingPeriodId: latestVote.votingPeriodId,
        isActive: true
      },
      { $inc: { votes: 1 } },
      { new: true, session: dbSession }
    );

    if (!updatedVote) {
      throw new Error('Failed to update vote count');
    }

    await dbSession.commitTransaction();

    const allVotes = await SystemConfigVotes.find({
      settingKey: sanitized.settingKey,
      votingPeriodId: latestVote.votingPeriodId,
      isActive: true
    });
    
     // Notify clients of the config update
     sendUpdate({
      type: 'vote-update',
      data: {
        settingKey: sanitized.settingKey,
        vote: allVotes,
        timestamp: Date.now()
      }
    });

    return { success: true, votingPeriodId: latestVote.votingPeriodId };
  } catch (error) {
    await dbSession.abortTransaction();
    throw error;
  } finally {
    dbSession.endSession();
  }
}

// Update System Config Most Votes
export async function updateSystemConfigWithWinningVotes() {
  await connectToDatabase();

  try {
    // Get all votes from the previous period
    const previousPeriodStart = new Date(Date.now() - VOTING_PERIOD);
    const votes = await SystemConfigVotes.find({
      lastResetTime: { 
        $gt: previousPeriodStart 
      },
      isActive: true
    });

    // Group votes by settingKey
    const votesBySetting = votes.reduce((acc, vote) => {
      if (!acc[vote.settingKey]) {
        acc[vote.settingKey] = [];
      }
      acc[vote.settingKey].push(vote);
      return acc;
    }, {} as Record<string, typeof votes>);

    // Find winning votes and update system config
    const updateData: Record<string, number> = {};
    
    for (const [settingKey, settingVotes] of Object.entries(votesBySetting)) {
      if (settingVotes.length === 0) continue;

      // Find the option with most votes
      const winningVote = settingVotes.reduce((prev, current) => 
        current.votes > prev.votes ? current : prev
      );

      if (winningVote.votes > 0) {
        updateData[settingKey] = winningVote.optionValue;
      }
    }

    // Update system config if there are any winning votes
    if (Object.keys(updateData).length > 0) {
      const updatedConfig = await SystemConfig.findOneAndUpdate(
        {},
        updateData,
        { new: true }
      );

       // Update Solana program config
       const programUpdates = {
        minBuyAmount: updateData.minContributionSol,
        maxBuyAmount: updateData.maxContributionSol,
        // Convert milliseconds to seconds for the program
        fundDuration: updateData.fundDuration ? Math.floor(updateData.fundDuration / 1000) : undefined
      };

      const filteredUpdates = Object.fromEntries(
        Object.entries(programUpdates).filter(([_, value]) => value !== undefined)
      );

      if (Object.keys(filteredUpdates).length > 0) {
        await updateProgramConfig(filteredUpdates);
      }

      // Notify clients of all config updates
      for (const [setting, value] of Object.entries(updateData)) {
        sendUpdate({
          type: 'config-update',
          setting,
          value
        });
      }

      return {
        success: true,
        updatedConfig: updatedConfig?.toObject()
      };
    }

    return {
      success: true,
      updatedConfig: null
    };

  } catch (error) {
    console.error('Failed to update system config with winning votes:', error);
    return {
      success: false,
      error
    };
  }
}