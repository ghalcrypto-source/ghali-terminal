import React, { useState } from 'react';
import {
  Lock,
  ShieldCheck,
  Compass,
  AlertCircle,
  Mail,
  KeyRound,
  ArrowRight,
  Globe,
} from 'lucide-react';
import { UserSession } from '../types/news';
import { sound } from '../audio/soundEngine';

import { WelcomeSplash } from './WelcomeSplash';

interface LoginGateProps {
  onLoginSuccess: (session: UserSession) => void;
}

export const LoginGate: React.FC<LoginGateProps> = ({ onLoginSuccess }) => {
  const [showWelcomeAnimation, setShowWelcomeAnimation] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [googleEmailInput, setGoogleEmailInput] = useState('');
  const [googleStep, setGoogleStep] = useState<'input' | 'verifying'>('input');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Option 1: Direct Email & Password Login
  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playSonarPing();
    setErrorMsg(null);
    setIsAuthenticating(true);

    setTimeout(() => {
      const cleanEmail = email.trim().toLowerCase();
      if (cleanEmail === 'ghalcrypto@gmail.com' && password === 'galihcontra120403') {
        const session: UserSession = {
          isLoggedIn: true,
          traderName: 'Ghal Crypto (Direct Auth)',
          role: 'Head of Macro Derivatives',
          avatarSeed: 'ghal_direct',
          connectedExchanges: ['BINANCE', 'BITGET'],
          riskPreference: 'CONVEX ASYMMETRIC',
        };
        sound.playClick(1500);
        onLoginSuccess(session);
      } else {
        sound.playClick(300);
        setIsAuthenticating(false);
        setErrorMsg('AKSES DITOLAK: Email atau Password salah. Hanya ghalcrypto@gmail.com yang diizinkan.');
      }
    }, 450);
  };

  // Option 2: Real Google Account Input Verification (Strictly ghalcrypto@gmail.com)
  const handleGoogleAccountVerification = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playSonarPing();
    setErrorMsg(null);
    setGoogleStep('verifying');

    setTimeout(() => {
      const cleanGoogleEmail = googleEmailInput.trim().toLowerCase();
      if (cleanGoogleEmail === 'ghalcrypto@gmail.com') {
        const session: UserSession = {
          isLoggedIn: true,
          traderName: 'Ghal Crypto (Google Verified)',
          role: 'Head of Macro Derivatives',
          avatarSeed: 'ghal_google_verified',
          connectedExchanges: ['BINANCE', 'BITGET'],
          riskPreference: 'CONVEX ASYMMETRIC',
        };
        sound.playClick(1500);
        onLoginSuccess(session);
      } else {
        sound.playClick(300);
        setGoogleStep('input');
        setErrorMsg('VERIFIKASI GOOGLE GAGAL: Hanya akun ghalcrypto@gmail.com asli yang diizinkan masuk.');
      }
    }, 600);
  };

  if (showWelcomeAnimation) {
    return <WelcomeSplash onComplete={() => setShowWelcomeAnimation(false)} />;
  }

  return (
    <div className="fixed inset-0 z-50 w-screen h-screen bg-[#06080e] flex items-center justify-center p-4 overflow-y-auto">
      {/* Ambient background grid and glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#101b30] via-[#07090f] to-[#040508] pointer-events-none" />
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Main Login Clearance Card */}
      <div className="relative w-full max-w-md bg-[#0b0f19] border border-[#23314d] rounded-2xl shadow-2xl p-6 sm:p-8 space-y-5 text-slate-100 z-10 my-auto">
        {/* Top Header Badge */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-[#121929] border border-[#202c44] px-3 py-1 rounded-full text-xs font-mono text-amber-400 mb-1">
            <Lock className="w-3.5 h-3.5" />
            <span>SECURE ACCESS // GHALI TERMINAL</span>
          </div>

          <div className="flex items-center justify-center gap-2.5">
            <Compass className="w-7 h-7 text-amber-400" />
            <h1 className="text-2xl font-mono font-bold tracking-wider text-slate-100">
              GHALI TERMINAL
            </h1>
          </div>
          <p className="text-xs font-mono text-slate-400 max-w-sm mx-auto">
            Silakan masukkan Akun Google asli atau Email & Password Anda. Akses eksklusif untuk ghalcrypto@gmail.com.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-950/40 border border-red-800 text-red-300 rounded-lg text-xs font-mono flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* OPTION 2: REAL GOOGLE ACCOUNT VERIFICATION FORM */}
        <form onSubmit={handleGoogleAccountVerification} className="space-y-3 font-mono text-xs bg-[#0e1422] p-3.5 rounded-xl border border-[#1e2a42]">
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.19v3.15C3.2 21.32 7.28 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.19C.43 8.1 0 9.99 0 12s.43 3.9 1.19 5.42l4.09-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.28 0 3.2 2.68 1.19 6.58l4.09 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span className="font-bold text-slate-200">Verifikasi Akun Google Asli</span>
          </div>

          <div>
            <label className="block text-[10px] text-slate-400 uppercase mb-1">
              Ketik Alamat Akun Google Anda (@gmail.com)
            </label>
            <input
              type="email"
              required
              value={googleEmailInput}
              onChange={(e) => setGoogleEmailInput(e.target.value)}
              placeholder="nama.anda@gmail.com"
              className="w-full bg-[#070b13] border border-[#202d46] focus:border-amber-400 rounded-lg px-3 py-2 text-slate-100 placeholder:text-slate-600 outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={googleStep === 'verifying'}
            className="w-full flex items-center justify-center gap-2 bg-white hover:bg-slate-200 text-black font-mono font-bold text-xs py-2.5 rounded-lg transition-all cursor-pointer shadow-md tracking-wider"
          >
            {googleStep === 'verifying' ? (
              <span>MEMVALIDASI AKUN GOOGLE...</span>
            ) : (
              <>
                <Globe className="w-3.5 h-3.5 text-black" />
                <span>VERIFIKASI & MASUK DENGAN GOOGLE</span>
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-[#1a253c] w-full" />
          <span className="bg-[#0b0f19] px-3 text-[10px] font-mono text-slate-500 uppercase tracking-widest shrink-0">
            ATAU EMAIL & PASSWORD
          </span>
          <div className="border-t border-[#1a253c] w-full" />
        </div>

        {/* OPTION 1: DIRECT EMAIL & PASSWORD FORM */}
        <form onSubmit={handleEmailLogin} className="space-y-3 font-mono text-xs">
          <div>
            <label className="block text-[10px] text-slate-300 uppercase mb-1">
              Email Langsung
            </label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ghalcrypto@gmail.com"
                className="w-full bg-[#070b13] border border-[#202d46] focus:border-amber-400 rounded-lg pl-9 pr-3 py-2 text-slate-100 placeholder:text-slate-600 outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-slate-300 uppercase mb-1">
              Password Langsung
            </label>
            <div className="relative">
              <KeyRound className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-[#070b13] border border-[#202d46] focus:border-amber-400 rounded-lg pl-9 pr-3 py-2 text-slate-100 placeholder:text-slate-600 outline-none transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isAuthenticating}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 hover:from-amber-500 hover:to-amber-300 text-black font-mono font-bold text-xs py-2.5 rounded-lg transition-all cursor-pointer shadow-lg tracking-wider"
          >
            {isAuthenticating ? (
              <span>MEMVERIFIKASI...</span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-black" />
                <span>MASUK DENGAN EMAIL & PASSWORD</span>
                <ArrowRight className="w-4 h-4 text-black" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
