'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <motion.nav 
      className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-md"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="h-12 w-12 md:h-14 md:w-14 rounded-full overflow-hidden flex items-center justify-center transform transition-transform duration-300 group-hover:scale-110">
              <img 
                src="/bbm-navbar-logo-white.png"
                alt="BBM Logo"
                className="h-full w-full object-cover"
              />
            </div>
            <span className="text-lg md:text-xl font-bold text-primary hidden sm:block transition-colors group-hover:text-secondary">
              Brampton בית מדרש
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-primary hover:text-secondary transition-all duration-300 font-medium hover:scale-105"
            >
              Home
            </Link>
            <Link
              href="/shiurim"
              className="text-primary hover:text-secondary transition-all duration-300 font-medium hover:scale-105"
            >
              Shiurim
            </Link>
            <Link
              href="/events"
              className="text-primary hover:text-secondary transition-all duration-300 font-medium hover:scale-105"
            >
              Events
            </Link>
            <Link
              href="/#schedule"
              className="text-primary hover:text-secondary transition-all duration-300 font-medium hover:scale-105"
            >
              Schedule
            </Link>
            <Link
              href="/#rosh-beit-midrash"
              className="text-primary hover:text-secondary transition-all duration-300 font-medium hover:scale-105"
            >
              Rabbanim
            </Link>
            <Link
              href="/#contact"
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-all duration-300 font-medium hover:scale-105 hover:shadow-lg active:scale-95"
            >
              Contact
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-light transition-colors"
            aria-label="Toggle menu"
            whileTap={{ scale: 0.9 }}
          >
            <motion.svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
              animate={isMenuOpen ? "open" : "closed"}
            >
              {isMenuOpen ? (
                <motion.path 
                  d="M6 18L18 6M6 6l12 12"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                />
              ) : (
                <motion.path 
                  d="M4 6h16M4 12h16M4 18h16"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                />
              )}
            </motion.svg>
          </motion.button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              className="md:hidden overflow-hidden border-t border-gray-200"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <motion.div 
                className="flex flex-col space-y-4 py-4"
                initial="closed"
                animate="open"
                exit="closed"
                variants={{
                  open: {
                    transition: { staggerChildren: 0.05, delayChildren: 0.1 }
                  },
                  closed: {
                    transition: { staggerChildren: 0.03, staggerDirection: -1 }
                  }
                }}
              >
                <motion.div
                  variants={{
                    open: { opacity: 1, x: 0 },
                    closed: { opacity: 0, x: -20 }
                  }}
                >
                  <Link
                    href="/"
                    onClick={() => setIsMenuOpen(false)}
                    className="block text-primary hover:text-secondary transition-colors font-medium py-2 hover:pl-2 duration-300"
                  >
                    Home
                  </Link>
                </motion.div>
                <motion.div
                  variants={{
                    open: { opacity: 1, x: 0 },
                    closed: { opacity: 0, x: -20 }
                  }}
                >
                  <Link
                    href="/shiurim"
                    onClick={() => setIsMenuOpen(false)}
                    className="block text-primary hover:text-secondary transition-colors font-medium py-2 hover:pl-2 duration-300"
                  >
                    Shiurim
                  </Link>
                </motion.div>
                <motion.div
                  variants={{
                    open: { opacity: 1, x: 0 },
                    closed: { opacity: 0, x: -20 }
                  }}
                >
                  <Link
                    href="/events"
                    onClick={() => setIsMenuOpen(false)}
                    className="block text-primary hover:text-secondary transition-colors font-medium py-2 hover:pl-2 duration-300"
                  >
                    Events
                  </Link>
                </motion.div>
                <motion.div
                  variants={{
                    open: { opacity: 1, x: 0 },
                    closed: { opacity: 0, x: -20 }
                  }}
                >
                  <Link
                    href="/#schedule"
                    onClick={() => setIsMenuOpen(false)}
                    className="block text-primary hover:text-secondary transition-colors font-medium py-2 hover:pl-2 duration-300"
                  >
                    Schedule
                  </Link>
                </motion.div>
                <motion.div
                  variants={{
                    open: { opacity: 1, x: 0 },
                    closed: { opacity: 0, x: -20 }
                  }}
                >
                  <Link
                    href="/#rosh-beit-midrash"
                    onClick={() => setIsMenuOpen(false)}
                    className="block text-primary hover:text-secondary transition-colors font-medium py-2 hover:pl-2 duration-300"
                  >
                    Rabbanim
                  </Link>
                </motion.div>
                <motion.div
                  variants={{
                    open: { opacity: 1, x: 0 },
                    closed: { opacity: 0, x: -20 }
                  }}
                >
                  <Link
                    href="/#contact"
                    onClick={() => setIsMenuOpen(false)}
                    className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-all duration-300 font-medium text-center block hover:scale-105 active:scale-95"
                  >
                    Contact
                  </Link>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}
