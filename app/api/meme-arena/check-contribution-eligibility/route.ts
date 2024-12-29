import { checkContributionEligibility } from '@/lib/actions/meme-arena.action'
import { CheckContributionEligibilityDto } from '@/types';
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const body: CheckContributionEligibilityDto = await request.json();
  let ip = request.headers.get("x-real-ip") || 
           request.headers.get("x-forwarded-for")?.split(',')[0].trim() || 
           ''

  const isLocal = ip === "::1" || ip === "127.0.0.1"

  if (isLocal) {
    ip = "127.0.0.1"
  } else if (ip?.includes(':')) {
    ip = ip.replace(/^.*:/, '')
  }

  const result = await checkContributionEligibility(body.memeId, body.contributor, ip!);
  return NextResponse.json({ result });
}