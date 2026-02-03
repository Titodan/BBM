'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import db from '@/lib/instantdb';
import { Event } from '@/types';

export default function SuccessPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const eventId = params.eventId as string;
  const sessionId = searchParams.get('session_id');

  const { data, isLoading } = db.useQuery({ events: {} } as any);
  const [event, setEvent] = useState<Event | null>(null);

  useEffect(() => {
    const eventsData = (data as any)?.events as Event[] | undefined;
    if (eventsData) {
      const foundEvent = eventsData.find((e: Event) => e.id === eventId);
      if (foundEvent) {
        setEvent(foundEvent);
      }
    }
  }, [data, eventId]);

  return (
    <div className="min-h-screen" style={{
      background: 'linear-gradient(to bottom right, #1a3d4f, #0f2027, #4a90e2)'
    }}>
      <Navbar />
      
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center">
          {/* Success Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-primary mb-4">
            Registration Successful!
          </h1>

          <p className="text-gray-600 mb-6">
            Thank you for registering. Your payment has been processed successfully.
          </p>

          {isLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : event ? (
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-primary mb-2">{event.title}</h2>
              <p className="text-gray-600">
                {new Date(event.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </p>
            </div>
          ) : null}

          <p className="text-sm text-gray-500 mb-6">
            A confirmation email will be sent to your email address shortly.
            {sessionId && (
              <>
                <br />
                <span className="font-mono text-xs">Transaction ID: {sessionId.slice(-12)}</span>
              </>
            )}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/events"
              className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors font-medium"
            >
              Back to Events
            </Link>
            <Link
              href="/"
              className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Go to Homepage
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
