'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import FadeInWhenVisible from './FadeInWhenVisible';
import { ShiurRecording } from '@/types';

interface AnimatedShiurRowProps {
  shiur: ShiurRecording;
  index?: number;
}

export default function AnimatedShiurRow({ shiur, index = 0 }: AnimatedShiurRowProps) {
  const recordedDate = new Date(shiur.recordedDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <FadeInWhenVisible delay={0.05 * index}>
      <Link href={`/shiurim/${shiur.id}`} prefetch={true}>
        <motion.div 
          className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl hover:border-primary transition-all duration-300 cursor-pointer group"
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {/* Audio Icon */}
              <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-yellow-500/20 transition-colors flex-shrink-0">
                <svg
                  className="w-8 h-8 text-primary group-hover:text-yellow-600 transition-colors"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              
              {/* Title and Date */}
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-semibold text-primary group-hover:text-yellow-600 transition-colors truncate" dir="auto">
                  {shiur.title}
                </h3>
                <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{recordedDate}</span>
                  </div>
                  {shiur.duration > 0 && (
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{Math.floor(shiur.duration / 60)} min</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Arrow Icon */}
            <motion.div 
              className="text-gray-400 group-hover:text-yellow-600 transition-colors flex-shrink-0 ml-4"
              animate={{ x: 0 }}
              whileHover={{ x: 5 }}
              transition={{ duration: 0.2 }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </motion.div>
          </div>
        </motion.div>
      </Link>
    </FadeInWhenVisible>
  );
}
