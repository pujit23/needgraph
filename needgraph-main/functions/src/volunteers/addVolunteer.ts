import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';

const db = admin.firestore();

interface AddVolunteerRequest {
  name: string;
  email: string;
  phone: string;
  wardId: number;
  wardName: string;
  skills: string[];
  status: 'Available' | 'Deployed' | 'Off-duty';
  ngoName?: string;
  yearsExperience?: number;
  emergencyContact: string;
  certificateUrl?: string;
}

/**
 * addVolunteer — validates and persists a new volunteer document to Firestore.
 * Only coordinators and super_admins may register volunteers.
 */
export const addVolunteer = onCall(
  { region: 'asia-south1' },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Authentication required');
    }

    const authUid = request.auth.uid;
    const userDoc = await db.collection('users').doc(authUid).get();
    const role = userDoc.data()?.role;
    if (!['coordinator', 'super_admin'].includes(role)) {
      throw new HttpsError('permission-denied', 'Only coordinators may add volunteers');
    }

    const data = request.data as AddVolunteerRequest;

    // Validate required fields
    if (!data.name?.trim()) throw new HttpsError('invalid-argument', 'Name is required');
    if (!data.email?.trim()) throw new HttpsError('invalid-argument', 'Email is required');
    if (!data.phone?.trim()) throw new HttpsError('invalid-argument', 'Phone is required');
    if (!Array.isArray(data.skills) || data.skills.length === 0) throw new HttpsError('invalid-argument', 'At least one skill is required');
    if (!data.emergencyContact?.trim()) throw new HttpsError('invalid-argument', 'Emergency contact is required');

    const volRef = db.collection('volunteers').doc();
    const now = admin.firestore.FieldValue.serverTimestamp();

    await volRef.set({
      id: volRef.id,
      name: data.name.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
      contact: data.phone.trim(),
      wardId: data.wardId,
      wardName: data.wardName,
      skills: data.skills,
      status: data.status || 'Available',
      ngoName: data.ngoName || null,
      yearsExperience: data.yearsExperience || null,
      emergencyContact: data.emergencyContact.trim(),
      certificateUrl: data.certificateUrl || null,
      tasksThisWeek: 0,
      totalTasks: 0,
      assignments: [],
      addedBy: authUid,
      joinedAt: now,
      createdAt: now,
    });

    // Activity feed entry
    await db.collection('activityFeed').add({
      type: 'volunteer_registered',
      entityId: volRef.id,
      entityType: 'volunteer',
      description: `New volunteer ${data.name} registered for ${data.wardName}`,
      userId: authUid,
      timestamp: now,
    });

    return { volunteerId: volRef.id, message: 'Volunteer registered successfully' };
  }
);
