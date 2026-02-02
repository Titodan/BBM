import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { uploadAudio } from '@/lib/r2-client';
import { addShiurToFolder } from '@/lib/shiurim-data';
import { ShiurRecording } from '@/types';

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const ALLOWED_TYPES = ['audio/mpeg', 'audio/mp3', 'audio/m4a', 'audio/wav', 'audio/x-m4a'];

// Configure Vercel to allow larger payloads
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '100mb',
    },
  },
};

// Set maximum duration for serverless function (Vercel)
export const maxDuration = 60; // 60 seconds

/**
 * POST /api/admin/upload
 * Upload audio file and metadata
 */
export async function POST(req: NextRequest) {
  try {
    // Check authentication
    await requireAuth();

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const recordedDate = formData.get('recordedDate') as string;
    const folderPath = JSON.parse(formData.get('folderPath') as string || '[]');

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

    if (folderPath.length === 0) {
      return NextResponse.json(
        { error: 'Must select a folder for the shiur' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type) && !file.name.match(/\.(mp3|m4a|wav)$/i)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only MP3, M4A, and WAV files are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 100MB.' },
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
    const audioUrl = await uploadAudio(buffer, fileName, file.type);

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
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
