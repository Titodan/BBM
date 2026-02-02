import Link from 'next/link';
import { statistics } from '@/data/rabbis';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src="/images/beit-midrash-bg.png"
          alt="Beit Midrash Background"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0" style={{
        background: 'linear-gradient(to bottom right, rgba(26, 61, 79, 0.85), rgba(15, 32, 39, 0.85), rgba(74, 144, 226, 0.85))'
      }} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 text-center">
        {/* Logo */}
        <div className="mb-8 md:mb-12 flex justify-center">
          <div className="w-64 md:w-80 lg:w-96">
            <img 
              src="/bbm-logo-white.png"
              alt="BBM Brampton בית מדרש"
              className="w-full h-auto"
            />
          </div>
        </div>

        {/* Main Tagline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 md:mb-6">
          A PLACE TO GROW
        </h1>

        {/* Bilingual Subtitle */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-12 md:mb-16">
          <p className="text-2xl sm:text-3xl md:text-4xl font-medium text-accent tracking-wide italic">
            BE A BEN TORAH, BE MORE
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-16 max-w-4xl mx-auto">
          {statistics.map((stat, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-white/20 hover:bg-white/15 transition-all duration-300"
            >
              <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-accent mb-2">
                {stat.value}
              </div>
              <div className="text-sm md:text-base text-white/90">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Call-to-Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <Link
            href="#schedule"
            className="bg-accent text-primary-dark px-8 py-4 rounded-lg font-bold text-lg hover:bg-accent/90 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 w-full sm:w-auto"
          >
            View Schedule
          </Link>
          <Link
            href="#rabbis"
            className="bg-white text-primary px-8 py-4 rounded-lg font-bold text-lg hover:bg-white/90 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 w-full sm:w-auto border-2 border-white"
          >
            Meet Our Rabbis
          </Link>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce hidden md:block">
          <svg
            className="w-6 h-6 text-white/60"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      </div>
    </section>
  );
}
