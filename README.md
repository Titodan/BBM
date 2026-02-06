# Brampton Beit Midrash (BBM) - Landing Page

A modern, responsive landing page for Brampton Beit Midrash featuring daily schedules, davening times, shiurim information, and rabbi profiles.

## 🎯 Features

- **Responsive Design**: Looks great on all devices (mobile, tablet, desktop)
- **Bilingual Support**: Hebrew and English with proper RTL handling
- **Modern UI**: Clean, sophisticated design with BBM brand colors
- **Daily Schedule**: Comprehensive davening times and shiurim schedule
- **Rabbi Profiles**: Detailed information about all teaching rabbis
- **Newsletter Signup**: Email subscription for updates
- **SEO Optimized**: Built-in metadata for better search visibility
- **Fast Performance**: Server components and automatic image optimization

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd btz
```

2. Install dependencies
```bash
npm install
```

3. Add images to the `public/images/` directory:
   - `bbm-logo.png` - Main BBM logo
   - `rabbis/rabbi-kahlani-portrait.png` - Rabbi Kahlani portrait
   - `rabbis/rabbi-hecht.png` - Rabbi Hecht photo
   - `rabbis/rabbi-bazak.png` - Rabbi Bazak photo
   - `rabbis/rabbi-hye.png` - Rabbi Hye photo
   - `rabbis/rabbi-goldstien.png` - Rabbi Goldstien photo

4. (Optional) Add the Taamey David CLM font:
   - Download the font file
   - Place `TaameyDavidCLM.woff2` in `public/fonts/`

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm run start
```

## 📁 Project Structure

```
btz/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Main landing page
│   ├── globals.css         # Global styles and Tailwind config
│   ├── shiurim/            # Shiurim page (coming soon)
│   ├── privacy/            # Privacy policy page
│   └── terms/              # Terms of service page
├── components/
│   ├── Navbar.tsx          # Navigation bar
│   ├── Hero.tsx            # Hero section with logo and tagline
│   ├── ScheduleAndShiurim.tsx  # Daily schedule and shiurim
│   ├── RoshBeitMidrash.tsx # Leadership section
│   ├── RabbisSection.tsx   # Other rabbis
│   ├── Newsletter.tsx      # Newsletter signup
│   └── Footer.tsx          # Footer with contact info
├── data/
│   ├── davening.ts         # Davening times data
│   ├── shiurim.ts          # All shiurim data
│   └── rabbis.ts           # Rabbi profiles and statistics
├── types/
│   └── index.ts            # TypeScript interfaces
└── public/
    ├── images/
    │   ├── bbm-logo.png
    │   └── rabbis/         # Rabbi photos
    └── fonts/
        └── TaameyDavidCLM.woff2  # Hebrew font
```

## 🎨 Design System

### Brand Colors

- **Primary**: `#284451` - Deep teal/dark blue from logo
- **Primary Dark**: `#1a3d4f` - Darker blue
- **Secondary**: `#4a90e2` - Bright blue
- **Accent**: `#FFB800` - Gold/yellow accent
- **Light**: `#f8fafb` - Light background
- **Dark**: `#0f2027` - Dark background

### Typography

- **English**: Inter (sans-serif)
- **Hebrew**: Taamey David CLM (traditional Hebrew font with taamim)

## 📝 Updating Content

### Davening Times

Edit `data/davening.ts`:

```typescript
export const daveningTimes: DaveningTime[] = [
  {
    id: 'shacharit',
    name: 'Shacharit',
    nameHebrew: 'שחרית',
    times: ['7:15 AM', '8:05 AM'],
  },
  // ... add more
];
```

### Shiurim

Edit `data/shiurim.ts`:

```typescript
export const shiurim: Shiur[] = [
  {
    id: 'unique-id',
    title: 'Shiur Title',
    titleHebrew: 'Hebrew Title',
    rabbi: 'Rabbi Name',
    time: '7:45-9:45 AM',
    days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
    isNew: true,
  },
  // ... add more
];
```

### Rabbis

Edit `data/rabbis.ts`:

```typescript
export const rabbis: Rabbi[] = [
  {
    id: 'rabbi-name',
    name: 'Rabbi Full Name',
    title: 'Title',
    photo: '/images/rabbis/photo.png',
    email: 'email@example.com',
    bio: 'Biography text...',
    shiurim: ['Topic 1', 'Topic 2'],
    isRosh: false,
  },
  // ... add more
];
```

## 🔧 Configuration

### Tailwind CSS

Brand colors are configured in `app/globals.css` using the new Tailwind v4 CSS-first configuration:

```css
@theme inline {
  --color-primary: #284451;
  --color-primary-dark: #1a3d4f;
  --color-secondary: #4a90e2;
  --color-accent: #FFB800;
  --color-light: #f8fafb;
  /* ... */
}
```

### Metadata & SEO

Update metadata in `app/layout.tsx`:

```typescript
export const metadata: Metadata = {
  title: "Your Title",
  description: "Your Description",
  // ... more metadata
};
```

## 🚧 Next Steps

- [ ] Add actual BBM logo and rabbi photos
- [ ] Add Taamey David CLM font file
- [ ] Implement newsletter subscription backend
- [ ] Create `/shiurim` page with audio player
- [ ] Add privacy policy and terms of service content
- [ ] Integrate analytics
- [ ] Set up domain and hosting

## 📞 Contact

- **Phone**: 020 4599 8310
- **Email**: Rabbikahlani@wearechazak.com
- **Charity Number**: 1142937 (Part of Chazak)

## 📄 License

© 2025 Brampton Beit Midrash | Part of Chazak

---

Built with Next.js 15, TypeScript, and Tailwind CSS
