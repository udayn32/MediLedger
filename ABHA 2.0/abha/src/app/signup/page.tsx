"use client";
import { useState } from 'react';

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("patient");
  const [msg, setMsg] = useState("");
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
  const res = await fetch('/api/auth/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password, name, role }) });
    const data = await res.json();
    if (!res.ok) return setMsg(data.error || 'Signup failed');
    setMsg('Account created. You can login now.');
  };
  return (
    <main className="container mx-auto px-6 py-12 max-w-md">
      <h1 className="text-2xl font-bold">Sign Up</h1>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <input className="w-full rounded-lg border border-white/20 bg-transparent px-3 py-2" placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />
        <input className="w-full rounded-lg border border-white/20 bg-transparent px-3 py-2" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="w-full rounded-lg border border-white/20 bg-transparent px-3 py-2" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <select className="w-full rounded-lg border border-white/20 bg-transparent px-3 py-2" value={role} onChange={e=>setRole(e.target.value)}>
          <option value="patient">Patient</option>
          <option value="doctor">Doctor</option>
          <option value="admin">Admin</option>
        </select>
        {msg && <p className="text-sm">{msg}</p>}
        <button className="rounded-lg bg-cyan-500 px-4 py-2 text-slate-950">Create account</button>
      </form>
    </main>
  );
}
