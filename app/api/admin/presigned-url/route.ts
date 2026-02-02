import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getPresignedUploadUrl } from '@/lib/r2-client';

/**
 * POST /api/admin/presigned-url
 * Generate a presigned URL for direct upload to R2
 */
export async function POST(req: NextRequest) {
  try {
    // Check authentication
    await requireAuth();

    const { fileName, contentType } = await req.json();

    if (!fileName || !contentType) {
      return NextResponse.json(
        { error: 'fileName and contentType are required' },
        { status: 400 }
      );
    }

    // Generate presigned URL (valid for 1 hour)
    const uploadUrl = await getPresignedUploadUrl(fileName, contentType, 3600);

    return NextResponse.json({
      uploadUrl,
      fileName,
    });
  } catch (error) {
    console.error('Presigned URL error:', error);
    
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate upload URL' },
      { status: 500 }
    );
  }
}
