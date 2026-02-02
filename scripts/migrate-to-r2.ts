/**
 * One-time migration script to upload shiurim-library.json to R2
 * Run with: npx tsx scripts/migrate-to-r2.ts
 */

import fs from 'fs/promises';
import path from 'path';
import { uploadJSON } from '../lib/r2-client';

async function migrate() {
  try {
    console.log('Starting migration to R2...');

    // Read local file
    const localPath = path.join(process.cwd(), 'data', 'shiurim-library.json');
    const data = await fs.readFile(localPath, 'utf-8');
    const library = JSON.parse(data);

    console.log('Local data loaded:', JSON.stringify(library, null, 2));

    // Upload to R2
    const url = await uploadJSON(library, 'shiurim-library.json');

    console.log('✅ Migration successful!');
    console.log('Data uploaded to:', url);
    console.log('\nYou can now safely deploy to Vercel.');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
