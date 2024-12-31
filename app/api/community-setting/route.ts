import { getSystemConfigAndVotes, submitVote } from '@/lib/actions/community-setting.action';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const data = await getSystemConfigAndVotes();
    return NextResponse.json(data);
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

   

    return NextResponse.json(result);
  } catch (error: any) {
    console.log(error)
    return NextResponse.json(
      { error: error.message || 'Failed to submit vote' },
      { status: 500 }
    );
  }
}