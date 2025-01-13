import { NextResponse } from 'next/server';
import SSEManager from '@/lib/sse/sse-manager';

export async function POST(request: Request) {
  try {
    const { type, data } = await request.json();
    const sseManager = SSEManager.getInstance();
    
    await sseManager.broadcast(type, data);
    
    return NextResponse.json({ success: true });
  } catch  {
    return NextResponse.json(
      { success: false, error: 'Failed to broadcast' },
      { status: 500 }
    );
  }
}