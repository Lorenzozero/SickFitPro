"use client";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuthCtx } from "@/context/auth-context";
import Link from "next/link";

export default function AdminGate({ children }: { children: React.ReactNode }) {
  const { user, loading, signIn } = useAuthCtx();
  const [allowed, setAllowed] = useState<boolean>(false);
  const [checking, setChecking] = useState<boolean>(true);

  useEffect(() => {
    const check = async () => {
      if (!user) { setChecking(false); setAllowed(false); return; }
      // Admin list stored in admin/config doc, or use custom claims in a future iteration
      const cfgRef = doc(db, 'admin', 'config');
      const snap = await getDoc(cfgRef);
      const cfg = snap.exists() ? snap.data() as any : { admins: [] };
      const emails: string[] = Array.isArray(cfg.admins) ? cfg.admins : [];
      setAllowed(!!user.email && emails.includes(user.email));
      setChecking(false);
    };
    check();
  }, [user]);

  if (loading || checking) return <p>Verifica accesso…</p>;
  if (!user || !allowed) return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Area Amministrazione</h1>
      <p className="text-muted-foreground">Accesso riservato. Effettua login con un account autorizzato.</p>
      <button className="rounded bg-primary text-primary-foreground px-4 py-2" onClick={signIn}>Login con Google</button>
      <p className="text-sm">Se sei admin e non riesci ad accedere, verifica la lista admin in admin/config.</p>
      <Link className="underline" href="/">Torna alla home</Link>
    </div>
  );
  return <>{children}</>;
}
