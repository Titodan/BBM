import { ShiurFolder, ShiurRecording } from '@/types';

/**
 * Extract the leading number from a string (e.g., "01 - Introduction" -> 1, "Shiur 23" -> 23)
 * Returns null if no leading number is found
 */
function extractLeadingNumber(str: string): number | null {
  // Try to match number at the start of the string (with optional non-alphanumeric characters)
  const match = str.match(/^\D*(\d+)/);
  if (match && match[1]) {
    return parseInt(match[1], 10);
  }
  return null;
}

/**
 * Sort folders by leading number in their name, falling back to alphabetical order
 * Folders with numbers come first (sorted numerically), then folders without numbers (sorted alphabetically)
 */
export function sortFoldersByNumber(folders: ShiurFolder[]): ShiurFolder[] {
  return [...folders].sort((a, b) => {
    const numA = extractLeadingNumber(a.name);
    const numB = extractLeadingNumber(b.name);

    // Both have numbers - sort numerically
    if (numA !== null && numB !== null) {
      return numA - numB;
    }

    // Only a has a number - a comes first
    if (numA !== null) {
      return -1;
    }

    // Only b has a number - b comes first
    if (numB !== null) {
      return 1;
    }

    // Neither has a number - sort alphabetically
    return a.name.localeCompare(b.name);
  });
}

/**
 * Sort shiurim by leading number in their title, falling back to date or alphabetical order
 * Shiurim with numbers come first (sorted numerically), then shiurim without numbers (sorted by date, then alphabetically)
 */
export function sortShiurimByNumber(shiurim: ShiurRecording[]): ShiurRecording[] {
  return [...shiurim].sort((a, b) => {
    const numA = extractLeadingNumber(a.title);
    const numB = extractLeadingNumber(b.title);

    // Both have numbers - sort numerically
    if (numA !== null && numB !== null) {
      return numA - numB;
    }

    // Only a has a number - a comes first
    if (numA !== null) {
      return -1;
    }

    // Only b has a number - b comes first
    if (numB !== null) {
      return 1;
    }

    // Neither has a number - sort by recorded date (most recent first), then alphabetically
    const dateCompare = new Date(b.recordedDate).getTime() - new Date(a.recordedDate).getTime();
    if (dateCompare !== 0) {
      return dateCompare;
    }

    return a.title.localeCompare(b.title);
  });
}

/**
 * Recursively sort all folders and shiurim in a folder tree
 * This modifies the folder structure in place and returns it
 */
export function sortFolderTreeRecursively(folder: ShiurFolder): ShiurFolder {
  // Sort the current folder's subfolders and shiurim
  folder.folders = sortFoldersByNumber(folder.folders);
  folder.shiurim = sortShiurimByNumber(folder.shiurim);

  // Recursively sort each subfolder
  folder.folders.forEach(subfolder => {
    sortFolderTreeRecursively(subfolder);
  });

  return folder;
}
