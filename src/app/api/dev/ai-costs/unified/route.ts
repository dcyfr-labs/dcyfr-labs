import { NextRequest, NextResponse } from 'next/server';
import { unifiedCostAggregator } from '@/lib/unified-cost-aggregator';

/**
 * Development-only API for unified AI cost data
 * Protected by middleware in production/preview
 */
export async function GET(request: NextRequest) {
  // Defense in depth: verify dev environment (middleware already blocks in prod)
  const isDev = process.env.NODE_ENV === 'development' || process.env.VERCEL_ENV === 'development';
  if (!isDev) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

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
