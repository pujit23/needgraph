/**
 * NeedGraph — Cloud Functions
 * ──────────────────────────────────────────────────────
 * All serverless backend logic for the NeedGraph platform.
 * Deploy: `firebase deploy --only functions`
 */

import * as admin from 'firebase-admin';

admin.initializeApp();

const db = admin.firestore();

// ── EXPORTS ─────────────────────────────────────────────

// Need lifecycle
export { onNeedCreated } from './needs/onNeedCreated';
export { onNeedUpdated } from './needs/onNeedUpdated';

// AI scoring
export { computeSeverityScore } from './ai/computeSeverityScore';

// Causal graph
export { getCausalGraph } from './graph/getCausalGraph';

// Simulation
export { runCrisisSimulation } from './simulator/runCrisisSimulation';

// Notifications
export { sendCriticalAlert } from './notifications/sendCriticalAlert';

// Resources
export { dispatchResource } from './resources/dispatchResource';

// WhatsApp webhook
export { parseWhatsAppReport } from './whatsapp/parseWhatsAppReport';

// Volunteers
export { addVolunteer } from './volunteers/addVolunteer';

// Tasks
export { createTask, updateTaskStatus } from './tasks/createTask';

// Needs (user-submitted)
export { submitNeed } from './needs/submitNeed';
