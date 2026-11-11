import React, { useState, useRef, useEffect } from 'react';
import { Search, Plus, Check } from 'lucide-react';
import { CRYPTO_50_COINS } from '../types/crypto';
import { sound } from '../audio/soundEngine';

interface CoinSearchInputProps {
  value: string; // e.g. 'BTCUSDT'
  onChange: (symbol: string) => void;
}

export const CoinSearchInput: React.FC<CoinSearchInputProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const cleanVal = (raw: string) => {
    let clean = raw.trim().toUpperCase().replace('/', '');
    if (clean && !clean.endsWith('USDT') && !clean.endsWith('USD') && !clean.endsWith('PERP')) {
      clean += 'USDT';
    }
    return clean;
  };

  const handleSelect = (sym: string) => {
    sound.playClick(1300);
    const formatted = cleanVal(sym);
    onChange(formatted);
    setIsOpen(false);
    setQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (query.trim()) {
        handleSelect(query);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const filteredCoins = CRYPTO_50_COINS.filter((c) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      c.symbol.toLowerCase().includes(q) ||
      c.pair.toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q)
    );
  });

  const formattedQuery = query.trim() ? cleanVal(query) : '';
  const isExactMatch = CRYPTO_50_COINS.some(
    (c) => c.pair === formattedQuery || c.symbol === query.trim().toUpperCase()
  );

  return (
    <div ref={containerRef} className="relative inline-block text-left z-30">
      <div className="flex items-center bg-[#151c2d] border border-[#23314d] hover:border-amber-400 rounded px-2 py-0.5 transition-colors cursor-pointer">
        <Search className="w-3 h-3 text-amber-400 shrink-0 mr-1.5" />
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            setIsOpen((prev) => !prev);
            setQuery('');
          }}
          className="text-xs font-bold font-mono text-slate-100 hover:text-amber-300 transition-colors flex items-center gap-1 outline-none cursor-pointer"
        >
          <span>{value}</span>
        </button>
      </div>

      {isOpen && (
        <div className="absolute left-0 top-full mt-1 w-72 bg-[#0d1322] border border-[#23314d] rounded-lg shadow-2xl z-50 p-2.5 font-mono text-xs max-h-80 flex flex-col space-y-2">
          {/* Input field inside popup */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Cari / Ketik Koin Kustom (misal: TIA, PEPE, SUI)..."
              className="w-full bg-[#141b2c] border border-[#212d46] focus:border-amber-400 rounded pl-8 pr-2.5 py-1.5 text-xs font-mono text-slate-100 placeholder:text-slate-500 outline-none"
            />
          </div>

          {/* Custom user typed coin option if not exact match */}
          {query.trim() && !isExactMatch && (
            <button
              type="button"
              onClick={() => handleSelect(query)}
              className="flex items-center gap-2 p-2 rounded bg-amber-500/15 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-bold text-left cursor-pointer transition-colors shrink-0"
            >
              <Plus className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Gunakan Koin Kustom "{formattedQuery}"</span>
            </button>
          )}

          {/* Preset list */}
          <div className="flex-1 overflow-y-auto space-y-1 pr-1">
            <div className="text-[10px] text-slate-500 uppercase tracking-wider px-1 mb-1">
              {query ? 'Hasil Pencarian' : 'Koin & Token Terkemuka (100+)'}:
            </div>

            {filteredCoins.length === 0 && !query.trim() && (
              <div className="text-[11px] text-slate-500 p-2 text-center">Tidak ditemukan.</div>
            )}

            {filteredCoins.map((c) => {
              const isSelected = value === c.pair || value === c.symbol;
              return (
                <button
                  key={c.pair}
                  type="button"
                  onClick={() => handleSelect(c.pair)}
                  className={`w-full flex items-center justify-between p-1.5 rounded text-left text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                      : 'hover:bg-[#162035] text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-100">{c.symbol}</span>
                    <span className="text-[10px] text-slate-400 font-normal truncate max-w-[100px]">
                      {c.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] px-1 py-0.2 rounded bg-[#182338] text-slate-400 border border-[#253452]">
                      {c.category}
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
