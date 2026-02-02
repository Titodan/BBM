import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { deleteShiur } from '@/lib/shiurim-data';
import { deleteAudio, extractFileName } from '@/lib/r2-client';

/**
 * DELETE /api/admin/delete
 * Delete a shiur
 */
export async function DELETE(req: NextRequest) {
  try {
    // Check authentication
    await requireAuth();

    const { searchParams } = new URL(req.url);
    const shiurId = searchParams.get('shiurId');
    const folderPathParam = searchParams.get('folderPath');

    if (!shiurId || !folderPathParam) {
      return NextResponse.json(
        { error: 'Shiur ID and folder path are required' },
        { status: 400 }
      );
    }

    const folderPath = JSON.parse(folderPathParam);

    if (!Array.isArray(folderPath)) {
      return NextResponse.json(
        { error: 'Invalid folder path' },
        { status: 400 }
      );
    }

    // Delete shiur from metadata
    const deletedShiur = await deleteShiur(shiurId, folderPath);

    if (!deletedShiur) {
      return NextResponse.json(
        { error: 'Shiur not found' },
        { status: 404 }
      );
    }

    // Delete audio file from R2
    try {
      const fileName = extractFileName(deletedShiur.audioUrl);
      await deleteAudio(fileName);
    } catch (error) {
      console.error('Failed to delete audio file from R2:', error);
      // Continue even if R2 deletion fails
    }

    return NextResponse.json({
      success: true,
      shiur: deletedShiur,
    });
  } catch (error) {
    console.error('Delete shiur error:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete shiur' },
      { status: 500 }
    );
  }
}
