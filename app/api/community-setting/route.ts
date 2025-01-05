import { getSystemConfigAndVotes, submitVote } from '@/lib/actions/community-setting.action';
import SystemConfigVotes from '@/lib/database/models/system-config-votes.model';
import { BaseResponse, CommunitySettingData } from '@/types';
import { NextRequest, NextResponse } from 'next/server';

import { VOTING_PERIOD } from '@/constants/community-setting.config';

import { sendUpdate } from "@/app/api/sse/route";

export async function GET() {
  try {
    const data = await getSystemConfigAndVotes();
    const response: BaseResponse<CommunitySettingData> = {
      items: [data],
      total: 1
    };
    return NextResponse.json(response);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch community settings' }, 
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    //!! just testing
    const clientIp = (Math.random() + 1).toString(36)

    const result = await submitVote({
      ...body,
      voterIpAddress: clientIp
    });

    if (result.success) {
      const updatedVote = await SystemConfigVotes.find({
        settingKey: body.settingKey,
        lastResetTime: { $gt: new Date(Date.now() - VOTING_PERIOD) }
      }).lean();

      sendUpdate('vote-update',{
        data: {
          settingKey: body.settingKey,
          vote: updatedVote,
          timestamp: Date.now()
        }
      });
    }
    return NextResponse.json(result);
  } catch (error: any) {
    console.log(error)
    return NextResponse.json(
      { error: error.message || 'Failed to submit vote' },
      { status: 500 }
    );
  }
}