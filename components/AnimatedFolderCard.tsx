'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import FadeInWhenVisible from './FadeInWhenVisible';
import { ShiurFolder } from '@/types';

interface AnimatedFolderCardProps {
  folder: ShiurFolder;
  currentPath: string[];
  index?: number;
}

export default function AnimatedFolderCard({ folder, currentPath, index = 0 }: AnimatedFolderCardProps) {
  const path = [...currentPath, folder.id].join('/');
  const shiurCount = countShiurimRecursive(folder);
  const subfolderCount = folder.folders.length;

  return (
    <FadeInWhenVisible delay={0.05 * index}>
      <Link href={`/shiurim?path=${path}`} prefetch={true}>
        <motion.div 
          className="bg-primary rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 cursor-pointer group transform"
          whileHover={{ scale: 1.05, y: -5 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center gap-4">
            <div className="p-4 bg-accent/20 rounded-xl group-hover:bg-accent/30 transition-colors">
              <svg
                className="w-10 h-10 text-accent"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-accent transition-colors" dir="auto">
                {folder.name}
              </h3>
              <div className="flex items-center gap-4 text-sm text-white/70">
                {subfolderCount > 0 && (
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                    </svg>
                    <span>{subfolderCount} {subfolderCount === 1 ? 'folder' : 'folders'}</span>
                  </div>
                )}
                {shiurCount > 0 && (
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                    </svg>
                    <span>{shiurCount} {shiurCount === 1 ? 'shiur' : 'shiurim'}</span>
                  </div>
                )}
                {subfolderCount === 0 && shiurCount === 0 && (
                  <p className="text-white/50">Empty folder</p>
                )}
              </div>
            </div>
            <div className="text-white/60 group-hover:text-accent transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </motion.div>
      </Link>
    </FadeInWhenVisible>
  );
}

function countShiurimRecursive(folder: ShiurFolder): number {
  let count = folder.shiurim.length;
  for (const subfolder of folder.folders) {
    count += countShiurimRecursive(subfolder);
  }
  return count;
}
