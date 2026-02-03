# Events Feature Setup Guide

The events management system has been successfully implemented! This guide will walk you through the final setup steps to get it running.

## ✅ What's Been Implemented

### Frontend (Public-Facing)
- **Events Listing Page** (`/events`) - Shows all published events with posters, dates, and prices
- **Event Detail & Registration** (`/events/[eventId]`) - Individual event page with registration form
- **Success Page** (`/events/[eventId]/success`) - Confirmation page after paid registrations
- **Navigation** - "Events" link added to main navbar between "Shiurim" and "Schedule"

### Admin Panel
- **Events Management** (`/admin/events`) - Create, edit, delete, publish/unpublish events
- **Poster Upload** - Direct upload to InstantDB storage
- **Real-Time Registrations** - View registrations live as they come in
- **Statistics Dashboard** - See totals for events, registrations, and paid registrations
- **Admin Navigation** - Link to events admin added to shiurim admin header

### Backend
- **InstantDB Integration** - Real-time database for events and registrations
- **Stripe Checkout** - Payment processing for paid events
- **Webhook Handler** - Automatically creates registrations after successful payment

## 🚀 What You Need to Do Next

### Step 1: Configure InstantDB Schema

The schema file has been created at `instant.schema.ts`. You need to push it to InstantDB using the CLI:

1. **Login to InstantDB CLI:**
   ```bash
   npx instant-cli@latest login
   ```
   This will open your browser to authenticate.

2. **Pull existing schema (to set up the CLI):**
   ```bash
   npx instant-cli@latest pull --app 0a72ba0c-1e03-4974-a076-07967ff37117
   ```
   This creates the connection between your local project and your InstantDB app.

3. **Push the schema:**
   ```bash
   npx instant-cli@latest push --app 0a72ba0c-1e03-4974-a076-07967ff37117
   ```
   This will push the `instant.schema.ts` file to your InstantDB app.

4. **Verify in dashboard:**
   - Go to https://instantdb.com/dash
   - Select your BBM app
   - Check that `events` and `registrations` entities appear in the Schema tab

**Note:** The schema file at `instant.schema.ts` defines both entities that the events feature needs.

### Step 2: Get InstantDB Admin Token (For Webhooks)

The Stripe webhook needs an admin token to write to InstantDB:

1. In InstantDB dashboard, go to Settings → Admin Tokens
2. Create a new admin token
3. Copy the token
4. Add it to your `.env.local`:
   ```
   INSTANTDB_ADMIN_TOKEN=your-admin-token-here
   ```

### Step 3: Test Locally

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Visit http://localhost:3000/admin/events and login

3. **Create a Free Event:**
   - Upload a poster image
   - Fill in title, date, price (set to 0 for free)
   - Click "Create Event"
   - Go to http://localhost:3000/events - you should see your event

4. **Test Free Registration:**
   - Click on the free event
   - Fill out the registration form
   - Click "Sign Up"
   - Check admin panel - registration should appear in real-time!

5. **Create a Paid Event:**
   - Create another event with price > 0 (e.g., 10.00 for $10)
   - Go to the event page
   - Fill out form and click "Pay $X.XX & Sign Up"

### Step 4: Test Stripe Payments (Local)

To test webhooks locally, you need Stripe CLI:

1. Install Stripe CLI:
   ```bash
   brew install stripe/stripe-cli/stripe
   ```

2. Login to Stripe:
   ```bash
   stripe login
   ```

3. Forward webhooks to localhost:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

4. Copy the webhook signing secret that appears in the terminal

5. Add it to `.env.local`:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

6. Restart your dev server

7. Now complete a test payment:
   - Go to a paid event
   - Use test card: `4242 4242 4242 4242`
   - Any future expiration, any CVC
   - Complete payment
   - Check admin panel - registration should appear with "Paid" status!

## 🌐 Production Deployment

### Step 1: Add Environment Variables to Vercel

Go to Vercel Dashboard → Your Project → Settings → Environment Variables

Add these variables:

```
NEXT_PUBLIC_INSTANTDB_APP_ID=0a72ba0c-1e03-4974-a076-07967ff37117
INSTANTDB_ADMIN_TOKEN=your-admin-token-from-step-2
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... (or pk_live_... for production)
STRIPE_SECRET_KEY=sk_test_... (or sk_live_... for production)
STRIPE_WEBHOOK_SECRET=(will set after creating webhook)
```

### Step 2: Deploy

```bash
git add .
git commit -m "Add events feature with InstantDB and Stripe"
git push
```

Vercel will automatically deploy.

### Step 3: Configure Stripe Webhook (Production)

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "Add endpoint"
3. Enter URL: `https://your-vercel-domain.com/api/stripe/webhook`
4. Select event: `checkout.session.completed`
5. Copy the webhook signing secret
6. Add `STRIPE_WEBHOOK_SECRET` to Vercel environment variables
7. Redeploy (or webhook won't work until next deploy)

### Step 4: Test in Production

1. Visit your production site
2. Go to `/admin/events` and create events
3. Test both free and paid registrations
4. Verify everything works!

## 📋 Features Overview

### Free Events
- Price set to $0
- Direct registration (no payment required)
- Instant confirmation
- Real-time updates in admin panel

### Paid Events
- Price set in dollars (e.g., 10.00)
- Stripe Checkout integration
- Webhook-based registration completion
- Payment tracking in admin panel

### Admin Features
- Create/edit/delete events
- Upload poster images
- Publish/unpublish events
- View all registrations in real-time
- Filter registrations by event
- See payment status for each registration
- Statistics dashboard

### Real-Time Features
- New events appear instantly (no page refresh)
- New registrations appear live in admin panel
- Changes sync across all open tabs/windows

## 🐛 Troubleshooting

### "No matches found" on events page
- Schema not configured in InstantDB
- Go back to Step 1 and add the schema

### Stripe payments not creating registrations
- Webhook secret not configured correctly
- Check Stripe CLI is running (for local testing)
- Check webhook is configured in Stripe Dashboard (for production)
- Check Vercel logs for webhook errors

### Poster upload fails
- InstantDB storage might have limits on free plan
- Check file size (try smaller image)
- Check InstantDB dashboard for storage quota

### Admin panel shows "Unauthorized"
- Use existing admin password: `admin123`
- Authentication uses the same system as shiurim admin

## 📊 Data Structure

### Events
- `id`: Unique identifier
- `title`: Event name
- `date`: ISO 8601 datetime
- `posterUrl`: InstantDB storage URL
- `price`: Price in cents (0 for free, 1000 = $10)
- `published`: Boolean (only published events show publicly)
- `createdDate`: ISO 8601 datetime

### Registrations
- `id`: Unique identifier
- `eventId`: References event
- `name`, `email`, `phone`, `address`: User info
- `registeredAt`: ISO 8601 datetime
- `paid`: Boolean (false for free, true after payment)
- `stripeSessionId`: Stripe checkout session ID (optional)

## 🎉 You're All Set!

The events feature is now ready to use. You can:

1. Create events through `/admin/events`
2. Users can register at `/events`
3. View all registrations in real-time
4. Process payments through Stripe for paid events

If you have any issues, check the troubleshooting section above or review the DEPLOYMENT.md file for more details.
