import type { InstantRules } from "@instantdb/react";

const rules = {
  events: {
    allow: {
      // Everyone can view events
      view: "true",
      // Anyone can create/update/delete (admin auth is handled by Next.js session)
      create: "true",
      update: "true",
      delete: "true",
    },
  },
  registrations: {
    allow: {
      // Everyone can view registrations
      view: "true",
      // Anyone can create registrations (for public sign-ups)
      create: "true",
      // Anyone can update (for webhook updates)
      update: "true",
      // Anyone can delete
      delete: "true",
    },
  },
  $default: {
    allow: {
      // Allow storage uploads (for event posters)
      "has-storage-permission": "true",
    },
  },
} satisfies InstantRules;

export default rules;
