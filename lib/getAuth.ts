import { cookies } from 'next/headers';
import { decode } from 'next-auth/jwt';

export async function getAuth() {
  const cookieStore = cookies();
  const tokenValue =
    cookieStore.get('__Secure-next-auth.session-token')?.value ||
    cookieStore.get('next-auth.session-token')?.value;

  if (!tokenValue) return null;

  try {
    return await decode({
      token: tokenValue,
      secret: process.env.NEXTAUTH_SECRET!,
    });
  } catch {
    return null;
  }
}
