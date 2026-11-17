import React from 'react';
import {
  X,
  ShieldCheck,
  KeyRound,
  LogOut,
  CheckCircle2,
  Mail,
  Lock,
} from 'lucide-react';
import { UserSession } from '../types/news';

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
  onLogout,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80">
      <div className="bg-[#0b0f18] border border-[#23314d] rounded-xl w-full max-w-md max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#1c273e] bg-[#0e1422]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded bg-amber-500/10 border border-amber-500/30">
              <KeyRound className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h2 className="text-sm font-mono font-bold tracking-wider text-slate-100">
                AKSES TERMINAL GHALI ON CHAIN
              </h2>
              <p className="text-[11px] font-mono text-slate-400">
                Terverifikasi dengan Kode Akses Masuk
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded border border-[#25324e] hover:bg-[#1a2336] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {session.isLoggedIn ? (
            <div className="space-y-4">
              <div className="bg-[#0e1422] border border-[#1f2b42] rounded-lg p-4 flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center font-mono font-bold text-lg text-black shadow-md">
                  {session.traderName.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-mono font-bold text-sm text-slate-100 truncate">
                      {session.traderName}
                    </h3>
                    <span className="text-[9px] font-mono uppercase bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/40 shrink-0">
                      ON-CHAIN TRADER
                    </span>
                  </div>
                  {session.email && (
                    <p className="text-xs font-mono text-amber-300/90 flex items-center gap-1.5 mt-0.5 truncate">
                      <Mail className="w-3 h-3 shrink-0" />
                      <span className="truncate">{session.email}</span>
                    </p>
                  )}
                  <p className="text-[10px] font-mono text-slate-400 mt-0.5">{session.role}</p>
                </div>
              </div>

              {/* Status Connections */}
              <div className="bg-[#0e1422] border border-[#1f2b42] rounded-lg p-3 space-y-2 text-xs font-mono">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                  Status Autentikasi &amp; Koneksi:
                </span>
                <div className="flex items-center justify-between p-2 rounded bg-[#121826] border border-[#1d273d]">
                  <span className="text-slate-200 font-bold flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    TERMINAL AUTHENTICATED
                  </span>
                  <span className="text-emerald-400 font-semibold text-[11px] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    TERVERIFIKASI
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-[#121826] border border-[#1d273d]">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#f3ba2f]" />
                    <span className="text-slate-200 font-bold">BINANCE &amp; BITGET FEED</span>
                  </div>
                  <span className="text-emerald-400 font-semibold text-[11px] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    TERHUBUNG
                  </span>
                </div>
              </div>

              {/* Logout */}
              <div className="pt-2">
                <button
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-red-950/40 hover:bg-red-900/60 border border-red-700/60 text-red-300 font-mono font-bold text-xs py-2.5 rounded transition-colors cursor-pointer shadow-md"
                >
                  <LogOut className="w-4 h-4 text-red-400" />
                  <span>KELUAR (LOGOUT)</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-[#0e1422] border border-[#1f2b42] text-center space-y-2">
              <Lock className="w-6 h-6 text-amber-400 mx-auto" />
              <p className="text-xs font-mono text-slate-300">
                Akses terkunci. Masuk menggunakan password terminal yang valid.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
