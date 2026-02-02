'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShiurimLibrary, ShiurFolder, ShiurRecording } from '@/types';

export default function AdminShiurimPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const [library, setLibrary] = useState<ShiurimLibrary>({ folders: [] });
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Upload form state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDate, setUploadDate] = useState(new Date().toISOString().split('T')[0]);
  const [uploadProgress, setUploadProgress] = useState(false);

  // Folder form state
  const [newFolderName, setNewFolderName] = useState('');
  const [folderCreating, setFolderCreating] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadLibrary();
    }
  }, [isAuthenticated]);

  const checkAuth = async () => {
    // Check if already authenticated by trying to access the library endpoint
    try {
      const res = await fetch('/api/admin/library');
      if (res.ok) {
        // Successfully authenticated
        setIsAuthenticated(true);
      } else {
        // Not authenticated or error
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

  const loadLibrary = async () => {
    try {
      const res = await fetch('/api/admin/library');
      if (res.ok) {
        const data = await res.json();
        setLibrary(data);
      }
    } catch (error) {
      console.error('Failed to load library:', error);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    setFolderCreating(true);
    try {
      const res = await fetch('/api/admin/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newFolderName,
          parentPath: currentPath,
        }),
      });

      if (res.ok) {
        showMessage('success', 'Folder created successfully');
        setNewFolderName('');
        await loadLibrary();
      } else {
        const data = await res.json();
        showMessage('error', data.error || 'Failed to create folder');
      }
    } catch (error) {
      showMessage('error', 'Failed to create folder');
    } finally {
      setFolderCreating(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || !uploadTitle || currentPath.length === 0) {
      showMessage('error', 'Please fill all fields and select a folder');
      return;
    }

    setUploadProgress(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('title', uploadTitle);
      formData.append('recordedDate', uploadDate);
      formData.append('folderPath', JSON.stringify(currentPath));

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        showMessage('success', 'Shiur uploaded successfully');
        setUploadFile(null);
        setUploadTitle('');
        setUploadDate(new Date().toISOString().split('T')[0]);
        await loadLibrary();
        // Reset file input
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        const data = await res.json();
        showMessage('error', data.error || 'Failed to upload shiur');
      }
    } catch (error) {
      showMessage('error', 'Failed to upload shiur');
    } finally {
      setUploadProgress(false);
    }
  };

  const handleDeleteFolder = async (folderPath: string[]) => {
    if (!confirm('Are you sure? This will delete the folder and ALL its contents, including subfolders and shiurim.')) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/folders?path=${encodeURIComponent(JSON.stringify(folderPath))}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        const data = await res.json();
        showMessage('success', `Folder deleted (${data.deletedCount} shiurim removed)`);
        await loadLibrary();
        // Navigate up if current path is deleted
        if (folderPath.every((seg, i) => seg === currentPath[i])) {
          setCurrentPath(folderPath.slice(0, -1));
        }
      } else {
        const data = await res.json();
        showMessage('error', data.error || 'Failed to delete folder');
      }
    } catch (error) {
      showMessage('error', 'Failed to delete folder');
    }
  };

  const handleDeleteShiur = async (shiurId: string) => {
    if (!confirm('Are you sure you want to delete this shiur?')) {
      return;
    }

    try {
      const res = await fetch(
        `/api/admin/delete?shiurId=${encodeURIComponent(shiurId)}&folderPath=${encodeURIComponent(JSON.stringify(currentPath))}`,
        { method: 'DELETE' }
      );

      if (res.ok) {
        showMessage('success', 'Shiur deleted successfully');
        await loadLibrary();
      } else {
        const data = await res.json();
        showMessage('error', data.error || 'Failed to delete shiur');
      }
    } catch (error) {
      showMessage('error', 'Failed to delete shiur');
    }
  };

  const getCurrentFolder = (): ShiurFolder | null => {
    let folders = library.folders;
    let current: ShiurFolder | null = null;

    for (const id of currentPath) {
      current = folders.find(f => f.id === id) || null;
      if (!current) return null;
      folders = current.folders;
    }

    return current;
  };

  const getFolderNamesFromPath = (path: string[]): string[] => {
    const names: string[] = [];
    let folders = library.folders;

    for (const id of path) {
      const folder = folders.find(f => f.id === id);
      if (folder) {
        names.push(folder.name);
        folders = folder.folders;
      } else {
        names.push(id); // Fallback to ID if folder not found
      }
    }

    return names;
  };

  const currentFolder = getCurrentFolder();
  const displayFolders = currentFolder?.folders || library.folders;
  const displayShiurim = currentFolder?.shiurim || [];

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
          <p className="mt-4 text-sm text-gray-600 text-center">
            Default password: admin123
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">Shiurim Admin</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Logout
          </button>
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
        {/* Breadcrumb */}
        <nav className="flex mb-6 text-sm">
          <button
            onClick={() => setCurrentPath([])}
            className="text-primary hover:underline font-medium"
          >
            Root
          </button>
          {getFolderNamesFromPath(currentPath).map((name, index) => {
            return (
              <span key={index} className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <button
                  onClick={() => setCurrentPath(currentPath.slice(0, index + 1))}
                  className="text-primary hover:underline"
                >
                  {name}
                </button>
              </span>
            );
          })}
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Folder Management */}
          <div className="space-y-6">
            {/* Create Folder */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-primary mb-4">Create Folder</h2>
              <form onSubmit={handleCreateFolder} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Folder Name
                  </label>
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="e.g., Pesachim 2024"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={folderCreating}
                  className="w-full bg-primary text-white py-2 rounded-lg font-bold hover:bg-primary-dark transition-colors disabled:opacity-50"
                >
                  {folderCreating ? 'Creating...' : 'Create Folder'}
                </button>
              </form>
            </div>

            {/* Folder List */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-primary mb-4">Folders</h2>
              {displayFolders.length === 0 ? (
                <p className="text-gray-500">No folders yet</p>
              ) : (
                <div className="space-y-2">
                  {displayFolders.map((folder) => (
                    <div key={folder.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <button
                        onClick={() => setCurrentPath([...currentPath, folder.id])}
                        className="flex items-center gap-2 flex-1 text-left hover:text-primary transition-colors"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                        </svg>
                        <span className="font-medium">{folder.name}</span>
                      </button>
                      <button
                        onClick={() => handleDeleteFolder([...currentPath, folder.id])}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete folder"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Upload Form */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-primary mb-4">Upload Shiur</h2>
              {currentPath.length === 0 ? (
                <div className="bg-yellow-50 text-yellow-800 px-4 py-3 rounded-lg mb-4">
                  Please select a folder first by clicking on a folder or creating one.
                </div>
              ) : (
                <div className="bg-blue-50 text-blue-800 px-4 py-3 rounded-lg mb-4 text-sm">
                  Uploading to: <strong>{getFolderNamesFromPath(currentPath).join(' / ')}</strong>
                </div>
              )}
              
              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Audio File
                  </label>
                  <input
                    type="file"
                    id="file-upload"
                    accept=".mp3,.m4a,.wav,audio/*"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                  {uploadFile && (
                    <p className="mt-1 text-sm text-gray-500">
                      {(uploadFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="e.g., Pesachim Perek 1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recorded Date
                  </label>
                  <input
                    type="date"
                    value={uploadDate}
                    onChange={(e) => setUploadDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={uploadProgress || currentPath.length === 0}
                  className="w-full bg-secondary text-white py-3 rounded-lg font-bold hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadProgress ? 'Uploading...' : 'Upload Shiur'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Shiurim List */}
        {displayShiurim.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-primary mb-4">
              Shiurim in Current Folder
            </h2>
            <div className="space-y-3">
              {displayShiurim.map((shiur) => (
                <div key={shiur.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{shiur.title}</h3>
                    <p className="text-sm text-gray-600">
                      {new Date(shiur.recordedDate).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteShiur(shiur.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Delete shiur"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
