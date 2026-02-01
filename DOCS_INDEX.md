# 📚 BBM Landing Page - Documentation Index

Welcome! This document helps you find the right guide for what you need.

## 🚀 Getting Started (Start Here!)

**Just want to see the site?**
→ Open [http://localhost:3002](http://localhost:3002) in your browser

**First time setup?**
→ Read [`SETUP.md`](./SETUP.md) - Quick start guide (5 min read)

**Want the full picture?**
→ Read [`PROJECT_SUMMARY.md`](./PROJECT_SUMMARY.md) - Complete overview of what's built

## 📖 Documentation Files

### [`SETUP.md`](./SETUP.md) ⭐ START HERE
**Quick setup guide** - Everything you need to get started
- What's already done
- How to view the site
- How to add images
- How to update content
- Quick testing guide

### [`README.md`](./README.md)
**Complete project documentation** - Technical reference
- Full feature list
- Detailed installation instructions
- Project structure explanation
- Configuration guide
- Updating content (detailed)
- Design system reference

### [`PROJECT_SUMMARY.md`](./PROJECT_SUMMARY.md)
**What was built** - Complete feature overview
- All completed features
- Component descriptions
- File structure
- Current status
- What's missing (if anything)
- Statistics

### [`DEVELOPMENT.md`](./DEVELOPMENT.md)
**Development guide** - For ongoing development
- Current status
- To-do before launch
- Future enhancements
- Testing checklist
- Deployment options
- File structure for updates

### [`LAUNCH_CHECKLIST.md`](./LAUNCH_CHECKLIST.md)
**Pre-launch checklist** - Use before going live
- Content review checklist
- Testing checklist (desktop, mobile)
- SEO checks
- Deployment steps
- Post-launch tasks
- Optional enhancements

### [`public/images/README.md`](./public/images/README.md)
**Image requirements** - What images you need
- Logo specifications
- Rabbi photo requirements
- Image dimensions
- Format recommendations

## 🎯 Common Tasks

### "I want to update the schedule"
1. Edit `data/davening.ts` for davening times
2. Edit `data/shiurim.ts` for shiurim
3. Save the file - changes appear automatically

### "I want to add rabbi information"
1. Edit `data/rabbis.ts`
2. Add rabbi photo to `public/images/rabbis/`
3. Save - updates appear automatically

### "I want to change colors"
1. Edit `app/globals.css`
2. Look for `@theme inline` section
3. Update color values

### "I want to add a new page"
1. Create folder in `app/` (e.g., `app/about/`)
2. Add `page.tsx` file
3. Import and use existing components

### "I want to deploy the site"
→ See [`LAUNCH_CHECKLIST.md`](./LAUNCH_CHECKLIST.md) deployment section

### "I want to test on mobile"
→ See [`LAUNCH_CHECKLIST.md`](./LAUNCH_CHECKLIST.md) testing section

## 🗂️ File Locations

### Content to Update
```
data/
├── davening.ts      ← Davening times
├── shiurim.ts       ← All shiurim
└── rabbis.ts        ← Rabbi profiles
```

### Components (if you want to modify layout)
```
components/
├── Navbar.tsx               ← Navigation bar
├── Hero.tsx                 ← Hero section
├── ScheduleAndShiurim.tsx   ← Schedule section
├── RoshBeitMidrash.tsx      ← Leadership section
├── RabbisSection.tsx        ← Rabbis grid
├── Newsletter.tsx           ← Newsletter form
└── Footer.tsx               ← Footer
```

### Pages
```
app/
├── page.tsx           ← Home page
├── layout.tsx         ← Site layout & metadata
├── globals.css        ← Styles & colors
├── shiurim/page.tsx   ← Shiurim page
├── privacy/page.tsx   ← Privacy policy
└── terms/page.tsx     ← Terms of service
```

### Images
```
public/
├── images/
│   ├── bbm-logo.png           ← Your logo here
│   └── rabbis/
│       ├── rabbi-kahlani-portrait.png
│       ├── rabbi-hecht.png
│       ├── rabbi-bazak.png
│       ├── rabbi-hye.png
│       └── rabbi-goldstien.png
└── fonts/
    └── TaameyDavidCLM.woff2   ← Hebrew font (optional)
```

## 💡 Quick Reference

### Commands
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Run production server
npm run lint     # Check for errors
```

### URLs
- **Development**: http://localhost:3002
- **Production**: (Your deployed URL)

### Contact Info
- **Email**: Rabbikahlani@wearechazak.com
- **Phone**: 020 4599 8310
- **Charity**: Chazak (No: 1142937)

## 🆘 Need Help?

### "Site won't load"
- Make sure dev server is running: `npm run dev`
- Check if port 3002 is free
- Try port 3000 if shown in terminal

### "Changes don't appear"
- Save the file (Cmd/Ctrl + S)
- Refresh browser (Cmd/Ctrl + R)
- Check terminal for errors

### "Images don't show"
- Check file paths match exactly
- Ensure files are in `public/images/`
- Image names are case-sensitive

### "Hebrew text looks wrong"
- Add Hebrew font file (optional)
- Check browser supports Hebrew
- Verify RTL is working

## 📊 Project Status

**Status**: ✅ **PRODUCTION READY**

- All components built
- All data structured
- Fully responsive
- No errors
- Ready to deploy

**Next Steps**:
1. Add images (optional)
2. Test on devices
3. Deploy to web
4. Share with community!

---

**Quick Start**: Read [`SETUP.md`](./SETUP.md) → Add images → Deploy!

**Questions?** Email: Rabbikahlani@wearechazak.com
