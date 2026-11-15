import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';

const OWNER_LOGIN_ID = process.env.OWNER_LOGIN_ID || '120403';
const OWNER_LOGIN_PASSWORD = process.env.OWNER_LOGIN_PASSWORD || '120403@';
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

function signOwnerToken(payload: { uid: string; exp: number }): string {
  const encoded = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const sig = crypto.createHmac('sha256', OWNER_SESSION_SECRET).update(encoded).digest('base64url');
  return `${encoded}.${sig}`;
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  const id = typeof body.id === 'string' ? body.id.trim() : '';
  const password = typeof body.password === 'string' ? body.password.trim() : '';

  if (!id || !password) {
    return res.status(400).json({ success: false, error: 'ID dan Password wajib diisi.' });
  }

  const validId = sha256Equal(id, OWNER_LOGIN_ID);
  const validPassword = sha256Equal(password, OWNER_LOGIN_PASSWORD);

  if (!validId || !validPassword) {
    return res.status(401).json({ success: false, error: 'ID atau Password tidak valid.' });
  }

  const exp = Date.now() + 7 * 24 * 60 * 60 * 1000;
  const token = signOwnerToken({ uid: 'owner-120403', exp });

  return res.status(200).json({
    success: true,
    token,
    user: {
      uid: 'owner-120403',
      traderName: 'GHALI',
      email: 'ghalcrypto@gmail.com',
      role: 'Terminal Owner',
    },
  });
}
