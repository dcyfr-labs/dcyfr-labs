import { NextRequest, NextResponse } from 'next/server';
import { unifiedCostAggregator } from '@/lib/unified-cost-aggregator';

export async function GET(request: NextRequest) {
  try {
    const period = (request.nextUrl.searchParams.get('period') || '30d') as
      | '7d'
      | '30d'
      | '90d'
      | 'all';

    const data = await unifiedCostAggregator.getUnifiedCostData(period);

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching unified cost data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cost data' },
      { status: 500 },
    );
  }
}
