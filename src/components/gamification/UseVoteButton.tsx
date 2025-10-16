"use client";
import { useAuthCtx } from "@/context/auth-context";

export async function serverVote(shareId: string, approve: boolean) {
  const res = await fetch('/api/vote', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ shareId, approve }) });
  if (!res.ok) throw new Error('vote_failed');
}

export function UseVoteButton({ id, approve }: { id: string; approve: boolean }) {
  const { user } = useAuthCtx();
  return (
    <button
      onClick={async () => { if (!user) return; await serverVote(id, approve); }}
      className={`rounded px-3 py-1 text-white ${approve? 'bg-emerald-600':'bg-rose-600'}`}
    >{approve? 'Approva':'Rifiuta'}</button>
  );
}
