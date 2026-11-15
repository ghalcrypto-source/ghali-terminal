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
    <header className="shrink-0 z-30 h-14 bg-[#070a11]/92 border-b border-[#192234] px-4 sm:px-6">
      <div className="max-w-6xl mx-auto h-full flex items-center justify-between gap-8">
        {/* Zone 1: Refined Brand Wordmark */}
        <button
          onClick={() => {
            sound.playClick();
            onChangeViewMode('home');
          }}
          className="font-display font-bold text-sm sm:text-[15px] tracking-[0.2em] text-[#e7cc82] hover:text-[#f5e3af] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          GHALI ON CHAIN
        </button>

        {/* Zone 2: Clean Editorial 4-Item Nav */}
        <nav className="hidden md:flex items-center gap-8 h-full">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                sound.playClick();
                onChangeViewMode(item.target);
              }}
              className={`h-full flex items-center text-[13px] font-medium tracking-wide transition-colors whitespace-nowrap shrink-0 border-b-[1.5px] cursor-pointer ${
                item.active
                  ? 'border-[#d4af37] text-[#f6e8be]'
                  : 'border-transparent text-slate-400 hover:text-slate-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: Minimalist Account Trigger */}
        <div className="flex items-center shrink-0">
          {session.isLoggedIn ? (
            <button
              onClick={() => {
                sound.playClick();
                onOpenAuth();
              }}
              title={session.email || session.traderName}
              className="flex items-center gap-2 py-1.5 px-3 rounded-xl bg-[#0d1320] hover:bg-[#131b2d] border border-[#222c40] hover:border-[#d4af37]/45 text-slate-100 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[38px]"
            >
              {session.photoURL ? (
                <img
                  src={session.photoURL}
                  alt={session.traderName}
                  referrerPolicy="no-referrer"
                  className="w-5 h-5 rounded-full object-cover ring-1 ring-[#d4af37]/40"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#e7cc82] to-[#b88f28] text-[#070a11] font-bold flex items-center justify-center text-[10px]">
                  {session.traderName.slice(0, 1).toUpperCase()}
                </div>
              )}
              <span className="truncate max-w-[90px] sm:max-w-[130px] text-slate-200">
                {session.traderName}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" strokeWidth={1.6} />
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-[#e7cc82] hover:bg-[#f2da99] text-[#070a11] text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[38px]"
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
