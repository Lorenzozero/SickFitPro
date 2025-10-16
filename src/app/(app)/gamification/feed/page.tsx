"use client";
import { useEffect, useState } from "react";
import { subscribeFeed } from "@/lib/firebase/services";

export default function Page() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    const unsub = subscribeFeed(setItems, "all");
    return () => unsub();
  }, []);
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
