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
      profile = await User.findOne({ email: auth.email }).lean();
    }
    return NextResponse.json({ authenticated: true, profile }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to load profile' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await getAuthUser();
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await request.json();

    // Only allow a safe subset of fields to be updated from the UI
    const updatable: Record<string, any> = {};
    const allowed = ['name', 'avatarCid', 'profileCid', 'phone', 'address', 'gender', 'bloodGroup', 'dob'];
    for (const k of allowed) {
      if (Object.prototype.hasOwnProperty.call(body, k)) {
        updatable[k] = body[k];
      }
    }

    await dbConnect();
    let userDoc: any = null;
    try {
      userDoc = await User.findById(auth.uid);
    } catch {
      userDoc = await User.findOne({ email: auth.email });
    }
    if (!userDoc) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

    Object.assign(userDoc, updatable);
    await userDoc.save();

    return NextResponse.json({ ok: true, profile: userDoc.toObject() }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to update profile' }, { status: 500 });
  }
}
