import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AudioPlayer from '@/components/AudioPlayer';
import AnimatedFolderCard from '@/components/AnimatedFolderCard';
import AnimatedShiurRow from '@/components/AnimatedShiurRow';
import AnimatedCategoryCard from '@/components/AnimatedCategoryCard';
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
                    {folders.map((folder, index) => (
                      <AnimatedFolderCard
                        key={folder.id}
                        folder={folder}
                        currentPath={folderPath}
                        index={index}
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
                    {shiurim.map((shiur, index) => (
                      <AnimatedShiurRow key={shiur.id} shiur={shiur} index={index} />
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
        {categories.map((category, index) => {
          const folder = getCategoryFolder(category.id);
          return (
            <AnimatedCategoryCard
              key={category.id}
              category={category}
              folderId={folder?.id}
              index={index}
            />
          );
        })}
      </div>
    </div>
  );
}

