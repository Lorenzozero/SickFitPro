import { collection, doc, getDoc, getDocs, limit, onSnapshot, orderBy, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import { db } from './config';
import type { CompletedWorkout, RankingEntry, SharedWorkout, UserProfile } from './schema';

export class WorkoutService {
  async saveCompletedWorkout(userId: string, workout: CompletedWorkout) {
    const ref = doc(collection(db, 'completed_workouts'));
    await setDoc(ref, { ...workout, userId, createdAt: serverTimestamp() });
    return ref.id;
  }

  async getUserWorkoutHistory(userId: string, take = 50) {
    const q = query(collection(db, 'completed_workouts'), where('userId', '==', userId), orderBy('createdAt', 'desc'), limit(take));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }
}

export class GamificationService {
  async shareWorkout(user: UserProfile, data: Omit<SharedWorkout, 'id'|'user'|'createdAt'|'oneRepMax'>) {
    const ref = doc(collection(db, 'shared_workouts'));
    const oneRepMax = Math.round(data.weight * (1 + data.reps / 30));
    await setDoc(ref, { ...data, userId: user.id, user: { name: user.name, avatar: user.avatar, level: user.gamingProfile.level, gym: user.gym?.name, country: user.country }, oneRepMax, createdAt: serverTimestamp(), status: 'pending' });
    return ref.id;
  }

  async validateWorkout(shareId: string, voterId: string, approve: boolean) {
    const ref = doc(db, 'shared_workouts', shareId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return;
    const sw = snap.data() as SharedWorkout;
    const vd = sw.validationData || { totalVotes: 0, approveVotes: 0, rejectVotes: 0, voters: [] };
    if (vd.voters.includes(voterId)) return;
    vd.voters.push(voterId); vd.totalVotes += 1; if (approve) vd.approveVotes += 1; else vd.rejectVotes += 1;
    await updateDoc(ref, { validationData: vd });

    if (vd.totalVotes >= 5) {
      const approved = vd.approveVotes / vd.totalVotes >= 0.6;
      await updateDoc(ref, { status: approved ? 'approved' : 'rejected' });
      if (approved) await this.updateRankings(sw);
    }
  }

  private async updateRankings(sw: SharedWorkout) {
    // Placeholder: implement ranking collections writes here
    return;
  }
}

export function subscribeFeed(setter: (items: any[]) => void, filter: 'all'|'pending'|'gym'|'country' = 'all', ctx?: { gym?: string; country?: string }) {
  let q = query(collection(db, 'shared_workouts'), orderBy('createdAt', 'desc'), limit(20));
  if (filter === 'pending') q = query(q, where('status', '==', 'pending'));
  if (filter === 'gym' && ctx?.gym) q = query(q, where('gym', '==', ctx.gym));
  if (filter === 'country' && ctx?.country) q = query(q, where('country', '==', ctx.country));
  return onSnapshot(q, (snap) => setter(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
}
