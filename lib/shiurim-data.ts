import fs from 'fs/promises';
import path from 'path';
import { ShiurimLibrary, ShiurFolder, ShiurRecording } from '@/types';

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'shiurim-library.json');

/**
 * Get the entire shiurim library
 */
export async function getShiurimLibrary(): Promise<ShiurimLibrary> {
  try {
    const data = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist, return empty library
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return { folders: [] };
    }
    throw error;
  }
}

/**
 * Save the shiurim library with atomic write
 */
export async function saveShiurimLibrary(library: ShiurimLibrary): Promise<void> {
  try {
    // Ensure data directory exists
    const dataDir = path.dirname(DATA_FILE_PATH);
    await fs.mkdir(dataDir, { recursive: true });

    // Write to temp file first, then rename (atomic operation)
    const tempPath = `${DATA_FILE_PATH}.tmp`;
    await fs.writeFile(tempPath, JSON.stringify(library, null, 2), 'utf-8');
    await fs.rename(tempPath, DATA_FILE_PATH);
  } catch (error) {
    console.error('Error saving shiurim library:', error);
    throw new Error('Failed to save shiurim library');
  }
}

/**
 * Navigate to a folder using a path array
 * @param path - Array of folder IDs (e.g., ["pesachim", "2024"])
 * @returns The folder at the specified path, or null if not found
 */
export async function getFolderByPath(folderPath: string[]): Promise<ShiurFolder | null> {
  const library = await getShiurimLibrary();
  
  if (folderPath.length === 0) {
    // Return root level (convert library to folder-like structure)
    return {
      id: 'root',
      name: 'Root',
      createdDate: new Date().toISOString(),
      folders: library.folders,
      shiurim: [],
    };
  }

  let currentFolders = library.folders;
  let targetFolder: ShiurFolder | null = null;

  for (const folderId of folderPath) {
    targetFolder = currentFolders.find(f => f.id === folderId) || null;
    if (!targetFolder) return null;
    currentFolders = targetFolder.folders;
  }

  return targetFolder;
}

/**
 * Create a new folder
 * @param name - Folder name
 * @param parentPath - Path to parent folder (empty array for root)
 * @returns The created folder
 */
export async function createFolder(
  name: string,
  parentPath: string[] = []
): Promise<ShiurFolder> {
  const library = await getShiurimLibrary();
  
  const newFolder: ShiurFolder = {
    id: `${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
    name,
    createdDate: new Date().toISOString(),
    folders: [],
    shiurim: [],
  };

  if (parentPath.length === 0) {
    // Add to root
    library.folders.push(newFolder);
  } else {
    // Navigate to parent and add
    const parent = await navigateToFolder(library.folders, parentPath);
    if (!parent) throw new Error('Parent folder not found');
    parent.folders.push(newFolder);
  }

  await saveShiurimLibrary(library);
  return newFolder;
}

/**
 * Add a shiur to a folder
 * @param shiur - The shiur recording to add
 * @param folderPath - Path to the target folder
 */
export async function addShiurToFolder(
  shiur: ShiurRecording,
  folderPath: string[]
): Promise<void> {
  const library = await getShiurimLibrary();

  if (folderPath.length === 0) {
    throw new Error('Cannot add shiur to root level - please select a folder');
  }

  const folder = await navigateToFolder(library.folders, folderPath);
  if (!folder) throw new Error('Folder not found');

  folder.shiurim.push(shiur);
  await saveShiurimLibrary(library);
}

/**
 * Delete a shiur from a folder
 * @param shiurId - ID of the shiur to delete
 * @param folderPath - Path to the folder containing the shiur
 * @returns The deleted shiur (for cleanup purposes)
 */
export async function deleteShiur(
  shiurId: string,
  folderPath: string[]
): Promise<ShiurRecording | null> {
  const library = await getShiurimLibrary();

  if (folderPath.length === 0) {
    throw new Error('Cannot delete shiur from root level');
  }

  const folder = await navigateToFolder(library.folders, folderPath);
  if (!folder) throw new Error('Folder not found');

  const shiurIndex = folder.shiurim.findIndex(s => s.id === shiurId);
  if (shiurIndex === -1) return null;

  const deletedShiur = folder.shiurim[shiurIndex];
  folder.shiurim.splice(shiurIndex, 1);
  
  await saveShiurimLibrary(library);
  return deletedShiur;
}

/**
 * Delete a folder and all its contents (recursive)
 * @param folderPath - Path to the folder to delete
 * @returns Array of all shiurim that were deleted (for cleanup)
 */
export async function deleteFolder(folderPath: string[]): Promise<ShiurRecording[]> {
  if (folderPath.length === 0) {
    throw new Error('Cannot delete root folder');
  }

  const library = await getShiurimLibrary();
  const deletedShiurim: ShiurRecording[] = [];
  
  const parentPath = folderPath.slice(0, -1);
  const folderToDeleteId = folderPath[folderPath.length - 1];

  let folders: ShiurFolder[];
  if (parentPath.length === 0) {
    folders = library.folders;
  } else {
    const parent = await navigateToFolder(library.folders, parentPath);
    if (!parent) throw new Error('Parent folder not found');
    folders = parent.folders;
  }

  const folderIndex = folders.findIndex(f => f.id === folderToDeleteId);
  if (folderIndex === -1) throw new Error('Folder not found');

  // Collect all shiurim recursively
  const folder = folders[folderIndex];
  collectAllShiurim(folder, deletedShiurim);

  // Remove the folder
  folders.splice(folderIndex, 1);
  
  await saveShiurimLibrary(library);
  return deletedShiurim;
}

/**
 * Helper: Navigate to a folder in the tree
 */
function navigateToFolder(
  folders: ShiurFolder[],
  path: string[]
): ShiurFolder | null {
  if (path.length === 0) return null;

  let currentFolders = folders;
  let targetFolder: ShiurFolder | null = null;

  for (const folderId of path) {
    targetFolder = currentFolders.find(f => f.id === folderId) || null;
    if (!targetFolder) return null;
    currentFolders = targetFolder.folders;
  }

  return targetFolder;
}

/**
 * Helper: Recursively collect all shiurim from a folder and its subfolders
 */
function collectAllShiurim(folder: ShiurFolder, accumulator: ShiurRecording[]): void {
  accumulator.push(...folder.shiurim);
  for (const subfolder of folder.folders) {
    collectAllShiurim(subfolder, accumulator);
  }
}

/**
 * Find a shiur by ID across all folders
 * @param shiurId - ID of the shiur to find
 * @returns Object containing the shiur and its path, or null if not found
 */
export async function findShiurById(
  shiurId: string
): Promise<{ shiur: ShiurRecording; path: string[] } | null> {
  const library = await getShiurimLibrary();
  return findShiurInFolders(library.folders, shiurId, []);
}

/**
 * Helper: Recursively search for a shiur
 */
function findShiurInFolders(
  folders: ShiurFolder[],
  shiurId: string,
  currentPath: string[]
): { shiur: ShiurRecording; path: string[] } | null {
  for (const folder of folders) {
    const folderPath = [...currentPath, folder.id];
    
    // Check shiurim in this folder
    const shiur = folder.shiurim.find(s => s.id === shiurId);
    if (shiur) {
      return { shiur, path: folderPath };
    }

    // Recursively check subfolders
    const result = findShiurInFolders(folder.folders, shiurId, folderPath);
    if (result) return result;
  }

  return null;
}
