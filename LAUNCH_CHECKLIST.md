# BBM Landing Page - Launch Checklist

Use this checklist to ensure everything is ready before going live.

## 🎯 Pre-Launch Checklist

### Content Review
- [ ] Review all davening times in `data/davening.ts`
- [ ] Verify all shiurim schedules in `data/shiurim.ts`
- [ ] Check all rabbi information in `data/rabbis.ts`
- [ ] Update statistics (if numbers have changed)
- [ ] Verify contact information in footer
- [ ] Double-check phone number: 020 4599 8310
- [ ] Double-check email: Rabbikahlani@wearechazak.com

### Images (Optional but Recommended)
- [ ] Add BBM logo to `public/images/bbm-logo.png`
- [ ] Add Rabbi Kahlani portrait
- [ ] Add Rabbi Hecht photo
- [ ] Add Rabbi Bazak photo
- [ ] Add Rabbi Hye photo
- [ ] Add Rabbi Goldstien photo
- [ ] Add Taamey David CLM font (optional)

### Testing - Desktop
- [ ] Test in Chrome
- [ ] Test in Safari
- [ ] Test in Firefox
- [ ] Test in Edge
- [ ] Check all navigation links work
- [ ] Test smooth scrolling to sections
- [ ] Verify newsletter form displays correctly
- [ ] Check Hebrew text displays properly (RTL)
- [ ] Test mobile menu (resize browser)

### Testing - Mobile
- [ ] Test on iPhone (or iOS simulator)
- [ ] Test on Android phone
- [ ] Test on iPad/tablet
- [ ] Verify mobile menu works
- [ ] Check all text is readable
- [ ] Ensure buttons are tappable
- [ ] Test landscape orientation
- [ ] Verify images load (if added)

### Content Pages
- [ ] Add privacy policy content to `app/privacy/page.tsx`
- [ ] Add terms of service to `app/terms/page.tsx`
- [ ] (Optional) Add more detail to shiurim page

### Technical Checks
- [ ] No console errors in browser
- [ ] No linter warnings (`npm run lint`)
- [ ] Site builds successfully (`npm run build`)
- [ ] Production build runs (`npm run start`)
- [ ] All links working (including footer links)
- [ ] Forms display correctly

### SEO & Metadata
- [ ] Verify page title in browser tab
- [ ] Check meta description
- [ ] Test social media preview (Facebook/WhatsApp share)
- [ ] Ensure site has proper favicon
- [ ] Review keywords in metadata

### Performance
- [ ] Page loads quickly
- [ ] Images optimized (when added)
- [ ] No layout shift on load
- [ ] Smooth animations
- [ ] Fast navigation between pages

## 🚀 Deployment Checklist

### Before Deployment
- [ ] Create production build: `npm run build`
- [ ] Test production build locally: `npm run start`
- [ ] Review all changes one final time
- [ ] Commit all changes to git
- [ ] Push to GitHub (or hosting repository)

### During Deployment

#### Option A: Vercel (Recommended)
- [ ] Create Vercel account
- [ ] Import GitHub repository
- [ ] Configure project settings
- [ ] Deploy
- [ ] Test live URL
- [ ] (Optional) Add custom domain
- [ ] Configure DNS if using custom domain

#### Option B: Netlify
- [ ] Create Netlify account
- [ ] Connect GitHub repository
- [ ] Set build command: `npm run build`
- [ ] Set publish directory: `.next`
- [ ] Deploy
- [ ] Test live URL
- [ ] (Optional) Add custom domain

#### Option C: Self-Hosted
- [ ] Build project: `npm run build`
- [ ] Upload files to server
- [ ] Configure web server (Nginx/Apache)
- [ ] Set up SSL certificate
- [ ] Configure domain DNS
- [ ] Test live URL

### After Deployment
- [ ] Test live site on desktop
- [ ] Test live site on mobile
- [ ] Verify all links work on live site
- [ ] Check contact email works
- [ ] Test newsletter form (when API integrated)
- [ ] Share URL with team for review
- [ ] Get feedback from users
- [ ] Monitor for any issues

## 🔧 Optional Enhancements (Post-Launch)

### Phase 1 (Soon after launch)
- [ ] Integrate newsletter API (Mailchimp, SendGrid, etc.)
- [ ] Add Google Analytics or similar
- [ ] Set up error monitoring (Sentry, etc.)
- [ ] Create sitemap.xml
- [ ] Submit to Google Search Console
- [ ] Set up social media accounts

### Phase 2 (Within first month)
- [ ] Build shiurim page with audio player
- [ ] Upload shiur recordings
- [ ] Add search functionality for shiurim
- [ ] Create dedicated contact page with form
- [ ] Add event calendar (if needed)
- [ ] Implement donation/campaign integration

### Phase 3 (Future)
- [ ] User accounts for personalized experience
- [ ] Ability to bookmark favorite shiurim
- [ ] Email notifications for new shiurim
- [ ] Mobile app consideration
- [ ] Admin panel for content management
- [ ] Multi-language support (beyond Hebrew/English)

## 📞 Support Contacts

If you need help or have questions:
- Email: Rabbikahlani@wearechazak.com
- Phone: 020 4599 8310

## ✅ Quick Launch Path

**Minimum to Go Live** (5-10 minutes):
1. ✅ Site is already built and functional
2. Add images (or skip - placeholders work)
3. Test on phone and desktop
4. Deploy to Vercel (free, 1-click)
5. Share the URL!

**Recommended Launch** (30-60 minutes):
1. Add all images
2. Complete content pages (privacy, terms)
3. Test thoroughly on multiple devices
4. Deploy to Vercel with custom domain
5. Set up analytics
6. Announce to community!

---

**Current Status**: ✅ Site is production-ready!

**Development Server**: http://localhost:3002

**Next Step**: Test the site, add images, then deploy! 🚀
