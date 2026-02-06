import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AudioPlayer from '@/components/AudioPlayer';
import { getShiurimLibrary, getFolderByPath } from '@/lib/shiurim-data';
import { ShiurFolder, ShiurRecording } from '@/types';
import Link from 'next/link';
import { memo } from 'react';
import { sortFoldersByNumber, sortShiurimByNumber } from '@/lib/sort-by-number';

interface PageProps {
  searchParams: Promise<{ path?: string }>;
}

export default async function ShiurimPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const pathParam = params.path || '';
  const folderPath = pathParam ? pathParam.split('/').filter(Boolean) : [];

  // Get current folder
  const currentFolder = await getFolderByPath(folderPath);
  const library = await getShiurimLibrary();

  // Helper function to get folder names for breadcrumb
  const getFolderNames = async (path: string[]): Promise<{ id: string; name: string }[]> => {
    const names: { id: string; name: string }[] = [];
    let currentFolders = library.folders;
    
    for (const folderId of path) {
      const folder = currentFolders.find(f => f.id === folderId);
      if (folder) {
        names.push({ id: folderId, name: folder.name });
        currentFolders = folder.folders;
      }
    }
    
    return names;
  };

  const breadcrumbFolders = await getFolderNames(folderPath);

  if (!currentFolder && folderPath.length > 0) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-primary mb-4">Folder Not Found</h1>
              <Link href="/shiurim" className="text-secondary hover:underline" prefetch={true}>
                Return to Shiurim Home
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const folders = sortFoldersByNumber(currentFolder?.folders || library.folders);
  const shiurim = sortShiurimByNumber(currentFolder?.shiurim || []);
  const hasContent = folders.length > 0 || shiurim.length > 0;
  
  // Check if we're at root level and should show category sections
  const isRootLevel = folderPath.length === 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb Navigation */}
          {!isRootLevel && (
            <nav className="flex mb-8 text-sm" aria-label="Breadcrumb">
              <ol className="inline-flex items-center space-x-1 md:space-x-3">
                <li className="inline-flex items-center">
                  <Link
                    href="/shiurim"
                    className="text-gray-700 hover:text-primary transition-colors font-medium"
                    prefetch={true}
                  >
                    Shiurim
                  </Link>
                </li>
                {breadcrumbFolders.map((folder, index) => {
                  const path = folderPath.slice(0, index + 1).join('/');
                  const isLast = index === breadcrumbFolders.length - 1;
                  return (
                    <li key={folder.id}>
                      <div className="flex items-center">
                        <svg
                          className="w-6 h-6 text-gray-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {isLast ? (
                          <span className="ml-1 font-medium text-primary md:ml-2" dir="auto">
                            {folder.name}
                          </span>
                        ) : (
                          <Link
                            href={`/shiurim?path=${path}`}
                            className="ml-1 text-gray-700 hover:text-primary transition-colors md:ml-2"
                            prefetch={true}
                            dir="auto"
                          >
                            {folder.name}
                          </Link>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </nav>
          )}

          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4" dir="auto">
              {folderPath.length === 0 ? 'Shiurim Library' : currentFolder?.name}
            </h1>
            <p className="text-xl text-gray-700">
              {isRootLevel
                ? 'Choose a category to browse shiurim'
                : hasContent
                ? 'Browse folders and listen to shiurim'
                : 'Shiurim will appear here once uploaded'}
            </p>
          </div>

          {isRootLevel ? (
            /* Category Sections - Special display for root level */
            <CategorySections folders={folders} />
          ) : !hasContent ? (
            /* Empty State */
            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8 md:p-12 text-center">
              <svg
                className="w-24 h-24 mx-auto text-secondary mb-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">
                No Shiurim Yet
              </h2>
              <p className="text-lg text-gray-700 mb-8">
                The shiurim library is being built. Check back soon for recorded shiurim.
              </p>
              <Link
                href="/#schedule"
                className="bg-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-primary-dark transition-colors inline-block"
              >
                View Schedule
              </Link>
            </div>
          ) : (
            <>
              {/* Folders Grid */}
              {folders.length > 0 && (
                <div className="mb-12">
                  <h2 className="text-2xl font-bold text-primary mb-6">Folders</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {folders.map((folder) => (
                      <FolderCard
                        key={folder.id}
                        folder={folder}
                        currentPath={folderPath}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Shiurim List */}
              {shiurim.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-primary mb-6">Shiurim</h2>
                  <div className="space-y-4">
                    {shiurim.map((shiur) => (
                      <ShiurRow key={shiur.id} shiur={shiur} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function CategorySections({ folders }: { folders: ShiurFolder[] }) {
  // Define the three main categories
  const categories = [
    { 
      id: 'gemara', 
      name: 'Gemara', 
      nameHebrew: 'גמרא',
    },
    { 
      id: 'sefarim', 
      name: 'Sefarim', 
      nameHebrew: 'ספרים',
    },
    { 
      id: 'shmoozim', 
      name: 'Shmoozim', 
      nameHebrew: 'שיחות',
    },
  ];

  // Find or create category folders
  const getCategoryFolder = (categoryId: string) => {
    return folders.find(f => f.id.toLowerCase().startsWith(categoryId));
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories.map((category) => {
          const folder = getCategoryFolder(category.id);

          return folder ? (
            <Link
              key={category.id}
              href={`/shiurim?path=${folder.id}`}
              prefetch={true}
            >
              <div className="bg-primary rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-10 cursor-pointer group h-96 flex flex-col justify-between">
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
                  <div className="flex items-center justify-center gap-2 text-white/90 font-medium group-hover:text-accent transition-colors group-hover:gap-3">
                    <span>Enter</span>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ) : (
            <div
              key={category.id}
              className="bg-gray-400 rounded-2xl shadow-xl p-8 h-96 flex flex-col justify-between opacity-50"
            >
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
          );
        })}
      </div>
    </div>
  );
}

const FolderCard = memo(function FolderCard({ folder, currentPath }: { folder: ShiurFolder; currentPath: string[] }) {
  const path = [...currentPath, folder.id].join('/');
  const shiurCount = countShiurimRecursive(folder);
  const subfolderCount = folder.folders.length;

  return (
    <Link href={`/shiurim?path=${path}`} prefetch={true}>
      <div className="bg-primary rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 cursor-pointer group hover:scale-105 transform">
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
      </div>
    </Link>
  );
});

const ShiurRow = memo(function ShiurRow({ shiur }: { shiur: ShiurRecording }) {
  const recordedDate = new Date(shiur.recordedDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Link href={`/shiurim/${shiur.id}`} prefetch={true}>
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl hover:border-primary transition-all duration-300 cursor-pointer group">
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
          <div className="text-gray-400 group-hover:text-yellow-600 transition-colors group-hover:translate-x-1 transform duration-300 flex-shrink-0 ml-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
});

function countShiurimRecursive(folder: ShiurFolder): number {
  let count = folder.shiurim.length;
  for (const subfolder of folder.folders) {
    count += countShiurimRecursive(subfolder);
  }
  return count;
}
