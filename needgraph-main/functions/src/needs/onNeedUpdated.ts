import { onDocumentUpdated } from 'firebase-functions/v2/firestore';
import * as admin from 'firebase-admin';

const db = admin.firestore();

/**
 * onNeedUpdated — records all changes to the immutable audit trail.
 */
export const onNeedUpdated = onDocumentUpdated(
  { document: 'needs/{needId}', region: 'asia-south1' },
  async (event) => {
    const before = event.data?.before.data();
    const after = event.data?.after.data();
    if (!before || !after) return;

    const needId = event.params.needId;
    const changes: string[] = [];

    if (before.status !== after.status) {
      changes.push(`status: ${before.status} → ${after.status}`);
    }
    if (before.severity !== after.severity) {
      changes.push(`severity: ${before.severity} → ${after.severity}`);
    }

    if (changes.length > 0) {
      await db.collection('activityFeed').add({
        type: 'need_updated',
        entityId: needId,
        entityType: 'need',
        description: `Need updated: ${changes.join(', ')}`,
        userId: after.updatedBy || 'system',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        metadata: {
          before: { status: before.status, severity: before.severity },
          after: { status: after.status, severity: after.severity },
        },
      });
    }
  },
);
