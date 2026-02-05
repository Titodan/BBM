import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { moveShiur, moveFolder } from '@/lib/shiurim-data';

/**
 * POST /api/admin/move
 * Move a shiur or folder to a different location
 */
export async function POST(req: NextRequest) {
  try {
    // Check authentication
    await requireAuth();

    const { type, itemId, sourcePath, targetPath } = await req.json();

    if (!type || !['shiur', 'folder'].includes(type)) {
      return NextResponse.json(
        { error: 'Type must be "shiur" or "folder"' },
        { status: 400 }
      );
    }

    if (type === 'shiur') {
      if (!itemId) {
        return NextResponse.json(
          { error: 'Shiur ID is required' },
          { status: 400 }
        );
      }

      if (!sourcePath || !Array.isArray(sourcePath)) {
        return NextResponse.json(
          { error: 'Source path is required' },
          { status: 400 }
        );
      }

      if (!targetPath || !Array.isArray(targetPath)) {
        return NextResponse.json(
          { error: 'Target path is required' },
          { status: 400 }
        );
      }

      await moveShiur(itemId, sourcePath, targetPath);
    } else if (type === 'folder') {
      if (!sourcePath || !Array.isArray(sourcePath) || sourcePath.length === 0) {
        return NextResponse.json(
          { error: 'Source path is required and must not be empty' },
          { status: 400 }
        );
      }

      if (!Array.isArray(targetPath)) {
        return NextResponse.json(
          { error: 'Target path must be an array' },
          { status: 400 }
        );
      }

      // Prevent moving category folders at root level
      const categoryFolders = ['gemara', 'sefarim', 'shmoozim'];
      if (sourcePath.length === 1) {
        const folderId = sourcePath[0].toLowerCase();
        if (categoryFolders.some(cat => folderId.startsWith(cat))) {
          return NextResponse.json(
            { error: 'Cannot move category folders (Gemara, Sefarim, Shmoozim)' },
            { status: 403 }
          );
        }
      }

      await moveFolder(sourcePath, targetPath);
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('Move error:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to move item' },
      { status: 500 }
    );
  }
}
