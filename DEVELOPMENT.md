# Development Guide

## Current Status

✅ All components created
✅ Data structures set up
✅ Styling configured
✅ Development server running on http://localhost:3002

## To-Do Before Launch

### 1. Add Images

**Priority: HIGH**

The site requires the following images in `public/images/`:

#### Logo
- `bbm-logo.png` - Your official BBM logo

#### Rabbi Photos (in `public/images/rabbis/`)
- `rabbi-kahlani-portrait.png` - Rabbi Natan Kahlani (leadership section)
- `rabbi-hecht.png` - Rabbi Hecht
- `rabbi-bazak.png` - Rabbi Bazak
- `rabbi-hye.png` - Rabbi Hye
- `rabbi-goldstien.png` - Rabbi Goldstien

**Image Requirements:**
- Format: PNG or JPG
- Logo: 400x400px minimum (square)
- Rabbi photos: 800x800px minimum (square aspect ratio)
- Background: Preferably neutral or remove background

**Temporary Solution:**
For testing, you can create simple placeholder images or the site will show initials for missing rabbi photos.

### 2. Add Hebrew Font (Optional but Recommended)

Download and add the Taamey David CLM font:
- Place `TaameyDavidCLM.woff2` in `public/fonts/`
- This provides authentic Hebrew typography with taamim (cantillation marks)

Without this font, the site will fall back to system Hebrew fonts.

### 3. Newsletter Integration

The newsletter signup form is currently a placeholder. To make it functional:

**Option A: Use a service like Mailchimp**
1. Sign up for Mailchimp or similar
2. Create an API route in `app/api/newsletter/route.ts`
3. Update the form submission in `components/Newsletter.tsx`

**Option B: Email notifications**
1. Set up an email service (SendGrid, AWS SES, etc.)
2. Create API route to send emails
3. Store subscribers in a database or spreadsheet

### 4. Content Pages

Complete the placeholder pages:
- `app/privacy/page.tsx` - Add privacy policy
- `app/terms/page.tsx` - Add terms of service

### 5. Future Enhancements

**Shiurim Page** (`/shiurim`)
- Audio player integration
- Upload and organize shiur recordings
- Search and filter functionality

**Analytics**
- Google Analytics
- Facebook Pixel (if needed)

**Contact Form**
- Add a dedicated contact page with form

**SEO**
- Add sitemap.xml
- Add robots.txt
- Submit to search engines

## Testing Checklist

- [ ] Test on mobile devices (iPhone, Android)
- [ ] Test on tablets (iPad, etc.)
- [ ] Test on different desktop browsers (Chrome, Safari, Firefox)
- [ ] Verify all links work
- [ ] Check Hebrew text displays correctly (RTL)
- [ ] Test navigation menu on mobile
- [ ] Verify newsletter form (once integrated)
- [ ] Check page load speed
- [ ] Test smooth scrolling to sections

## Deployment Options

### Option 1: Vercel (Recommended - Easiest)
1. Push code to GitHub
2. Connect repository to Vercel
3. Deploy automatically
4. Custom domain setup available

### Option 2: Netlify
1. Push code to GitHub
2. Connect repository to Netlify
3. Configure build settings
4. Deploy

### Option 3: Self-Hosted
1. Build: `npm run build`
2. Upload build files to server
3. Configure web server (Nginx, Apache)
4. Set up SSL certificate

## Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Check for issues
npm run lint
```

## File Structure for Quick Updates

### Update Schedule
- **Davening times**: `data/davening.ts`
- **Shiurim**: `data/shiurim.ts`

### Update Rabbi Info
- **Profiles**: `data/rabbis.ts`
- **Photos**: `public/images/rabbis/`

### Update Styling
- **Colors**: `app/globals.css` (look for `@theme inline`)
- **Component styles**: Individual component files in `components/`

## Support

For questions or issues, contact:
- Email: Rabbikahlani@wearechazak.com
- Phone: 020 4599 8310

---

**Current Version**: 1.0.0
**Last Updated**: February 2026
