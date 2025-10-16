"use client";
import { useState } from "react";
import { GamificationService } from "@/lib/firebase/services";
import type { UserProfile, SharedWorkout } from "@/lib/firebase/schema";

export default function Page() {
  const [form, setForm] = useState({ exercise: "", weight: 0, reps: 0, sets: 1, country: "", notes: "" });
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    try {
      // TODO: recuperare user da auth context
      const user: UserProfile = {
        id: "demo",
        email: "demo@example.com",
        name: "Demo",
        country: form.country || "IT",
        createdAt: undefined as any,
        updatedAt: undefined as any,
        profileVisibility: "public",
        shareWorkouts: true,
        gamingProfile: { level: 1, xp: 0, badges: [], totalWorkoutsShared: 0, validationsGiven: 0, validationAccuracy: 0, currentRanks: {} }
      };
      const svc = new GamificationService();
      const data: Omit<SharedWorkout, 'id'|'user'|'createdAt'|'oneRepMax'> = {
        userId: user.id,
        exercise: form.exercise,
        weight: Number(form.weight),
        reps: Number(form.reps),
        sets: Number(form.sets),
        media: [],
        status: 'pending',
        country: user.country,
        notes: form.notes
      } as any;
      await svc.shareWorkout(user, data);
      alert("Condiviso per validazione");
      setForm({ exercise: "", weight: 0, reps: 0, sets: 1, country: "", notes: "" });
    } finally { setBusy(false); }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Condividi Workout</h1>
      <div className="grid gap-3 max-w-md">
        <input className="border rounded p-2" placeholder="Esercizio" value={form.exercise} onChange={e=>setForm({...form, exercise:e.target.value})} />
        <div className="grid grid-cols-3 gap-2">
          <input className="border rounded p-2" type="number" placeholder="Peso" value={form.weight} onChange={e=>setForm({...form, weight:e.target.valueAsNumber})} />
          <input className="border rounded p-2" type="number" placeholder="Reps" value={form.reps} onChange={e=>setForm({...form, reps:e.target.valueAsNumber})} />
          <input className="border rounded p-2" type="number" placeholder="Serie" value={form.sets} onChange={e=>setForm({...form, sets:e.target.valueAsNumber})} />
        </div>
        <input className="border rounded p-2" placeholder="Nazione (es. IT)" value={form.country} onChange={e=>setForm({...form, country:e.target.value})} />
        <textarea className="border rounded p-2" placeholder="Note" value={form.notes} onChange={e=>setForm({...form, notes:e.target.value})} />
        <button disabled={busy} onClick={submit} className="rounded bg-primary text-primary-foreground px-4 py-2 disabled:opacity-50">{busy? 'Invio…':'Condividi'}</button>
      </div>
      <p className="text-sm text-muted-foreground">Versione base: in produzione, integra upload su Firebase Storage con limiti (max 3 file, 20MB cad., img/video).</p>
    </div>
  );
}
