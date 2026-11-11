import React, { useState } from 'react';
import {
  Lock,
  KeyRound,
  ShieldCheck,
  Compass,
  AlertCircle,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { UserSession } from '../types/news';
import { sound } from '../audio/soundEngine';
import { WelcomeSplash } from './WelcomeSplash';

interface LoginGateProps {
  onLoginSuccess: (session: UserSession) => void;
}

export const LoginGate: React.FC<LoginGateProps> = ({ onLoginSuccess }) => {
  const [showWelcomeAnimation, setShowWelcomeAnimation] = useState(true);
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handlePinAccess = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playSonarPing();
    setErrorMsg(null);
    setIsAuthenticating(true);

    setTimeout(() => {
      const cleanPin = pinInput.trim();
      if (cleanPin === '123456' || cleanPin === '') {
        const session: UserSession = {
          isLoggedIn: true,
          traderName: 'Ghali Trader',
          role: 'Head of Global Macro Strategy',
          avatarSeed: 'ghali_terminal_user',
          connectedExchanges: ['BINANCE', 'BITGET'],
          riskPreference: 'CONVEX ASYMMETRIC',
        };
        sound.playClick(1500);
        onLoginSuccess(session);
      } else {
        sound.playClick(300);
        setIsAuthenticating(false);
        setErrorMsg('KODE AKSES SALAH: Ketik 123456 untuk membuka Ghali Terminal.');
      }
    }, 300);
  };

  const handleQuickPass = () => {
    sound.playSonarPing();
    setPinInput('123456');
    const session: UserSession = {
      isLoggedIn: true,
      traderName: 'Ghali Trader',
      role: 'Head of Global Macro Strategy',
      avatarSeed: 'ghali_terminal_user',
      connectedExchanges: ['BINANCE', 'BITGET'],
      riskPreference: 'CONVEX ASYMMETRIC',
    };
    sound.playClick(1500);
    onLoginSuccess(session);
  };

  if (showWelcomeAnimation) {
    return <WelcomeSplash onComplete={() => setShowWelcomeAnimation(false)} />;
  }

  return (
    <div className="fixed inset-0 z-50 w-screen h-screen bg-[#04060a] flex items-center justify-center p-4 overflow-y-auto font-mono text-slate-100 select-none">
      {/* Background ambient radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0f192b] via-[#06080e] to-[#030407] pointer-events-none" />
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Main Login Clearance Card */}
      <div className="relative w-full max-w-md bg-[#080c14]/90 backdrop-blur-xl border border-[#1d2b45] rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 z-10 my-auto">
        {/* Top Header Badge */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-[#101726] border border-[#1e2d48] px-3.5 py-1 rounded-full text-xs text-amber-400 mb-1">
            <Lock className="w-3.5 h-3.5" />
            <span>SECURE ACCESS // GHALI TERMINAL</span>
          </div>

          <div className="flex items-center justify-center gap-2.5">
            <Compass className="w-8 h-8 text-amber-400 animate-pulse" />
            <h1 className="text-2xl sm:text-3xl font-black tracking-wider text-white">
              GHALI TERMINAL
            </h1>
          </div>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            Ketik Kode Akses PIN <strong className="text-amber-300">123456</strong> untuk membuka terminal.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-950/50 border border-red-800 text-red-300 rounded-xl text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* PIN LOGIN FORM */}
        <form onSubmit={handlePinAccess} className="space-y-4">
          <div>
            <label className="block text-[11px] text-slate-300 uppercase mb-1.5 font-bold">
              KODE AKSES PIN (KODE: 123456)
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                autoFocus
                required
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                placeholder="Ketik 123456"
                className="w-full bg-[#0b111e] border border-[#21304d] focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 rounded-xl pl-10 pr-4 py-3 text-slate-100 placeholder:text-slate-600 outline-none text-sm font-bold tracking-widest transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isAuthenticating}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 hover:from-amber-500 hover:to-amber-300 text-black font-extrabold text-xs sm:text-sm py-3 rounded-xl transition-all cursor-pointer shadow-lg shadow-amber-500/15 tracking-wider"
          >
            {isAuthenticating ? (
              <span>MEMVERIFIKASI PIN...</span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-black" />
                <span>MASUK TERMINAL (PIN: 123456)</span>
                <ArrowRight className="w-4 h-4 text-black" />
              </>
            )}
          </button>
        </form>

        {/* Quick Pass Access Button */}
        <div className="pt-2 border-t border-[#16233a]">
          <button
            type="button"
            onClick={handleQuickPass}
            className="w-full flex items-center justify-center gap-2 bg-[#0e1524] hover:bg-[#162035] text-slate-200 border border-[#1f2d48] hover:border-amber-400/50 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>MASUK LANGSUNG SEKARANG (PIN: 123456)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
