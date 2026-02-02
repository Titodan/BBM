import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { createFolder, deleteFolder } from '@/lib/shiurim-data';
import { deleteAudio, extractFileName } from '@/lib/r2-client';

/**
 * POST /api/admin/folders
 * Create a new folder
 */
export async function POST(req: NextRequest) {
  try {
    // Check authentication
    await requireAuth();

    const { name, parentPath = [] } = await req.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Folder name is required' },
        { status: 400 }
      );
    }

    // Create folder
    const folder = await createFolder(name, parentPath);

    return NextResponse.json({
      success: true,
      folder,
    });
  } catch (error) {
    console.error('Create folder error:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create folder' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/folders
 * Delete a folder and all its contents
 */
export async function DELETE(req: NextRequest) {
  try {
    // Check authentication
    await requireAuth();

    const { searchParams } = new URL(req.url);
    const folderPathParam = searchParams.get('path');

    if (!folderPathParam) {
      return NextResponse.json(
        { error: 'Folder path is required' },
        { status: 400 }
      );
    }

    const folderPath = JSON.parse(folderPathParam);

    if (!Array.isArray(folderPath) || folderPath.length === 0) {
      return NextResponse.json(
        { error: 'Invalid folder path' },
        { status: 400 }
      );
    }

    // Delete folder and get all shiurim that were deleted
    const deletedShiurim = await deleteFolder(folderPath);

    // Delete all audio files from R2
    const deletePromises = deletedShiurim.map(shiur => {
      const fileName = extractFileName(shiur.audioUrl);
      return deleteAudio(fileName).catch(err => {
        console.error(`Failed to delete ${fileName}:`, err);
      });
    });

    await Promise.all(deletePromises);

    return NextResponse.json({
      success: true,
      deletedCount: deletedShiurim.length,
    });
  } catch (error) {
    console.error('Delete folder error:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete folder' },
      { status: 500 }
    );
  }
}
