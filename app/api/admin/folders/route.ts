import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { createFolder, deleteFolder, renameFolder } from '@/lib/shiurim-data';
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
 * PATCH /api/admin/folders
 * Rename a folder
 */
export async function PATCH(req: NextRequest) {
  try {
    // Check authentication
    await requireAuth();

    const { folderPath, newName } = await req.json();

    if (!folderPath || !Array.isArray(folderPath) || folderPath.length === 0) {
      return NextResponse.json(
        { error: 'Folder path is required' },
        { status: 400 }
      );
    }

    if (!newName) {
      return NextResponse.json(
        { error: 'New name is required' },
        { status: 400 }
      );
    }

    // Prevent renaming category folders at root level
    const categoryFolders = ['gemara', 'sefarim', 'shmoozim'];
    if (folderPath.length === 1) {
      const folderId = folderPath[0].toLowerCase();
      if (categoryFolders.some(cat => folderId.startsWith(cat))) {
        return NextResponse.json(
          { error: 'Cannot rename category folders (Gemara, Sefarim, Shmoozim)' },
          { status: 403 }
        );
      }
    }

    await renameFolder(folderPath, newName);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('Rename folder error:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to rename folder' },
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

    // Prevent deletion of category folders at root level
    const categoryFolders = ['gemara', 'sefarim', 'shmoozim'];
    if (folderPath.length === 1) {
      const folderId = folderPath[0].toLowerCase();
      if (categoryFolders.some(cat => folderId.startsWith(cat))) {
        return NextResponse.json(
          { error: 'Cannot delete category folders (Gemara, Sefarim, Shmoozim)' },
          { status: 403 }
        );
      }
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
