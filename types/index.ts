export interface Shiur {
  id: string;
  title: string;
  titleHebrew?: string;
  rabbi: string;
  time: string;
  days?: string[]; // e.g., ["Monday", "Tuesday", "Wednesday", "Thursday", "Sunday"]
  dayOfWeek?: string; // For weekly shiurim, e.g., "Tuesday"
  topic?: string;
  location?: string;
  isNew?: boolean;
  isSpecial?: boolean; // For special weekly shiurim
}

export interface DaveningTime {
  id: string;
  name: string;
  nameHebrew: string;
  times: string[];
}

export interface Rabbi {
  id: string;
  name: string;
  title?: string;
  photo?: string;
  bio?: string;
  email?: string;
  phone?: string;
  shiurim: string[]; // Array of shiur topics they teach
  isRosh?: boolean; // For Rosh Beit Hamidrash
}

export interface Statistic {
  value: string;
  label: string;
}

// Shiurim Library Types
export interface ShiurRecording {
  id: string;
  title: string;
  recordedDate: string;
  duration: number; // seconds
  audioUrl: string;
  fileSize: number; // bytes
  uploadedDate: string;
}

export interface ShiurFolder {
  id: string;
  name: string;
  createdDate: string;
  folders: ShiurFolder[]; // Recursive: folders can contain folders
  shiurim: ShiurRecording[];
}

export interface ShiurimLibrary {
  folders: ShiurFolder[];
}
