import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { dbConnect } from '@/lib/mongodb';
import User from '@/lib/models/User';

export async function GET() {
  try {
    const auth = await getAuthUser();
    if (!auth) return NextResponse.json({ authenticated: false }, { status: 200 });
    await dbConnect();
    let profile: any = null;
    try {
      profile = await User.findById(auth.uid).lean();
    } catch {
      // If uid is not ObjectId, fallback by email
      profile = await User.findOne({ email: auth.email }).lean();
    }
    return NextResponse.json({ authenticated: true, user: auth, profile }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to load profile' }, { status: 500 });
  }
}
