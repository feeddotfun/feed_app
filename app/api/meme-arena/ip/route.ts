import { NextResponse } from 'next/server';
import { getIpAddress } from '@/lib/utils';

export async function GET(req: Request) {
  const ip = getIpAddress(req);
  return NextResponse.json({ ip });
}