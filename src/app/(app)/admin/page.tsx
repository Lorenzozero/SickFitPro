"use client";
import AdminGate from "./_components/AdminGate";
import Link from "next/link";
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

export default function Page() {
  const [metrics, setMetrics] = useState<any|null>(null);

  useEffect(() => {
    const ref = doc(db, 'admin', 'metrics');
    const unsub = onSnapshot(ref, snap => setMetrics(snap.data() ?? null));
    return () => unsub();
  }, []);

  return (
    <AdminGate>
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded border p-4">
            <p className="text-sm text-muted-foreground">Utenti</p>
            <p className="text-3xl font-bold">{metrics?.totals?.users ?? '-'}</p>
          </div>
          <div className="rounded border p-4">
            <p className="text-sm text-muted-foreground">Condivisioni</p>
            <p className="text-3xl font-bold">{metrics?.totals?.sharedWorkouts ?? '-'}</p>
          </div>
          <div className="rounded border p-4">
            <p className="text-sm text-muted-foreground">Completati</p>
            <p className="text-3xl font-bold">{metrics?.totals?.completedWorkouts ?? '-'}</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded border p-4 space-y-2">
            <h2 className="text-lg font-semibold">Gestione</h2>
            <div className="flex flex-wrap gap-2">
              <Link href="/admin/users" className="rounded border px-3 py-2">Utenti</Link>
              <Link href="/admin/gyms" className="rounded border px-3 py-2">Palestre</Link>
              <Link href="/admin/shared" className="rounded border px-3 py-2">Post Condivisi</Link>
              <Link href="/admin/settings" className="rounded border px-3 py-2">Impostazioni</Link>
            </div>
          </div>

          <div className="rounded border p-4 space-y-2">
            <h2 className="text-lg font-semibold">Strumenti</h2>
            <ul className="list-disc pl-6 text-sm text-muted-foreground">
              <li>Moderazione rapida (approva/rimuovi)</li>
              <li>Verifica palestre e staff</li>
              <li>Audit log e anomalie</li>
              <li>Esportazione CSV</li>
            </ul>
          </div>
        </div>
      </div>
    </AdminGate>
  );
}
