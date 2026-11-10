import React, { useState } from 'react';
import {
  X,
  User,
  ShieldCheck,
  KeyRound,
  LogOut,
  CheckCircle2,
  Lock,
  ArrowRight,
  Server,
} from 'lucide-react';
import { UserSession } from '../types/news';
import { sound } from '../audio/soundEngine';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: UserSession;
  onLogin: (session: UserSession) => void;
  onLogout: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  session,
  onLogin,
  onLogout,
}) => {
  const [handle, setHandle] = useState(session.traderName || 'Ghal_Contrarian_Whale');
  const [role, setRole] = useState(session.role || 'Head of Macro Derivatives');
  const [connectedBinance, setConnectedBinance] = useState(true);
  const [connectedBitget, setConnectedBitget] = useState(true);
  const [riskPref, setRiskPref] = useState<'CONVEX ASYMMETRIC' | 'DEEP VALUE' | 'MOMENTUM SQUEEZE'>(
    session.riskPreference || 'CONVEX ASYMMETRIC'
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick(1500);

    const connected: ('BINANCE' | 'BITGET')[] = [];
    if (connectedBinance) connected.push('BINANCE');
    if (connectedBitget) connected.push('BITGET');

    const newSession: UserSession = {
      isLoggedIn: true,
      traderName: handle.trim() || 'Trader_01',
      role,
      avatarSeed: handle.toLowerCase(),
      connectedExchanges: connected,
      riskPreference: riskPref,
    };

    onLogin(newSession);
    onClose();
  };

  const handleQuickDemo = () => {
    sound.playSonarPing();
    const demoSession: UserSession = {
      isLoggedIn: true,
      traderName: 'Institutional_Macro_Desk',
      role: 'Chief Risk Officer',
      avatarSeed: 'macro_lead',
      connectedExchanges: ['BINANCE', 'BITGET'],
      riskPreference: 'CONVEX ASYMMETRIC',
    };
    onLogin(demoSession);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-none">
      <div className="bg-[#0b0f18] border border-[#23314d] rounded-xl w-full max-w-md max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#1c273e] bg-[#0e1422]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded bg-amber-500/10 border border-amber-500/30">
              <KeyRound className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h2 className="text-sm font-mono font-bold tracking-wider text-slate-100">
                {session.isLoggedIn ? 'PROFIL & STATUS TRADER' : 'MASUK TERMINAL (AUTHENTICATION)'}
              </h2>
              <p className="text-[11px] font-mono text-slate-400">
                {session.isLoggedIn
                  ? 'Sesi aktif • Kunci API Binance & Bitget Terhubung'
                  : 'Masuk dengan kredensial desk institusional atau demo'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1 text-slate-400 hover:text-white rounded border border-[#25324e] hover:bg-[#1a2336] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {session.isLoggedIn ? (
            /* ACTIVE SESSION VIEW */
            <div className="space-y-4">
              <div className="bg-[#0e1422] border border-[#1f2b42] rounded-lg p-4 flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center font-mono font-bold text-lg text-black shadow-md">
                  {session.traderName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-mono font-bold text-sm text-slate-100">
                      {session.traderName}
                    </h3>
                    <span className="text-[9px] font-mono uppercase bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-500/40">
                      ONLINE
                    </span>
                  </div>
                  <p className="text-xs font-mono text-slate-400 mt-0.5">{session.role}</p>
                </div>
              </div>

              {/* Status exchanges */}
              <div className="bg-[#0e1422] border border-[#1f2b42] rounded-lg p-3 space-y-2 text-xs font-mono">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                  Status Koneksi Exchange API:
                </span>
                <div className="flex items-center justify-between p-2 rounded bg-[#121826] border border-[#1d273d]">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#f3ba2f]" />
                    <span className="text-slate-200 font-bold">BINANCE FUTURES</span>
                  </div>
                  <span className="text-emerald-400 font-semibold text-[11px] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    TERHUBUNG
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-[#121826] border border-[#1d273d]">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00f0ff]" />
                    <span className="text-slate-200 font-bold">BITGET CONTRACTS</span>
                  </div>
                  <span className="text-emerald-400 font-semibold text-[11px] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    TERHUBUNG
                  </span>
                </div>
              </div>

              {/* Keluar (Logout) button */}
              <div className="pt-2">
                <button
                  onClick={() => {
                    sound.playClick();
                    onLogout();
                    onClose();
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-red-950/40 hover:bg-red-900/60 border border-red-700/60 text-red-300 font-mono font-bold text-xs py-2.5 rounded transition-colors cursor-pointer shadow-md"
                >
                  <LogOut className="w-4 h-4 text-red-400" />
                  <span>KELUAR DARI AKUN (LOGOUT)</span>
                </button>
              </div>
            </div>
          ) : (
            /* LOGIN FORM */
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-mono text-slate-300 uppercase mb-1">
                  Nama Trader / Alias Desk
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    placeholder="e.g. Ghal_Crypto_Desk"
                    className="w-full bg-[#080c14] border border-[#212d45] focus:border-amber-400 rounded pl-8 pr-3 py-2 text-xs font-mono text-slate-100 placeholder:text-slate-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-slate-300 uppercase mb-1">
                  Peran / Mandat Trading
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-[#080c14] border border-[#212d45] focus:border-amber-400 rounded px-3 py-2 text-xs font-mono text-slate-100 outline-none cursor-pointer"
                >
                  <option value="Head of Macro Derivatives">Head of Macro Derivatives</option>
                  <option value="Systemic Contrarian Arbitrageur">Systemic Contrarian Arbitrageur</option>
                  <option value="Asymmetric Convexity Trader">Asymmetric Convexity Trader</option>
                  <option value="Prop Desk Execution Lead">Prop Desk Execution Lead</option>
                </select>
              </div>

              {/* Exchange API connection toggle */}
              <div className="bg-[#0e1422] border border-[#1d2940] rounded p-3 space-y-2">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold block">
                  Sambungkan Modul Exchange:
                </span>
                <label className="flex items-center justify-between text-xs font-mono text-slate-300 cursor-pointer">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#f3ba2f]" />
                    Binance Data & Trading API
                  </span>
                  <input
                    type="checkbox"
                    checked={connectedBinance}
                    onChange={(e) => setConnectedBinance(e.target.checked)}
                    className="accent-amber-500 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between text-xs font-mono text-slate-300 cursor-pointer">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#00f0ff]" />
                    Bitget Contract API
                  </span>
                  <input
                    type="checkbox"
                    checked={connectedBitget}
                    onChange={(e) => setConnectedBitget(e.target.checked)}
                    className="accent-cyan-500 cursor-pointer"
                  />
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-mono font-bold text-xs py-2.5 rounded transition-all cursor-pointer shadow-md"
                >
                  <Lock className="w-3.5 h-3.5 text-black" />
                  <span>MASUK KE TERMINAL</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={handleQuickDemo}
                  className="w-full flex items-center justify-center gap-1.5 bg-[#121929] hover:bg-[#1a253a] border border-[#1e2a42] text-slate-300 font-mono text-xs py-2 rounded transition-colors cursor-pointer"
                >
                  <Server className="w-3.5 h-3.5 text-cyan-400" />
                  <span>MASUK CEPAT SEBAGAI DEMO TRADER</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
