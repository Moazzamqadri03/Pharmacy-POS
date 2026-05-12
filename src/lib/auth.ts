import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';

export const SESSION_COOKIE_NAME = 'medicate_session';
export const OTP_TTL_MS = 5 * 60 * 1000;
export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export function normalizeIdentifier(method: 'email' | 'phone', identifier: string) {
  const value = String(identifier || '').trim();
  return method === 'email'
    ? value.toLowerCase()
    : value.replace(/\D/g, '');
}

export function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}

export function isPhone(value: string) {
  return /^[6-9]\d{9}$/.test(String(value || '').trim());
}

export function createOtpCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function createSessionToken() {
  return randomBytes(32).toString('hex');
}

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const derived = scryptSync(password, salt, 64);
  return `${salt}:${derived.toString('hex')}`;
}

export function verifyPassword(password: string, storedHash: string | null | undefined) {
  if (!storedHash) return false;
  const [salt, key] = storedHash.split(':');
  if (!salt || !key) return false;
  const derived = scryptSync(password, salt, 64);
  try {
    return timingSafeEqual(Buffer.from(key, 'hex'), derived);
  } catch {
    return false;
  }
}
