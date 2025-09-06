"use client";
import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
  const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
    const data = await res.json();
    if (!res.ok) return setError(data.error || 'Login failed');
  setOk(true);
  const params = new URLSearchParams(window.location.search);
  const next = params.get('next') || '/';
  setTimeout(() => (window.location.href = next), 500);
  };
  return (
    <main className="container mx-auto px-6 py-12 max-w-md">
      <h1 className="text-2xl font-bold">Login</h1>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <input className="w-full rounded-lg border border-white/20 bg-transparent px-3 py-2" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="w-full rounded-lg border border-white/20 bg-transparent px-3 py-2" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        {error && <p className="text-red-400 text-sm">{error}</p>}
        {ok && <p className="text-green-400 text-sm">Logged in.</p>}
        <button className="rounded-lg bg-cyan-500 px-4 py-2 text-slate-950">Login</button>
      </form>
    </main>
  );
}
