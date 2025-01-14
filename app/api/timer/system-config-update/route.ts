import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '@/lib/database/mongoose';
import { SETTINGS_CONFIG, VOTING_PERIOD } from '@/constants/community-setting.config';
import SystemConfigVotes from '@/lib/database/models/system-config-votes.model';
import { sendUpdate } from "@/lib/utils";
import { updateSystemConfigWithWinningVotes } from '@/lib/actions/community-setting.action';

const verifyQStashSignature = async (req: NextRequest): Promise<boolean> => {
  const signature = req.headers.get('upstash-signature');
  if (!signature) {
    return false;
  }

  const signingKey = process.env.QSTASH_CURRENT_SIGNING_KEY!;
  
  try {
    jwt.verify(signature, signingKey);
    return true;
  } catch {
    return false;
  }
};

export async function POST(req: NextRequest) {
  if (!await verifyQStashSignature(req)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  try {
    await connectToDatabase();

    // First update system config with winning votes from previous period
    const updateResult = await updateSystemConfigWithWinningVotes();
    if (!updateResult.success) {
      throw updateResult.error;
    }
    
    const now = new Date();
    
    for (const [settingKey, setting] of Object.entries(SETTINGS_CONFIG)) {
      for (const option of setting.options) {
        await SystemConfigVotes.create({
          settingKey,
          optionValue: option.value,
          votes: 0,
          lastResetTime: now
        });
      }
    }

    sendUpdate('voting-period-reset', {
      votingStartTime: now.toISOString(),
      votingEndTime: new Date(now.getTime() + VOTING_PERIOD).toISOString()
    });

    return NextResponse.json({ 
      success: true,
      executedAt: now.toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update system config' },
      { status: 500 }
    );
  }
}