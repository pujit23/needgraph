import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

type UrgencyLevel = 'Critical' | 'High' | 'Medium' | 'Low';

function deriveUrgency(score: number): UrgencyLevel {
  if (score >= 80) return 'Critical';
  if (score >= 60) return 'High';
  if (score >= 40) return 'Medium';
  return 'Low';
}

function deriveWard(lat: number, lng: number): string {
  if (lat > 17.45 && lng < 78.42) return 'Ward 7 - Kukatpally';
  if (lat > 17.45) return 'Ward 1 - Secunderabad';
  if (lat < 17.37) return 'Ward 12 - Charminar';
  if (lng > 78.53) return 'Ward 15 - Uppal';
  if (lng < 78.38) return 'Ward 11 - Gachibowli';
  return 'Ward 5 - Banjara Hills';
}

interface SubmitNeedPayload {
  needType: string;
  severityScore: number;
  peopleAffected: number;
  description: string;
  location: {
    address: string;
    lat: number;
    lng: number;
  };
  audioTranscript?: string;
  submitterName: string;
  contactNumber: string;
}

export const submitNeed = onCall(async (request) => {
  const data = request.data as SubmitNeedPayload;

  // ─── Validation ────────────────────────────────────────
  if (!data.needType || typeof data.needType !== 'string') {
    throw new HttpsError('invalid-argument', 'needType is required');
  }
  if (typeof data.severityScore !== 'number' || data.severityScore < 0 || data.severityScore > 100) {
    throw new HttpsError('invalid-argument', 'severityScore must be 0–100');
  }
  if (typeof data.peopleAffected !== 'number' || data.peopleAffected < 1) {
    throw new HttpsError('invalid-argument', 'peopleAffected must be >= 1');
  }
  if (!data.description || typeof data.description !== 'string') {
    throw new HttpsError('invalid-argument', 'description is required');
  }
  if (!data.location?.address || typeof data.location.lat !== 'number' || typeof data.location.lng !== 'number') {
    throw new HttpsError('invalid-argument', 'location.address, lat, lng are required');
  }
  if (!data.submitterName || typeof data.submitterName !== 'string') {
    throw new HttpsError('invalid-argument', 'submitterName is required');
  }
  if (!data.contactNumber || typeof data.contactNumber !== 'string') {
    throw new HttpsError('invalid-argument', 'contactNumber is required');
  }

  // ─── Build document ─────────────────────────────────────
  const db = getFirestore();
  const ts = Date.now();
  const referenceId = `NG-${ts}`;
  const ward = deriveWard(data.location.lat, data.location.lng);

  const needDoc = {
    referenceId,
    needType: data.needType,
    severityScore: data.severityScore,
    peopleAffected: data.peopleAffected,
    description: data.description,
    location: {
      address: data.location.address,
      lat: data.location.lat,
      lng: data.location.lng,
      ward,
    },
    audioTranscript: data.audioTranscript ?? null,
    submitterName: data.submitterName,
    contactNumber: data.contactNumber,
    submittedAt: FieldValue.serverTimestamp(),
    status: 'open',
    urgency: deriveUrgency(data.severityScore),
    createdAt: FieldValue.serverTimestamp(),
    resolvedAt: null,
    assignedVolunteerId: null,
  };

  const docRef = await db.collection('needs').add(needDoc);

  return {
    success: true,
    referenceId,
    needId: docRef.id,
  };
});
