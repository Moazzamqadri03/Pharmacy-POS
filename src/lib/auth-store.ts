type AuthMethod = 'email' | 'phone';

type StoredOtp = {
  code: string;
  expiresAt: number;
};

const otpStore = new Map<string, StoredOtp>();
const OTP_TTL = 5 * 60 * 1000; // 5 minutes

function makeKey(method: AuthMethod, identifier: string) {
  return `${method}:${identifier.trim().toLowerCase()}`;
}

function createCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function storeOtp(method: AuthMethod, identifier: string) {
  const key = makeKey(method, identifier);
  const code = createCode();
  otpStore.set(key, { code, expiresAt: Date.now() + OTP_TTL });
  return code;
}

function consumeOtp(method: AuthMethod, identifier: string) {
  const key = makeKey(method, identifier);
  const entry = otpStore.get(key);
  if (!entry) return null;
  otpStore.delete(key);
  return entry;
}

function peekOtp(method: AuthMethod, identifier: string) {
  const key = makeKey(method, identifier);
  return otpStore.get(key) ?? null;
}

export { AuthMethod, storeOtp, consumeOtp, peekOtp };
