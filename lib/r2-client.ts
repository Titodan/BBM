import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Hardcoded credentials - Updated with new token
const R2_ACCOUNT_ID = '76607767b99e07476386f8339a5cfc07';
const R2_ACCESS_KEY_ID = 'da18b5f563699f4fcad733025941b83c';
const R2_SECRET_ACCESS_KEY = '7725956509711b262843c2a3fe72f72773ce6c16959298a31e5b487a62eff168';
const BUCKET_NAME = 'bbm';
const PUBLIC_URL = 'https://pub-d40a1a8ecfcd4bb0878a1b19dc9a43c6.r2.dev';

// Initialize R2 S3 Client
const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

/**
 * Upload an audio file to R2
 * @param file - File buffer
 * @param fileName - Name to save the file as
 * @param contentType - MIME type of the file
 * @returns Public URL of the uploaded file
 */
export async function uploadAudio(
  file: Buffer,
  fileName: string,
  contentType: string
): Promise<string> {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: file,
      ContentType: contentType,
    });

    await r2Client.send(command);

    // Return the public URL
    return `${PUBLIC_URL}/${fileName}`;
  } catch (error) {
    console.error('Error uploading to R2:', error);
    throw new Error('Failed to upload audio file');
  }
}

/**
 * Delete an audio file from R2
 * @param fileName - Name of the file to delete
 */
export async function deleteAudio(fileName: string): Promise<void> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
    });

    await r2Client.send(command);
  } catch (error) {
    console.error('Error deleting from R2:', error);
    throw new Error('Failed to delete audio file');
  }
}

/**
 * Generate a presigned URL for temporary access to a file
 * @param fileName - Name of the file
 * @param expiresIn - Expiration time in seconds (default: 1 hour)
 * @returns Presigned URL
 */
export async function getPresignedUrl(
  fileName: string,
  expiresIn: number = 3600
): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
    });

    return await getSignedUrl(r2Client, command, { expiresIn });
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    throw new Error('Failed to generate presigned URL');
  }
}

/**
 * Generate a presigned URL for uploading a file directly to R2
 * @param fileName - Name of the file to upload
 * @param contentType - MIME type of the file
 * @param expiresIn - Expiration time in seconds (default: 1 hour)
 * @returns Presigned URL for PUT request
 */
export async function getPresignedUploadUrl(
  fileName: string,
  contentType: string,
  expiresIn: number = 3600
): Promise<string> {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
      ContentType: contentType,
    });

    return await getSignedUrl(r2Client, command, { expiresIn });
  } catch (error) {
    console.error('Error generating presigned upload URL:', error);
    throw new Error('Failed to generate presigned upload URL');
  }
}

/**
 * Extract filename from a full R2 URL
 * @param url - Full R2 URL
 * @returns Filename
 */
export function extractFileName(url: string): string {
  return url.split('/').pop() || '';
}

/**
 * Upload JSON data to R2
 * @param data - JSON data to upload
 * @param fileName - Name to save the file as
 * @returns Public URL of the uploaded file
 */
export async function uploadJSON(
  data: any,
  fileName: string
): Promise<string> {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    const buffer = Buffer.from(jsonString, 'utf-8');

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: buffer,
      ContentType: 'application/json',
    });

    await r2Client.send(command);

    return `${PUBLIC_URL}/${fileName}`;
  } catch (error) {
    console.error('Error uploading JSON to R2:', error);
    throw new Error('Failed to upload JSON file');
  }
}

/**
 * Download JSON data from R2
 * @param fileName - Name of the file to download
 * @returns Parsed JSON data
 */
export async function downloadJSON(fileName: string): Promise<any> {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
    });

    const response = await r2Client.send(command);
    
    if (!response.Body) {
      throw new Error('No data received from R2');
    }

    // Convert stream to string
    const bodyString = await response.Body.transformToString();
    return JSON.parse(bodyString);
  } catch (error: any) {
    // If file doesn't exist, return null
    if (error.name === 'NoSuchKey' || error.Code === 'NoSuchKey') {
      return null;
    }
    console.error('Error downloading JSON from R2:', error);
    throw new Error('Failed to download JSON file');
  }
}
