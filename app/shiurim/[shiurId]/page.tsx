import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AudioPlayer from '@/components/AudioPlayer';
import { findShiurById } from '@/lib/shiurim-data';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ shiurId: string }>;
}

export default async function ShiurPage({ params }: PageProps) {
  const { shiurId } = await params;
  
  // Find the shiur by ID
  const result = await findShiurById(shiurId);
  
  if (!result) {
    notFound();
  }
  
  const { shiur, path } = result;
  
  // Format the recorded date
  const recordedDate = new Date(shiur.recordedDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  // Build the back link to the folder
  const folderPath = path.join('/');
  const backUrl = `/shiurim?path=${folderPath}`;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Navigation */}
          <div className="mb-8">
            <Link
              href={backUrl}
              className="inline-flex items-center text-gray-700 hover:text-primary transition-colors font-medium"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to Folder
            </Link>
          </div>

          {/* Shiur Details Card */}
          <div className="bg-white rounded-2xl shadow-xl p-10 md:p-16">
            {/* Header */}
            <div className="mb-10 pb-8 border-b border-gray-200">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-6">
                {shiur.title}
              </h1>
              <div className="flex flex-wrap items-center gap-6 text-gray-600">
                <div className="flex items-center gap-3">
                  <svg
                    className="w-7 h-7"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-lg font-medium">{recordedDate}</span>
                </div>
                {shiur.duration > 0 && (
                  <div className="flex items-center gap-3">
                    <svg
                      className="w-7 h-7"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-lg font-medium">
                      {Math.floor(shiur.duration / 60)} minutes
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Audio Player */}
            <div className="mb-10">
              <AudioPlayer
                audioUrl={shiur.audioUrl}
                title={shiur.title}
              />
            </div>

            {/* Additional Info */}
            <div className="mt-10 pt-8 border-t border-gray-200">
              <div className="flex flex-wrap gap-8 text-base text-gray-600">
                <div>
                  <span className="font-medium text-gray-700 text-lg">Uploaded:</span>{' '}
                  <span className="text-lg">
                    {new Date(shiur.uploadedDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700 text-lg">Size:</span>{' '}
                  <span className="text-lg">
                    {(shiur.fileSize / (1024 * 1024)).toFixed(2)} MB
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
