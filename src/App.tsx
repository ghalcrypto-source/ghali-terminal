import React, { useState, useEffect } from 'react';
import { ThreeCanvas } from './components/ThreeCanvas';
import { HeaderTerminal, TerminalViewMode } from './components/HeaderTerminal';
import { BottomControlDock } from './components/BottomControlDock';
import { MultiChartGrid } from './components/MultiChartGrid';
import { MacroNewsTable } from './components/MacroNewsTable';
import { AINewsAnalysisDrawer } from './components/AINewsAnalysisDrawer';
import { MacroImpactMatrix } from './components/MacroImpactMatrix';
import { ApiKeysConfigModal } from './components/ApiKeysConfigModal';
import { MultiApiTelemetryPanel } from './components/MultiApiTelemetryPanel';
import { CryptoNarrativeStream } from './components/CryptoNarrativeStream';
import { BitcoinCyclePanel } from './components/BitcoinCyclePanel';
import { RadarModal } from './components/RadarModal';
import { ExchangeContrarianPanel } from './components/ExchangeContrarianPanel';
import { TopMoversModal } from './components/TopMoversModal';
import { AuthModal } from './components/AuthModal';
import { LoginGate } from './components/LoginGate';
import { TechnicalAnalysisPanel } from './components/TechnicalAnalysisPanel';
import { WhaleIntelligenceModal } from './components/WhaleIntelligenceModal';
import { PriceAlertManager } from './components/PriceAlertManager';
import { CryptoLiquidityMoversPanel } from './components/CryptoLiquidityMoversPanel';

import { FinishId, CameraPreset } from './types/contrarian';
import { UserSession } from './types/news';
import { MacroNewsItem, ApiKeysConfig } from './types/macroNews';
import { PartInfo } from './three/MonolithScene';
import { sound } from './audio/soundEngine';
import {
  Newspaper,
  Activity,
  Flame,
  Radar,
  LayoutGrid,
  Box,
  ChevronRight,
  Radio,
  TrendingUp,
  Compass,
} from 'lucide-react';

