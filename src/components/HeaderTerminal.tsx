import React from 'react';
import {
  Volume2,
  VolumeX,
  Compass,
  Radar,
  Cpu,
  LayoutGrid,
  Percent,
  Box,
  SplitSquareVertical,
  Newspaper,
  TrendingUp,
  UserCheck,
  User,
  LogOut,
  Sliders,
  Crown,
  BellRing,
} from 'lucide-react';
import { sound } from '../audio/soundEngine';
import { UserSession } from '../types/news';

export type TerminalViewMode = 'monolith' | 'multichart' | 'split';

interface HeaderTerminalProps {
  viewMode: TerminalViewMode;
  onChangeViewMode: (mode: TerminalViewMode) => void;
  onOpenInverter: () => void;
  onOpenRadar: () => void;
  onOpenExchangeSentiment: () => void;
  onOpenNews: () => void;
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
  onOpenInverter,
  onOpenRadar,
  onOpenExchangeSentiment,
  onOpenNews,
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
    <header className="absolute top-0 left-0 right-0 z-20 pointer-events-none p-2 sm:p-2.5 bg-gradient-to-b from-[#07090e]/95 via-[#07090e]/80 to-transparent">
      <div className="max-w-[1780px] mx-auto flex items-center justify-between gap-2">
        {/* Left: Branding & View Mode Switcher */}
        <div className="flex items-center gap-2 pointer-events-auto flex-wrap">
          <div className="flex items-center gap-2 bg-[#0d121c] border border-[#232f48] px-2.5 py-1.5 rounded shadow-lg">
            <Compass className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-xs tracking-wider text-slate-100 hidden sm:inline">
                GHALI TERMINAL
              </span>
              <span className="text-[10px] font-mono uppercase bg-[#1a2538] text-amber-300 px-1.5 py-0.2 rounded border border-[#2d3f5e]">
                v4.8
              </span>
            </div>
          </div>

          {/* Primary View Switcher Tabs */}
          <div className="flex items-center bg-[#0d121c] border border-[#232f48] p-0.5 rounded shadow-md">
            <button
              onClick={() => {
                sound.playClick();
                onChangeViewMode('monolith');
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-semibold transition-colors cursor-pointer ${
                viewMode === 'monolith'
                  ? 'bg-amber-500 text-black shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span className="hidden md:inline">3D MONOLITH</span>
              <span className="md:hidden">3D</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onChangeViewMode('multichart');
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-semibold transition-colors cursor-pointer ${
                viewMode === 'multichart'
                  ? 'bg-amber-500 text-black shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>MULTICHART</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onChangeViewMode('split');
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-semibold transition-colors cursor-pointer ${
                viewMode === 'split'
                  ? 'bg-amber-500 text-black shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Split View: 3D Monolith + Multicharts"
            >
              <SplitSquareVertical className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">SPLIT VIEW</span>
            </button>
          </div>
        </div>

        {/* Center: Live Crowdedness Ticker (Desktop) */}
        <div className="hidden 2xl:flex items-center gap-2 bg-[#0c101a] border border-[#1e293b] px-3 py-1 rounded text-[11px] font-mono text-slate-300 pointer-events-auto">
          <span className="text-slate-500 uppercase tracking-widest text-[9px]">EXCHANGE FEED:</span>
          <span className="text-[#f3ba2f] font-semibold">BINANCE BTC [L/S 2.82]</span>
          <span className="text-slate-600">•</span>
          <span className="text-[#00f0ff] font-semibold">BITGET ETH [+0.008%]</span>
          <span className="text-slate-600">•</span>
          <span className="text-red-400 font-semibold">SOL [77% LONG CROWDED]</span>
          <span className="text-slate-600">•</span>
          <span className="text-emerald-400 font-semibold">DOGE [-0.012% SQUEEZE RISK]</span>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 pointer-events-auto flex-wrap justify-end">
          {/* News Button */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenNews();
            }}
            className="flex items-center gap-1.5 bg-[#0d121c] hover:bg-[#151d2d] border border-[#232f48] hover:border-blue-400/50 text-slate-200 px-2.5 py-1.5 rounded text-xs font-mono font-medium transition-colors shadow-md cursor-pointer"
          >
            <Newspaper className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">BERITA (NEWS)</span>
          </button>

          {/* Top Movers Button */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenTopMovers();
            }}
            className="flex items-center gap-1.5 bg-[#0d121c] hover:bg-[#151d2d] border border-[#232f48] hover:border-emerald-400/50 text-slate-200 px-2.5 py-1.5 rounded text-xs font-mono font-medium transition-colors shadow-md cursor-pointer"
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">TOP MOVERS</span>
          </button>

          {/* KOL & Whale Intelligence Desk Button */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenWhale();
            }}
            className="flex items-center gap-1.5 bg-[#0d121c] hover:bg-[#151d2d] border border-[#232f48] hover:border-amber-400/50 text-slate-200 px-2.5 py-1.5 rounded text-xs font-mono font-medium transition-colors shadow-md cursor-pointer"
            title="Tempat analisa para KOL & Smart Money Whales terhadap koin"
          >
            <Crown className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">KOL & WHALE</span>
          </button>

          {/* Price Alert Button */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenAlerts();
            }}
            className="flex items-center gap-1.5 bg-[#0d121c] hover:bg-[#151d2d] border border-[#232f48] hover:border-red-400/50 text-slate-200 px-2.5 py-1.5 rounded text-xs font-mono font-medium transition-colors shadow-md cursor-pointer"
            title="Pusat Alert & Notifikasi setiap koin naik atau turun $1"
          >
            <BellRing className="w-3.5 h-3.5 text-red-400 animate-bounce" />
            <span className="hidden sm:inline">ALERT $1</span>
          </button>

          {/* Funding & Long/Short Button */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenExchangeSentiment();
            }}
            className="flex items-center gap-1.5 bg-[#0d121c] hover:bg-[#151d2d] border border-[#232f48] hover:border-amber-400/50 text-slate-200 px-2.5 py-1.5 rounded text-xs font-mono font-medium transition-colors shadow-md cursor-pointer"
          >
            <Percent className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">L/S & FUNDING</span>
          </button>

