import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AudioPlayer from '@/components/AudioPlayer';
import { getShiurimLibrary, getFolderByPath } from '@/lib/shiurim-data';
import { ShiurFolder, ShiurRecording } from '@/types';
import Link from 'next/link';

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

  if (!currentFolder && folderPath.length > 0) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-primary mb-4">Folder Not Found</h1>
              <Link href="/shiurim" className="text-secondary hover:underline">
                Return to Shiurim Home
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const folders = currentFolder?.folders || library.folders;
  const shiurim = currentFolder?.shiurim || [];
  const hasContent = folders.length > 0 || shiurim.length > 0;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb Navigation */}
          <nav className="flex mb-8 text-sm" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link
                  href="/shiurim"
                  className="text-gray-700 hover:text-primary transition-colors"
                >
                  Shiurim
                </Link>
              </li>
              {folderPath.map((segment, index) => {
                const path = folderPath.slice(0, index + 1).join('/');
                const isLast = index === folderPath.length - 1;
                return (
                  <li key={segment}>
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
                        <span className="ml-1 font-medium text-primary md:ml-2">
                          {currentFolder?.name}
                        </span>
                      ) : (
                        <Link
                          href={`/shiurim?path=${path}`}
                          className="ml-1 text-gray-700 hover:text-primary transition-colors md:ml-2"
                        >
                          {currentFolder?.name}
                        </Link>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </nav>

          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
              {folderPath.length === 0 ? 'Shiurim Library' : currentFolder?.name}
            </h1>
            <p className="text-xl text-gray-700">
              {hasContent
                ? 'Browse folders and listen to shiurim'
                : 'Shiurim will appear here once uploaded'}
            </p>
          </div>

          {!hasContent ? (
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

function FolderCard({ folder, currentPath }: { folder: ShiurFolder; currentPath: string[] }) {
  const path = [...currentPath, folder.id].join('/');
  const shiurCount = countShiurimRecursive(folder);
  const subfolderCount = folder.folders.length;

  return (
    <Link href={`/shiurim?path=${path}`}>
      <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 cursor-pointer group">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
            <svg
              className="w-8 h-8 text-primary"
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
            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">
              {folder.name}
            </h3>
            <div className="text-sm text-gray-600 space-y-1">
              {subfolderCount > 0 && (
                <p>{subfolderCount} {subfolderCount === 1 ? 'folder' : 'folders'}</p>
              )}
              {shiurCount > 0 && (
                <p>{shiurCount} {shiurCount === 1 ? 'shiur' : 'shiurim'}</p>
              )}
              {subfolderCount === 0 && shiurCount === 0 && (
                <p className="text-gray-400">Empty folder</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function ShiurRow({ shiur }: { shiur: ShiurRecording }) {
  const recordedDate = new Date(shiur.recordedDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">{shiur.title}</h3>
          <span className="text-sm text-gray-500">{recordedDate}</span>
        </div>
      </div>
      <AudioPlayer
        audioUrl={shiur.audioUrl}
        title={shiur.title}
        rabbi={shiur.rabbi}
      />
    </div>
  );
}

function countShiurimRecursive(folder: ShiurFolder): number {
  let count = folder.shiurim.length;
  for (const subfolder of folder.folders) {
    count += countShiurimRecursive(subfolder);
  }
  return count;
}
