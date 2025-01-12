import { NextResponse } from 'next/server';
import { getDashboardStats } from '@/lib/actions/dashboard.action';
import { BaseResponse, DashboardStats } from '@/types';

export async function GET() {
  try {
    const data = await getDashboardStats();
    const response: BaseResponse<DashboardStats> = {
      items: [data],
      total: 1
    };
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}