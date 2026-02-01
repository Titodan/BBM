'use client';

import { useState } from 'react';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    // TODO: Replace with actual API endpoint
    // For now, just simulate a submission
    setTimeout(() => {
      setStatus('success');
      setMessage('Thank you for subscribing! Check your email for confirmation.');
      setEmail('');
      
      // Reset after 5 seconds
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 5000);
    }, 1000);
  };

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-secondary to-primary">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Icon */}
        <div className="mb-6">
          <svg
            className="w-16 h-16 mx-auto text-accent"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>

        {/* Heading */}
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
          Stay Connected
        </h2>
        <p className="text-lg md:text-xl text-white/90 mb-8 md:mb-12">
          Subscribe to our newsletter for updates on shiurim, events, and more
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="max-w-md mx-auto">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={status === 'loading'}
              className="flex-1 px-6 py-4 rounded-lg text-foreground placeholder-foreground/50 focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="bg-accent text-primary-dark px-8 py-4 rounded-lg font-bold hover:bg-accent/90 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
            </button>
          </div>

          {/* Status Message */}
          {message && (
            <div
              className={`mt-4 p-4 rounded-lg ${
                status === 'success'
                  ? 'bg-accent/20 text-white'
                  : 'bg-red-500/20 text-white'
              }`}
            >
              {message}
            </div>
          )}
        </form>

        {/* Privacy Note */}
        <p className="text-sm text-white/70 mt-6">
          We respect your privacy. Unsubscribe at any time.
        </p>
      </div>
    </section>
  );
}
