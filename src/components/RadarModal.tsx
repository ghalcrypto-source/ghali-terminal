import React, { useEffect, useState } from 'react';
import { X, Radar, ArrowUpRight, Flame, Shield, Clock, AlertCircle } from 'lucide-react';
import { RadarItem } from '../types/contrarian';
import { sound } from '../audio/soundEngine';

interface RadarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectForInversion: (themeName: string) => void;
}

export const RadarModal: React.FC<RadarModalProps> = ({
  isOpen,
  onClose,
  onSelectForInversion,
}) => {
  const [items, setItems] = useState<RadarItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    fetch('/api/contrarian/radar')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.items) {
          setItems(data.items);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-none">
      <div className="bg-[#0b0f18] border border-[#23314d] rounded-xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#1c273e] bg-[#0e1422]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded bg-cyan-500/10 border border-cyan-500/30">
              <Radar className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-sm font-mono font-bold tracking-wider text-slate-100">
                ACTIVE MACRO DISLOCATION RADAR
              </h2>
              <p className="text-[11px] font-mono text-slate-400">
                Monitored herd consensus anomalies • Asymmetric payoff spreads • Reflexive tipping points
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

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {loading ? (
            <div className="py-16 text-center text-xs font-mono text-slate-400">
              SCANNING MACRO FREQUENCIES...
            </div>
          ) : (
            <div className="space-y-3.5">
              {items.map((item) => {
                const isOvercrowded = item.crowdingScore > 75;
                const isCapitulation = item.crowdingScore < 25;

                return (
                  <div
                    key={item.id}
                    className="bg-[#0e1422] border border-[#1e2a42] hover:border-[#2f4266] rounded-lg p-4 transition-all space-y-3"
                  >
                    {/* Top Row: Symbol, Title, Conviction, and Score */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono font-bold text-xs bg-[#172238] text-amber-300 px-2 py-0.5 rounded border border-[#263758]">
                          {item.symbol}
                        </span>
                        <h3 className="font-mono text-sm font-bold text-slate-100">
                          {item.title}
                        </h3>
                        <span
                          className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-semibold ${
                            item.conviction === 'VERY HIGH'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                          }`}
                        >
                          {item.conviction} CONVICTION
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs font-mono">
                        <div className="flex items-center gap-1.5">
                          <Flame
                            className={`w-3.5 h-3.5 ${
                              isOvercrowded
                                ? 'text-red-400'
                                : isCapitulation
                                ? 'text-emerald-400'
                                : 'text-amber-400'
                            }`}
                          />
                          <span className="text-slate-400 text-[11px]">Crowding:</span>
                          <span
                            className={`font-bold ${
                              isOvercrowded
                                ? 'text-red-400'
                                : isCapitulation
                                ? 'text-emerald-400'
                                : 'text-amber-400'
                            }`}
                          >
                            {item.crowdingScore}%
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <Shield className="w-3.5 h-3.5 text-cyan-400" />
                          <span className="text-slate-400 text-[11px]">Asymmetry:</span>
                          <span className="text-emerald-400 font-bold">{item.asymmetryRatio}</span>
                        </div>

                        <button
                          onClick={() => {
                            sound.playClick(1400);
                            onSelectForInversion(item.title);
                          }}
                          className="flex items-center gap-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:border-amber-500/60 px-2.5 py-1 rounded text-[11px] font-mono cursor-pointer transition-colors"
                        >
                          <span>INVERT</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Consensus vs Contrarian Angle */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="bg-[#121622] rounded p-3 border border-[#1b253b]">
                        <span className="text-[10px] font-mono text-red-400 uppercase font-bold block mb-1">
                          The Unchallenged Consensus:
                        </span>
                        <p className="text-slate-300 font-sans leading-relaxed">
                          {item.consensus}
                        </p>
                      </div>

                      <div className="bg-[#101b24] rounded p-3 border border-cyan-900/40">
                        <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold block mb-1">
                          The Contrarian Dislocation:
                        </span>
                        <p className="text-slate-200 font-sans leading-relaxed">
                          {item.contrarianAngle}
                        </p>
                      </div>
                    </div>

                    {/* Footer: Direction, Timeframe, Catalysts */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#182338] text-[11px] font-mono text-slate-400">
                      <div className="flex items-center gap-4">
                        <div>
                          <span className="text-slate-500">EXPRESSION: </span>
                          <span className="text-slate-200 font-semibold">{item.direction}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span className="text-slate-500">HORIZON: </span>
                          <span className="text-slate-300">{item.timeframe}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                        <AlertCircle className="w-3 h-3 text-amber-400" />
                        <span>CATALYSTS: {item.catalysts.join(' • ')}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
