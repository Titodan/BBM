import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="contact" className="bg-white text-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-12">
          {/* About Column */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center">
                <img 
                  src="/bbm-navbar-logo-white.png"
                  alt="BBM Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold text-primary">Brampton Beit Midrash</h3>
                <p className="text-sm text-primary/70 hebrew">בית מדרש</p>
              </div>
            </div>
            <p className="text-foreground/80 mb-4 leading-relaxed">
              A place dedicated to Torah learning and spiritual growth in the heart of Hendon.
              Join us for davening, shiurim, and community learning.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-4 text-primary">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-foreground/80 hover:text-accent transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/shiurim"
                  className="text-foreground/80 hover:text-accent transition-colors"
                >
                  Shiurim
                </Link>
              </li>
              <li>
                <Link
                  href="#schedule"
                  className="text-foreground/80 hover:text-accent transition-colors"
                >
                  Schedule
                </Link>
              </li>
              <li>
                <Link
                  href="#rabbis"
                  className="text-foreground/80 hover:text-accent transition-colors"
                >
                  Our Rabbanim
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-bold mb-4 text-primary">Contact Us</h4>
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
                  <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <a
                  href="mailto:Rabbikahlani@wearechazak.com"
                  className="text-foreground/80 hover:text-accent transition-colors break-words"
                >
                  Rabbikahlani@<wbr />wearechazak.com
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
                <div className="flex flex-col gap-1">
                  <span className="text-foreground/80">
                    73 Brent St, London NW4 2EA
                  </span>
                  <div className="flex gap-3 text-sm">
                    <a
                      href="https://maps.google.com/?q=73+Brent+St+London+NW4+2EA"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent hover:text-accent/80 transition-colors font-medium"
                    >
                      Google Maps
                    </a>
                    <span className="text-foreground/30">•</span>
                    <a
                      href="https://waze.com/ul?q=73+Brent+St+London+NW4+2EA"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent hover:text-accent/80 transition-colors font-medium"
                    >
                      Waze
                    </a>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t-4 border-primary">
          <div className="flex flex-col md:flex-row justify-center items-center gap-4">
            <p className="text-foreground/70 text-sm text-center md:text-left">
              © {currentYear} Brampton Beit Midrash
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
