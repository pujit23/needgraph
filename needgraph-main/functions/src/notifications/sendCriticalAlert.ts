import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import * as admin from 'firebase-admin';

/**
 * sendCriticalAlert — triggered when a new alert is created.
 * Sends FCM push notifications to coordinators and assigned volunteers.
 */
export const sendCriticalAlert = onDocumentCreated(
  { document: 'alerts/{alertId}', region: 'asia-south1' },
  async (event) => {
    const snap = event.data;
    if (!snap) return;

    const alert = snap.data();
    if (alert.urgency !== 'Critical') return;

    // Get coordinator tokens
    const coordsSnap = await admin.firestore()
      .collection('users')
      .where('role', 'in', ['super_admin', 'coordinator'])
      .where('isActive', '==', true)
      .get();

    const tokens = coordsSnap.docs
      .map(d => d.data().fcmToken)
      .filter(Boolean);

    if (tokens.length === 0) return;

    const message: admin.messaging.MulticastMessage = {
      tokens,
      notification: {
        title: `🔴 Critical: ${alert.needType}`,
        body: `Severity ${alert.severity}/100 in ${alert.wardName}. ${alert.affectedCount} people affected.`,
      },
      data: {
        alertId: event.params.alertId,
        wardId: String(alert.wardId),
        type: 'critical_alert',
      },
      webpush: {
        fcmOptions: {
          link: `/alerts`,
        },
      },
    };

    try {
      const result = await admin.messaging().sendEachForMulticast(message);
      console.log(`FCM sent: ${result.successCount} success, ${result.failureCount} failed`);
    } catch (err) {
      console.error('FCM send error:', err);
    }
  },
);
