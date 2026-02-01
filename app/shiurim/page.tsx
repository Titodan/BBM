import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ShiurimPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
              Shiurim
            </h1>
            <p className="text-xl text-gray-700">
              Coming Soon - Audio recordings of all shiurim
            </p>
          </div>

          {/* Coming Soon Content */}
          <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8 md:p-12 text-center">
            <div className="mb-6">
              <svg
                className="w-24 h-24 mx-auto text-secondary"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">
              Audio Library Coming Soon
            </h2>
            <p className="text-lg text-gray-700 mb-8">
              We're working on building a comprehensive library of recorded shiurim with an integrated audio player. 
              Check back soon to access all our Torah learning content online.
            </p>
            <div className="space-y-4">
              <p className="text-gray-600">
                In the meantime, you can:
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/#schedule"
                  className="bg-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-primary-dark transition-colors"
                >
                  View Schedule
                </a>
                <a
                  href="/#contact"
                  className="bg-secondary text-white px-6 py-3 rounded-lg font-bold hover:bg-secondary/90 transition-colors"
                >
                  Contact Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
