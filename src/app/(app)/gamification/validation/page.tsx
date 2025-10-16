"use client";
import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { GamificationService } from "@/lib/firebase/services";

export default function Page() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'shared_workouts'), where('status', '==', 'pending'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => setItems(snap.docs.map(d=>({ id: d.id, ...d.data() }))));
    return () => unsub();
  }, []);

  const vote = async (id: string, approve: boolean) => {
    const svc = new GamificationService();
    // TODO: sostituire con userId reale da auth
    await svc.validateWorkout(id, 'demo', approve);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Validation Center</h1>
      <ul className="space-y-3">
        {items.map((it) => (
          <li key={it.id} className="rounded-md border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{it.user?.name ?? 'Utente'}</p>
                <p className="text-sm text-muted-foreground">{it.exercise} • {it.weight}kg × {it.reps}×{it.sets}</p>
              </div>
              <div className="flex gap-2">
                <button className="rounded bg-emerald-600 px-3 py-1 text-white" onClick={()=>vote(it.id, true)}>Approva</button>
                <button className="rounded bg-rose-600 px-3 py-1 text-white" onClick={()=>vote(it.id, false)}>Rifiuta</button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
