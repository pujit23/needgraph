import { onRequest } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';

const db = admin.firestore();

/**
 * parseWhatsAppReport — HTTP endpoint for Twilio/MSG91 WhatsApp webhook.
 *
 * Usage with ngrok for local testing:
 *   1. Install ngrok: npm install -g ngrok
 *   2. Start Firebase emulator: firebase emulators:start --only functions
 *   3. In a separate terminal: ngrok http 5001
 *   4. Copy the ngrok URL (e.g., https://abc123.ngrok.io)
 *   5. Set as webhook in Twilio: https://abc123.ngrok.io/YOUR_PROJECT/asia-south1/parseWhatsAppReport
 *   6. Send a WhatsApp message to your Twilio number
 *
 * See DEPLOYMENT.md for full ngrok setup instructions.
 */
export const parseWhatsAppReport = onRequest(
  { region: 'asia-south1' },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).send('Method Not Allowed');
      return;
    }

    try {
      const body = req.body;

      // Twilio sends form-encoded data
      const from = body.From || body.from || 'unknown';
      const messageBody = body.Body || body.body || '';
      const mediaUrl = body.MediaUrl0 || null;

      if (!messageBody && !mediaUrl) {
        res.status(400).json({ error: 'No message body or media' });
        return;
      }

      // Create a need document from WhatsApp message
      const needRef = await db.collection('needs').add({
        wardId: 0, // To be determined by geo-coding or manual assignment
        wardName: 'Unassigned',
        lat: 17.3850,
        lng: 78.4867,
        needType: 'Healthcare', // Will be reclassified by AI
        severity: 50,
        affectedCount: 1,
        urgency: 'Medium',
        description: messageBody,
        language: 'auto',
        status: 'Active',
        source: 'whatsapp',
        sourcePhone: from,
        mediaUrl,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        submittedBy: `WhatsApp: ${from}`,
      });

      // Audit trail
      await db.collection('activityFeed').add({
        type: 'whatsapp_report',
        entityId: needRef.id,
        entityType: 'need',
        description: `WhatsApp report received from ${from}`,
        userId: 'system',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        metadata: { from, hasMedia: !!mediaUrl },
      });

      // Respond to Twilio with TwiML
      res.set('Content-Type', 'text/xml');
      res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>Thank you for your report. Need ID: ${needRef.id}. Our team will review it shortly.</Message>
</Response>`);
    } catch (err: any) {
      console.error('WhatsApp webhook error:', err);
      res.status(500).json({ error: err.message });
    }
  },
);
