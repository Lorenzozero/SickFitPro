import type { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { shareId, approve } = body || {};
  if (!shareId || typeof approve !== 'boolean') return new Response(JSON.stringify({ error: 'invalid_payload' }), { status: 400 });
  // Proxy to CF endpoint (set in env)
  const endpoint = process.env.NEXT_PUBLIC_FUNCTION_VOTE_ENDPOINT!; // e.g., https://<region>-<project>.cloudfunctions.net/voteSharedWorkout
  const voterId = process.env.NEXT_PUBLIC_PROXY_VOTER_ID || 'client'; // optionally inject; better: derive from session token in future
  const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ shareId, voterId, approve }) });
  const text = await res.text();
  return new Response(text, { status: res.status, headers: { 'Content-Type': 'application/json' } });
}
