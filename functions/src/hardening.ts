import { onRequest } from 'firebase-functions/v2/https';
import { onDocumentWritten, onSchedule } from 'firebase-functions/v2/firestore';
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

initializeApp();
const db = getFirestore();

// ENV: ADMIN_API_SECRET used to authorize admin claim setting and rate-limited endpoints
function assertSecret(req: any) {
  const secret = process.env.ADMIN_API_SECRET;
  if (!secret || req.get('x-admin-secret') !== secret) {
    throw new Error('unauthorized');
  }
}

// 1) Best-practice: server-enforced single vote with transaction + basic rate limiting
export const voteSharedWorkout = onRequest({ region: 'europe-west3' }, async (req, res) => {
  try {
    const { shareId, voterId, approve } = req.body || {};
    if (!shareId || !voterId || typeof approve !== 'boolean') return res.status(400).json({ error: 'invalid_payload' });

    // simple RL: max 20 votes/hour
    const rlRef = db.collection('admin').doc(`rate_limits_votes_${voterId}`);
    await db.runTransaction(async (tx) => {
      const rlSnap = await tx.get(rlRef);
      const now = Date.now();
      const windowMs = 60 * 60 * 1000; // 1h
      const limit = 20;
      const data = rlSnap.exists ? rlSnap.data() as any : { windowStart: now, count: 0 };
      const inWindow = now - data.windowStart < windowMs;
      const count = inWindow ? data.count + 1 : 1;
      if (count > limit) throw new Error('rate_limited');
      tx.set(rlRef, { windowStart: inWindow ? data.windowStart : now, count }, { merge: true });
    });

    const ref = db.doc(`shared_workouts/${shareId}`);
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists) throw new Error('not_found');
      const doc = snap.data() as any;
      if (doc.status !== 'pending') return; // already finalized
      const vd = doc.validationData || { totalVotes: 0, approveVotes: 0, rejectVotes: 0, voters: [] };
      if (vd.voters.includes(voterId)) return; // idempotent
      vd.voters.push(voterId);
      vd.totalVotes += 1;
      if (approve) vd.approveVotes += 1; else vd.rejectVotes += 1;
      tx.update(ref, { validationData: vd });
    });
    return res.json({ ok: true });
  } catch (e: any) {
    if (e.message === 'rate_limited') return res.status(429).json({ error: 'rate_limited' });
    if (e.message === 'not_found') return res.status(404).json({ error: 'not_found' });
    return res.status(500).json({ error: 'internal' });
  }
});

// 2) Best-practice: rate limited share endpoint (optional wrapper)
export const shareRateLimit = onRequest({ region: 'europe-west3' }, async (req, res) => {
  try {
    const { userId } = req.body || {};
    if (!userId) return res.status(400).json({ error: 'invalid_payload' });
    const rlRef = db.collection('admin').doc(`rate_limits_share_${userId}`);
    await db.runTransaction(async (tx) => {
      const rlSnap = await tx.get(rlRef);
      const now = Date.now();
      const windowMs = 24 * 60 * 60 * 1000; // 1 day
      const limit = 5;
      const data = rlSnap.exists ? rlSnap.data() as any : { windowStart: now, count: 0 };
      const inWindow = now - data.windowStart < windowMs;
      const count = inWindow ? data.count + 1 : 1;
      if (count > limit) throw new Error('rate_limited');
      tx.set(rlRef, { windowStart: inWindow ? data.windowStart : now, count }, { merge: true });
    });
    return res.json({ ok: true });
  } catch (e: any) {
    if (e.message === 'rate_limited') return res.status(429).json({ error: 'rate_limited' });
    return res.status(500).json({ error: 'internal' });
  }
});

// 3) Materialize leaderboards (Top 100) periodically
export const materializeLeaderboards = onSchedule({ schedule: 'every 10 minutes', region: 'europe-west3' }, async () => {
  const ranksRef = db.collection('rankings');
  const entriesSnap = await db.collectionGroup('entries').get();
  const byKey: Record<string, any[]> = {};
  entriesSnap.forEach((doc) => {
    const e = doc.data() as any;
    if (!e.exercise) return;
    const keys: string[] = [
      `global_${e.exercise}`,
      e.country ? `country_${e.country}_${e.exercise}` : '',
      e.gym ? `gym_${e.gym}_${e.exercise}` : '',
    ].filter(Boolean);
    for (const k of keys) {
      byKey[k] = byKey[k] || [];
      byKey[k].push(e);
    }
  });
  await Promise.all(Object.entries(byKey).map(async ([key, arr]) => {
    arr.sort((a, b) => (b.oneRepMax || 0) - (a.oneRepMax || 0));
    const top = arr.slice(0, 100).map((e, idx) => ({ ...e, rank: idx + 1 }));
    await ranksRef.doc(key).set({ leaderboard: top, lastUpdated: new Date() }, { merge: true });
  }));
});

// 4) Admin claims via secret header
export const setAdminClaim = onRequest({ region: 'europe-west3' }, async (req, res) => {
  try {
    assertSecret(req);
    const { uid, admin } = req.body || {};
    if (!uid || typeof admin !== 'boolean') return res.status(400).json({ error: 'invalid_payload' });
    await getAuth().setCustomUserClaims(uid, { admin });
    return res.json({ ok: true });
  } catch (e: any) {
    if (e.message === 'unauthorized') return res.status(401).json({ error: 'unauthorized' });
    return res.status(500).json({ error: 'internal' });
  }
});

// Existing triggers kept
export { finalizeValidation, aggregateAdminMetrics } from './existing';
