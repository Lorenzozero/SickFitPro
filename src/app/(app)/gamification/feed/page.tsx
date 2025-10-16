"use client";
import { useEffect, useState } from "react";
import { subscribeFeed } from "@/lib/firebase/services";
import { useAuthCtx } from "@/context/auth-context";

export default function Page() {
  const { user, loading, signIn } = useAuthCtx();
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return; // opzionale: feed pubblico anche da ospiti
    const unsub = subscribeFeed(setItems, "all");
    return () => unsub && unsub();
  }, [user]);

  if (loading) return <p>Caricamento…</p>;
  if (!user) return (
    <div className="space-y-3">
      <p className="text-muted-foreground">Accedi per vedere e votare i post della community.</p>
      <button onClick={signIn} className="rounded bg-primary text-primary-foreground px-4 py-2">Login con Google</button>
    </div>
  );

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Community Feed</h1>
      <ul className="space-y-3">
        {items.map((it) => (
          <li key={it.id} className="rounded-md border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{it.user?.name ?? "Utente"}</p>
                <p className="text-sm text-muted-foreground">{it.exercise} • {it.weight}kg × {it.reps}×{it.sets}</p>
              </div>
              <span className="text-xs uppercase tracking-wide">{it.status}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
