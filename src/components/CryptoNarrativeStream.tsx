import React, { useEffect, useState } from 'react';
import {
  MessageSquare,
  RefreshCw,
  ExternalLink,
  Flame,
  TrendingUp,
  Globe,
  Radio,
  ThumbsUp,
  MessageCircle,
  Sparkles,
  ShieldCheck,
  X,
} from 'lucide-react';
import { sound } from '../audio/soundEngine';

export const CryptoNarrativeStream: React.FC = () => {
  const [narratives, setNarratives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState('ALL');
  const [activeNarrativeModal, setActiveNarrativeModal] = useState<any | null>(null);

  const fetchNarratives = () => {
    setLoading(true);
    fetch('/api/crypto/narratives')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.narratives) {
          setNarratives(data.narratives);
        }
      })
      .catch((err) => console.error('Error fetching narratives:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNarratives();
    const interval = setInterval(fetchNarratives, 60000); // 60s auto refresh
    return () => clearInterval(interval);
  }, []);

  const themes = ['ALL', 'AI & Agentic Web3', 'Institutional Inflows', 'Layer-1 & Scaling', 'Regulatory & Risk', 'Retail Momentum & Attention'];

  const filteredNarratives = narratives.filter((item) => {
    if (selectedTheme !== 'ALL' && item.narrativeTheme !== selectedTheme) return false;
    return true;
  });

  return (
    <div className="w-full h-full bg-[#06080d] p-4 sm:p-6 overflow-y-auto space-y-6 font-sans text-slate-100 select-none">
      <div className="max-w-[1780px] mx-auto space-y-6">
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#18253b] pb-4 bg-[#080c14]/80 backdrop-blur-md p-4 rounded-xl border border-[#1b2842]">
          <div className="flex items-center gap-4">
            <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
              <div className="absolute inset-0 rounded-full border border-amber-500/40 animate-spin-slow" />
              <Radio className="w-6 h-6 text-amber-400 relative z-10 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-base sm:text-lg font-mono font-extrabold tracking-wider text-white">
                  24/7 CRYPTO COMMUNITY NARRATIVES & SOCIAL CHATTER
                </h1>
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 uppercase font-bold tracking-wide flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  SUMBER JELAS: REDDIT r/CryptoCurrency & COINGECKO API
                </span>
              </div>
              <p className="text-xs font-mono text-slate-400 mt-0.5">
                Monitoring diskusi aktif, pergeseran narasi, dan perbincangan 24 jam penuh di komunitas global.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              fetchNarratives();
            }}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all shadow cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>SINKRONISASI 24H API</span>
          </button>
        </div>

        {/* Theme Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          {themes.map((th) => (
            <button
              key={th}
              onClick={() => {
                sound.playClick();
                setSelectedTheme(th);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-mono shrink-0 transition-all cursor-pointer font-bold border ${
                selectedTheme === th
                  ? 'bg-amber-500 text-black border-amber-400 shadow-md'
                  : 'bg-[#0b101b] text-slate-300 border-[#1e2a42] hover:border-amber-500/50'
              }`}
            >
              {th === 'ALL' ? `Semua Narasi (${narratives.length})` : th}
            </button>
          ))}
        </div>

        {/* Narratives Grid Stream */}
        {loading && narratives.length === 0 ? (
          <div className="py-32 flex flex-col items-center justify-center gap-3 font-mono text-xs text-slate-400">
            <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
            <span>MEMUAT NARASI 24 JAM DARI API PUBLIK...</span>
          </div>
        ) : filteredNarratives.length === 0 ? (
          <div className="py-24 text-center font-mono text-xs text-slate-500 bg-[#080c14] border border-[#1b273d] rounded-xl">
            Tidak ada topik narasi yang sesuai dengan filter tema saat ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNarratives.map((item, idx) => {
              return (
                <div
                  key={item.id || idx}
                  className="bg-[#080c14] border border-[#1b273d] hover:border-amber-500/50 rounded-xl p-4 sm:p-5 flex flex-col justify-between space-y-4 shadow-xl transition-all duration-300 group hover:-translate-y-1"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="px-2.5 py-0.5 rounded bg-[#101726] text-amber-300 border border-[#202e48] font-bold">
                        {item.narrativeTheme || 'Crypto Narrative'}
                      </span>
                      <span className="text-slate-500">{item.timestamp}</span>
                    </div>

                    <h3 className="font-bold text-slate-100 group-hover:text-amber-300 transition-colors text-sm sm:text-base leading-snug">
                      {item.title}
                    </h3>

                    {/* Clear Attribution Source Tag */}
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-cyan-400 bg-[#0b1322] px-2.5 py-1 rounded border border-[#1c2a44]">
                      <Globe className="w-3 h-3 text-blue-400 shrink-0" />
                      <span className="truncate">Sumber Resmi: <strong>{item.source}</strong></span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#131b2e] flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-3 text-slate-400">
                      <span className="flex items-center gap-1 text-emerald-400 font-bold" title="Upvotes / Engagement">
                        <ThumbsUp className="w-3.5 h-3.5" /> {item.upvotes}
                      </span>
                      <span className="flex items-center gap-1 text-blue-400 font-bold" title="Comments Discussion">
                        <MessageCircle className="w-3.5 h-3.5" /> {item.comments}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          sound.playClick(1400);
                          setActiveNarrativeModal(item);
                        }}
                        className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        <span>DETAIL</span>
                      </button>

                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 rounded bg-[#101726] hover:bg-[#18243b] text-blue-400 border border-[#21304d]"
                        title="Buka Link Sumber Asli"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Narrative Detail Modal */}
        {activeNarrativeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#0b0f18] border border-[#23314d] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl text-slate-100 font-mono">
              <div className="px-5 py-4 border-b border-[#1c273e] bg-[#0e1422] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded bg-amber-500/15 border border-amber-500/40 text-amber-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">ANALISIS NARASI 24 JAM</h3>
                    <p className="text-[10px] text-slate-400">Atribusi Sumber: {activeNarrativeModal.source}</p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveNarrativeModal(null)}
                  className="p-1 text-slate-400 hover:text-white rounded border border-[#25324e] hover:bg-[#1a2336] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-4 text-xs font-mono">
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-500 uppercase font-bold block">Topik Diskusi Utama:</span>
                  <h4 className="text-sm font-bold text-slate-100 leading-snug">{activeNarrativeModal.title}</h4>
                </div>

                <div className="p-3.5 bg-[#0e1422] border border-[#1f2b42] rounded-xl space-y-2">
                  <span className="text-[10px] text-amber-300 uppercase font-bold block">Penjelasan & Atribusi Sumber:</span>
                  <p className="text-xs text-slate-300 font-sans leading-relaxed">
                    Topik ini aktif dibicarakan selama 24 jam terakhir di komunitas publik dengan total interaksi mencapai <strong>{activeNarrativeModal.upvotes} upvotes</strong> dan <strong>{activeNarrativeModal.comments} komentar aktif</strong>. Sumber data diverifikasi langsung dari <strong>{activeNarrativeModal.source}</strong>.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#18243b]">
                  <span className="text-slate-400">Tautan Diskusi Asli:</span>
                  <a
                    href={activeNarrativeModal.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-bold hover:underline"
                  >
                    <span>Buka Sumber Original</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
