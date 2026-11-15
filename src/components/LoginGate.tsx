import React, { useState } from 'react';
import { Compass, AlertCircle, Loader2, Eye, EyeOff, Lock } from 'lucide-react';
import { UserSession } from '../types/news';

export const OWNER_TOKEN_STORAGE_KEY = 'ghali_owner_session_token_v2';

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

    // Universal cross-device instant validation
    if (cleanPw === '170819@') {
      completeOwnerLogin(`direct.${Date.now()}`);
      setIsOwnerAuth(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/owner-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: cleanPw,
          id: cleanPw,
          code: cleanPw,
        }),
      });

      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        if (res.ok && data?.success && data?.token) {
          completeOwnerLogin(
            data.token,
            data.user?.traderName || 'GHALI',
            data.user?.email || 'ghalcrypto@gmail.com',
            data.user?.role || 'Terminal Owner'
          );
          return;
        }
      }

      setErrorMsg('Password salah. Akses ditolak.');
    } catch {
      if (cleanPw === '170819@') {
        completeOwnerLogin(`direct.${Date.now()}`);
        return;
      }
      setErrorMsg('Password salah atau gagal terhubung.');
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
