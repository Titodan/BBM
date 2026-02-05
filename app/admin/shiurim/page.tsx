'use client';

import { useState, useEffect, useRef } from 'react';
import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShiurimLibrary, ShiurFolder, ShiurRecording } from '@/types';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core';

// Draggable Item Component
function DraggableItem({
  id,
  type,
  children,
  isDragging,
}: {
  id: string;
  type: 'folder' | 'shiur';
  children: React.ReactNode;
  isDragging: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `${type}-${id}`,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={isDragging ? 'opacity-50' : ''}
    >
      {children}
    </div>
  );
}

// Droppable Area Component
function DroppableArea({
  id,
  type,
  children,
}: {
  id: string;
  type: 'folder' | 'shiur' | 'breadcrumb';
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `${type}-${id}`,
  });

  // For breadcrumbs, we want the drop zone visible and highlight on hover
  if (type === 'breadcrumb') {
    return (
      <div
        ref={setNodeRef}
        className={`inline-flex ${isOver ? 'bg-blue-100 rounded' : ''}`}
      >
        {children}
      </div>
    );
  }

  // For folders and shiurim, add ring on hover
  const ringClasses = isOver ? 'ring-2 ring-blue-500 ring-offset-2 rounded' : '';

  // Clone children to add ring classes when dragging over
  const childrenWithRing = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child as React.ReactElement<any>, {
        className: `${(child as React.ReactElement<any>).props.className || ''} ${ringClasses}`.trim(),
      });
    }
    return child;
  });

  return (
    <div ref={setNodeRef}>
      {childrenWithRing || children}
    </div>
  );
}

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
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDate, setUploadDate] = useState(new Date().toISOString().split('T')[0]);
  const [uploadProgress, setUploadProgress] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>('');

  // Folder form state
  const [newFolderName, setNewFolderName] = useState('');
  const [folderCreating, setFolderCreating] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [showFolderForm, setShowFolderForm] = useState(false);

  // Drag and drop state
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<'folder' | 'shiur' | null>(null);
  
  // Rename state
  const [renamingItem, setRenamingItem] = useState<{
    type: 'folder' | 'shiur';
    id: string;
    currentName: string;
  } | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const renameInputRef = useRef<HTMLInputElement>(null);
  
  // View mode
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px of movement before drag starts
      },
    })
  );

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadLibrary();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (renamingItem) {
      setTimeout(() => renameInputRef.current?.select(), 0);
    }
  }, [renamingItem]);

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
        
        // Auto-create category folders if they don't exist
        await ensureCategoryFolders(data);
      }
    } catch (error) {
      console.error('Failed to load library:', error);
    }
  };

  const ensureCategoryFolders = async (currentLibrary: ShiurimLibrary) => {
    const categoryFolders = ['gemara', 'sefarim', 'shmoozim'];
    const existingFolderIds = currentLibrary.folders.map(f => f.id.toLowerCase());

    for (const category of categoryFolders) {
      const exists = existingFolderIds.some(id => id.startsWith(category));
      if (!exists) {
        // Create the category folder
        const capitalizedName = category.charAt(0).toUpperCase() + category.slice(1);
        await fetch('/api/admin/folders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: capitalizedName,
            parentPath: [],
          }),
        });
      }
    }
  };

  const isCategoryFolder = (folderId: string): boolean => {
    const categoryFolders = ['gemara', 'sefarim', 'shmoozim'];
    return categoryFolders.some(cat => folderId.toLowerCase().startsWith(cat));
  };

  const handleMigrateFolders = async () => {
    if (!confirm('This will move the Pesachim folder to Gemara and create the three category folders. Continue?')) {
      return;
    }

    setMigrating(true);
    try {
      const res = await fetch('/api/admin/migrate-folders', {
        method: 'POST',
      });

      const data = await res.json();
      
      if (res.ok) {
        showMessage('success', data.message || 'Migration completed successfully');
        await loadLibrary();
      } else {
        showMessage('error', data.error || 'Migration failed');
      }
    } catch (error) {
      showMessage('error', 'Failed to migrate folders');
    } finally {
      setMigrating(false);
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
        setShowFolderForm(false);
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
    if (uploadFiles.length === 0 || currentPath.length === 0) {
      showMessage('error', 'Please select file(s) and a folder');
      return;
    }

    setUploadProgress(true);
    let successCount = 0;
    let failCount = 0;

    try {
      // Upload files sequentially
      for (let i = 0; i < uploadFiles.length; i++) {
        const file = uploadFiles[i];
        setUploadStatus(`Uploading ${i + 1} of ${uploadFiles.length}: ${file.name}...`);

        try {
          // For multiple files, always use filename. For single file with custom title, use that.
          const finalTitle = uploadFiles.length === 1 && uploadTitle.trim() 
            ? uploadTitle.trim() 
            : file.name.replace(/\.[^/.]+$/, '');

          // Step 1: Generate unique filename
          const timestamp = Date.now() + i; // Add index to ensure uniqueness
          const sanitizedTitle = finalTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          const ext = file.name.split('.').pop();
          const fileName = `${sanitizedTitle}-${timestamp}.${ext}`;

          // Step 2: Get presigned URL for direct upload to R2
          const presignedRes = await fetch('/api/admin/presigned-url', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileName,
              contentType: file.type || 'audio/mpeg',
            }),
          });

          if (!presignedRes.ok) {
            failCount++;
            continue;
          }

          const { uploadUrl } = await presignedRes.json();

          // Step 3: Upload file directly to R2 using presigned URL
          const uploadRes = await fetch(uploadUrl, {
            method: 'PUT',
            body: file,
            headers: {
              'Content-Type': file.type || 'audio/mpeg',
            },
          });

          if (!uploadRes.ok) {
            failCount++;
            continue;
          }

          // Step 4: Register the upload in our system
          const registerRes = await fetch('/api/admin/register-upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: finalTitle,
              recordedDate: uploadDate,
              folderPath: currentPath,
              fileName,
              fileSize: file.size,
              contentType: file.type || 'audio/mpeg',
            }),
          });

          if (registerRes.ok) {
            successCount++;
          } else {
            failCount++;
          }

          // Small delay between uploads to avoid overwhelming the server
          if (i < uploadFiles.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        } catch (error) {
          console.error(`Upload error for ${file.name}:`, error);
          failCount++;
        }
      }

      // Show summary message
      if (successCount > 0 && failCount === 0) {
        showMessage('success', `Successfully uploaded ${successCount} shiur${successCount > 1 ? 'im' : ''}`);
      } else if (successCount > 0 && failCount > 0) {
        showMessage('error', `Uploaded ${successCount} shiur${successCount > 1 ? 'im' : ''}, ${failCount} failed`);
      } else {
        showMessage('error', 'All uploads failed');
      }

      // Reset form
      setUploadFiles([]);
      setUploadTitle('');
      setUploadDate(new Date().toISOString().split('T')[0]);
      setShowUploadForm(false);
      setUploadStatus('');
      await loadLibrary();
      
      // Reset file input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error) {
      console.error('Upload error:', error);
      showMessage('error', 'Failed to upload shiurim');
    } finally {
      setUploadProgress(false);
      setUploadStatus('');
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

  // Drag and drop handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const id = active.id as string;
    
    if (id.startsWith('folder-')) {
      setActiveType('folder');
      setActiveId(id.replace('folder-', ''));
    } else if (id.startsWith('shiur-')) {
      setActiveType('shiur');
      setActiveId(id.replace('shiur-', ''));
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveId(null);
      setActiveType(null);
      return;
    }

    const activeIdStr = (active.id as string).replace(/^(folder|shiur)-/, '');
    const overIdStr = over.id as string;

    // Don't do anything if dropped on itself
    if (active.id === over.id) {
      setActiveId(null);
      setActiveType(null);
      return;
    }

    try {
      if (activeType === 'shiur') {
        // Moving a shiur
        let targetPath: string[] = [];
        
        if (overIdStr.startsWith('folder-')) {
          // Dropped on a folder in current view
          const targetFolderId = overIdStr.replace('folder-', '');
          targetPath = [...currentPath, targetFolderId];
        } else if (overIdStr.startsWith('breadcrumb-')) {
          // Dropped on a breadcrumb folder
          const breadcrumbId = overIdStr.replace('breadcrumb-', '');
          
          if (breadcrumbId === 'root') {
            // Moving to root - not allowed for shiurim
            showMessage('error', 'Shiurim must be in a folder. Please select a folder to move to.');
            setActiveId(null);
            setActiveType(null);
            return;
          }
          
          // Parse the breadcrumb index
          const breadcrumbIndex = parseInt(breadcrumbId);
          if (isNaN(breadcrumbIndex)) {
            setActiveId(null);
            setActiveType(null);
            return;
          }
          
          targetPath = currentPath.slice(0, breadcrumbIndex + 1);
        } else {
          setActiveId(null);
          setActiveType(null);
          return;
        }
        
        // Don't move if already in target folder
        if (JSON.stringify(targetPath) === JSON.stringify(currentPath)) {
          setActiveId(null);
          setActiveType(null);
          return;
        }

        const res = await fetch('/api/admin/move', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'shiur',
            itemId: activeIdStr,
            sourcePath: currentPath,
            targetPath: targetPath,
          }),
        });

        if (res.ok) {
          showMessage('success', 'Shiur moved successfully');
          await loadLibrary();
        } else {
          const data = await res.json();
          showMessage('error', data.error || 'Failed to move shiur');
        }
      } else if (activeType === 'folder') {
        // Moving a folder
        let targetPath: string[] = [];
        
        if (overIdStr.startsWith('folder-')) {
          // Dropped on another folder in current view
          const targetFolderId = overIdStr.replace('folder-', '');
          targetPath = [...currentPath, targetFolderId];
        } else if (overIdStr.startsWith('breadcrumb-')) {
          // Dropped on a breadcrumb folder
          const breadcrumbId = overIdStr.replace('breadcrumb-', '');
          
          if (breadcrumbId === 'root') {
            targetPath = [];
          } else {
            const breadcrumbIndex = parseInt(breadcrumbId);
            if (isNaN(breadcrumbIndex)) {
              setActiveId(null);
              setActiveType(null);
              return;
            }
            targetPath = currentPath.slice(0, breadcrumbIndex + 1);
          }
        } else {
          setActiveId(null);
          setActiveType(null);
          return;
        }
        
        const sourcePath = [...currentPath, activeIdStr];
        
        const res = await fetch('/api/admin/move', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'folder',
            sourcePath: sourcePath,
            targetPath: targetPath,
          }),
        });

        if (res.ok) {
          showMessage('success', 'Folder moved successfully');
          await loadLibrary();
        } else {
          const data = await res.json();
          showMessage('error', data.error || 'Failed to move folder');
        }
      }
    } catch (error) {
      showMessage('error', 'Failed to move item');
    }

    setActiveId(null);
    setActiveType(null);
  };

  // Rename handlers
  const startRename = (type: 'folder' | 'shiur', id: string, currentName: string) => {
    setRenamingItem({ type, id, currentName });
    setRenameValue(currentName);
  };

  const cancelRename = () => {
    setRenamingItem(null);
    setRenameValue('');
  };

  const handleRename = async () => {
    if (!renamingItem || !renameValue.trim()) {
      cancelRename();
      return;
    }

    if (renameValue === renamingItem.currentName) {
      cancelRename();
      return;
    }

    try {
      if (renamingItem.type === 'folder') {
        const folderPath = [...currentPath, renamingItem.id];
        const res = await fetch('/api/admin/folders', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            folderPath,
            newName: renameValue,
          }),
        });

        if (res.ok) {
          showMessage('success', 'Folder renamed successfully');
          await loadLibrary();
        } else {
          const data = await res.json();
          showMessage('error', data.error || 'Failed to rename folder');
        }
      } else if (renamingItem.type === 'shiur') {
        const res = await fetch('/api/admin/shiurim', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            shiurId: renamingItem.id,
            folderPath: currentPath,
            newTitle: renameValue,
          }),
        });

        if (res.ok) {
          showMessage('success', 'Shiur renamed successfully');
          await loadLibrary();
        } else {
          const data = await res.json();
          showMessage('error', data.error || 'Failed to rename shiur');
        }
      }
    } catch (error) {
      showMessage('error', 'Failed to rename item');
    }

    cancelRename();
  };

  const handleDoubleClick = (type: 'folder' | 'shiur', id: string, name: string) => {
    if (type === 'folder') {
      startRename(type, id, name);
    } else {
      startRename(type, id, name);
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
  const allItems = [
    ...displayFolders.map(f => ({ type: 'folder' as const, data: f })),
    ...displayShiurim.map(s => ({ type: 'shiur' as const, data: s })),
  ];

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
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-800">Shiurim Library</h1>
            <div className="flex items-center gap-3">
              <Link
                href="/admin/events"
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-primary transition-colors font-medium"
              >
                Events
              </Link>
              <Link
                href="/"
                className="px-3 py-1.5 text-sm text-gray-600 hover:text-primary transition-colors font-medium flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
              </Link>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
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

        {/* Toolbar */}
        <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
          {/* Breadcrumb */}
          <nav className="flex items-center text-sm flex-1 min-w-0">
            <DroppableArea id="root" type="breadcrumb">
              <button
                onClick={() => setCurrentPath([])}
                className="flex items-center gap-1 text-gray-700 hover:text-primary transition-colors p-1 rounded hover:bg-gray-100"
                title="Home - Drag here to move to root"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
              </button>
            </DroppableArea>
            {getFolderNamesFromPath(currentPath).map((name, index) => (
              <span key={index} className="flex items-center">
                <svg className="w-4 h-4 mx-1 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <DroppableArea id={`${index}`} type="breadcrumb">
                  <button
                    onClick={() => setCurrentPath(currentPath.slice(0, index + 1))}
                    className="text-gray-700 hover:text-primary transition-colors px-1 py-0.5 rounded hover:bg-gray-100 truncate max-w-[150px]"
                    title={`Drag here to move to ${name}`}
                  >
                    {name}
                  </button>
                </DroppableArea>
              </span>
            ))}
          </nav>

          {/* View Mode Toggles */}
          <div className="flex items-center gap-1 ml-4">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
              title="Grid view"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
              title="List view"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        {/* Quick Actions Bar */}
        <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between gap-4">
          {/* Folder Creation */}
          <div className="flex items-center gap-2 flex-1">
            {showFolderForm ? (
              <form onSubmit={handleCreateFolder} className="flex items-center gap-2 flex-1">
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onBlur={() => {
                    if (!newFolderName.trim()) {
                      setShowFolderForm(false);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setShowFolderForm(false);
                      setNewFolderName('');
                    }
                  }}
                  className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Folder name"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={folderCreating || !newFolderName.trim()}
                  className="px-3 py-1.5 text-sm bg-primary text-white rounded hover:bg-primary-dark transition-colors disabled:opacity-50"
                >
                  {folderCreating ? 'Creating...' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowFolderForm(false);
                    setNewFolderName('');
                  }}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors"
                >
                  Cancel
                </button>
              </form>
            ) : (
              <button
                onClick={() => setShowFolderForm(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 rounded transition-colors border border-gray-200"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Folder
              </button>
            )}
          </div>

          {/* Upload Controls - Only show when in a folder */}
          {currentPath.length > 0 && (
            <div className="flex items-center gap-2">
              {showUploadForm ? (
                <form onSubmit={handleUpload} className="flex items-center gap-2 flex-wrap">
                  <input
                    type="file"
                    id="file-upload"
                    accept=".mp3,.m4a,.wav,audio/*"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      setUploadFiles(files);
                      // Auto-populate title from filename if single file and title is empty
                      if (files.length === 1 && !uploadTitle) {
                        const fileNameWithoutExt = files[0].name.replace(/\.[^/.]+$/, '');
                        setUploadTitle(fileNameWithoutExt);
                      } else if (files.length > 1) {
                        // Clear title for multiple files (will use individual filenames)
                        setUploadTitle('');
                      }
                    }}
                    className="hidden"
                  />
                  <label
                    htmlFor="file-upload"
                    className="px-3 py-1.5 text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 rounded transition-colors border border-gray-200 cursor-pointer"
                  >
                    {uploadFiles.length === 0 
                      ? 'Choose Files' 
                      : uploadFiles.length === 1 
                        ? uploadFiles[0].name 
                        : `${uploadFiles.length} files selected`}
                  </label>
                  {uploadFiles.length === 1 && (
                    <input
                      type="text"
                      value={uploadTitle}
                      onChange={(e) => setUploadTitle(e.target.value)}
                      className="px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-transparent w-48"
                      placeholder="Shiur title (optional)"
                    />
                  )}
                  <input
                    type="date"
                    value={uploadDate}
                    onChange={(e) => setUploadDate(e.target.value)}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  {uploadProgress && uploadStatus && (
                    <span className="text-xs text-gray-600">{uploadStatus}</span>
                  )}
                  <button
                    type="submit"
                    disabled={uploadProgress || uploadFiles.length === 0}
                    className="px-3 py-1.5 text-sm bg-primary text-white rounded hover:bg-primary-dark transition-colors disabled:opacity-50"
                  >
                    {uploadProgress ? 'Uploading...' : 'Upload'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowUploadForm(false);
                      setUploadFiles([]);
                      setUploadTitle('');
                      setUploadStatus('');
                      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
                      if (fileInput) fileInput.value = '';
                    }}
                    className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors"
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setShowUploadForm(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 rounded transition-colors border border-gray-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Upload Shiur
                </button>
              )}
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto">
          {allItems.length === 0 ? (
            <div className="flex items-center justify-center h-full py-20">
              <div className="text-center text-gray-500">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                <p className="text-lg font-medium">This folder is empty</p>
                <p className="text-sm mt-1">Create a folder or upload a shiur to get started</p>
              </div>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="p-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {displayFolders.map((folder) => {
                  const isCategory = currentPath.length === 0 && isCategoryFolder(folder.id);
                  const isRenaming = renamingItem?.type === 'folder' && renamingItem.id === folder.id;
                  const isDragging = activeType === 'folder' && activeId === folder.id;

                  return (
                    <DroppableArea key={folder.id} id={folder.id} type="folder">
                      <DraggableItem id={folder.id} type="folder" isDragging={isDragging}>
                        <div
                          className="group relative flex flex-col items-center p-3 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                          onClick={(e) => {
                            // Single click to enter folder (unless renaming or clicking delete button)
                            if (!isRenaming && e.target === e.currentTarget || (e.target as HTMLElement).closest('svg')) {
                              setCurrentPath([...currentPath, folder.id]);
                            }
                          }}
                          onDoubleClick={(e) => {
                            // Double click to rename
                            if (!isCategory) {
                              e.stopPropagation();
                              handleDoubleClick('folder', folder.id, folder.name);
                            }
                          }}
                        >
                          {/* Folder Icon */}
                          <div className="relative mb-2" onClick={() => setCurrentPath([...currentPath, folder.id])}>
                            <svg className="w-16 h-16 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                            </svg>
                            {/* Delete button on hover */}
                            {!isCategory && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteFolder([...currentPath, folder.id]);
                                }}
                                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs hover:bg-red-600"
                              >
                                ×
                              </button>
                            )}
                          </div>

                          {/* Folder Name */}
                          {isRenaming ? (
                            <input
                              ref={renameInputRef}
                              type="text"
                              value={renameValue}
                              onChange={(e) => setRenameValue(e.target.value)}
                              onBlur={handleRename}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleRename();
                                } else if (e.key === 'Escape') {
                                  cancelRename();
                                }
                              }}
                              className="w-full text-center text-sm border border-blue-500 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                              onClick={(e) => e.stopPropagation()}
                            />
                          ) : (
                            <span className="text-sm text-center break-words max-w-full px-1">
                              {folder.name}
                            </span>
                          )}
                        </div>
                      </DraggableItem>
                    </DroppableArea>
                  );
                })}

                {displayShiurim.map((shiur) => {
                  const isRenaming = renamingItem?.type === 'shiur' && renamingItem.id === shiur.id;
                  const isDragging = activeType === 'shiur' && activeId === shiur.id;

                  return (
                    <DraggableItem key={shiur.id} id={shiur.id} type="shiur" isDragging={isDragging}>
                      <div
                        className="group relative flex flex-col items-center p-3 rounded-lg hover:bg-gray-100 transition-colors cursor-move"
                        onDoubleClick={() => handleDoubleClick('shiur', shiur.id, shiur.title)}
                      >
                        {/* Audio Icon */}
                        <div className="relative mb-2">
                          <svg className="w-16 h-16 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                          </svg>
                          {/* Delete button on hover */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteShiur(shiur.id);
                            }}
                            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>

                        {/* Shiur Title */}
                        {isRenaming ? (
                          <input
                            ref={renameInputRef}
                            type="text"
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onBlur={handleRename}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleRename();
                              } else if (e.key === 'Escape') {
                                cancelRename();
                              }
                            }}
                            className="w-full text-center text-sm border border-purple-500 rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-purple-500"
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <span className="text-sm text-center break-words max-w-full px-1">
                            {shiur.title}
                          </span>
                        )}
                      </div>
                    </DraggableItem>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-4">
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {/* Header Row */}
                <div className="grid grid-cols-12 bg-gray-50 border-b border-gray-200 px-4 py-3">
                  <div className="col-span-5">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Name</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Type</span>
                  </div>
                  <div className="col-span-3">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Date</span>
                  </div>
                  <div className="col-span-2 text-right">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</span>
                  </div>
                </div>

                {/* Rows */}
                <div className="divide-y divide-gray-200">
                  {displayFolders.map((folder) => {
                    const isCategory = currentPath.length === 0 && isCategoryFolder(folder.id);
                    const isRenaming = renamingItem?.type === 'folder' && renamingItem.id === folder.id;
                    const isDragging = activeType === 'folder' && activeId === folder.id;

                    return (
                      <DroppableArea key={folder.id} id={folder.id} type="folder">
                        <DraggableItem id={folder.id} type="folder" isDragging={isDragging}>
                          <div
                            className="grid grid-cols-12 group hover:bg-gray-50 transition-colors cursor-move px-4 py-3 items-center"
                            onDoubleClick={() => !isCategory && handleDoubleClick('folder', folder.id, folder.name)}
                          >
                            <div className="col-span-5">
                              <div className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                                </svg>
                                {isRenaming ? (
                                  <input
                                    ref={renameInputRef}
                                    type="text"
                                    value={renameValue}
                                    onChange={(e) => setRenameValue(e.target.value)}
                                    onBlur={handleRename}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        handleRename();
                                      } else if (e.key === 'Escape') {
                                        cancelRename();
                                      }
                                    }}
                                    className="flex-1 text-sm border border-blue-500 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    onClick={(e) => e.stopPropagation()}
                                  />
                                ) : (
                                  <button
                                    onClick={() => setCurrentPath([...currentPath, folder.id])}
                                    className="text-sm font-medium text-gray-900 hover:text-primary text-left"
                                  >
                                    {folder.name}
                                  </button>
                                )}
                              </div>
                            </div>
                            <div className="col-span-2">
                              <span className="text-sm text-gray-500">Folder</span>
                              {isCategory && (
                                <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">Category</span>
                              )}
                            </div>
                            <div className="col-span-3">
                              <span className="text-sm text-gray-500">
                                {new Date(folder.createdDate).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="col-span-2 text-right">
                              {!isCategory && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteFolder([...currentPath, folder.id]);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-800 transition-opacity p-1"
                                  title="Delete folder"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          </div>
                        </DraggableItem>
                      </DroppableArea>
                    );
                  })}

                  {displayShiurim.map((shiur) => {
                    const isRenaming = renamingItem?.type === 'shiur' && renamingItem.id === shiur.id;
                    const isDragging = activeType === 'shiur' && activeId === shiur.id;

                    return (
                      <DraggableItem key={shiur.id} id={shiur.id} type="shiur" isDragging={isDragging}>
                        <div
                          className="grid grid-cols-12 group hover:bg-gray-50 transition-colors cursor-move px-4 py-3 items-center"
                          onDoubleClick={() => handleDoubleClick('shiur', shiur.id, shiur.title)}
                        >
                          <div className="col-span-5">
                            <div className="flex items-center gap-2">
                              <svg className="w-5 h-5 text-purple-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                              </svg>
                              {isRenaming ? (
                                <input
                                  ref={renameInputRef}
                                  type="text"
                                  value={renameValue}
                                  onChange={(e) => setRenameValue(e.target.value)}
                                  onBlur={handleRename}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleRename();
                                    } else if (e.key === 'Escape') {
                                      cancelRename();
                                    }
                                  }}
                                  className="flex-1 text-sm border border-purple-500 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-purple-500"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              ) : (
                                <span className="text-sm font-medium text-gray-900">{shiur.title}</span>
                              )}
                            </div>
                          </div>
                          <div className="col-span-2">
                            <span className="text-sm text-gray-500">Audio</span>
                          </div>
                          <div className="col-span-3">
                            <span className="text-sm text-gray-500">
                              {new Date(shiur.recordedDate).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="col-span-2 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteShiur(shiur.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-800 transition-opacity p-1"
                              title="Delete shiur"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </DraggableItem>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeId && activeType ? (
            <div className="opacity-50">
              {activeType === 'folder' ? (
                <div className="flex flex-col items-center p-3">
                  <svg className="w-16 h-16 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                  </svg>
                </div>
              ) : (
                <div className="flex flex-col items-center p-3">
                  <svg className="w-16 h-16 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
}
