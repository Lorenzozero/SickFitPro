import { Timestamp } from 'firebase/firestore';

export interface MediaFile { url: string; type: 'image' | 'video'; }
export interface RankPosition { global?: number; country?: number; gym?: number }
export interface Badge { id: string; name: string; icon: string }

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  country: string;
  gym?: { id: string; name: string; verified: boolean };
  weight?: number; height?: number; age?: number;
  fitnessGoals?: string[];
  gamingProfile: { level: number; xp: number; badges: Badge[]; totalWorkoutsShared: number; validationsGiven: number; validationAccuracy: number; currentRanks: Record<string, RankPosition>; };
  profileVisibility: 'public' | 'gym' | 'private';
  shareWorkouts: boolean;
  createdAt: Timestamp; updatedAt: Timestamp;
}

export interface CompletedExercise { name: string; sets: { weight: number; reps: number }[] }
export interface PersonalRecord { exercise: string; weight: number; reps: number; date: string }
export interface CompletedWorkout {
  id: string; userId: string; planId: string; planName: string;
  startTime: Timestamp; endTime: Timestamp; duration: number;
  exercises: CompletedExercise[]; totalWeight: number; totalReps: number;
  personalRecords: PersonalRecord[]; canShare: boolean; isShared: boolean; shareId?: string;
  completionDate: string; createdAt: Timestamp;
}

export interface SharedWorkout {
  id: string; userId: string;
  user: { name: string; avatar?: string; level: number; gym?: string; country: string };
  exercise: string; weight: number; reps: number; sets: number; oneRepMax: number;
  media: MediaFile[]; status: 'pending'|'approved'|'rejected';
  validationData?: { totalVotes: number; approveVotes: number; rejectVotes: number; voters: string[] };
  gym?: string; country: string; notes?: string; createdAt: Timestamp;
}

export interface RankingEntry { userId: string; username: string; avatar?: string; weight: number; reps: number; oneRepMax: number; shareId: string; gym?: string; country: string; rank: number; previousRank?: number; recordDate: Timestamp }
