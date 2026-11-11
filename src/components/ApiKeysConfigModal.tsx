import React, { useState, useEffect } from 'react';
import { X, Key, Save, ShieldCheck, ExternalLink, RefreshCw } from 'lucide-react';
import { ApiKeysConfig } from '../types/macroNews';
import { sound } from '../audio/soundEngine';

interface ApiKeysConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ApiKeysConfig;
  onSave: (newConfig: ApiKeysConfig) => void;
}

export const ApiKeysConfigModal: React.FC<ApiKeysConfigModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
}) => {
  const [newsDataKey, setNewsDataKey] = useState(config.newsDataKey || '');
  const [gnewsKey, setGnewsKey] = useState(config.gnewsKey || '');
  const [guardianKey, setGuardianKey] = useState(config.guardianKey || '');
  const [geminiKey, setGeminiKey] = useState(config.geminiKey || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setNewsDataKey(config.newsDataKey || '');
    setGnewsKey(config.gnewsKey || '');
    setGuardianKey(config.guardianKey || '');
    setGeminiKey(config.geminiKey || '');
  }, [config, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    sound.playClick(1400);
    const updated: ApiKeysConfig = {
      newsDataKey: newsDataKey.trim(),
      gnewsKey: gnewsKey.trim(),
      guardianKey: guardianKey.trim(),
      geminiKey: geminiKey.trim(),
    };
    onSave(updated);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0b0f19] border border-[#233352] rounded-xl w-full max-w-xl overflow-hidden shadow-2xl text-slate-100 flex flex-col">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[#1b273e] bg-[#0e1524] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-mono font-bold tracking-wider text-white">
                KONFIGURASI API KEY BERITA & AI
              </h2>
              <p className="text-[11px] font-mono text-slate-400">
                Gunakan API key pribadi Anda untuk kuota fetch berita & analisis Gemini AI tanpa batas
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-white rounded border border-[#25324e] hover:bg-[#1a2336] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body Form */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-xs font-mono text-blue-200 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <span>
                Terminal ini sudah menyertakan scraper RSS publik (BBC, Al Jazeera, France 24, DW, GDELT) secara otomatis tanpa API key. API Key opsional di bawah ini memungkinkan akses tambahan data berita spesifik.
              </span>
            </div>
          </div>

          {/* NewsData.io Key */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold text-amber-300">
                NewsData.io API Key (Opsional)
              </label>
              <a
                href="https://newsdata.io/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-mono text-blue-400 hover:underline inline-flex items-center gap-1"
              >
                Dapatkan Key Gratis <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <input
              type="password"
              placeholder="pub_..."
              value={newsDataKey}
              onChange={(e) => setNewsDataKey(e.target.value)}
              className="w-full bg-[#070a12] border border-[#212d45] focus:border-amber-400 rounded px-3 py-2 text-xs font-mono text-slate-200 outline-none"
            />
          </div>

          {/* GNews API Key */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold text-cyan-300">
                GNews.io API Key (Opsional)
              </label>
              <a
                href="https://gnews.io/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-mono text-blue-400 hover:underline inline-flex items-center gap-1"
              >
                Dapatkan Key Gratis <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <input
              type="password"
              placeholder="gnews_token_..."
              value={gnewsKey}
              onChange={(e) => setGnewsKey(e.target.value)}
              className="w-full bg-[#070a12] border border-[#212d45] focus:border-cyan-400 rounded px-3 py-2 text-xs font-mono text-slate-200 outline-none"
            />
          </div>

          {/* The Guardian API Key */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold text-emerald-300">
                The Guardian API Key (Default: 'test')
              </label>
              <a
                href="https://open-platform.theguardian.com/access/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-mono text-blue-400 hover:underline inline-flex items-center gap-1"
              >
                Dapatkan Key Guardian <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <input
              type="text"
              placeholder="test"
              value={guardianKey}
              onChange={(e) => setGuardianKey(e.target.value)}
              className="w-full bg-[#070a12] border border-[#212d45] focus:border-emerald-400 rounded px-3 py-2 text-xs font-mono text-slate-200 outline-none"
            />
          </div>

          {/* Gemini API Key Override */}
          <div className="space-y-1.5 pt-2 border-t border-[#1b273e]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold text-purple-300">
                Google Gemini API Key Override (Opsional)
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-mono text-purple-400 hover:underline inline-flex items-center gap-1"
              >
                Google AI Studio Key <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              className="w-full bg-[#070a12] border border-[#212d45] focus:border-purple-400 rounded px-3 py-2 text-xs font-mono text-slate-200 outline-none"
            />
            <p className="text-[10px] font-mono text-slate-500">
              Kosongkan untuk menggunakan kunci Gemini server bawaan aplikasi.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 border-t border-[#1b273e] bg-[#0e1524] flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-400">
            {savedSuccess ? (
              <span className="text-emerald-400 font-bold">✓ Konfigurasi Berhasil Disimpan!</span>
            ) : (
              'Kunci disimpan aman di browser lokal Anda'
            )}
          </span>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-mono font-bold px-4 py-2 rounded text-xs transition-all cursor-pointer shadow-md"
          >
            <Save className="w-4 h-4" />
            <span>SIMPAN KONFIGURASI</span>
          </button>
        </div>
      </div>
    </div>
  );
};
