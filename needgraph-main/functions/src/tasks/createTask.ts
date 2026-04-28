import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';

const db = admin.firestore();

type TaskStatus = 'Assigned' | 'In Progress' | 'Completed' | 'Verified';
type TaskPriority = 'Low' | 'Medium' | 'High' | 'Critical';
type TaskType =
  | 'Health Camp' | 'Survey' | 'Education Drive' | 'Legal Workshop'
  | 'Food Distribution' | 'Counselling Session' | 'Water Relief'
  | 'Emergency Response' | 'Community Outreach' | 'Other';

interface CreateTaskRequest {
  volunteerId: string;
  title: string;
  ward: string;
  taskType: TaskType;
  date: string;
  estimatedHours: number;
  description?: string;
  priority: TaskPriority;
}

/**
 * createTask — creates a new task, assigns it to a volunteer,
 * and updates the volunteer's status to 'Deployed'.
 * Only coordinators and super_admins may create tasks.
 */
export const createTask = onCall(
  { region: 'asia-south1' },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Authentication required');
    }

    const authUid = request.auth.uid;
    const userDoc = await db.collection('users').doc(authUid).get();
    const role = userDoc.data()?.role;
    if (!['coordinator', 'super_admin'].includes(role)) {
      throw new HttpsError('permission-denied', 'Only coordinators may assign tasks');
    }

    const data = request.data as CreateTaskRequest;

    if (!data.volunteerId) throw new HttpsError('invalid-argument', 'volunteerId is required');
    if (!data.title?.trim()) throw new HttpsError('invalid-argument', 'Task title is required');
    if (!data.ward?.trim()) throw new HttpsError('invalid-argument', 'Ward is required');
    if (!data.date) throw new HttpsError('invalid-argument', 'Date is required');
    if (!data.estimatedHours || data.estimatedHours <= 0) throw new HttpsError('invalid-argument', 'estimatedHours must be > 0');

    // Verify volunteer exists
    const volRef = db.collection('volunteers').doc(data.volunteerId);
    const volSnap = await volRef.get();
    if (!volSnap.exists) throw new HttpsError('not-found', 'Volunteer not found');

    const now = admin.firestore.FieldValue.serverTimestamp();
    const taskRef = db.collection('tasks').doc();

    await db.runTransaction(async (tx) => {
      // Create task document
      tx.set(taskRef, {
        id: taskRef.id,
        volunteerId: data.volunteerId,
        title: data.title.trim(),
        ward: data.ward.trim(),
        taskType: data.taskType,
        date: data.date,
        estimatedHours: data.estimatedHours,
        description: data.description?.trim() || '',
        priority: data.priority,
        status: 'Assigned' as TaskStatus,
        assignedBy: authUid,
        createdAt: now,
        updatedAt: now,
      });

      // Update volunteer: set status to Deployed, increment counters
      tx.update(volRef, {
        status: 'Deployed',
        tasksThisWeek: admin.firestore.FieldValue.increment(1),
        totalTasks: admin.firestore.FieldValue.increment(1),
        lastUpdated: now,
      });
    });

    // Activity feed
    await db.collection('activityFeed').add({
      type: 'task_assigned',
      entityId: taskRef.id,
      entityType: 'task',
      description: `Task "${data.title}" assigned to volunteer ${volSnap.data()?.name} in ${data.ward}`,
      userId: authUid,
      timestamp: now,
    });

    return { taskId: taskRef.id, message: 'Task created and assigned successfully' };
  }
);

/**
 * updateTaskStatus — advances a task through its status flow.
 * Status flow: Assigned → In Progress → Completed → Verified
 */
export const updateTaskStatus = onCall(
  { region: 'asia-south1' },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Authentication required');
    }

    const authUid = request.auth.uid;
    const { taskId, newStatus } = request.data as { taskId: string; newStatus: TaskStatus };

    if (!taskId) throw new HttpsError('invalid-argument', 'taskId is required');
    const validStatuses: TaskStatus[] = ['Assigned', 'In Progress', 'Completed', 'Verified'];
    if (!validStatuses.includes(newStatus)) throw new HttpsError('invalid-argument', 'Invalid status value');

    const taskRef = db.collection('tasks').doc(taskId);
    const taskSnap = await taskRef.get();
    if (!taskSnap.exists) throw new HttpsError('not-found', 'Task not found');

    const task = taskSnap.data()!;
    const now = admin.firestore.FieldValue.serverTimestamp();

    await taskRef.update({ status: newStatus, updatedAt: now });

    // If task is done, check if volunteer has remaining active tasks
    if (newStatus === 'Completed' || newStatus === 'Verified') {
      const activeTasks = await db.collection('tasks')
        .where('volunteerId', '==', task.volunteerId)
        .where('status', 'in', ['Assigned', 'In Progress'])
        .get();

      if (activeTasks.empty) {
        await db.collection('volunteers').doc(task.volunteerId).update({
          status: 'Available',
          lastUpdated: now,
        });
      }
    }

    await db.collection('activityFeed').add({
      type: 'task_status_updated',
      entityId: taskId,
      entityType: 'task',
      description: `Task "${task.title}" status updated to ${newStatus}`,
      userId: authUid,
      timestamp: now,
    });

    return { taskId, status: newStatus };
  }
);
