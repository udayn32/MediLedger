import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

export interface AuthUser {
  uid: string;
  email: string;
  role: string;
}

export async function getAuthUser(): Promise<AuthUser | null> {
  const c = await cookies();
  const token = c.get('auth')?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return { uid: decoded.uid, email: decoded.email, role: decoded.role };
  } catch {
    return null;
  }
}
