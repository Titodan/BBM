import { NextRequest, NextResponse } from 'next/server';
import { init } from '@instantdb/admin';

/**
 * POST /api/admin/upload-poster
 * Upload event poster to InstantDB storage (server-side with admin token)
 */
export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const authRes = await fetch(new URL('/api/admin/library', req.url).toString(), {
      headers: req.headers,
    });
    
    if (!authRes.ok) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Initialize InstantDB admin client
    const db = init({
      appId: process.env.NEXT_PUBLIC_INSTANTDB_APP_ID!,
      adminToken: process.env.INSTANTDB_ADMIN_TOKEN || '',
    });

    // Get form data
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const filename = `event-poster-${timestamp}.${fileExtension}`;

    // Convert File to ArrayBuffer for InstantDB
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Upload to InstantDB storage
    await (db as any).storage.upload(filename, buffer);
    
    console.log('Upload successful, getting download URL...');
    
    // Get the signed download URL from InstantDB
    const downloadUrl = await (db as any).storage.getDownloadUrl(filename);
    
    console.log('Download URL:', downloadUrl);
    
    return NextResponse.json({
      url: downloadUrl,
      filename: filename,
    });
  } catch (error) {
    console.error('Poster upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload poster' },
      { status: 500 }
    );
  }
}
