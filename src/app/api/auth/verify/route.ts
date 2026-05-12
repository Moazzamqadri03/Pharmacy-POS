import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizeIdentifier, isEmail, isPhone, createSessionToken, SESSION_COOKIE_NAME, SESSION_TTL_MS } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const mode = body?.mode as 'sign-in' | 'register' | 'reset';
  const method = body?.method as 'email' | 'phone';
  const identifier = body?.identifier as string;
  const otp = body?.otp as string;

  if (!mode || !method || !identifier || !otp) {
    return NextResponse.json({ message: 'Please provide the one-time code for verification.' }, { status: 400 });
  }

  const normalized = normalizeIdentifier(method, identifier);

  if (method === 'email' && !isEmail(normalized)) {
    return NextResponse.json({ message: 'Enter a valid email address.' }, { status: 400 });
  }

  if (method === 'phone' && !isPhone(normalized)) {
    return NextResponse.json({ message: 'Enter a valid 10-digit phone number.' }, { status: 400 });
  }

  const latestRequest = await prisma.otpRequest.findFirst({
    where: {
      identifier: normalized,
      method,
      purpose: mode,
      used: false,
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!latestRequest) {
    return NextResponse.json({ message: 'No active OTP was found. Please request a new code.' }, { status: 400 });
  }

  if (latestRequest.expiresAt.getTime() < Date.now()) {
    await prisma.otpRequest.update({ where: { id: latestRequest.id }, data: { used: true } });
    return NextResponse.json({ message: 'That code has expired. Request another one.' }, { status: 400 });
  }

  if (latestRequest.code !== otp.trim()) {
    return NextResponse.json({ message: 'The code is incorrect. Please check and retry.' }, { status: 400 });
  }

  await prisma.otpRequest.update({ where: { id: latestRequest.id }, data: { used: true } });

  const sessionToken = createSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await prisma.session.create({
    data: {
      userId: latestRequest.userId,
      token: sessionToken,
      expiresAt,
    },
  });

  const user = await prisma.user.findUnique({
    where: { id: latestRequest.userId },
  });

  const response = NextResponse.json({
    success: true,
    message: 'Verification successful. You are now signed in.',
    user: {
      id: user?.id,
      name: user?.name ?? null,
      email: user?.email ?? null,
      phone: user?.phone ?? null,
    },
  });

  response.cookies.set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
  });

  return response;
}
