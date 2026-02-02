import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getShiurimLibrary } from '@/lib/shiurim-data';

/**
 * GET /api/admin/library
 * Get the entire shiurim library (requires authentication)
 */
export async function GET() {
  try {
    // Check authentication
    await requireAuth();

    const library = await getShiurimLibrary();

    return NextResponse.json(library);
  } catch (error) {
    console.error('Get library error:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to load library' },
      { status: 500 }
    );
  }
}
