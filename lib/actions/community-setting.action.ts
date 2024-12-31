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
const VOTING_PERIOD = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
import { SETTINGS_CONFIG } from "@/constants/community-setting-config";

// Get current system config and votes
export async function getSystemConfigAndVotes() {
  await connectToDatabase();
  
  const config = await SystemConfig.getConfig();
  const votes = await SystemConfigVotes.find({
    lastResetTime: { 
      $gt: new Date(Date.now() - VOTING_PERIOD) 
    }
  });

  // Get or create voting session timestamps
  let votingStartTime = new Date(Date.now() - 1000 * 60 * 60); // 1 hour ago
  let votingEndTime = new Date(Date.now() + VOTING_PERIOD - (1000 * 60 * 60)); // 23 hours from now

  // Initialize votes for all config options
  for (const [settingKey, setting] of Object.entries(SETTINGS_CONFIG)) {
    for (const option of setting.options) {
      const existingVote = votes.find(v => 
        v.settingKey === settingKey && v.optionValue === option.value
      );
      
      if (!existingVote) {
        await SystemConfigVotes.create({
          settingKey,
          optionValue: option.value,
          votes: 0,
          lastResetTime: votingStartTime
        });
      } else {
        // If we have existing votes, use their lastResetTime
        votingStartTime = existingVote.lastResetTime;
        votingEndTime = new Date(votingStartTime.getTime() + VOTING_PERIOD);
      }
    }
  }

  // Re-fetch votes after initialization
  const currentVotes = await SystemConfigVotes.find({
    lastResetTime: { 
      $gt: new Date(Date.now() - VOTING_PERIOD) 
    }
  });

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
        { voter: sanitized.voter, settingKey: sanitized.settingKey },
        { voterIpAddress: sanitized.voterIpAddress, settingKey: sanitized.settingKey }
      ],
      votedAt: { $gt: new Date(Date.now() - VOTING_PERIOD) }
    }).session(dbSession);

    if (existingVote) {
      throw new Error('Already voted for this setting in the current period');
    }

    // Create the vote record
    await SystemConfigCommunityVote.create([{
      ...sanitized,
      votedAt: new Date()
    }], { session: dbSession });

    // Update vote counts
    const updatedVote = await SystemConfigVotes.findOneAndUpdate(
      {
        settingKey: sanitized.settingKey,
        optionValue: sanitized.selectedValue,
        lastResetTime: { $gt: new Date(Date.now() - VOTING_PERIOD) }
      },
      { $inc: { votes: 1 } },
      { new: true, session: dbSession }
    );

    if (!updatedVote) {
      throw new Error('Failed to update vote count');
    }

    await dbSession.commitTransaction();


    sendUpdate({
      type: 'vote-update',
      settingKey: sanitized.settingKey,
      votes: await SystemConfigVotes.find({
        settingKey: sanitized.settingKey,
        lastResetTime: { $gt: new Date(Date.now() - VOTING_PERIOD) }
      })
    });

    // Get all votes for this setting to calculate if this is now the winning option
    const allVotes = await SystemConfigVotes.find({
      settingKey: sanitized.settingKey,
      lastResetTime: { $gt: new Date(Date.now() - VOTING_PERIOD) }
    });

    const winningVote = allVotes.reduce((prev, current) => 
      current.votes > prev.votes ? current : prev
    );

    // If this is the winning option, update the system config
    if (winningVote.optionValue === sanitized.selectedValue) {
      await SystemConfig.findOneAndUpdate(
        {},
        { [sanitized.settingKey]: sanitized.selectedValue }
      );

      // Notify clients of the config update
      sendUpdate({
        type: 'config-update',
        setting: sanitized.settingKey,
        value: sanitized.selectedValue
      });
    }

    return { success: true };
  } catch (error) {
    await dbSession.abortTransaction();
    throw error;
  } finally {
    dbSession.endSession();
  }
}
