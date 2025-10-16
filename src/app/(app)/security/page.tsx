"use client";
import { useAuthCtx } from '@/context/auth-context';
import { sendPasswordResetEmail, verifyBeforeUpdateEmail } from 'firebase/auth';

export default function SecurityPage() {
  const { user, loading, signIn } = useAuthCtx();

  const resetPwd = async () => {
    if (!user?.email) return;
    await sendPasswordResetEmail((await import('@/lib/firebase/config')).auth, user.email);
    alert('Email di reset password inviata.');
  };

  const verifyEmail = async () => {
    if (!user) return;
    await verifyBeforeUpdateEmail((await import('@/lib/firebase/config')).auth.currentUser!, user.email ?? '');
    alert('Email di verifica inviata.');
  };

  if (loading) return <p>Caricamento…</p>;
  if (!user) return (
    <div className="space-y-3">
      <p className="text-muted-foreground">Accedi per gestire la sicurezza del tuo account.</p>
      <button onClick={signIn} className="rounded bg-primary text-primary-foreground px-4 py-2">Login con Google</button>
    </div>
  );

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Sicurezza Account</h1>
      <div className="space-y-2">
        <button onClick={resetPwd} className="rounded border px-3 py-2">Reset Password</button>
        <button onClick={verifyEmail} className="rounded border px-3 py-2">Verifica Email</button>
      </div>
      <p className="text-sm text-muted-foreground">Consiglio: abilita 2FA sul tuo account Google per maggiore sicurezza.</p>
    </div>
  );
}
