'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="h-12 w-12 md:h-14 md:w-14 rounded-full overflow-hidden flex items-center justify-center">
              <img 
                src="/bbm-navbar-logo-white.png"
                alt="BBM Logo"
                className="h-full w-full object-cover"
              />
            </div>
            <span className="text-lg md:text-xl font-bold text-primary hidden sm:block">
              Brampton Beit Midrash
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              Home
            </Link>
            <Link
              href="/shiurim"
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              Shiurim
            </Link>
            <Link
              href="/#schedule"
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              Schedule
            </Link>
            <Link
              href="/#rabbis"
              className="text-foreground hover:text-primary transition-colors font-medium"
            >
              Rabbanim
            </Link>
            <Link
              href="/#contact"
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors font-medium"
            >
              Contact
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-light transition-colors"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <Link
                href="/"
                onClick={() => setIsMenuOpen(false)}
                className="text-foreground hover:text-primary transition-colors font-medium py-2"
              >
                Home
              </Link>
              <Link
                href="/shiurim"
                onClick={() => setIsMenuOpen(false)}
                className="text-foreground hover:text-primary transition-colors font-medium py-2"
              >
                Shiurim
              </Link>
              <Link
                href="/#schedule"
                onClick={() => setIsMenuOpen(false)}
                className="text-foreground hover:text-primary transition-colors font-medium py-2"
              >
                Schedule
              </Link>
              <Link
                href="/#rabbis"
                onClick={() => setIsMenuOpen(false)}
                className="text-foreground hover:text-primary transition-colors font-medium py-2"
              >
                Rabbanim
              </Link>
              <Link
                href="/#contact"
                onClick={() => setIsMenuOpen(false)}
                className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors font-medium text-center"
              >
                Contact
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
