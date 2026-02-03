import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { addShiurToFolder } from '@/lib/shiurim-data';
import { uploadAudio } from '@/lib/r2-client';
import { ShiurRecording } from '@/types';

const PUBLIC_URL = 'https://pub-d40a1a8ecfcd4bb0878a1b19dc9a43c6.r2.dev';

/**
 * POST /api/admin/upload
 * Upload file to R2 and register in library
 */
export async function POST(req: NextRequest) {
  try {
    // Check authentication
    await requireAuth();

    // Parse FormData
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const recordedDate = formData.get('recordedDate') as string;
    const folderPathStr = formData.get('folderPath') as string;

    // Validate inputs
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!title || !recordedDate) {
      return NextResponse.json(
        { error: 'Missing required fields: title or recordedDate' },
        { status: 400 }
      );
    }

    const folderPath = JSON.parse(folderPathStr || '[]');
    if (!folderPath || folderPath.length === 0) {
      return NextResponse.json(
        { error: 'Must select a folder for the shiur' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const ext = file.name.split('.').pop();
    const fileName = `${sanitizedTitle}-${timestamp}.${ext}`;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to R2
    const audioUrl = await uploadAudio(buffer, fileName, file.type || 'audio/mpeg');

    // Get audio duration (simplified - in production use a library like music-metadata)
    // For now, we'll set it to 0 and can update it later
    const duration = 0;

    // Create shiur recording
    const shiur: ShiurRecording = {
      id: `${sanitizedTitle}-${timestamp}`,
      title,
      recordedDate,
      duration,
      audioUrl,
      fileSize: file.size,
      uploadedDate: new Date().toISOString(),
    };

    // Add to library
    await addShiurToFolder(shiur, folderPath);

    return NextResponse.json({
      success: true,
      shiur,
    });
  } catch (error) {
    console.error('Upload error:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload shiur' },
      { status: 500 }
    );
  }
}
