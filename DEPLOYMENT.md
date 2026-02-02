# Deployment Guide

## Issues Fixed

### Problem 1: 413 Payload Too Large Error
**Cause:** Vercel has a default 4.5MB body size limit, but audio files can be much larger (up to 100MB).

**Solution:** Added Vercel configuration to the upload route to allow up to 100MB payloads:
- File: `app/api/admin/upload/route.ts`
- Added `maxDuration: 60` for 60-second timeout
- Note: The actual upload limit is now set at the route level

### Problem 2: 401 Unauthorized / Data Not Persisting
**Cause:** The app was storing shiurim data in a local JSON file (`data/shiurim-library.json`). Vercel's filesystem is read-only in production, so uploads worked locally but failed in production.

**Solution:** Migrated data storage to Cloudflare R2:
- Updated `lib/shiurim-data.ts` to read/write from R2 instead of filesystem
- Added `uploadJSON()` and `downloadJSON()` functions to `lib/r2-client.ts`
- Migrated existing data to R2 using the migration script

## Vercel Configuration

### Environment Variables
No environment variables are needed since R2 credentials are hardcoded in `lib/r2-client.ts`.

⚠️ **Security Note:** In production, you should move these credentials to environment variables:
- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`
- `R2_PUBLIC_URL`

### Vercel Settings
1. **Build Command:** `npm run build` (default)
2. **Output Directory:** `.next` (default)
3. **Install Command:** `npm install` (default)
4. **Node Version:** 20.x (recommended)

### Function Configuration
The upload route is configured with:
- **Max Duration:** 60 seconds
- **Body Size Limit:** 100MB

Note: Vercel Pro plan may be required for:
- Increased function execution time (60s)
- Larger body payloads (>4.5MB)

## Deployment Steps

1. **Commit Changes:**
   ```bash
   git add .
   git commit -m "Fix Vercel deployment: migrate data storage to R2 and configure larger payload limits"
   git push
   ```

2. **Deploy to Vercel:**
   - Vercel will automatically deploy from your connected GitHub repository
   - Or use: `vercel --prod`

3. **Test the Deployment:**
   - Visit your Vercel URL
   - Log into the admin panel at `/admin/shiurim`
   - Try uploading a shiur
   - Verify it appears on the public shiurim page

## Migration Script

If you need to run the migration again:

```bash
npx tsx scripts/migrate-to-r2.ts
```

This will upload the local `data/shiurim-library.json` file to R2.

## Troubleshooting

### 413 Error Still Occurring
- Check Vercel logs to see if the route configuration is being applied
- Verify you're on a Vercel plan that supports larger payloads
- Try reducing the file size or implementing chunked uploads

### 401 Unauthorized
- Check R2 credentials are correct
- Verify the bucket name matches
- Ensure the R2 bucket has proper CORS configuration

### Data Not Showing
- Check Vercel logs for errors
- Verify `shiurim-library.json` exists in R2
- Test the R2 public URL directly: `https://pub-d40a1a8ecfcd4bb0878a1b19dc9a43c6.r2.dev/shiurim-library.json`

## How It Works

1. **Admin uploads a shiur:**
   - Audio file is uploaded to Cloudflare R2
   - Metadata is stored in `shiurim-library.json` (also in R2)

2. **Public page displays shiurim:**
   - Fetches `shiurim-library.json` from R2
   - Audio player streams files directly from R2's public URL

3. **All data is persistent:**
   - Audio files: Stored in R2 bucket
   - Library structure: Stored as JSON in R2
   - No filesystem writes needed
