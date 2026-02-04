import Link from 'next/link';
import { statistics } from '@/data/rabbis';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-4 sm:py-0">
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

      <div className="relative z-10 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 md:py-12 lg:py-16 text-center">
        {/* Logo */}
        <div className="mb-2 sm:mb-4 md:mb-6 lg:mb-8 flex justify-center">
          <div className="w-40 sm:w-48 md:w-64 lg:w-80 xl:w-96">
            <img 
              src="/bbm-logo-white.png"
              alt="BBM Brampton בית מדרש"
              className="w-full h-auto"
            />
          </div>
        </div>

        {/* Main Tagline */}
        <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold text-white mb-1 sm:mb-2 md:mb-3 lg:mb-4 leading-tight">
          A PLACE TO GROW
        </h1>

        {/* Bilingual Subtitle */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 md:gap-3 lg:gap-4 mb-3 sm:mb-6 md:mb-8 lg:mb-10">
          <p className="text-base sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-medium text-accent tracking-wide italic leading-tight">
            BE A BEN TORAH, BE MORE
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8 mb-3 sm:mb-6 md:mb-8 lg:mb-10 max-w-4xl mx-auto">
          {statistics.map((stat, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 lg:p-8 border border-white/20 hover:bg-white/15 transition-all duration-300"
            >
              <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-accent mb-1 leading-tight">
                {stat.value}
              </div>
              <div className="text-[10px] sm:text-xs md:text-sm lg:text-base text-white/90 leading-tight">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Call-to-Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4 justify-center items-center">
          <Link
            href="#schedule"
            className="bg-accent text-primary-dark px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 rounded-lg font-bold text-sm sm:text-base md:text-lg hover:bg-accent/90 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 w-full sm:w-auto"
          >
            View Schedule
          </Link>
          <Link
            href="#rabbis"
            className="bg-white text-primary px-4 sm:px-6 md:px-8 py-2 sm:py-3 md:py-4 rounded-lg font-bold text-sm sm:text-base md:text-lg hover:bg-white/90 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 w-full sm:w-auto border-2 border-white"
          >
            Meet Our Rabbis
          </Link>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 animate-bounce hidden md:block z-20">
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
    </section>
  );
}
