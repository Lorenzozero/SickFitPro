"use client";
import { useAuthCtx } from '@/context/auth-context';
import Link from 'next/link';

export default function Page() {
  const { user, loading, signIn, signOut } = useAuthCtx();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Community</h1>
      {loading ? (
        <p className="text-muted-foreground">Caricamento…</p>
      ) : user ? (
        <div className="space-y-3">
          <p className="text-sm">Sei autenticato come <span className="font-medium">{user.displayName ?? user.email}</span></p>
          <div className="flex gap-2">
            <Link href="/gamification/feed" className="rounded bg-primary text-primary-foreground px-3 py-2">Vai al Feed</Link>
            <Link href="/gamification/share" className="rounded bg-primary text-primary-foreground px-3 py-2">Condividi Workout</Link>
            <Link href="/gamification/validation" className="rounded bg-primary text-primary-foreground px-3 py-2">Validation Center</Link>
            <button onClick={signOut} className="rounded border px-3 py-2">Logout</button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-muted-foreground">Per accedere alla community effettua il login.</p>
          <button onClick={signIn} className="rounded bg-primary text-primary-foreground px-4 py-2">Login con Google</button>
        </div>
      )}
    </div>
  );
}
