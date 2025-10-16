"use client";
import AdminGate from "../_components/AdminGate";

export default function Page() {
  return (
    <AdminGate>
      <div className="space-y-4">
        <h1 className="text-xl font-semibold">Gestione Post Condivisi</h1>
        <p className="text-muted-foreground">(Da implementare) Approva/rimuovi, filtri per stato/paese/palestra.</p>
      </div>
    </AdminGate>
  );
}
