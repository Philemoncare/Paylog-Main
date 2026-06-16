/**
 * Global Training Schedule Configuration
 * Synchronized across the entire platform.
 */

// Official Training Start: 20th of the month @ 10:00 AM GMT
export const TRAINING_START_DATE = new Date('2026-06-20T10:00:00Z');

// Registration Deadline: 19th of the month @ 11:59 PM GMT
export const REGISTRATION_DEADLINE = new Date('2026-06-19T23:59:59Z');

export const TRAINING_MODE = "Hybrid (Online & Physical)";

export const COHORT_SEAT_TARGET = 25;

export const REGISTRATION_FEE_GHS = 450;

export const WHATSAPP_GROUP_LINK = "https://chat.whatsapp.com/F6F93vrKMyNK2GVGl8QXfB";

/**
 * Utility to check if registration is currently open
 */
export const isRegistrationOpen = () => {
  const now = new Date();
  return now < REGISTRATION_DEADLINE;
};

/**
 * Formatted dates for display
 */
export const SCHEDULE_DISPLAY = {
  trainingStart: "20th June 2026 at 10:00 AM GMT",
  registrationDeadline: "19th June 2026 at 11:59 PM GMT",
  mode: "Hybrid Learning (Online & Physical)"
};
