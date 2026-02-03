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

## Events Feature Setup

### InstantDB Configuration

The events feature uses InstantDB for real-time data management of events and registrations.

1. **Create InstantDB Account:**
   - Go to [https://instantdb.com](https://instantdb.com)
   - Sign up for a free account
   - Create a new app (e.g., "BBM Events")

2. **Configure Schema:**
   - Login to InstantDB CLI: `npx instant-cli@latest login`
   - Pull to link your project: `npx instant-cli@latest pull --app YOUR_APP_ID`
   - Push the schema: `npx instant-cli@latest push --app YOUR_APP_ID`
   - The schema is defined in `instant.schema.ts` in the project root

3. **Get Your App ID:**
   - Copy your App ID from the InstantDB dashboard
   - Add it to your environment variables (see below)

### Stripe Configuration

The events feature uses Stripe for paid event registrations.

1. **Create/Login to Stripe Account:**
   - Go to [https://stripe.com](https://stripe.com)
   - Create an account or log in to existing

2. **Get API Keys (Test Mode):**
   - In Stripe Dashboard, toggle to "Test mode" (top right)
   - Go to Developers → API Keys
   - Copy both keys:
     - **Publishable key** (starts with `pk_test_...`)
     - **Secret key** (starts with `sk_test_...`)

3. **Configure Webhook (After Deployment):**
   - Go to Developers → Webhooks
   - Click "Add endpoint"
   - Enter your webhook URL: `https://yourdomain.com/api/stripe/webhook`
   - Select event: `checkout.session.completed`
   - Copy the webhook signing secret (starts with `whsec_...`)

4. **Test with Stripe Test Cards:**
   - Use test card: `4242 4242 4242 4242`
   - Any future expiration date
   - Any 3-digit CVC

### Local Testing with Stripe Webhooks

For local development, use Stripe CLI to forward webhooks:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Use the webhook signing secret displayed in the terminal
```

## Vercel Configuration

### Environment Variables

Add these environment variables in Vercel (Settings → Environment Variables):

**InstantDB:**
- `NEXT_PUBLIC_INSTANTDB_APP_ID` - Your InstantDB App ID
- `INSTANTDB_ADMIN_TOKEN` - Admin token from InstantDB (for webhook operations)

**Stripe:**
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key (pk_test_... for test mode)
- `STRIPE_SECRET_KEY` - Stripe secret key (sk_test_... for test mode)
- `STRIPE_WEBHOOK_SECRET` - Webhook signing secret from Stripe dashboard

**R2 (for shiurim - already configured):**
- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`
- `R2_PUBLIC_URL`

**Note:** For production, use live Stripe keys (`pk_live_...` and `sk_live_...`) and ensure R2 credentials are moved to environment variables.

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

3. **Configure Environment Variables in Vercel:**
   - Go to Vercel dashboard → Settings → Environment Variables
   - Add all required variables (see Environment Variables section above)
   - Redeploy to apply the changes

4. **Set Up Stripe Webhook:**
   - In Stripe Dashboard, add webhook endpoint with your production URL
   - Copy the webhook secret and update `STRIPE_WEBHOOK_SECRET` in Vercel
   - Redeploy again to apply the webhook secret

5. **Test the Deployment:**
   - Visit your Vercel URL
   - Log into the admin panel at `/admin/shiurim` or `/admin/events`
   - **Test Shiurim:** Try uploading a shiur
   - **Test Events:** Create a free event and a paid event
   - **Test Registration:** Register for a free event and complete a paid event registration
   - Verify everything appears correctly

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

### Shiurim Feature
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

### Events Feature
1. **Admin creates an event:**
   - Poster image uploaded to InstantDB storage
   - Event metadata stored in InstantDB (title, date, price, etc.)
   - Real-time updates: Event appears immediately on public page

2. **Free event registration:**
   - User fills form on event page
   - Registration saved directly to InstantDB
   - Admin sees registration in real-time

3. **Paid event registration:**
   - User fills form and clicks "Pay & Sign Up"
   - Redirected to Stripe Checkout
   - After successful payment, Stripe webhook saves registration to InstantDB
   - User redirected to success page

4. **All data is real-time:**
   - Events: Stored in InstantDB with real-time sync
   - Registrations: Stored in InstantDB with real-time updates
   - Poster images: Stored in InstantDB storage
   - Admin panel updates automatically when new registrations come in
