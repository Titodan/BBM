import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getShiurimLibrary, saveShiurimLibrary } from '@/lib/shiurim-data';
import { ShiurFolder } from '@/types';

/**
 * POST /api/admin/migrate-folders
 * Migrate Pesachim folder to Gemara category
 */
export async function POST(req: NextRequest) {
  try {
    // Check authentication
    await requireAuth();

    const library = await getShiurimLibrary();
    
    // Find Pesachim folder at root level
    const pesachimIndex = library.folders.findIndex(f => 
      f.name.toLowerCase().includes('pesachim') || 
      f.id.toLowerCase().includes('pesachim')
    );

    if (pesachimIndex === -1) {
      return NextResponse.json({
        success: false,
        message: 'No Pesachim folder found at root level',
      });
    }

    // Find or create Gemara folder
    let gemaraFolder = library.folders.find(f => 
      f.id.toLowerCase().startsWith('gemara')
    );

    if (!gemaraFolder) {
      // Create Gemara folder
      gemaraFolder = {
        id: `gemara-${Date.now()}`,
        name: 'Gemara',
        createdDate: new Date().toISOString(),
        folders: [],
        shiurim: [],
      };
      library.folders.push(gemaraFolder);
    }

    // Move Pesachim folder to Gemara
    const pesachimFolder = library.folders[pesachimIndex];
    library.folders.splice(pesachimIndex, 1);
    gemaraFolder.folders.push(pesachimFolder);

    // Ensure Sefarim and Shmoozim folders exist
    const categories = [
      { id: 'sefarim', name: 'Sefarim' },
      { id: 'shmoozim', name: 'Shmoozim' },
    ];

    for (const category of categories) {
      const exists = library.folders.some(f => 
        f.id.toLowerCase().startsWith(category.id)
      );
      if (!exists) {
        library.folders.push({
          id: `${category.id}-${Date.now()}`,
          name: category.name,
          createdDate: new Date().toISOString(),
          folders: [],
          shiurim: [],
        });
      }
    }

    // Save updated library
    await saveShiurimLibrary(library);

    return NextResponse.json({
      success: true,
      message: 'Pesachim folder moved to Gemara successfully',
    });
  } catch (error) {
    console.error('Migration error:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to migrate folders' },
      { status: 500 }
    );
  }
}
