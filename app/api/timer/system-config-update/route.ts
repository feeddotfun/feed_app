import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { SystemConfigTimerService } from '@/lib/services/system-config-timer.service';

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
    const timerService = SystemConfigTimerService.getInstance();
    //const nextUpdate = await timerService.scheduleConfigUpdate();

    return NextResponse.json({ 
      success: true,
    });
  } catch (error) {
    console.error('Failed to update system config:', error);
    return NextResponse.json(
      { error: 'Failed to update system config' },
      { status: 500 }
    );
  }
}