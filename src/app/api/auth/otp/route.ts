import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizeIdentifier, isEmail, isPhone, createOtpCode, hashPassword, OTP_TTL_MS } from '@/lib/auth';
import { sendOtpEmail, sendOtpSms } from '@/lib/notifications';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const mode = body?.mode as 'sign-in' | 'register' | 'reset';
  const method = body?.method as 'email' | 'phone';
  const identifier = body?.identifier as string;
  const name = typeof body?.name === 'string' ? body.name.trim() : undefined;
  const password = typeof body?.password === 'string' ? body.password.trim() : undefined;

  if (!mode || !method || !identifier) {
    return NextResponse.json({ message: 'Please provide all required information.' }, { status: 400 });
  }

  if (!['sign-in', 'register', 'reset'].includes(mode)) {
    return NextResponse.json({ message: 'Invalid authentication mode.' }, { status: 400 });
  }

  const normalized = normalizeIdentifier(method, identifier);

  if (method === 'email' && !isEmail(normalized)) {
    return NextResponse.json({ message: 'Enter a valid email address.' }, { status: 400 });
  }

  if (method === 'phone' && !isPhone(normalized)) {
    return NextResponse.json({ message: 'Enter a valid 10-digit phone number.' }, { status: 400 });
  }

  const existingUser = await prisma.user.findUnique({
    where: method === 'email' ? { email: normalized } : { phone: normalized },
  });

  let user = existingUser;

  if (mode === 'register') {
    if (!password || password.length < 8) {
      return NextResponse.json({ message: 'Password must be at least 8 characters.' }, { status: 400 });
    }
    if (existingUser) {
      return NextResponse.json({ message: `This ${method} is already registered. Please sign in.` }, { status: 409 });
    }
    user = await prisma.user.create({
      data: {
        name: name || null,
        email: method === 'email' ? normalized : null,
        phone: method === 'phone' ? normalized : null,
        passwordHash: hashPassword(password),
      },
    });
  } else {
    if (!existingUser) {
      return NextResponse.json({ message: `No account found. Please register first.` }, { status: 404 });
    }
  }

  const code = createOtpCode();
  await prisma.otpRequest.create({
    data: {
      userId: user!.id,
      method,
      identifier: normalized,
      purpose: mode,
      code,
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
    },
  });

  let sent = false;
  if (method === 'email') {
    sent = await sendOtpEmail(normalized, code, user?.name ?? undefined);
  } else {
    sent = await sendOtpSms(normalized, code);
  }

  const debugOtp = process.env.NODE_ENV !== 'production' ? code : undefined;
  const message = sent 
    ? `Verification code sent to your ${method}.`
    : `Verification code generated (delivery may not be configured).`;

  return NextResponse.json({ success: true, message, debugOtp });
}
