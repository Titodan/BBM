'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import FadeInWhenVisible from './FadeInWhenVisible';

interface AnimatedCategoryCardProps {
  category: {
    id: string;
    name: string;
    nameHebrew: string;
  };
  folderId?: string;
  index: number;
}

export default function AnimatedCategoryCard({ category, folderId, index }: AnimatedCategoryCardProps) {
  if (!folderId) {
    return (
      <FadeInWhenVisible delay={0.1 * index}>
        <div className="bg-gray-400 rounded-xl shadow-xl p-8 h-96 flex flex-col justify-between opacity-50">
          {/* Header */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-3">
              {category.name}
            </h2>
            <p className="text-4xl font-hebrew text-white/90 mb-6" dir="auto">
              {category.nameHebrew}
            </p>
          </div>

          {/* Empty State */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="text-center text-white/80 text-sm">
              Not yet set up
            </div>
          </div>

          {/* Footer */}
          <div className="text-center">
            <div className="text-white/60 text-sm">
              Contact admin
            </div>
          </div>
        </div>
      </FadeInWhenVisible>
    );
  }

  return (
    <FadeInWhenVisible delay={0.1 * index}>
      <Link href={`/shiurim?path=${folderId}`} prefetch={true}>
        <motion.div 
          className="bg-primary rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-10 cursor-pointer group h-96 flex flex-col justify-between"
          whileHover={{ scale: 1.03, y: -5 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.3 }}
        >
          {/* Content */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-bold text-white group-hover:text-accent transition-colors">
                {category.name}
              </h2>
              <div className="h-px w-16 bg-accent mx-auto"></div>
              <p className="text-6xl font-hebrew text-white/95 font-semibold" dir="auto">
                {category.nameHebrew}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center pt-6 border-t border-white/20">
            <motion.div 
              className="flex items-center justify-center gap-2 text-white/90 font-medium group-hover:text-accent transition-colors"
              initial={{ gap: '0.5rem' }}
              whileHover={{ gap: '0.75rem' }}
            >
              <span>Enter</span>
              <motion.svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                animate={{ x: 0 }}
                whileHover={{ x: 3 }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </motion.svg>
            </motion.div>
          </div>
        </motion.div>
      </Link>
    </FadeInWhenVisible>
  );
}
