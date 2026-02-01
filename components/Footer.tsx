import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="contact" className="bg-primary-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-12">
          {/* About Column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                <span className="text-lg font-bold text-accent">
                  BBM
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold">Brampton Beit Midrash</h3>
                <p className="text-sm text-white/70 hebrew">בית מדרש</p>
              </div>
            </div>
            <p className="text-white/80 mb-4 leading-relaxed">
              A place dedicated to Torah learning and spiritual growth in the heart of Brampton.
              Join us for davening, shiurim, and community learning.
            </p>
            <p className="text-sm text-accent font-semibold">
              Part of Chazak (Charity No: 1142937)
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-white/80 hover:text-accent transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/shiurim"
                  className="text-white/80 hover:text-accent transition-colors"
                >
                  Shiurim
                </Link>
              </li>
              <li>
                <Link
                  href="#schedule"
                  className="text-white/80 hover:text-accent transition-colors"
                >
                  Schedule
                </Link>
              </li>
              <li>
                <Link
                  href="#rabbis"
                  className="text-white/80 hover:text-accent transition-colors"
                >
                  Our Rabbis
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-bold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <svg
                  className="w-5 h-5 text-accent mt-1 flex-shrink-0"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <a
                  href="tel:02045998310"
                  className="text-white/80 hover:text-accent transition-colors"
                >
                  020 4599 8310
                </a>
              </li>
              <li className="flex items-start gap-2">
                <svg
                  className="w-5 h-5 text-accent mt-1 flex-shrink-0"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a
                  href="mailto:Rabbikahlani@wearechazak.com"
                  className="text-white/80 hover:text-accent transition-colors break-all"
                >
                  Rabbikahlani@wearechazak.com
                </a>
              </li>
              <li className="flex items-start gap-2">
                <svg
                  className="w-5 h-5 text-accent mt-1 flex-shrink-0"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-white/80">
                  Brampton, ON
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-white/70 text-sm text-center md:text-left">
              © {currentYear} Brampton Beit Midrash | Part of Chazak
            </p>
            <div className="flex gap-6">
              <Link
                href="/privacy"
                className="text-white/70 hover:text-accent transition-colors text-sm"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-white/70 hover:text-accent transition-colors text-sm"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
