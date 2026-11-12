import React from 'react';
import {
  Volume2,
  VolumeX,
  User,
  LogOut,
  Sliders,
  BellRing,
  Globe,
  Key,
} from 'lucide-react';
import { sound } from '../audio/soundEngine';
import { UserSession } from '../types/news';
import { TradingViewTickerTape } from './TradingViewWidgets';

export type TerminalViewMode =
  | 'macro_terminal'
  | 'impact_matrix'
  | 'high_impact'
  | 'monolith'
  | 'multichart'
  | 'telemetry'
  | 'narratives'
  | 'bitcoin_cycle'
  | 'liquidity_movers';

interface HeaderTerminalProps {
  viewMode: TerminalViewMode;
  onChangeViewMode: (mode: TerminalViewMode) => void;
  onOpenApiKeys: () => void;
  onOpenRadar: () => void;
  onOpenExchangeSentiment: () => void;
  onOpenTopMovers: () => void;
  onOpenWhale: () => void;
  onOpenAlerts: () => void;
  onOpenAuth: () => void;
  onOpenTA: () => void;
  session: UserSession;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const HeaderTerminal: React.FC<HeaderTerminalProps> = ({
  viewMode,
  onChangeViewMode,
  onOpenApiKeys,
  onOpenRadar,
  onOpenExchangeSentiment,
  onOpenTopMovers,
  onOpenWhale,
  onOpenAlerts,
  onOpenAuth,
  onOpenTA,
  session,
  soundEnabled,
  onToggleSound,
}) => {
  return (
    <header className="absolute top-0 left-0 right-0 z-20 pointer-events-none p-2 sm:p-2.5 bg-gradient-to-b from-[#06080d]/95 via-[#06080d]/85 to-transparent">
      <div className="max-w-[1780px] mx-auto flex items-center justify-between gap-2">
        {/* Left: Branding Logo Badge (GHALI TERMINAL) */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="flex items-center gap-2.5 bg-[#0c1220]/90 backdrop-blur-md border border-amber-500/30 px-3 py-1.5 rounded-lg shadow-lg group relative overflow-hidden">
            <div className="relative w-5 h-5 flex items-center justify-center shrink-0">
              <span className="absolute inset-0 rounded-full border border-amber-400/40 animate-spin-slow" />
              <Globe className="w-4 h-4 text-amber-400 shrink-0 animate-pulse relative z-10" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-xs sm:text-sm tracking-wider text-amber-300">
                GHALI TERMINAL
              </span>
              <span className="text-[10px] font-mono uppercase bg-[#18263e] text-slate-300 px-1.5 py-0.2 rounded border border-[#2b3f66] font-bold">
                PRO INTEL
              </span>
            </div>
          </div>
        </div>

        {/* Center: Live TradingView Ticker Tape */}
        <div className="hidden xl:flex items-center flex-1 max-w-xl mx-2 pointer-events-auto overflow-hidden rounded border border-[#1b273e] bg-[#070a12]/80">
          <TradingViewTickerTape />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 pointer-events-auto flex-wrap justify-end">
          {/* API Key Settings Button */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenApiKeys();
            }}
            className="flex items-center gap-1.5 bg-[#0c1220] hover:bg-[#162138] border border-[#233454] text-amber-300 hover:text-white px-2.5 py-1.5 rounded text-xs font-mono font-bold transition-colors shadow-md cursor-pointer"
            title="Konfigurasi API Keys Sumber Berita"
          >
            <Key className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">API KEYS</span>
          </button>

          {/* Price Alert Button */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenAlerts();
            }}
            className="flex items-center gap-1.5 bg-[#0c1220] hover:bg-[#162138] border border-[#233454] hover:border-red-400/50 text-slate-200 px-2.5 py-1.5 rounded text-xs font-mono font-medium transition-colors shadow-md cursor-pointer"
            title="Pusat Alert & Notifikasi"
          >
            <BellRing className="w-3.5 h-3.5 text-red-400" />
            <span className="hidden sm:inline">ALERTS</span>
          </button>

          {/* Technical Analysis Button */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenTA();
            }}
            className="flex items-center gap-1.5 bg-[#0c1220] hover:bg-[#162138] border border-[#233454] hover:border-amber-400/50 text-slate-200 px-2.5 py-1.5 rounded text-xs font-mono font-medium transition-colors shadow-md cursor-pointer"
            title="Buka Suite Teknikal Analisis"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">TEKNIKAL</span>
          </button>

          {/* Audio toggle */}
          <button
            onClick={() => {
              sound.playClick();
              onToggleSound();
            }}
            title={soundEnabled ? 'Mute Audio' : 'Enable Audio'}
            className="flex items-center bg-[#0c1220] hover:bg-[#162138] border border-[#233454] text-slate-300 hover:text-white p-1.5 rounded text-xs font-mono transition-colors shadow-md cursor-pointer"
          >
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-slate-500" />
            )}
          </button>

          {/* User Account */}
          {session.isLoggedIn ? (
            <button
              onClick={() => {
                sound.playClick();
                onOpenAuth();
              }}
              className="flex items-center gap-1.5 bg-[#141d2e] hover:bg-[#1c2940] border border-[#2a3c5e] text-slate-200 px-2.5 py-1 rounded text-xs font-mono transition-colors shadow-md cursor-pointer"
            >
              <div className="w-4 h-4 rounded-full bg-amber-500 text-black font-bold flex items-center justify-center text-[10px]">
                {session.traderName.slice(0, 1)}
              </div>
              <span className="font-semibold text-amber-300 truncate max-w-[80px] sm:max-w-[120px]">
                {session.traderName}
              </span>
              <LogOut className="w-3 h-3 text-slate-400 ml-1" />
            </button>
          ) : (
            <button
              onClick={() => {
                sound.playClick();
                onOpenAuth();
              }}
              className="flex items-center gap-1.5 bg-[#172236] hover:bg-[#20304c] border border-amber-500/40 text-amber-300 hover:text-white px-2.5 py-1.5 rounded text-xs font-mono font-bold transition-colors shadow-md cursor-pointer"
            >
              <User className="w-3.5 h-3.5 text-amber-400" />
              <span>MASUK</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
