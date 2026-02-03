import { init } from '@instantdb/react';

// Initialize InstantDB with app ID from environment
// Use a fallback value for build time if environment variable is not set
const db = init({
  appId: process.env.NEXT_PUBLIC_INSTANTDB_APP_ID || '0a72ba0c-1e03-4974-a076-07967ff37117',
});

export default db;
