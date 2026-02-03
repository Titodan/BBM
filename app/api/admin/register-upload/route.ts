import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { addShiurToFolder } from '@/lib/shiurim-data';
import { ShiurRecording } from '@/types';

const PUBLIC_URL = 'https://pub-d40a1a8ecfcd4bb0878a1b19dc9a43c6.r2.dev';

/**
 * POST /api/admin/register-upload
 * Register uploaded file in library (file already uploaded to R2)
 */
export async function POST(req: NextRequest) {
  try {
    // Check authentication
    await requireAuth();

    const { title, recordedDate, folderPath, fileName, fileSize } = await req.json();

    // Validate inputs
    if (!title || !recordedDate) {
      return NextResponse.json(
        { error: 'Missing required fields: title or recordedDate' },
        { status: 400 }
      );
    }

    if (!folderPath || folderPath.length === 0) {
      return NextResponse.json(
        { error: 'Must select a folder for the shiur' },
        { status: 400 }
      );
    }

    if (!fileName) {
      return NextResponse.json(
        { error: 'fileName is required' },
        { status: 400 }
      );
    }

    // Generate audio URL
    const audioUrl = `${PUBLIC_URL}/${fileName}`;

    // Get audio duration (simplified - in production use a library like music-metadata)
    // For now, we'll set it to 0 and can update it later
    const duration = 0;

    // Extract ID from filename (remove extension)
    const sanitizedTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const timestamp = Date.now();

    // Create shiur recording
    const shiur: ShiurRecording = {
      id: `${sanitizedTitle}-${timestamp}`,
      title,
      recordedDate,
      duration,
      audioUrl,
      fileSize: fileSize || 0,
      uploadedDate: new Date().toISOString(),
    };

    // Add to library
    await addShiurToFolder(shiur, folderPath);

    return NextResponse.json({
      success: true,
      shiur,
    });
  } catch (error) {
    console.error('Upload registration error:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to register uploaded file' },
      { status: 500 }
    );
  }
}
