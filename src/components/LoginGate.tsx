import React, { useState } from 'react';
import { Compass, AlertCircle, Loader2, Eye, EyeOff, Lock } from 'lucide-react';
import { UserSession } from '../types/news';

export const OWNER_TOKEN_STORAGE_KEY = 'ghali_owner_session_token_v2';

const OWNER_PW_SHA256 = '095d3c3d863fe869c3dce845e9ebc0f5ddf212d6bbd05192d61d4e4e31076b87';

function sha256Fallback(ascii: string): string {
  const rightRotate = (value: number, amount: number) => (value >>> amount) | (value << (32 - amount));
  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  let result = '';
  const words: number[] = [];
  const asciiBitLength = ascii.length * 8;
  const hash: number[] = [];
  const k: number[] = [];
  let primeCounter = 0;
  const isComposite: Record<number, boolean> = {};
  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (let i = 0; i < 313; i += candidate) isComposite[i] = true;
      hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
      k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
    }
  }
  ascii += '\x80';
  while ((ascii.length % 64) - 56) ascii += '\x00';
  for (let i = 0; i < ascii.length; i++) {
    const j = ascii.charCodeAt(i);
    words[i >> 2] |= j << (((3 - i) % 4) * 8);
  }
  words[words.length] = (asciiBitLength / maxWord) | 0;
  words[words.length] = asciiBitLength;
  for (let j = 0; j < words.length; ) {
    const w = words.slice(j, (j += 16));
    const oldHash = hash.slice(0);
    for (let i = 0; i < 64; i++) {
      const w15 = w[i - 15], w2 = w[i - 2];
      const a = hash[0], e = hash[4];
      const temp1 =
        hash[7] +
        (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25)) +
        ((e & hash[5]) ^ (~e & hash[6])) +
        k[i] +
        (w[i] =
          i < 16
            ? w[i]
            : (w[i - 16] +
                (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)) +
                w[i - 7] +
                (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))) |
              0);
      const temp2 =
        (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) +
        ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
      hash.unshift((temp1 + temp2) | 0);
      hash[4] = (hash[4] + temp1) | 0;
      hash.pop();
    }
    for (let i = 0; i < 8; i++) hash[i] = (hash[i] + oldHash[i]) | 0;
  }
  for (let i = 0; i < 8; i++) {
    for (let j = 3; j + 1; j--) {
      const b = (hash[i] >> (j * 8)) & 255;
      result += (b < 16 ? '0' : '') + b.toString(16);
    }
  }
  return result;
}

async function sha256Hex(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  if (typeof window !== 'undefined' && window.crypto?.subtle) {
    const digest = await window.crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  let bin = '';
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return sha256Fallback(bin);
}

interface LoginGateProps {
  onLoginSuccess: (session: UserSession) => void;
}

export const LoginGate: React.FC<LoginGateProps> = ({ onLoginSuccess }) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isOwnerAuth, setIsOwnerAuth] = useState(false);

  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const completeOwnerLogin = (
    token: string,
    traderName = 'GHALI',
    email = 'ghalcrypto@gmail.com',
    role = 'Terminal Owner'
  ) => {
    try {
      localStorage.removeItem('ghali_owner_session_token');
      localStorage.setItem(OWNER_TOKEN_STORAGE_KEY, token);
    } catch (_) {}

    onLoginSuccess({
      isLoggedIn: true,
      uid: 'owner-120403',
      email,
      photoURL: '',
      traderName,
      role,
      avatarSeed: 'owner-120403',
      connectedExchanges: ['BINANCE', 'BITGET'],
      riskPreference: 'CONVEX ASYMMETRIC',
    });
  };

  const handleOwnerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsOwnerAuth(true);

    const cleanPw = loginPassword.trim();

    try {
      const res = await fetch('/api/auth/owner-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: cleanPw,
        }),
      });

      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        if (!res.ok || !data?.success || !data?.token) {
          setErrorMsg(data?.error || 'Password salah. Akses ditolak.');
          return;
        }
        completeOwnerLogin(
          data.token,
          data.user?.traderName || 'GHALI',
          data.user?.email || 'ghalcrypto@gmail.com',
          data.user?.role || 'Terminal Owner'
        );
        return;
      }

      // If hosting returned non-JSON (e.g. static SPA fallback), verify via SHA-256
      const pwHash = await sha256Hex(cleanPw);
      if (pwHash === OWNER_PW_SHA256) {
        completeOwnerLogin(`static.${OWNER_PW_SHA256.slice(0, 16)}`);
        return;
      }
      setErrorMsg('Password salah. Akses ditolak.');
    } catch {
      try {
        const pwHash = await sha256Hex(cleanPw);
        if (pwHash === OWNER_PW_SHA256) {
          completeOwnerLogin(`static.${OWNER_PW_SHA256.slice(0, 16)}`);
          return;
        }
        setErrorMsg('Password salah. Akses ditolak.');
      } catch {
        setErrorMsg('Gagal memverifikasi password akses.');
      }
    } finally {
      setIsOwnerAuth(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#04060a] overflow-y-auto font-mono text-slate-100">
      {/* Ambient Radial Backdrop */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#111c33] via-[#06080e] to-[#030407] pointer-events-none" />
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative min-h-full w-full flex items-center justify-center p-4 py-8 z-10">
        {/* Minimalist Private Access Gate */}
        <div className="w-full max-w-sm bg-[#080c14] border border-[#1d2b45] rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-col items-center justify-center gap-3 text-center">
            <Compass className="w-8 h-8 text-amber-400" />
            <h1 className="font-display text-xl sm:text-2xl font-bold tracking-[0.22em] bg-gradient-to-r from-amber-100 via-amber-300 to-amber-100 bg-clip-text text-transparent">
              GHALI ON CHAIN
            </h1>
            <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-400">
              <Lock className="w-3.5 h-3.5 text-amber-400/80" />
              <span>Akses Privat Terminal</span>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-950/60 border border-red-700/70 text-red-200 rounded-xl text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Password-Only Gate Form */}
          <form onSubmit={handleOwnerLogin} className="space-y-4">
            <div className="space-y-1.5">
              <div>
                <label
                  htmlFor="owner-password"
                  className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400"
                >
                  Password Akses
                </label>
              </div>
              <div className="relative">
                <input
                  id="owner-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  autoFocus
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Masukkan Password"
                  className="w-full select-text bg-[#0d1322] border border-[#23324f] focus:border-amber-400/70 rounded-xl pl-3.5 pr-10 py-3 text-sm text-slate-100 placeholder-slate-600 outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                  aria-label={showPassword ? 'Sembunyikan Password' : 'Lihat Password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isOwnerAuth || !loginPassword.trim()}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 disabled:opacity-50 text-black font-bold text-xs uppercase tracking-widest py-3 rounded-xl transition-all cursor-pointer shadow-lg shadow-amber-500/15"
            >
              {isOwnerAuth ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <span>Masuk Terminal</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
