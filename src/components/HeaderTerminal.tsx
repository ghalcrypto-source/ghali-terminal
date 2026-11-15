import React from 'react';
import { User, ChevronDown } from 'lucide-react';
import { sound } from '../audio/soundEngine';
import { UserSession } from '../types/news';

export type TerminalViewMode =
  | 'home'
  | 'macro_terminal'
  | 'impact_matrix'
  | 'high_impact'
  | 'monolith'
  | 'multichart'
  | 'telemetry'
  | 'narratives'
  | 'bitcoin_cycle'
  | 'liquidity_movers'
  | 'room_chat';

interface HeaderTerminalProps {
  viewMode: TerminalViewMode;
  onChangeViewMode: (mode: TerminalViewMode) => void;
  onOpenAuth: () => void;
  session: UserSession;
}

const MARKET_MODES: TerminalViewMode[] = [
  'monolith',
  'bitcoin_cycle',
  'liquidity_movers',
  'multichart',
];

const NEWS_MODES: TerminalViewMode[] = [
  'macro_terminal',
  'high_impact',
  'impact_matrix',
  'narratives',
];

export const HeaderTerminal: React.FC<HeaderTerminalProps> = ({
  viewMode,
  onChangeViewMode,
  onOpenAuth,
  session,
}) => {
  const isHomeActive = viewMode === 'home';
  const isMarketActive = MARKET_MODES.includes(viewMode);
  const isNewsActive = NEWS_MODES.includes(viewMode);
  const isChatActive = viewMode === 'room_chat';

  const navItems: { label: string; active: boolean; target: TerminalViewMode }[] = [
    { label: 'Beranda', active: isHomeActive, target: 'home' },
    { label: 'Pasar', active: isMarketActive, target: 'bitcoin_cycle' },
    { label: 'Berita', active: isNewsActive, target: 'macro_terminal' },
    { label: 'Room Chat', active: isChatActive, target: 'room_chat' },
  ];

  return (
    <header className="shrink-0 z-30 h-13 sm:h-14 bg-[#070a11]/92 border-b border-[#162033] px-4 sm:px-6">
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between gap-8">
        {/* Zone 1: Single-element Brand Wordmark */}
        <button
          onClick={() => {
            sound.playClick();
            onChangeViewMode('home');
          }}
          className="font-display font-bold text-sm sm:text-base tracking-[0.16em] text-amber-200 hover:text-amber-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          GHALI TERMINAL
        </button>

        {/* Zone 2: Clean 4-item Primary Navigation (Desktop) */}
        <nav className="hidden md:flex items-center gap-7 h-full">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                sound.playClick();
                onChangeViewMode(item.target);
              }}
              className={`h-full flex items-center text-sm font-medium transition-colors whitespace-nowrap shrink-0 border-b-2 cursor-pointer ${
                item.active
                  ? 'border-amber-400 text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: Single Primary Account Trigger */}
        <div className="flex items-center shrink-0">
          {session.isLoggedIn ? (
            <button
              onClick={() => {
                sound.playClick();
                onOpenAuth();
              }}
              title={session.email || session.traderName}
              className="flex items-center gap-2 py-1.5 px-2.5 rounded-xl bg-[#0e1524] hover:bg-[#152036] border border-[#1f2c46] text-slate-100 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[40px]"
            >
              {session.photoURL ? (
                <img
                  src={session.photoURL}
                  alt={session.traderName}
                  referrerPolicy="no-referrer"
                  className="w-6 h-6 rounded-full object-cover"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-amber-400 text-black font-bold flex items-center justify-center text-[11px]">
                  {session.traderName.slice(0, 1).toUpperCase()}
                </div>
              )}
              <span className="truncate max-w-[90px] sm:max-w-[140px]">
                {session.traderName}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[40px]"
            >
              <User className="w-3.5 h-3.5" />
              <span>Masuk</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
