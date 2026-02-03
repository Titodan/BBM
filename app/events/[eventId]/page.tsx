'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import db from '@/lib/instantdb';
import { Event } from '@/types';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;

  const { data, isLoading, error } = db.useQuery({ events: {} } as any);
  const [event, setEvent] = useState<Event | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const eventsData = (data as any)?.events as Event[] | undefined;
    if (eventsData) {
      const foundEvent = eventsData.find((e: Event) => e.id === eventId);
      if (foundEvent && foundEvent.published) {
        setEvent(foundEvent);
      } else if (foundEvent && !foundEvent.published) {
        router.push('/events');
      }
    }
  }, [data, eventId, router]);

  const validateForm = () => {
    if (!name.trim()) return 'Please enter your name';
    if (!email.trim()) return 'Please enter your email';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email';
    if (!phone.trim()) return 'Please enter your phone number';
    if (!address.trim()) return 'Please enter your address';
    return null;
  };

  const handleFreeEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setMessage({ type: 'error', text: validationError });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      // Register directly with InstantDB
      const registrationId = crypto.randomUUID();
      
      await db.transact([
        (db.tx as any).registrations[registrationId].update({
          id: registrationId,
          eventId: event!.id,
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          address: address.trim(),
          registeredAt: new Date().toISOString(),
          paid: false,
          stripeSessionId: undefined,
        }),
      ]);

      setMessage({ type: 'success', text: 'Successfully registered! We look forward to seeing you.' });
      
      // Clear form
      setName('');
      setEmail('');
      setPhone('');
      setAddress('');
    } catch (error) {
      console.error('Registration error:', error);
      setMessage({ type: 'error', text: 'Failed to register. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaidEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setMessage({ type: 'error', text: validationError });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      // Create Stripe Checkout session
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event!.id,
          eventTitle: event!.title,
          price: event!.price,
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          address: address.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { sessionId, url } = await response.json();
      
      // Redirect to Stripe Checkout URL
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setMessage({ type: 'error', text: 'Failed to process payment. Please try again.' });
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        background: 'linear-gradient(to bottom right, #1a3d4f, #0f2027, #4a90e2)'
      }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen" style={{
        background: 'linear-gradient(to bottom right, #1a3d4f, #0f2027, #4a90e2)'
      }}>
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Event Not Found</h1>
          <p className="text-white/80 mb-8">This event doesn't exist or has been unpublished.</p>
          <Link href="/events" className="bg-white text-primary px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors">
            Back to Events
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{
      background: 'linear-gradient(to bottom right, #1a3d4f, #0f2027, #4a90e2)'
    }}>
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <Link href="/events" className="text-white hover:underline mb-6 inline-block">
          ← Back to Events
        </Link>

        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          {/* Event Poster */}
          <div className="relative h-96 w-full bg-gray-200">
            {event.posterUrl && (
              <img
                src={event.posterUrl}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Event Details */}
          <div className="p-8">
            <h1 className="text-4xl font-bold text-primary mb-4">{event.title}</h1>
            
            <div className="flex items-center gap-6 mb-6 text-gray-600">
              <div>
                <span className="font-semibold">Date:</span>{' '}
                {new Date(event.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </div>
              <div>
                <span className="font-semibold">Price:</span>{' '}
                <span className="text-primary font-bold">
                  {event.price === 0 ? 'FREE' : `$${(event.price / 100).toFixed(2)}`}
                </span>
              </div>
            </div>

            {/* Registration Form */}
            <div className="border-t pt-6">
              <h2 className="text-2xl font-bold text-primary mb-4">Register for This Event</h2>
              
              {message && (
                <div className={`mb-4 px-4 py-3 rounded-lg ${
                  message.type === 'success' 
                    ? 'bg-green-50 text-green-800 border border-green-200' 
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {message.text}
                </div>
              )}

              <form onSubmit={event.price === 0 ? handleFreeEventSubmit : handlePaidEventSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting 
                    ? 'Processing...' 
                    : event.price === 0 
                      ? 'Sign Up' 
                      : `Pay $${(event.price / 100).toFixed(2)} & Sign Up`
                  }
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
