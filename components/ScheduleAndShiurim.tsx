'use client';

import { daveningTimes } from '@/data/davening';
import { shiurim } from '@/data/shiurim';
import { getFridayMinchaTime, getFridayArvitTime } from '@/lib/zmanim';
import { useMemo } from 'react';
import FadeInWhenVisible from './FadeInWhenVisible';
import { motion } from 'framer-motion';

export default function ScheduleAndShiurim() {
  // Calculate Friday Mincha and Arvit times dynamically
  const fridayMinchaTime = useMemo(() => getFridayMinchaTime(), []);
  const fridayArvitTime = useMemo(() => getFridayArvitTime(), []);

  // Update davening times with calculated times based on Friday's zmanim
  const updatedDaveningTimes = useMemo(() => {
    return daveningTimes.map(davening => {
      if (davening.id === 'mincha') {
        return {
          ...davening,
          times: ['1:00 PM', fridayMinchaTime]
        };
      }
      if (davening.id === 'arvit') {
        return {
          ...davening,
          times: [fridayArvitTime, '9:45 PM']
        };
      }
      return davening;
    });
  }, [fridayMinchaTime, fridayArvitTime]);
  // Group shiurim by time period
  const morningShiurim = shiurim.filter(s => 
    s.time.includes('AM') && !s.isSpecial
  );
  const nightShiurim = shiurim.filter(s => 
    s.time.includes('PM') && !s.isSpecial
  );
  const specialWeekly = shiurim.filter(s => s.isSpecial);

  return (
    <section id="schedule" className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <FadeInWhenVisible>
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-4 tracking-tight">
              Daily Schedule
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto font-light">
              Join us for davening and Torah learning throughout the day
            </p>
          </div>
        </FadeInWhenVisible>

        {/* Davening Times */}
        <div className="mb-16 md:mb-20">
          <FadeInWhenVisible delay={0.1}>
            <div className="text-center mb-8 md:mb-10">
              <h3 className="text-2xl md:text-3xl font-bold text-primary mb-2">
                Davening Times
              </h3>
              <div className="h-0.5 w-16 bg-accent rounded-full mx-auto mt-3"></div>
            </div>
          </FadeInWhenVisible>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
            {updatedDaveningTimes.map((davening, index) => (
              <FadeInWhenVisible key={davening.id} delay={0.2 + index * 0.1}>
                <motion.div
                  className="group relative h-full"
                  whileHover={{ scale: 1.05, y: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Glow effect on hover */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-accent to-primary rounded-2xl opacity-0 group-hover:opacity-100 blur transition duration-500"></div>
                  
                  <div className="relative bg-gradient-to-br from-primary to-primary-dark rounded-2xl shadow-xl p-6 md:p-8 border border-accent/20 group-hover:border-accent/60 transition-all duration-300">
                    <div className="text-center">
                      <div className="mb-4 pb-4 border-b border-accent/30">
                        <h4 className="text-xl md:text-2xl font-bold text-white mb-2 tracking-wide">
                          {davening.name}
                        </h4>
                        <p className="text-lg md:text-xl font-semibold text-accent hebrew tracking-wider">
                          {davening.nameHebrew}
                        </p>
                      </div>
                      <div className="space-y-2">
                        {davening.times.map((time, idx) => (
                          <div key={idx} className="bg-white/10 backdrop-blur-sm rounded-lg py-2 px-3">
                            <p className="text-lg md:text-xl font-bold text-accent">
                              {time}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </FadeInWhenVisible>
            ))}
          </div>
        </div>

        {/* Morning Seder */}
        <div className="mb-16">
          <FadeInWhenVisible delay={0.1}>
            <div className="text-center mb-8">
              <h3 className="text-2xl md:text-3xl font-bold text-primary mb-2">
                Morning Seder
              </h3>
              <div className="h-0.5 w-16 bg-accent rounded-full mx-auto mt-3"></div>
            </div>
          </FadeInWhenVisible>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-7">
            {morningShiurim.map((shiur, index) => (
              <FadeInWhenVisible key={shiur.id} delay={0.15 + index * 0.05}>
                <ShiurCard shiur={shiur} />
              </FadeInWhenVisible>
            ))}
          </div>
        </div>

        {/* Night Seder */}
        <div className="mb-16">
          <FadeInWhenVisible delay={0.1}>
            <div className="text-center mb-8">
              <h3 className="text-2xl md:text-3xl font-bold text-primary mb-2">
                Night Seder
              </h3>
              <div className="h-0.5 w-16 bg-accent rounded-full mx-auto mt-3"></div>
            </div>
          </FadeInWhenVisible>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-7">
            {nightShiurim.map((shiur, index) => (
              <FadeInWhenVisible key={shiur.id} delay={0.15 + index * 0.05}>
                <ShiurCard shiur={shiur} />
              </FadeInWhenVisible>
            ))}
          </div>
        </div>

        {/* Vaadim */}
        <div className="mb-8">
          <FadeInWhenVisible delay={0.1}>
            <div className="text-center mb-8">
              <h3 className="text-2xl md:text-3xl font-bold text-primary mb-2">
                Vaadim
              </h3>
              <div className="h-0.5 w-16 bg-accent rounded-full mx-auto mt-3"></div>
            </div>
          </FadeInWhenVisible>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-7">
            {specialWeekly.map((shiur, index) => (
              <FadeInWhenVisible key={shiur.id} delay={0.15 + index * 0.1}>
                <ShiurCard shiur={shiur} special />
              </FadeInWhenVisible>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ShiurCard({ shiur, special = false }: { shiur: any; special?: boolean }) {
  return (
    <motion.div 
      className="group relative h-full"
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ duration: 0.2 }}
    >
      {/* Subtle glow effect on hover */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-accent rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-300"></div>
      
      <div
        className={`relative h-full flex flex-col bg-gradient-to-br from-primary via-primary to-primary-dark rounded-xl shadow-lg p-5 md:p-6 border-l-4 group-hover:shadow-2xl transition-all duration-300 ${
          special ? 'border-accent' : 'border-accent'
        }`}
      >
        {/* Title */}
        <div className="mb-3 flex-grow">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="text-lg md:text-xl font-bold text-white flex-1 group-hover:text-accent transition-colors duration-300">
              {shiur.title}
            </h4>
            {shiur.isNew && (
              <span className="bg-gradient-to-r from-accent to-yellow-400 text-primary-dark text-xs font-bold px-2.5 py-1 rounded-full shadow-md animate-pulse">
                NEW
              </span>
            )}
          </div>
          {shiur.titleHebrew && (
            <p className="text-base md:text-lg text-accent font-semibold hebrew">
              {shiur.titleHebrew}
            </p>
          )}
        </div>

        {/* Time with styled background */}
        <div className="bg-white/5 backdrop-blur-sm rounded-lg px-3 py-2 mb-3 border border-white/10">
          <p className="text-base md:text-lg font-bold text-white">
            {special && shiur.dayOfWeek && (
              <span className="text-accent mr-1">{shiur.dayOfWeek}</span>
            )}
            <span className="text-accent">{shiur.time}</span>
          </p>
        </div>

        {/* Topic/Location */}
        <div className="mt-auto">
          {shiur.topic && (
            <p className="text-sm text-white/80 italic mb-2 px-2 py-1 bg-white/5 rounded">
              {shiur.topic}
            </p>
          )}
          {shiur.location && (
            <div className="flex items-center gap-1.5 text-xs md:text-sm text-white/70 mt-3 pt-3 border-t border-white/10">
              <svg className="w-3.5 h-3.5 text-accent" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <span>{shiur.location}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
