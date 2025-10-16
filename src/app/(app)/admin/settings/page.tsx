"use client";
import AdminGate from "../_components/AdminGate";

export default function Page() {
  return (
    <AdminGate>
      <div className="space-y-4">
        <h1 className="text-xl font-semibold">Impostazioni</h1>
        <p className="text-muted-foreground">(Da implementare) Gestione admin/config, whitelist email admin, chiavi/feature flags.</p>
      </div>
    </AdminGate>
  );
}
