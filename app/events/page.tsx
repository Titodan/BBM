'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import db from '@/lib/instantdb';
import { Event } from '@/types';

export default function EventsPage() {
  const { data, isLoading, error } = db.useQuery({ events: {} } as any);
  const [sortedEvents, setSortedEvents] = useState<Event[]>([]);

  useEffect(() => {
    const eventsData = (data as any)?.events as Event[] | undefined;
    if (eventsData) {
      // Filter only published events and sort by date (upcoming first)
      const published = eventsData
        .filter((event: Event) => event.published)
        .sort((a: Event, b: Event) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setSortedEvents(published);
    }
  }, [data]);

  return (
    <div className="min-h-screen" style={{
      background: 'linear-gradient(to bottom right, #1a3d4f, #0f2027, #4a90e2)'
    }}>
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Upcoming Events
          </h1>
          <p className="text-xl text-white/80">
            Join us for inspiring lectures, classes, and community gatherings
          </p>
        </div>

        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-white px-6 py-4 rounded-lg text-center">
            Failed to load events. Please try again later.
          </div>
        )}

        {!isLoading && !error && sortedEvents.length === 0 && (
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-6 py-12 rounded-lg text-center">
            <p className="text-xl">No upcoming events at this time.</p>
            <p className="text-white/70 mt-2">Check back soon for new events!</p>
          </div>
        )}

        {!isLoading && !error && sortedEvents.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedEvents.map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
              >
                <div className="relative h-64 w-full bg-gray-200">
                  {event.posterUrl && (
                    <img
                      src={event.posterUrl}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-primary mb-2">
                    {event.title}
                  </h2>
                  
                  <p className="text-gray-600 mb-4">
                    {new Date(event.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-primary">
                      {event.price === 0 ? 'FREE' : `$${(event.price / 100).toFixed(2)}`}
                    </span>
                    
                    <span className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors">
                      Sign Up
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
