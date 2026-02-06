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
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Folder form state
  const [newFolderName, setNewFolderName] = useState('');
  const [folderCreating, setFolderCreating] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [showFolderForm, setShowFolderForm] = useState(false);

  // Drag and drop state
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<'folder' | 'shiur' | null>(null);
  
  // Multi-select state
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);
  
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

  // Clear selection when path changes
  useEffect(() => {
    clearSelection();
  }, [currentPath]);

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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);

    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('audio/') || 
      file.name.endsWith('.mp3') || 
      file.name.endsWith('.m4a') || 
      file.name.endsWith('.wav')
    );

    if (files.length > 0) {
      // Add to existing files instead of replacing
      setUploadFiles(prev => [...prev, ...files]);
      if (!showUploadForm) {
        setShowUploadForm(true);
      }
    } else {
      showMessage('error', 'Please drop audio files only');
    }
  };

  const removeFileFromQueue = (index: number) => {
    setUploadFiles(prev => prev.filter((_, i) => i !== index));
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

  // Selection handlers
  const handleItemClick = (id: string, type: 'folder' | 'shiur', event: React.MouseEvent) => {
    // Don't select if renaming
    if (renamingItem) return;

    const itemKey = `${type}-${id}`;
    
    if (event.metaKey || event.ctrlKey) {
      // Cmd/Ctrl + Click: Toggle selection
      setSelectedItems(prev => {
        const newSet = new Set(prev);
        if (newSet.has(itemKey)) {
          newSet.delete(itemKey);
        } else {
          newSet.add(itemKey);
        }
        return newSet;
      });
      setLastSelectedId(itemKey);
    } else if (event.shiftKey && lastSelectedId) {
      // Shift + Click: Range selection
      const allItemKeys = allItems.map(item => 
        `${item.type}-${item.type === 'folder' ? item.data.id : item.data.id}`
      );
      const lastIndex = allItemKeys.indexOf(lastSelectedId);
      const currentIndex = allItemKeys.indexOf(itemKey);
      
      if (lastIndex !== -1 && currentIndex !== -1) {
        const start = Math.min(lastIndex, currentIndex);
        const end = Math.max(lastIndex, currentIndex);
        const range = allItemKeys.slice(start, end + 1);
        
        setSelectedItems(prev => {
          const newSet = new Set(prev);
          range.forEach(key => newSet.add(key));
          return newSet;
        });
      }
    } else {
      // Regular click: Select only this item
      setSelectedItems(new Set([itemKey]));
      setLastSelectedId(itemKey);
    }
  };

  const clearSelection = () => {
    setSelectedItems(new Set());
    setLastSelectedId(null);
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
      
      // If dragging an item that's selected, drag all selected items
      const itemKey = `shiur-${id.replace('shiur-', '')}`;
      if (!selectedItems.has(itemKey)) {
        // If dragging an unselected item, select only it
        setSelectedItems(new Set([itemKey]));
      }
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
        // Moving shiur(s)
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
            clearSelection();
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
          clearSelection();
          return;
        }

        // Get all selected shiur IDs (filter to only shiurim, not folders)
        const selectedShiurIds = Array.from(selectedItems)
          .filter(key => key.startsWith('shiur-'))
          .map(key => key.replace('shiur-', ''));
        
        // If no items are selected or the dragged item isn't selected, just move the dragged item
        const itemsToMove = selectedShiurIds.length > 0 ? selectedShiurIds : [activeIdStr];
        
        let successCount = 0;
        let failCount = 0;

        // Move each shiur
        for (const shiurId of itemsToMove) {
          try {
            const res = await fetch('/api/admin/move', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: 'shiur',
                itemId: shiurId,
                sourcePath: currentPath,
                targetPath: targetPath,
              }),
            });

            if (res.ok) {
              successCount++;
            } else {
              failCount++;
            }
          } catch (error) {
            failCount++;
          }
        }

        if (successCount > 0 && failCount === 0) {
          showMessage('success', `${successCount} shiur${successCount > 1 ? 'im' : ''} moved successfully`);
        } else if (successCount > 0 && failCount > 0) {
          showMessage('error', `Moved ${successCount} shiur${successCount > 1 ? 'im' : ''}, ${failCount} failed`);
        } else {
          showMessage('error', 'Failed to move shiurim');
        }
        
        await loadLibrary();
        clearSelection();
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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Select all: Cmd/Ctrl + A
      if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
        e.preventDefault();
        const currentItems = [
          ...displayFolders.map(f => ({ type: 'folder' as const, data: f })),
          ...displayShiurim.map(s => ({ type: 'shiur' as const, data: s })),
        ];
        const allItemKeys = currentItems.map(item => 
          `${item.type}-${item.type === 'folder' ? item.data.id : item.data.id}`
        );
        setSelectedItems(new Set(allItemKeys));
      }
      
      // Deselect all: Escape
      if (e.key === 'Escape') {
        clearSelection();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [displayFolders, displayShiurim]);

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

        {/* Global Drag Overlay */}
        {isDraggingOver && !showUploadForm && currentPath.length > 0 && (
          <div className="fixed inset-0 bg-primary/10 backdrop-blur-sm z-30 flex items-center justify-center pointer-events-none">
            <div className="bg-white rounded-2xl shadow-2xl p-8 border-4 border-primary border-dashed">
              <svg className="w-20 h-20 text-primary mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-2xl font-bold text-primary text-center">Drop audio files here</p>
              <p className="text-sm text-gray-600 text-center mt-2">to add them to the upload queue</p>
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
                    dir="auto"
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
          <div className="flex items-center gap-4 flex-1">
            <div className="flex items-center gap-2">
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
            
            {/* Help text */}
            {allItems.length > 0 && (
              <div className="text-xs text-gray-500 hidden md:block">
                <span className="font-medium">Tip:</span> ⌘/Ctrl+Click to multi-select • Shift+Click for range • Drag to move
              </div>
            )}
          </div>

          {/* Upload Controls - Only show when in a folder */}
          {currentPath.length > 0 && !showUploadForm && (
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

        {/* Main Content Area */}
        <div 
          className="flex-1 overflow-auto"
          onDragOver={currentPath.length > 0 ? handleDragOver : undefined}
          onDragLeave={currentPath.length > 0 ? handleDragLeave : undefined}
          onDrop={currentPath.length > 0 ? handleDrop : undefined}
          onClick={(e) => {
            // Clear selection when clicking on empty space
            if (e.target === e.currentTarget || (e.target as HTMLElement).closest('.empty-area')) {
              clearSelection();
            }
          }}
        >
          {allItems.length === 0 ? (
            <div className="flex items-center justify-center h-full py-20 empty-area">
              <div className="text-center text-gray-500">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                <p className="text-lg font-medium">This folder is empty</p>
                <p className="text-sm mt-1">Create a folder or upload a shiur to get started</p>
              </div>
            </div>
          ) : (
            <>
              {/* Selection indicator */}
              {selectedItems.size > 0 && (
                <div className="sticky top-0 z-10 bg-blue-50 border-b border-blue-200 px-4 py-2 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-blue-900">
                      {selectedItems.size} item{selectedItems.size > 1 ? 's' : ''} selected
                    </span>
                    <span className="text-xs text-blue-700">
                      Drag to move • Esc to clear
                    </span>
                  </div>
                  <button
                    onClick={clearSelection}
                    className="text-sm text-blue-700 hover:text-blue-900 font-medium"
                  >
                    Clear selection
                  </button>
                </div>
              )}
              
              {viewMode === 'grid' ? (
            <div className="p-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {displayFolders.map((folder) => {
                  const isCategory = currentPath.length === 0 && isCategoryFolder(folder.id);
                  const isRenaming = renamingItem?.type === 'folder' && renamingItem.id === folder.id;
                  const isDragging = activeType === 'folder' && activeId === folder.id;
                  const isSelected = selectedItems.has(`folder-${folder.id}`);

                  return (
                    <DroppableArea key={folder.id} id={folder.id} type="folder">
                      <DraggableItem id={folder.id} type="folder" isDragging={isDragging}>
                        <div
                          className={`group relative flex flex-col items-center p-3 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer ${
                            isSelected ? 'bg-blue-100 ring-2 ring-blue-500' : ''
                          }`}
                          onClick={(e) => {
                            // Check if clicking on the folder area itself or SVG
                            const target = e.target as HTMLElement;
                            const isFolderArea = target === e.currentTarget || target.closest('svg')?.parentElement?.classList.contains('relative');
                            
                            if (!isRenaming && isFolderArea && !target.closest('button')) {
                              if (e.metaKey || e.ctrlKey || e.shiftKey) {
                                // Multi-select
                                handleItemClick(folder.id, 'folder', e);
                              } else {
                                // Regular click - enter folder
                                setCurrentPath([...currentPath, folder.id]);
                                clearSelection();
                              }
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
                              dir="auto"
                            />
                          ) : (
                            <span className="text-sm text-center break-words max-w-full px-1" dir="auto">
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
                  const isSelected = selectedItems.has(`shiur-${shiur.id}`);

                  return (
                    <DraggableItem key={shiur.id} id={shiur.id} type="shiur" isDragging={isDragging}>
                      <div
                        className={`group relative flex flex-col items-center p-3 rounded-lg hover:bg-gray-100 transition-colors cursor-move ${
                          isSelected ? 'bg-blue-100 ring-2 ring-blue-500' : ''
                        }`}
                        onClick={(e) => handleItemClick(shiur.id, 'shiur', e)}
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          handleDoubleClick('shiur', shiur.id, shiur.title);
                        }}
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
                            dir="auto"
                          />
                        ) : (
                          <span className="text-sm text-center break-words max-w-full px-1" dir="auto">
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
                    const isSelected = selectedItems.has(`folder-${folder.id}`);

                    return (
                      <DroppableArea key={folder.id} id={folder.id} type="folder">
                        <DraggableItem id={folder.id} type="folder" isDragging={isDragging}>
                          <div
                            className={`grid grid-cols-12 group hover:bg-gray-50 transition-colors cursor-move px-4 py-3 items-center ${
                              isSelected ? 'bg-blue-100 ring-2 ring-blue-500 ring-inset' : ''
                            }`}
                            onClick={(e) => {
                              if (e.metaKey || e.ctrlKey || e.shiftKey) {
                                handleItemClick(folder.id, 'folder', e);
                              }
                            }}
                            onDoubleClick={(e) => {
                              if (!isCategory) {
                                e.stopPropagation();
                                handleDoubleClick('folder', folder.id, folder.name);
                              }
                            }}
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
                                    dir="auto"
                                  />
                                ) : (
                                  <button
                                    onClick={() => setCurrentPath([...currentPath, folder.id])}
                                    className="text-sm font-medium text-gray-900 hover:text-primary text-left"
                                    dir="auto"
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
                    const isSelected = selectedItems.has(`shiur-${shiur.id}`);

                    return (
                      <DraggableItem key={shiur.id} id={shiur.id} type="shiur" isDragging={isDragging}>
                        <div
                          className={`grid grid-cols-12 group hover:bg-gray-50 transition-colors cursor-move px-4 py-3 items-center ${
                            isSelected ? 'bg-blue-100 ring-2 ring-blue-500 ring-inset' : ''
                          }`}
                          onClick={(e) => handleItemClick(shiur.id, 'shiur', e)}
                          onDoubleClick={(e) => {
                            e.stopPropagation();
                            handleDoubleClick('shiur', shiur.id, shiur.title);
                          }}
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
                                  dir="auto"
                                />
                              ) : (
                                <span className="text-sm font-medium text-gray-900" dir="auto">{shiur.title}</span>
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
            </>
          )}
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeId && activeType ? (
            <div className="opacity-80 bg-white rounded-lg shadow-xl p-3">
              {activeType === 'folder' ? (
                <div className="flex flex-col items-center">
                  <svg className="w-16 h-16 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                  </svg>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <svg className="w-16 h-16 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                  </svg>
                  {activeType === 'shiur' && selectedItems.size > 1 && (
                    <div className="mt-2 bg-blue-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                      {selectedItems.size}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : null}
        </DragOverlay>

        {/* Upload Panel */}
        {showUploadForm && currentPath.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-300 shadow-2xl z-40 max-h-[50vh] flex flex-col">
            {/* Upload Panel Header */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <h3 className="font-semibold text-gray-800">Upload Shiurim</h3>
                <span className="text-sm text-gray-500">
                  ({uploadFiles.length} file{uploadFiles.length !== 1 ? 's' : ''} ready)
                </span>
              </div>
              <button
                onClick={() => {
                  setShowUploadForm(false);
                  setUploadFiles([]);
                  setUploadTitle('');
                  setUploadStatus('');
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Drop Zone and File List */}
            <div className="flex-1 overflow-auto p-6">
              <div className="max-w-6xl mx-auto">
                {/* Drop Zone */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`relative border-2 border-dashed rounded-lg p-8 mb-4 transition-all ${
                    isDraggingOver
                      ? 'border-primary bg-primary/5 scale-[1.02]'
                      : 'border-gray-300 bg-gray-50 hover:border-primary/50 hover:bg-primary/5'
                  }`}
                >
                  <input
                    type="file"
                    id="file-upload-input"
                    accept=".mp3,.m4a,.wav,audio/*"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      if (files.length > 0) {
                        setUploadFiles(prev => [...prev, ...files]);
                      }
                    }}
                    className="hidden"
                  />
                  <label
                    htmlFor="file-upload-input"
                    className="flex flex-col items-center justify-center cursor-pointer"
                  >
                    <svg
                      className={`w-12 h-12 mb-3 transition-colors ${
                        isDraggingOver ? 'text-primary' : 'text-gray-400'
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <p className="text-lg font-medium text-gray-700 mb-1">
                      {isDraggingOver ? 'Drop files here' : 'Drag & drop audio files here'}
                    </p>
                    <p className="text-sm text-gray-500">or click to browse</p>
                    <p className="text-xs text-gray-400 mt-2">Supports MP3, M4A, WAV files</p>
                  </label>
                </div>

                {/* File List */}
                {uploadFiles.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Queued Files:</h4>
                    <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100 max-h-[200px] overflow-y-auto">
                      {uploadFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <svg className="w-5 h-5 text-purple-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                            </svg>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                              <p className="text-xs text-gray-500">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => removeFileFromQueue(index)}
                            disabled={uploadProgress}
                            className="ml-4 text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Remove file"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Upload Panel Footer */}
            <form onSubmit={handleUpload} className="border-t border-gray-200 bg-gray-50 px-6 py-4">
              <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Recording Date</label>
                    <input
                      type="date"
                      value={uploadDate}
                      onChange={(e) => setUploadDate(e.target.value)}
                      className="px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  {uploadFiles.length === 1 && (
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Custom Title (optional)</label>
                      <input
                        type="text"
                        value={uploadTitle}
                        onChange={(e) => setUploadTitle(e.target.value)}
                        className="px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-primary focus:border-transparent w-64"
                        placeholder="Leave blank to use filename"
                        dir="auto"
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {uploadProgress && uploadStatus && (
                    <span className="text-sm text-gray-600">{uploadStatus}</span>
                  )}
                  <button
                    type="submit"
                    disabled={uploadProgress || uploadFiles.length === 0}
                    className="px-6 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {uploadProgress ? (
                      <>
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        Upload {uploadFiles.length} File{uploadFiles.length !== 1 ? 's' : ''}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </DndContext>
  );
}
