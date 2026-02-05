import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { renameShiur } from '@/lib/shiurim-data';

/**
 * PATCH /api/admin/shiurim
 * Rename a shiur
 */
export async function PATCH(req: NextRequest) {
  try {
    // Check authentication
    await requireAuth();

    const { shiurId, folderPath, newTitle } = await req.json();

    if (!shiurId) {
      return NextResponse.json(
        { error: 'Shiur ID is required' },
        { status: 400 }
      );
    }

    if (!folderPath || !Array.isArray(folderPath)) {
      return NextResponse.json(
        { error: 'Folder path is required' },
        { status: 400 }
      );
    }

    if (!newTitle) {
      return NextResponse.json(
        { error: 'New title is required' },
        { status: 400 }
      );
    }

    await renameShiur(shiurId, folderPath, newTitle);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('Rename shiur error:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to rename shiur' },
      { status: 500 }
    );
  }
}
