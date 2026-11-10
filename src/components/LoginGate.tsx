import React, { useState } from 'react';
import {
  Lock,
  ShieldCheck,
  KeyRound,
  ArrowRight,
  Server,
  Zap,
  CheckCircle2,
  Compass,
  TrendingUp,
  Cpu,
  Layers,
} from 'lucide-react';
import { UserSession } from '../types/news';
import { sound } from '../audio/soundEngine';

interface LoginGateProps {
  onLoginSuccess: (session: UserSession) => void;
}

export const LoginGate: React.FC<LoginGateProps> = ({ onLoginSuccess }) => {
  const [handle, setHandle] = useState('Ghal_Crypto_Desk');
  const [passcode, setPasscode] = useState('contrarian-alpha-2026');
  const [role, setRole] = useState('Head of Macro Derivatives');
  const [binanceActive, setBinanceActive] = useState(true);
  const [bitgetActive, setBitgetActive] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playSonarPing();
    setIsAuthenticating(true);

    setTimeout(() => {
      const connected: ('BINANCE' | 'BITGET')[] = [];
      if (binanceActive) connected.push('BINANCE');
      if (bitgetActive) connected.push('BITGET');

      const session: UserSession = {
        isLoggedIn: true,
        traderName: handle.trim() || 'Trader_01',
        role,
        avatarSeed: handle.toLowerCase(),
        connectedExchanges: connected,
        riskPreference: 'CONVEX ASYMMETRIC',
      };

      sound.playClick(1500);
      onLoginSuccess(session);
    }, 450);
  };

  const handleInstantDemo = () => {
    sound.playSonarPing();
    setIsAuthenticating(true);

    setTimeout(() => {
      const demoSession: UserSession = {
        isLoggedIn: true,
        traderName: 'Institutional_Macro_Desk',
        role: 'Chief Risk Officer',
        avatarSeed: 'macro_demo',
        connectedExchanges: ['BINANCE', 'BITGET'],
        riskPreference: 'CONVEX ASYMMETRIC',
      };

      sound.playClick(1500);
      onLoginSuccess(demoSession);
    }, 400);
  };

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
      <div className="relative w-full max-w-lg bg-[#0b0f19] border border-[#23314d] rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 text-slate-100 z-10 my-auto">
        {/* Top Header Badge */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 bg-[#121929] border border-[#202c44] px-3 py-1 rounded-full text-xs font-mono text-amber-400 mb-1">
            <Lock className="w-3.5 h-3.5" />
            <span>RESTRICTED ACCESS // LEVEL 4 CLEARANCE</span>
          </div>

          <div className="flex items-center justify-center gap-2.5">
            <Compass className="w-7 h-7 text-amber-400" />
            <h1 className="text-2xl font-mono font-bold tracking-wider text-slate-100">
              GHALI TERMINAL
            </h1>
          </div>
          <p className="text-xs font-mono text-slate-400 max-w-sm mx-auto">
            Sistem analisis kontrarian, multichart 50 koin Binance & Bitget, teknikal indikator, dan pemindai sentimen AI.
          </p>
        </div>


        {/* Login Form */}
        <form onSubmit={handleCustomLogin} className="space-y-4">
          <div>
            <label className="block text-[11px] font-mono text-slate-300 uppercase mb-1">
              Trader Handle / Nama Akun
            </label>
            <input
              type="text"
              required
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="e.g. Ghal_Crypto_Desk"
              className="w-full bg-[#070b13] border border-[#202d46] focus:border-amber-400 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 placeholder:text-slate-600 outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-slate-300 uppercase mb-1">
              Desk Security Passcode
            </label>
            <div className="relative">
              <KeyRound className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter access passcode"
                className="w-full bg-[#070b13] border border-[#202d46] focus:border-amber-400 rounded-lg pl-9 pr-3 py-2 text-xs font-mono text-slate-100 placeholder:text-slate-600 outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-slate-300 uppercase mb-1">
              Mandat / Peran Trading
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-[#070b13] border border-[#202d46] focus:border-amber-400 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 outline-none cursor-pointer"
            >
              <option value="Head of Macro Derivatives">Head of Macro Derivatives</option>
              <option value="Systemic Contrarian Arbitrageur">Systemic Contrarian Arbitrageur</option>
              <option value="Asymmetric Convexity Trader">Asymmetric Convexity Trader</option>
              <option value="Prop Desk Execution Lead">Prop Desk Execution Lead</option>
            </select>
          </div>

          {/* Module switches */}
          <div className="bg-[#0e1422] border border-[#1b263d] rounded-lg p-3 space-y-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold block">
              Integrasi Modul Exchange Otomatis:
            </span>
            <div className="flex items-center justify-between text-xs font-mono">
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={binanceActive}
                  onChange={(e) => setBinanceActive(e.target.checked)}
                  className="accent-amber-500 cursor-pointer"
                />
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#f3ba2f]" />
                  Binance Spot & Futures Module
                </span>
              </label>
              <span className="text-emerald-400 text-[10px]">READY</span>
            </div>

            <div className="flex items-center justify-between text-xs font-mono">
              <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={bitgetActive}
                  onChange={(e) => setBitgetActive(e.target.checked)}
                  className="accent-cyan-500 cursor-pointer"
                />
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#00f0ff]" />
                  Bitget Contract & Swap Module
                </span>
              </label>
              <span className="text-emerald-400 text-[10px]">READY</span>
            </div>
          </div>

          {/* Primary Action Button */}
          <button
            type="submit"
            disabled={isAuthenticating}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 hover:from-amber-500 hover:to-amber-300 text-black font-mono font-bold text-xs py-3 rounded-lg transition-all cursor-pointer shadow-lg tracking-wider"
          >
            {isAuthenticating ? (
              <span className="flex items-center gap-2">
                <Cpu className="w-4 h-4 animate-spin text-black" />
                MENGOTENTIKASI AKSES TERMINAL...
              </span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-black" />
                <span>MASUK KE CONTRARIAN TERMINAL</span>
                <ArrowRight className="w-4 h-4 text-black" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Access Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-[#1a253c] w-full" />
          <span className="bg-[#0b0f19] px-3 text-[10px] font-mono text-slate-500 uppercase tracking-widest shrink-0">
            ATAU AKSES INSTAN
          </span>
          <div className="border-t border-[#1a253c] w-full" />
        </div>

        {/* 1-Click Instant Demo Access */}
        <button
          type="button"
          onClick={handleInstantDemo}
          disabled={isAuthenticating}
          className="w-full flex items-center justify-center gap-2 bg-[#121929] hover:bg-[#1a253d] border border-[#22314e] text-slate-200 font-mono text-xs py-2.5 rounded-lg transition-all cursor-pointer shadow-md"
        >
          <Zap className="w-4 h-4 text-amber-400" />
          <span>MASUK CEPAT SEBAGAI DEMO TRADER (1-KLIK)</span>
        </button>

        <div className="text-center text-[10px] font-mono text-slate-500">
          Enkripsi Sesi Klien Lokal • Zero Data Exposure • Standar Institusional
        </div>
      </div>
    </div>
  );
};
