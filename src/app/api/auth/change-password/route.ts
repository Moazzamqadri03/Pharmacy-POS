import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SESSION_COOKIE_NAME, hashPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ message: 'You must be signed in to update your password.' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const newPassword = typeof body?.newPassword === 'string' ? body.newPassword.trim() : '';

  if (!newPassword || newPassword.length < 8) {
    return NextResponse.json({ message: 'Please choose a strong password with at least 8 characters.' }, { status: 400 });
  }

  const session = await prisma.session.findUnique({ where: { token }, include: { user: true } });
  if (!session || session.expiresAt.getTime() < Date.now()) {
    return NextResponse.json({ message: 'Session expired. Please sign in again.' }, { status: 401 });
  }

  await prisma.user.update({ where: { id: session.userId }, data: { passwordHash: hashPassword(newPassword) } });

  return NextResponse.json({ success: true, message: 'Password updated successfully.' });
}
