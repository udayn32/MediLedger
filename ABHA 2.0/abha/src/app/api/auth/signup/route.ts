import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { dbConnect } from '@/lib/mongodb';
import User from '@/lib/models/User';

export async function POST(req: Request) {
  try {
    const { email, password, name, role } = await req.json();
    if (!email || !password) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    await dbConnect();
    const existing = await User.findOne({ email });
    if (existing) return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, passwordHash, name, role });
    return NextResponse.json({ id: user.id, email: user.email });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Signup failed' }, { status: 500 });
  }
}
