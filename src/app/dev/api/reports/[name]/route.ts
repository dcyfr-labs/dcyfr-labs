import { NextRequest, NextResponse } from 'next/server';
import { assertDevOr404 } from '@/lib/dev-only';
import fs from 'fs';
import path from 'path';

/**
 * Dev Reports API - Serves generated reports for dev tools
 * 
 * This route is only accessible in development mode (protected by proxy.ts).
 * Reports are stored in /.reports/ directory (outside public/).
 * 
 * Usage:
 *   GET /dev/api/reports/design-system-report.json
 *   GET /dev/api/reports/design-system-report.txt
 */

// Only allow specific report names for security
const ALLOWED_REPORTS = [
  'design-system-report.json',
  'design-system-report.txt',
];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  // Defense-in-depth: explicit environment check for Vercel Fluid Compute optimization
  assertDevOr404();
  
  const { name } = await params;

  // Validate report name
  if (!ALLOWED_REPORTS.includes(name)) {
    return NextResponse.json(
      { error: 'Report not found' },
      { status: 404 }
    );
  }

  // Build path to report file
  const reportsDir = path.join(process.cwd(), '.reports');
  const reportPath = path.join(reportsDir, name);

  // Check if file exists
  if (!fs.existsSync(reportPath)) {
    return NextResponse.json(
      { 
        error: 'Report not generated yet',
        hint: 'Run: node scripts/validate-design-tokens.mjs'
      },
      { status: 404 }
    );
  }

  // Read and return the report
  const content = fs.readFileSync(reportPath, 'utf-8');
  
  // Determine content type
  const isJson = name.endsWith('.json');
  const contentType = isJson ? 'application/json' : 'text/plain';

  return new NextResponse(content, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'no-store',
    },
  });
}
