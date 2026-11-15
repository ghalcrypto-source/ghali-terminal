import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

const OWNER_SESSION_SECRET =
  process.env.OWNER_SESSION_SECRET ||
  crypto
    .createHash('sha256')
    .update(process.env.GEMINI_API_KEY || 'ghali-terminal-owner-hmac-key-v1')
    .digest('hex');

function sha256Equal(a: string, b: string): boolean {
  const hashA = crypto.createHash('sha256').update(a).digest();
  const hashB = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

function verifyOwnerToken(token: string): { uid: string; exp: number } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [encoded, sig] = parts;
    const expectedSig = crypto
      .createHmac('sha256', OWNER_SESSION_SECRET)
      .update(encoded)
      .digest('base64url');
    if (!sha256Equal(sig, expectedSig)) return null;
    const decoded = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8'));
    if (!decoded?.uid || typeof decoded.exp !== 'number' || Date.now() > decoded.exp) {
      return null;
    }
    return decoded;
  } catch {
    return null;
  }
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ authenticated: false });
  }

  const authHeader = (req.headers.authorization as string) || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  const verified = token ? verifyOwnerToken(token) : null;

  if (!verified) {
    return res.status(401).json({ authenticated: false });
  }

  return res.status(200).json({
    authenticated: true,
    user: {
      uid: verified.uid,
      traderName: 'GHALI',
      email: 'ghalcrypto@gmail.com',
      role: 'Terminal Owner',
    },
  });
}
