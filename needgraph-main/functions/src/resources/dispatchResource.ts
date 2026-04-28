import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';

const db = admin.firestore();

interface DispatchRequest {
  resourceId: string;
  needId?: string;
  quantity: number;
  destinationWard?: string;
}

/**
 * dispatchResource — atomically dispatches resources to a need.
 * Decrements quantity and creates an audit trail.
 */
export const dispatchResource = onCall(
  { region: 'asia-south1' },
  async (request) => {
    // 1. Authenticate user
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'User must be authenticated to dispatch resources');
    }
    const authUid = request.auth.uid;

    const { resourceId, needId, quantity, destinationWard } = request.data as DispatchRequest;

    // 2. Validate input
    if (!resourceId || typeof quantity !== 'number' || quantity <= 0) {
      throw new HttpsError('invalid-argument', 'Valid resourceId and a positive quantity are required');
    }

    // 3. Run transaction
    const result = await db.runTransaction(async (tx) => {
      const resRef = db.collection('resources').doc(resourceId);
      const resSnap = await tx.get(resRef);

      if (!resSnap.exists) {
        throw new HttpsError('not-found', 'Resource not found');
      }

      const resource = resSnap.data()!;
      
      if (typeof resource.quantity !== 'number' || resource.quantity < quantity) {
        throw new HttpsError('failed-precondition', 'Insufficient resource quantity available');
      }

      const newQty = resource.quantity - quantity;
      
      // Update resource quantity
      tx.update(resRef, {
        quantity: newQty,
        status: newQty === 0 ? 'Depleted' : 'Available',
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Prepare fallback values to prevent Firestore 'undefined' crash errors
      const safeResourceName = resource.name || 'Unknown Resource';
      const safeDestination = destinationWard || resource.wardName || 'Unknown Destination';
      const safeUnit = resource.unit || 'units';

      // Create dispatch record
      const dispatchRef = db.collection('dispatches').doc();
      tx.set(dispatchRef, {
        resourceId,
        resourceName: safeResourceName,
        needId: needId || null,
        quantity,
        destinationWard: safeDestination,
        dispatchedBy: authUid,
        dispatchedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Create audit trail entry
      const feedRef = db.collection('activityFeed').doc();
      tx.set(feedRef, {
        type: 'resource_dispatched',
        entityId: resourceId,
        entityType: 'resource',
        description: `${quantity} ${safeUnit} of ${safeResourceName} dispatched to ${safeDestination}`,
        userId: authUid,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });

      return { dispatched: quantity, remaining: newQty };
    });

    return result;
  },
);
