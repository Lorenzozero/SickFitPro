// Cloud Functions (Node 20, TypeScript)
import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
initializeApp();
const db = getFirestore();

// Auto-finalize validation and update status; enqueue ranking update
export const finalizeValidation = onDocumentWritten({
  document: 'shared_workouts/{shareId}',
  region: 'europe-west3',
  retries: 3,
}, async (event) => {
  const after = event.data?.after?.data() as any | undefined;
  if (!after) return;
  if (after.status !== 'pending') return; // already finalized
  const vd = after.validationData || { totalVotes: 0, approveVotes: 0 };
  if (vd.totalVotes < 5) return; // threshold
  const approved = vd.approveVotes / vd.totalVotes >= 0.6;
  await db.doc(`shared_workouts/${event.params.shareId}`).update({ status: approved ? 'approved' : 'rejected', 'validationData.completedAt': new Date() });
  if (!approved) return;
  // naive ranking update: write/merge per scope documents; can be optimized
  const exercise = after.exercise as string;
  const entry = {
    userId: after.userId,
    username: after.user?.name ?? 'User',
    avatar: after.user?.avatar ?? null,
    weight: after.weight,
    reps: after.reps,
    oneRepMax: Math.round(after.weight * (1 + after.reps / 30)),
    shareId: event.params.shareId,
    gym: after.gym ?? null,
    country: after.country,
    recordDate: new Date(),
  };
  // Global
  await db.collection('rankings').doc(`global_${exercise}`).set({ exercise, scope: 'global', leaderboard: [] }, { merge: true });
  await db.collection('rankings').doc(`global_${exercise}`).collection('entries').doc(entry.shareId).set(entry);
  // Country
  if (entry.country) {
    await db.collection('rankings').doc(`country_${entry.country}_${exercise}`).set({ exercise, scope: 'country', scopeId: entry.country, leaderboard: [] }, { merge: true });
    await db.collection('rankings').doc(`country_${entry.country}_${exercise}`).collection('entries').doc(entry.shareId).set(entry);
  }
  // Gym
  if (entry.gym) {
    await db.collection('rankings').doc(`gym_${entry.gym}_${exercise}`).set({ exercise, scope: 'gym', scopeId: entry.gym, leaderboard: [] }, { merge: true });
    await db.collection('rankings').doc(`gym_${entry.gym}_${exercise}`).collection('entries').doc(entry.shareId).set(entry);
  }
});

// Admin metrics aggregation: writes summary docs under admin/metrics
export const aggregateAdminMetrics = onDocumentWritten({
  document: '{colId}/{docId}',
  region: 'europe-west3',
  retries: 3,
}, async (_event) => {
  // Simple periodic aggregator could be moved to scheduled function
  const [users, shared, completed] = await Promise.all([
    db.collection('users').count().get(),
    db.collection('shared_workouts').count().get(),
    db.collection('completed_workouts').count().get(),
  ]);
  await db.collection('admin').doc('metrics').set({
    updatedAt: new Date(),
    totals: {
      users: users.data().count,
      sharedWorkouts: shared.data().count,
      completedWorkouts: completed.data().count,
    },
  }, { merge: true });
});
