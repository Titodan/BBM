# Quick Setup Guide - BBM Landing Page

## ✅ What's Already Done

- ✅ Next.js project initialized with TypeScript
- ✅ Tailwind CSS configured with BBM brand colors
- ✅ All components created (Navbar, Hero, Schedule, Rabbis, Newsletter, Footer)
- ✅ Data structure set up for easy updates
- ✅ Responsive design for mobile, tablet, and desktop
- ✅ Development server running

## 🚀 Immediate Next Steps

### 1. View the Site

The development server is already running at:
**http://localhost:3002**

Open this in your browser to see the site!

### 2. Add Your Images (Recommended)

The site will work without images, but to make it look complete:

#### Add Logo
Copy your BBM logo to:
```
public/images/bbm-logo.png
```

#### Add Rabbi Photos
Copy rabbi photos to:
```
public/images/rabbis/rabbi-kahlani-portrait.png
public/images/rabbis/rabbi-hecht.png
public/images/rabbis/rabbi-bazak.png
public/images/rabbis/rabbi-hye.png
public/images/rabbis/rabbi-goldstien.png
```

**Note**: The site currently displays placeholders for missing images, so it will work fine while you gather the photos.

### 3. (Optional) Add Hebrew Font

For authentic Hebrew typography with taamim:

1. Download Taamey David CLM font (search online or use Frank Ruehl as alternative)
2. Convert to `.woff2` format (use online converter if needed)
3. Place file at: `public/fonts/TaameyDavidCLM.woff2`

Without this, Hebrew text will use system fonts (still looks good).

## 📝 How to Update Content

### Update Davening Times

Edit `data/davening.ts`:
```typescript
times: ['7:15 AM', '8:05 AM']  // Change these times
```

### Add/Edit Shiurim

Edit `data/shiurim.ts`:
```typescript
{
  id: 'unique-id',
  title: 'Shiur Name',
  rabbi: 'Rabbi Name',
  time: '7:45-9:45 AM',
  days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
  isNew: true,  // Shows "NEW" badge
}
```

### Update Rabbi Information

Edit `data/rabbis.ts`:
```typescript
{
  id: 'rabbi-name',
  name: 'Rabbi Full Name',
  bio: 'Biography text...',
  shiurim: ['Topic 1', 'Topic 2'],
}
```

## 🎨 Customize Colors (If Needed)

Edit `app/globals.css` and change these values:
```css
--color-primary: #1a3d4f;      /* Deep teal */
--color-secondary: #4a90e2;    /* Bright blue */
--color-accent: #3dd8a7;       /* Mint green */
```

## 📱 Testing

Open **http://localhost:3002** and test:
- [ ] Desktop view (resize browser)
- [ ] Mobile view (use browser dev tools or phone)
- [ ] Click navigation links
- [ ] Scroll through all sections
- [ ] Try the newsletter signup form
- [ ] Check Hebrew text displays correctly

## 🌐 Deploy to Production

When ready to go live, you have several options:

### Option 1: Vercel (Easiest - Recommended)
1. Push code to GitHub
2. Visit [vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Deploy (automatic)
5. Add custom domain (if you have one)

### Option 2: Build Locally
```bash
npm run build
npm run start
```

Then upload the `.next` folder to your hosting provider.

## 📞 Need Help?

The site is fully functional now. If you need to:
- Update content → Edit files in the `data/` folder
- Change colors → Edit `app/globals.css`
- Add pages → Create new folders in `app/`
- Modify layout → Edit components in `components/`

All files are well-organized and documented with comments!

## 📚 Additional Documentation

- `README.md` - Full project documentation
- `DEVELOPMENT.md` - Detailed development guide
- `public/images/README.md` - Image requirements

---

**Development server running at**: http://localhost:3002

**Stop the server**: Press Ctrl+C in the terminal

**Restart the server**: Run `npm run dev`
