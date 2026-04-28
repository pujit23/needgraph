import { onCall } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';

const db = admin.firestore();

/**
 * getCausalGraph — returns current causal edges with optional ward filtering.
 * Called by GraphExplorer page.
 */
export const getCausalGraph = onCall(
  { region: 'asia-south1' },
  async (request) => {
    const { wardFilter } = request.data || {};

    const snapshot = await db.collection('causalEdges')
      .orderBy('weight', 'desc')
      .get();

    const edges = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return { edges };
  },
);
