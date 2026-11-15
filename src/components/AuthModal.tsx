import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  KeyRound,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Mail,
} from 'lucide-react';
import { UserSession } from '../types/news';
import { signInWithGoogle } from '../firebase';

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
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setIsLoading(true);
    try {
      const user = await signInWithGoogle();
      const resolvedEmail =
        user.email || user.providerData?.find((p) => p.email)?.email || '';
      onLogin({
        isLoggedIn: true,
        uid: user.uid,
        email: resolvedEmail,
        photoURL: user.photoURL || '',
        traderName:
          user.displayName ||
          (resolvedEmail ? resolvedEmail.split('@')[0] : 'Google User'),
        role: 'Verified Google Strategist',
        avatarSeed: user.uid,
        connectedExchanges: ['BINANCE', 'BITGET'],
        riskPreference: 'CONVEX ASYMMETRIC',
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Gagal melakukan autentikasi Google.');
    } finally {
      setIsLoading(false);
    }
  };

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
                {session.isLoggedIn
                  ? session.uid === 'owner-120403'
                    ? 'AKSES OWNER TERMINAL'
                    : 'AKUN GOOGLE TERVERIFIKASI'
                  : 'AUTENTIKASI AKUN GOOGLE'}
              </h2>
              <p className="text-[11px] font-mono text-slate-400">
                {session.isLoggedIn
                  ? session.uid === 'owner-120403'
                    ? 'Terverifikasi sebagai Pemilik Terminal'
                    : 'Terhubung langsung dengan server Google Identity'
                  : 'Wajib login akun Google untuk mengakses terminal'}
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
                {session.photoURL ? (
                  <img
                    src={session.photoURL}
                    alt={session.traderName}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 rounded-full border-2 border-amber-400 object-cover shadow-md"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center font-mono font-bold text-lg text-black shadow-md">
                    {session.traderName.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-mono font-bold text-sm text-slate-100 truncate">
                      {session.traderName}
                    </h3>
                    <span className="text-[9px] font-mono uppercase bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/40 shrink-0">
                      {session.uid === 'owner-120403' ? 'OWNER ACCESS' : 'GOOGLE VERIFIED'}
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
                    {session.uid === 'owner-120403' ? 'OWNER SERVER AUTH' : 'GOOGLE ACCOUNT SERVER'}
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
            <div className="space-y-4">
              {errorMsg && (
                <div className="p-3 bg-red-950/50 border border-red-800 text-red-300 rounded-lg text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="button"
                disabled={isLoading}
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-2.5 bg-white hover:bg-slate-100 text-slate-900 font-sans font-bold text-sm py-3 px-4 rounded-xl transition-all cursor-pointer shadow-lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menghubungkan Google...</span>
                  </>
                ) : (
                  <span>Masuk dengan Akun Google</span>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