export default function App() {
  const [viewMode, setViewMode] = useState<TerminalViewMode>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const v = params.get('view');
      const path = window.location.pathname.toLowerCase();
      if (v === 'impact_matrix' || v === 'matrix' || path.includes('matrix')) return 'impact_matrix';
      if (v === 'high_impact' || v === 'priority' || path.includes('high_impact') || path.includes('priority')) return 'high_impact';
      if (v === 'macro_terminal' || v === 'macro' || v === 'macroview' || path.includes('macroview') || path.includes('macro')) return 'macro_terminal';
      if (v === 'telemetry' || path.includes('telemetry')) return 'telemetry';
      if (v === 'narratives' || v === 'chatter' || path.includes('narratives') || path.includes('chatter')) return 'narratives';
      if (v === 'bitcoin_cycle' || v === 'cycle' || path.includes('cycle') || path.includes('bitcoin')) return 'bitcoin_cycle';
      if (v === 'liquidity_movers' || v === 'liquidity' || v === 'movers' || path.includes('liquidity')) return 'liquidity_movers';
      if (v === 'multichart' || path.includes('multichart')) return 'multichart';
      if (v === 'monolith' || path.includes('monolith')) return 'monolith';
    } catch (_) {}
    return 'macro_terminal';
  });

  useEffect(() => {
    try {
      const newUrl = `${window.location.pathname}?view=${viewMode}`;
      window.history.replaceState({}, '', newUrl);
    } catch (_) {}
  }, [viewMode]);

  const [finish, setFinish] = useState<FinishId>('obsidian-gold');
  const [exploded, setExploded] = useState(0);
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('macro');
  const [autoRotate, setAutoRotate] = useState(true);
  const [rotationSpeed, setRotationSpeed] = useState(1.0);
  const [hoveredPart, setHoveredPart] = useState<PartInfo | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Global Macro News State
  const [macroNews, setMacroNews] = useState<MacroNewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [wibNow, setWibNow] = useState('');
  const [selectedNewsForAI, setSelectedNewsForAI] = useState<MacroNewsItem | null>(null);
  const [isAIDrawerOpen, setIsAIDrawerOpen] = useState(false);

  // API Key Config State
  const [isApiKeysOpen, setIsApiKeysOpen] = useState(false);
  const [apiConfig, setApiConfig] = useState<ApiKeysConfig>(() => {
    try {
      const saved = localStorage.getItem('macro_api_config');
      return saved ? JSON.parse(saved) : {};
    } catch (_) {
      return {};
    }
  });

  // User authentication session state
  const [session, setSession] = useState<UserSession>(() => {
    return {
      isLoggedIn: false, // Mandatory login gate
      traderName: '',
      role: 'Head of Global Macro Strategy',
      avatarSeed: 'gate',
      connectedExchanges: ['BINANCE', 'BITGET'],
      riskPreference: 'CONVEX ASYMMETRIC',
    };
  });

  // Modals state
  const [isRadarOpen, setIsRadarOpen] = useState(false);
  const [isExchangeSentimentOpen, setIsExchangeSentimentOpen] = useState(false);
  const [isTopMoversOpen, setIsTopMoversOpen] = useState(false);
  const [isWhaleOpen, setIsWhaleOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isTAOpen, setIsTAOpen] = useState(false);
  const [chartTargetSymbol, setChartTargetSymbol] = useState('BTCUSDT');

  // Fetch Macro News Wire
  const fetchMacroNews = () => {
    setNewsLoading(true);
    const query = new URLSearchParams();
    if (apiConfig.newsDataKey) query.set('newsDataKey', apiConfig.newsDataKey);
    if (apiConfig.gnewsKey) query.set('gnewsKey', apiConfig.gnewsKey);
    if (apiConfig.guardianKey) query.set('guardianKey', apiConfig.guardianKey);

    fetch(`/api/macro/news?${query.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.items) {
          setMacroNews(data.items);
          if (data.wibNow) setWibNow(data.wibNow);
        }
      })
      .catch((err) => console.error('Error fetching macro news:', err))
      .finally(() => setNewsLoading(false));
  };

  useEffect(() => {
    if (session.isLoggedIn) {
      fetchMacroNews();
      const interval = setInterval(fetchMacroNews, 45000); // 45s auto update
      return () => clearInterval(interval);
    }
  }, [session.isLoggedIn, apiConfig]);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.enabled = next;
  };

  const handleSaveApiKeys = (newConfig: ApiKeysConfig) => {
    setApiConfig(newConfig);
    try {
      localStorage.setItem('macro_api_config', JSON.stringify(newConfig));
    } catch (_) {}
  };

  const handleLogin = (newSession: UserSession) => {
    setSession(newSession);
    try {
      localStorage.setItem('contrarian_session', JSON.stringify(newSession));
    } catch (_) {}
  };

  const handleLogout = () => {
    const loggedOut: UserSession = {
      isLoggedIn: false,
      traderName: '',
      role: 'Observer',
      avatarSeed: 'guest',
      connectedExchanges: [],
      riskPreference: 'CONVEX ASYMMETRIC',
    };
    setSession(loggedOut);
    try {
      localStorage.removeItem('contrarian_session');
    } catch (_) {}
  };

  const handleLoadToChart = (symbol: string) => {
    sound.playSonarPing();
    const formatted = symbol.endsWith('USDT') ? symbol : `${symbol}USDT`;
    setChartTargetSymbol(formatted);
    setViewMode('multichart');
  };

  const handlePartSelect = (part: PartInfo) => {
    sound.playClick(1300);
    setHoveredPart(part);
  };

  const handleSelectNewsForAI = (item: MacroNewsItem) => {
    setSelectedNewsForAI(item);
    setIsAIDrawerOpen(true);
  };

  // If user is not logged in, render mandatory Login Gate
  if (!session.isLoggedIn) {
    return <LoginGate onLoginSuccess={handleLogin} />;
  }

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#06080d] font-sans flex flex-col">
      {/* 1. Header Bar with Ticker & Top Controls */}
      <HeaderTerminal
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
        onOpenApiKeys={() => setIsApiKeysOpen(true)}
        onOpenRadar={() => setIsRadarOpen(true)}
        onOpenExchangeSentiment={() => setIsExchangeSentimentOpen(true)}
        onOpenTopMovers={() => setIsTopMoversOpen(true)}
        onOpenWhale={() => setIsWhaleOpen(true)}
        onOpenAlerts={() => setIsAlertsOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenTA={() => setIsTAOpen(true)}
        session={session}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
      />

      {/* 2. Main Workspace Layout with Left Sidebar Menu */}
      <div className="flex-1 w-full h-full pt-14 relative flex overflow-hidden">
        {/* ============================================================ */}
        {/* LEFT SIDEBAR NAVIGATION MENU                                 */}
        {/* ============================================================ */}
        <aside className="w-64 shrink-0 bg-[#080b12] border-r border-[#1a253a] flex flex-col justify-between p-3.5 overflow-y-auto hidden lg:flex text-xs font-mono z-10">
          <div className="space-y-6">
            <div className="px-2 pt-1 pb-2.5 border-b border-[#18243b] flex items-center justify-between">
              <div>
                <span className="text-xs font-black tracking-wider text-amber-300 font-mono block">
                  GHALI TERMINAL
                </span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                  Macro & Crypto Desk
                </span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="System Live" />
            </div>

            <div className="space-y-1.5">
              {/* Macro Wire / MacroView */}
              <button
                onClick={() => {
                  sound.playClick();
                  setViewMode('macro_terminal');
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold transition-all cursor-pointer ${
                  viewMode === 'macro_terminal'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-black shadow-lg shadow-amber-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-[#101726]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Newspaper className="w-4 h-4" />
                  <span>Macro Wire (MacroView)</span>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 ${viewMode === 'macro_terminal' ? 'text-black' : 'text-slate-500'}`} />
              </button>

              {/* 24/7 Crypto Narratives */}
              <button
                onClick={() => {
                  sound.playClick();
                  setViewMode('narratives');
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold transition-all cursor-pointer ${
                  viewMode === 'narratives'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-black shadow-lg shadow-amber-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-[#101726]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
                  <span>24/7 Crypto Narratives</span>
                </div>
                <span className="px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 text-[10px] font-bold border border-amber-800">
                  LIVE
                </span>
              </button>

              {/* Impact Matrix */}
              <button
                onClick={() => {
                  sound.playClick();
                  setViewMode('impact_matrix');
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold transition-all cursor-pointer ${
                  viewMode === 'impact_matrix'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-black shadow-lg shadow-amber-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-[#101726]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Activity className="w-4 h-4" />
                  <span>Impact Matrix</span>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 ${viewMode === 'impact_matrix' ? 'text-black' : 'text-slate-500'}`} />
              </button>

              {/* High Impact */}
              <button
                onClick={() => {
                  sound.playClick();
                  setViewMode('high_impact');
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold transition-all cursor-pointer ${
                  viewMode === 'high_impact'
                    ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg shadow-red-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-[#101726]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Flame className="w-4 h-4 text-amber-300" />
                  <span>High Impact Priority</span>
                </div>
                <span className="px-1.5 py-0.2 rounded bg-red-950 text-red-300 text-[10px] font-bold border border-red-800">
                  HOT
                </span>
              </button>

              {/* 8-API Telemetry */}
              <button
                onClick={() => {
                  sound.playClick();
                  setViewMode('telemetry');
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold transition-all cursor-pointer ${
                  viewMode === 'telemetry'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-black shadow-lg shadow-amber-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-[#101726]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Radar className="w-4 h-4 text-cyan-400" />
                  <span>8-API Telemetry</span>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 ${viewMode === 'telemetry' ? 'text-black' : 'text-slate-500'}`} />
              </button>

              {/* Multichart */}
              <button
                onClick={() => {
                  sound.playClick();
                  setViewMode('multichart');
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold transition-all cursor-pointer ${
                  viewMode === 'multichart'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-black shadow-lg shadow-amber-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-[#101726]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <LayoutGrid className="w-4 h-4 text-blue-400" />
                  <span>Multichart Grid</span>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 ${viewMode === 'multichart' ? 'text-black' : 'text-slate-500'}`} />
              </button>

              {/* 3D Monolith */}
              <button
                onClick={() => {
                  sound.playClick();
                  setViewMode('monolith');
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold transition-all cursor-pointer ${
                  viewMode === 'monolith'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-black shadow-lg shadow-amber-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-[#101726]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Box className="w-4 h-4 text-emerald-400" />
                  <span>3D Monolith Sentiment</span>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 ${viewMode === 'monolith' ? 'text-black' : 'text-slate-500'}`} />
              </button>

              {/* Bitcoin Cycle & Expert Analysis (Placed directly below 3D Monolith) */}
              <button
                onClick={() => {
                  sound.playClick();
                  setViewMode('bitcoin_cycle');
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold transition-all cursor-pointer ${
                  viewMode === 'bitcoin_cycle'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-black shadow-lg shadow-amber-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-[#101726]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                  <span>Bitcoin Cycle & Analysis</span>
                </div>
                <span className="px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 text-[10px] font-bold border border-amber-800">
                  2026
                </span>
              </button>

              {/* Arus Likuiditas & Movers (Placed directly below Bitcoin Cycle) */}
              <button
                onClick={() => {
                  sound.playClick();
                  setViewMode('liquidity_movers');
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold transition-all cursor-pointer ${
                  viewMode === 'liquidity_movers'
                    ? 'bg-gradient-to-r from-cyan-500 to-cyan-400 text-black shadow-lg shadow-cyan-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-[#101726]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Compass className="w-4 h-4 text-cyan-400" />
                  <span>Arus Likuiditas & Movers</span>
                </div>
                <span className="px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 text-[10px] font-bold border border-cyan-800">
                  TOP 5 L/S
                </span>
              </button>
            </div>
          </div>
        </aside>

        {/* ============================================================ */}
        {/* RIGHT CONTENT AREA                                           */}
        {/* ============================================================ */}
        <div className="flex-1 w-full h-full relative overflow-hidden flex">
          {/* VIEW A: GLOBAL MACRO NEWS WIRE TERMINAL */}
          {viewMode === 'macro_terminal' && (
            <div className="w-full h-full relative flex overflow-hidden">
              <MacroNewsTable
                news={macroNews}
                loading={newsLoading}
                onRefresh={fetchMacroNews}
                onSelectForAI={handleSelectNewsForAI}
                wibNow={wibNow}
              />
            </div>
          )}

          {/* VIEW B: 24/7 CRYPTO NARRATIVES STREAM */}
          {viewMode === 'narratives' && (
            <div className="w-full h-full relative flex overflow-hidden">
              <CryptoNarrativeStream />
            </div>
          )}

          {/* VIEW C: BITCOIN CYCLE & EXPERT ANALYSIS */}
          {viewMode === 'bitcoin_cycle' && (
            <div className="w-full h-full relative flex overflow-hidden">
              <BitcoinCyclePanel
                onLoadToChart={handleLoadToChart}
                onOpenAlerts={() => setIsAlertsOpen(true)}
              />
            </div>
          )}

          {/* VIEW: CRYPTO LIQUIDITY FLOW, MOVERS & TOP 5 ALTCOINS LONG/SHORT */}
          {viewMode === 'liquidity_movers' && (
            <div className="w-full h-full relative flex flex-col overflow-y-auto p-4 sm:p-6 bg-[#060911]">
              <CryptoLiquidityMoversPanel
                onLoadToChart={handleLoadToChart}
                onOpenAlerts={() => setIsAlertsOpen(true)}
              />
            </div>
          )}

          {/* VIEW D: GLOBAL MACRO IMPACT MATRIX */}
          {viewMode === 'impact_matrix' && (
            <div className="w-full h-full relative flex overflow-hidden">
              <MacroImpactMatrix
                news={macroNews}
                onSelectNews={handleSelectNewsForAI}
              />
            </div>
          )}

          {/* VIEW E: HIGH IMPACT PRIORITY VIEW */}
          {viewMode === 'high_impact' && (
            <div className="w-full h-full relative flex overflow-hidden">
              <MacroNewsTable
                news={macroNews.filter((n) => n.impactLevel === 'HIGH')}
                loading={newsLoading}
                onRefresh={fetchMacroNews}
                onSelectForAI={handleSelectNewsForAI}
                wibNow={wibNow}
              />
            </div>
          )}

          {/* VIEW F: MULTICHART GRID */}
          {viewMode === 'multichart' && (
            <div className="w-full h-full relative flex">
              <MultiChartGrid
                externalSymbol={chartTargetSymbol}
                onOpenTA={(sym) => {
                  setChartTargetSymbol(sym);
                  setIsTAOpen(true);
                }}
              />
            </div>
          )}

          {/* VIEW G: ON-CHAIN & MULTI-EXCHANGE 8-API TELEMETRY PANEL */}
          {viewMode === 'telemetry' && (
            <div className="w-full h-full relative flex overflow-hidden">
              <MultiApiTelemetryPanel />
            </div>
          )}

          {/* VIEW H: 3D SENTIMENT MONOLITH */}
          {viewMode === 'monolith' && (
            <div className="w-full h-full relative w-full h-full">
              <ThreeCanvas
                finish={finish}
                exploded={exploded}
                cameraPreset={cameraPreset}
                autoRotate={autoRotate}
                rotationSpeed={rotationSpeed}
                onPartHover={setHoveredPart}
                onPartSelect={handlePartSelect}
              />
              <BottomControlDock
                finish={finish}
                onSelectFinish={setFinish}
                exploded={exploded}
                onChangeExploded={setExploded}
                cameraPreset={cameraPreset}
                onSelectCamera={setCameraPreset}
                autoRotate={autoRotate}
                onToggleRotate={() => setAutoRotate((prev) => !prev)}
                rotationSpeed={rotationSpeed}
                onChangeSpeed={setRotationSpeed}
                hoveredPart={hoveredPart}
              />
            </div>
          )}
        </div>
      </div>

      {/* 3. AI News Analysis Drawer */}
      <AINewsAnalysisDrawer
        isOpen={isAIDrawerOpen}
        onClose={() => setIsAIDrawerOpen(false)}
        item={selectedNewsForAI}
      />

      {/* 4. API Keys Configuration Modal */}
      <ApiKeysConfigModal
        isOpen={isApiKeysOpen}
        onClose={() => setIsApiKeysOpen(false)}
        config={apiConfig}
        onSave={handleSaveApiKeys}
      />

      {/* 5. Macro Dislocation Radar Modal */}
      <RadarModal
        isOpen={isRadarOpen}
        onClose={() => setIsRadarOpen(false)}
      />

      {/* 6. Exchange Contrarian Panel */}
      <ExchangeContrarianPanel
        isOpen={isExchangeSentimentOpen}
        onClose={() => setIsExchangeSentimentOpen(false)}
      />

      {/* 7. Top Gainers & Top Losers Modal */}
      <TopMoversModal
        isOpen={isTopMoversOpen}
        onClose={() => setIsTopMoversOpen(false)}
        onLoadToChart={handleLoadToChart}
      />

      {/* 8. Menu Auth (Masuk & Keluar) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        session={session}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />

      {/* 9. Technical Analysis Suite */}
      <TechnicalAnalysisPanel
        isOpen={isTAOpen}
        onClose={() => setIsTAOpen(false)}
        activeSymbol={chartTargetSymbol}
        onApplyCoinToChart={handleLoadToChart}
      />

      {/* 10. KOL & Smart Money Whale Intelligence Desk */}
      <WhaleIntelligenceModal
        isOpen={isWhaleOpen}
        onClose={() => setIsWhaleOpen(false)}
        onLoadToChart={handleLoadToChart}
      />

      {/* 11. Price Alert Manager */}
      <PriceAlertManager
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
        onSelectCoinToChart={handleLoadToChart}
      />
    </main>
  );
}