          {/* Macro Radar */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenRadar();
            }}
            className="flex items-center gap-1.5 bg-[#0d121c] hover:bg-[#151d2d] border border-[#232f48] hover:border-cyan-500/50 text-slate-200 px-2.5 py-1.5 rounded text-xs font-mono font-medium transition-colors shadow-md cursor-pointer"
          >
            <Radar className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden lg:inline">RADAR</span>
          </button>
          {/* Technical Analysis Button */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenTA();
            }}
            className="flex items-center gap-1.5 bg-[#0d121c] hover:bg-[#151d2d] border border-[#232f48] hover:border-amber-400/50 text-slate-200 px-2.5 py-1.5 rounded text-xs font-mono font-medium transition-colors shadow-md cursor-pointer"
            title="Buka suite teknikal analisis (Fibonacci, EMA, StochRSI, Path, Trendline)"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">TEKNIKAL</span>
          </button>

          {/* AI Inverter */}
          <button
            onClick={() => {
              sound.playClick(1400);
              onOpenInverter();
            }}
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-mono font-bold px-3 py-1.5 rounded text-xs tracking-wider transition-all shadow-md cursor-pointer"
          >
            <Cpu className="w-3.5 h-3.5 text-black" />
            <span className="hidden sm:inline">AI INVERTER</span>
          </button>

          {/* Audio toggle */}
          <button
            onClick={() => {
              sound.playClick();
              onToggleSound();
            }}
            title={soundEnabled ? 'Mute Procedural Audio' : 'Enable Procedural Audio'}
            className="flex items-center bg-[#0d121c] hover:bg-[#151d2d] border border-[#232f48] text-slate-300 hover:text-white p-1.5 rounded text-xs font-mono transition-colors shadow-md cursor-pointer"
          >
            {soundEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-slate-500" />
            )}
          </button>

          {/* User Account: Masuk (Login) / Profile (Logout) */}
          {session.isLoggedIn ? (
            <button
              onClick={() => {
                sound.playClick();
                onOpenAuth();
              }}
              className="flex items-center gap-1.5 bg-[#141d2e] hover:bg-[#1c2940] border border-[#2a3c5e] text-slate-200 px-2.5 py-1 rounded text-xs font-mono transition-colors shadow-md cursor-pointer"
              title="Klik untuk membuka menu profil & keluar (logout)"
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
