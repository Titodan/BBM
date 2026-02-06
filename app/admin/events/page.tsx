'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import db from '@/lib/instantdb';
import { Event, EventRegistration } from '@/types';

export default function AdminEventsPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedEventForRegistrations, setSelectedEventForRegistrations] = useState<string | null>(null);

  // Create event form state
  const [createTitle, setCreateTitle] = useState('');
  const [createDate, setCreateDate] = useState('');
  const [createPrice, setCreatePrice] = useState('0');
  const [createPosterFile, setCreatePosterFile] = useState<File | null>(null);
  const [createPublished, setCreatePublished] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // Edit event state
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editPrice, setEditPrice] = useState('0');

  // Query events and registrations with real-time updates
  const eventsQuery = db.useQuery({ events: {} } as any);
  const registrationsQuery = db.useQuery({ registrations: {} } as any);

  const events = ((eventsQuery.data as any)?.events || []) as Event[];
  const registrations = ((registrationsQuery.data as any)?.registrations || []) as EventRegistration[];

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/admin/library');
      if (res.ok) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        setIsAuthenticated(true);
        setPassword('');
      } else {
        const data = await res.json();
        setAuthError(data.error || 'Invalid password');
      }
    } catch (error) {
      setAuthError('Failed to authenticate');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    setIsAuthenticated(false);
    router.refresh();
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!createPosterFile) {
      showMessage('error', 'Please select a poster image');
      return;
    }

    // Validate file type - only accept JPG, PNG, GIF, WebP
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(createPosterFile.type.toLowerCase())) {
      showMessage('error', `Invalid file type: ${createPosterFile.type}. Please use JPG, PNG, GIF, or WebP images. iPhone users: Convert HEIC to JPG first.`);
      return;
    }

    setIsCreating(true);

    try {
      // Upload poster to InstantDB storage via API route (server-side with admin token)
      const formData = new FormData();
      formData.append('file', createPosterFile);
      
      const uploadResponse = await fetch('/api/admin/upload-poster', {
        method: 'POST',
        body: formData,
      });
      
      if (!uploadResponse.ok) {
        throw new Error('Failed to upload poster');
      }
      
      const { url } = await uploadResponse.json();

      // Create event in InstantDB
      const eventId = crypto.randomUUID();
      const priceInCents = Math.round(parseFloat(createPrice) * 100);

      await db.transact([
        (db.tx as any).events[eventId].update({
          id: eventId,
          title: createTitle,
          date: new Date(createDate).toISOString(),
          posterUrl: url,
          price: priceInCents,
          published: createPublished,
          createdDate: new Date().toISOString(),
        }),
      ]);

      showMessage('success', 'Event created successfully');
      
      // Reset form
      setCreateTitle('');
      setCreateDate('');
      setCreatePrice('0');
      setCreatePosterFile(null);
      setCreatePublished(true);
      
      const fileInput = document.getElementById('poster-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error) {
      console.error('Create event error:', error);
      showMessage('error', 'Failed to create event');
    } finally {
      setIsCreating(false);
    }
  };

  const handleTogglePublish = async (event: Event) => {
    try {
      await db.transact([
        (db.tx as any).events[event.id].update({
          published: !event.published,
        }),
      ]);
      showMessage('success', `Event ${!event.published ? 'published' : 'unpublished'}`);
    } catch (error) {
      showMessage('error', 'Failed to update event');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    try {
      await db.transact([(db.tx as any).events[eventId].delete()]);
      
      // Also delete associated registrations
      const eventRegistrations = registrations.filter((r: EventRegistration) => r.eventId === eventId);
      if (eventRegistrations.length > 0) {
        await db.transact(
          eventRegistrations.map((r: EventRegistration) => (db.tx as any).registrations[r.id].delete())
        );
      }

      showMessage('success', 'Event deleted successfully');
    } catch (error) {
      showMessage('error', 'Failed to delete event');
    }
  };

  const startEditEvent = (event: Event) => {
    setEditingEventId(event.id);
    setEditTitle(event.title);
    setEditDate(event.date.slice(0, 16)); // Format for datetime-local
    setEditPrice((event.price / 100).toString());
  };

  const handleSaveEdit = async (eventId: string) => {
    try {
      const priceInCents = Math.round(parseFloat(editPrice) * 100);
      
      await db.transact([
        (db.tx as any).events[eventId].update({
          title: editTitle,
          date: new Date(editDate).toISOString(),
          price: priceInCents,
        }),
      ]);

      showMessage('success', 'Event updated successfully');
      setEditingEventId(null);
    } catch (error) {
      showMessage('error', 'Failed to update event');
    }
  };

  const getEventRegistrations = (eventId: string) => {
    return registrations
      .filter((r: EventRegistration) => r.eventId === eventId)
      .sort((a: EventRegistration, b: EventRegistration) => 
        new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime()
      );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-primary mb-6 text-center">Admin Login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>
            {authError && (
              <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm">
                {authError}
              </div>
            )}
            <button
              type="submit"
              className="w-full bg-primary text-white py-2 rounded-lg font-bold hover:bg-primary-dark transition-colors"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white/95 backdrop-blur-sm shadow-md border-b border-white/40">
        <div className="max-w-full mx-auto px-2 sm:px-3 lg:px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary overflow-hidden border border-primary/20 shadow-sm">
              <img
                src="/bbm-navbar-logo-white.png"
                alt="BBM Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-semibold text-primary">Events</h1>
              <p className="text-xs text-gray-500">Admin console</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/shiurim"
              className="px-3 py-1.5 text-sm text-primary hover:text-primary-dark transition-colors font-medium"
            >
              Shiurim
            </Link>
            <Link
              href="/"
              className="px-3 py-1.5 text-sm text-primary hover:text-primary-dark transition-colors font-medium flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </Link>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 text-sm bg-white text-primary border border-primary/20 rounded-md hover:bg-primary/5 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Message Toast */}
      {message && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
          <div
            className={`px-6 py-3 rounded-lg shadow-lg ${
              message.type === 'success' ? 'bg-green-500' : 'bg-red-500'
            } text-white`}
          >
            {message.text}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Create Event Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-primary mb-4">Create Event</h2>
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Title *
                </label>
                <input
                  type="text"
                  value={createTitle}
                  onChange={(e) => setCreateTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="e.g., Torah Study Evening"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date & Time *
                </label>
                <input
                  type="datetime-local"
                  value={createDate}
                  onChange={(e) => setCreateDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (USD) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={createPrice}
                  onChange={(e) => setCreatePrice(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="0 for free events"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Enter 0 for free events, or the price in dollars (e.g., 10.00)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Poster Image *
                </label>
                <input
                  type="file"
                  id="poster-upload"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={(e) => setCreatePosterFile(e.target.files?.[0] || null)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Accepted formats: JPG, PNG, GIF, WebP (no HEIC)
                </p>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="published"
                  checked={createPublished}
                  onChange={(e) => setCreatePublished(e.target.checked)}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="published" className="ml-2 block text-sm text-gray-700">
                  Publish immediately
                </label>
              </div>

              <button
                type="submit"
                disabled={isCreating}
                className="w-full bg-primary text-white py-2 rounded-lg font-bold hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                {isCreating ? 'Creating...' : 'Create Event'}
              </button>
            </form>
          </div>

          {/* Stats */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-primary mb-4">Statistics</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-primary/10 rounded-lg p-4">
                <div className="text-3xl font-bold text-primary">{events.length}</div>
                <div className="text-sm text-gray-600">Total Events</div>
              </div>
              <div className="bg-green-100 rounded-lg p-4">
                <div className="text-3xl font-bold text-green-600">
                  {events.filter((e: Event) => e.published).length}
                </div>
                <div className="text-sm text-gray-600">Published</div>
              </div>
              <div className="bg-blue-100 rounded-lg p-4">
                <div className="text-3xl font-bold text-blue-600">{registrations.length}</div>
                <div className="text-sm text-gray-600">Total Registrations</div>
              </div>
              <div className="bg-purple-100 rounded-lg p-4">
                <div className="text-3xl font-bold text-purple-600">
                  {registrations.filter((r: EventRegistration) => r.paid).length}
                </div>
                <div className="text-sm text-gray-600">Paid Registrations</div>
              </div>
            </div>
          </div>
        </div>

        {/* Events List */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-primary mb-4">All Events</h2>
          
          {events.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No events yet. Create your first event above!</p>
          ) : (
            <div className="space-y-4">
              {events
                .sort((a: Event, b: Event) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())
                .map((event: Event) => {
                  const eventRegs = getEventRegistrations(event.id);
                  const isEditing = editingEventId === event.id;
                  const showingRegistrations = selectedEventForRegistrations === event.id;

                  return (
                    <div key={event.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start gap-4">
                        {/* Poster Thumbnail */}
                        <div className="flex-shrink-0 w-24 h-24 bg-gray-200 rounded overflow-hidden">
                          {event.posterUrl && (
                            <img src={event.posterUrl} alt={event.title} className="w-full h-full object-cover" />
                          )}
                        </div>

                        {/* Event Details */}
                        <div className="flex-1 min-w-0">
                          {isEditing ? (
                            <div className="space-y-2">
                              <input
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="w-full px-3 py-1 border rounded"
                              />
                              <input
                                type="datetime-local"
                                value={editDate}
                                onChange={(e) => setEditDate(e.target.value)}
                                className="w-full px-3 py-1 border rounded"
                              />
                              <input
                                type="number"
                                step="0.01"
                                value={editPrice}
                                onChange={(e) => setEditPrice(e.target.value)}
                                className="w-full px-3 py-1 border rounded"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleSaveEdit(event.id)}
                                  className="px-3 py-1 bg-primary text-white rounded hover:bg-primary-dark"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => setEditingEventId(null)}
                                  className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                                  <p className="text-sm text-gray-600">
                                    {new Date(event.date).toLocaleString('en-US', {
                                      weekday: 'short',
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric',
                                      hour: 'numeric',
                                      minute: '2-digit',
                                    })}
                                  </p>
                                  <div className="flex items-center gap-3 mt-2">
                                    <span className="text-sm font-semibold text-primary">
                                      {event.price === 0 ? 'FREE' : `$${(event.price / 100).toFixed(2)}`}
                                    </span>
                                    <span
                                      className={`text-xs px-2 py-1 rounded ${
                                        event.published
                                          ? 'bg-green-100 text-green-800'
                                          : 'bg-gray-100 text-gray-800'
                                      }`}
                                    >
                                      {event.published ? 'Published' : 'Draft'}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {eventRegs.length} registration{eventRegs.length !== 1 ? 's' : ''}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex flex-wrap gap-2 mt-3">
                                <button
                                  onClick={() => handleTogglePublish(event)}
                                  className="text-xs px-3 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                                >
                                  {event.published ? 'Unpublish' : 'Publish'}
                                </button>
                                <button
                                  onClick={() => startEditEvent(event)}
                                  className="text-xs px-3 py-1 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() =>
                                    setSelectedEventForRegistrations(
                                      showingRegistrations ? null : event.id
                                    )
                                  }
                                  className="text-xs px-3 py-1 bg-purple-100 text-purple-800 rounded hover:bg-purple-200"
                                >
                                  {showingRegistrations ? 'Hide' : 'View'} Registrations ({eventRegs.length})
                                </button>
                                <button
                                  onClick={() => handleDeleteEvent(event.id)}
                                  className="text-xs px-3 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200"
                                >
                                  Delete
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Registrations Table */}
                      {showingRegistrations && (
                        <div className="mt-4 border-t pt-4">
                          <h4 className="font-semibold mb-3">Registrations</h4>
                          {eventRegs.length === 0 ? (
                            <p className="text-gray-500 text-sm">No registrations yet</p>
                          ) : (
                            <div className="overflow-x-auto">
                              <table className="min-w-full text-sm">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="px-3 py-2 text-left">Name</th>
                                    <th className="px-3 py-2 text-left">Email</th>
                                    <th className="px-3 py-2 text-left">Phone</th>
                                    <th className="px-3 py-2 text-left">Address</th>
                                    <th className="px-3 py-2 text-left">Date</th>
                                    <th className="px-3 py-2 text-left">Status</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y">
                                  {eventRegs.map((reg: EventRegistration) => (
                                    <tr key={reg.id}>
                                      <td className="px-3 py-2">{reg.name}</td>
                                      <td className="px-3 py-2">{reg.email}</td>
                                      <td className="px-3 py-2">{reg.phone}</td>
                                      <td className="px-3 py-2">{reg.address}</td>
                                      <td className="px-3 py-2">
                                        {new Date(reg.registeredAt).toLocaleDateString()}
                                      </td>
                                      <td className="px-3 py-2">
                                        <span
                                          className={`text-xs px-2 py-1 rounded ${
                                            reg.paid
                                              ? 'bg-green-100 text-green-800'
                                              : 'bg-gray-100 text-gray-800'
                                          }`}
                                        >
                                          {reg.paid ? 'Paid' : 'Free'}
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
