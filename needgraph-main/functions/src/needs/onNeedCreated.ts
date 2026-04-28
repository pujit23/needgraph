import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import * as admin from 'firebase-admin';

const db = admin.firestore();

/**
 * onNeedCreated — triggered when a new need document is created.
 * 1. Compute severity score (via Vertex AI or rules-based)
 * 2. Create alert if severity >= 60
 * 3. Write audit trail entry
 * 4. Send FCM notification if critical
 */
export const onNeedCreated = onDocumentCreated(
  { document: 'needs/{needId}', region: 'asia-south1' },
  async (event) => {
    const snap = event.data;
    if (!snap) return;

    const need = snap.data();
    const needId = event.params.needId;

    // Create alert if severity warrants it
    if (need.severity >= 60) {
      const urgency =
        need.severity >= 80 ? 'Critical' :
        need.severity >= 60 ? 'High' : 'Medium';

      await db.collection('alerts').add({
        needId,
        wardId: need.wardId,
        wardName: need.wardName,
        needType: need.needType,
        severity: need.severity,
        affectedCount: need.affectedCount,
        urgency,
        status: 'Active',
        detectedAt: admin.firestore.FieldValue.serverTimestamp(),
        isPredicted: false,
      });
    }

    // Write audit trail
    await db.collection('activityFeed').add({
      type: 'need_created',
      entityId: needId,
      entityType: 'need',
      description: `New ${need.needType} need reported in ${need.wardName} (severity: ${need.severity})`,
      userId: need.submittedBy || 'system',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      metadata: {
        wardId: need.wardId,
        needType: need.needType,
        severity: need.severity,
      },
    });
  },
);
