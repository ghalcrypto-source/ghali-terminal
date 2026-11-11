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

import { ThesisInverterModal } from './components/ThesisInverterModal';
import { RadarModal } from './components/RadarModal';
import { ExchangeContrarianPanel } from './components/ExchangeContrarianPanel';
import { TopMoversModal } from './components/TopMoversModal';
import { AuthModal } from './components/AuthModal';
import { LoginGate } from './components/LoginGate';
import { TechnicalAnalysisPanel } from './components/TechnicalAnalysisPanel';
import { WhaleIntelligenceModal } from './components/WhaleIntelligenceModal';
import { PriceAlertManager } from './components/PriceAlertManager';

import { FinishId, CameraPreset } from './types/contrarian';
import { UserSession } from './types/news';
import { MacroNewsItem, ApiKeysConfig } from './types/macroNews';
import { PartInfo } from './three/MonolithScene';
import { sound } from './audio/soundEngine';

export default function App() {
  const [viewMode, setViewMode] = useState<TerminalViewMode>('macro_terminal');
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

  // User authentication session state - defaults to requiring Google login on entry
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
  const [isInverterOpen, setIsInverterOpen] = useState(false);
  const [isRadarOpen, setIsRadarOpen] = useState(false);
  const [isExchangeSentimentOpen, setIsExchangeSentimentOpen] = useState(false);
  const [isTopMoversOpen, setIsTopMoversOpen] = useState(false);
  const [isWhaleOpen, setIsWhaleOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isTAOpen, setIsTAOpen] = useState(false);
  const [inverterAsset, setInverterAsset] = useState('Fed Rate & DXY Liquidity Policy');
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

  const handleOpenInverterWithAsset = (themeName: string) => {
    setInverterAsset(themeName);
    setIsRadarOpen(false);
    setIsExchangeSentimentOpen(false);
    setIsTopMoversOpen(false);
    setIsWhaleOpen(false);
    setIsAlertsOpen(false);
    setIsTAOpen(false);
    setIsInverterOpen(true);
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
      {/* 1. Header Bar with View Switchers & Ticker */}
      <HeaderTerminal
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
        onOpenApiKeys={() => setIsApiKeysOpen(true)}
        onOpenInverter={() => {
          setInverterAsset('Fed Rate & DXY Liquidity Policy');
          setIsInverterOpen(true);
        }}
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

      {/* 2. Main Viewport Area */}
      <div className="flex-1 w-full h-full pt-14 relative overflow-hidden">
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

        {/* VIEW B: GLOBAL MACRO IMPACT MATRIX */}
        {viewMode === 'impact_matrix' && (
          <div className="w-full h-full relative flex overflow-hidden">
            <MacroImpactMatrix
              news={macroNews}
              onSelectNews={handleSelectNewsForAI}
            />
          </div>
        )}

        {/* VIEW C: HIGH IMPACT PRIORITY VIEW */}
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

        {/* VIEW D: MULTICHART GRID */}
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

        {/* VIEW E: ON-CHAIN & MULTI-EXCHANGE 8-API TELEMETRY PANEL */}
        {viewMode === 'telemetry' && (
          <div className="w-full h-full relative flex overflow-hidden">
            <MultiApiTelemetryPanel />
          </div>
        )}

        {/* VIEW F: 3D SENTIMENT MONOLITH */}
        {viewMode === 'monolith' && (
          <div className="w-full h-full relative">
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

      {/* 3. AI News Analysis Drawer (Gemini Deep Analysis) */}
      <AINewsAnalysisDrawer
        isOpen={isAIDrawerOpen}
        onClose={() => setIsAIDrawerOpen(false)}
        item={selectedNewsForAI}
        userGeminiKey={apiConfig.geminiKey}
      />

      {/* 4. API Keys Configuration Modal */}
      <ApiKeysConfigModal
        isOpen={isApiKeysOpen}
        onClose={() => setIsApiKeysOpen(false)}
        config={apiConfig}
        onSave={handleSaveApiKeys}
      />

      {/* 5. AI Contrarian Inverter Modal */}
      <ThesisInverterModal
        isOpen={isInverterOpen}
        onClose={() => setIsInverterOpen(false)}
        initialAsset={inverterAsset}
      />

      {/* 6. Macro Dislocation Radar Modal */}
      <RadarModal
        isOpen={isRadarOpen}
        onClose={() => setIsRadarOpen(false)}
        onSelectForInversion={handleOpenInverterWithAsset}
      />

      {/* 7. Exchange Contrarian Panel */}
      <ExchangeContrarianPanel
        isOpen={isExchangeSentimentOpen}
        onClose={() => setIsExchangeSentimentOpen(false)}
        onSelectForInversion={handleOpenInverterWithAsset}
      />

      {/* 8. Top Gainers & Top Losers Modal */}
      <TopMoversModal
        isOpen={isTopMoversOpen}
        onClose={() => setIsTopMoversOpen(false)}
        onLoadToChart={handleLoadToChart}
        onSelectForInversion={handleOpenInverterWithAsset}
      />

      {/* 9. Menu Auth (Masuk & Keluar) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        session={session}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />

      {/* 10. Technical Analysis Suite */}
      <TechnicalAnalysisPanel
        isOpen={isTAOpen}
        onClose={() => setIsTAOpen(false)}
        activeSymbol={chartTargetSymbol}
        onApplyCoinToChart={handleLoadToChart}
      />

      {/* 11. KOL & Smart Money Whale Intelligence Desk */}
      <WhaleIntelligenceModal
        isOpen={isWhaleOpen}
        onClose={() => setIsWhaleOpen(false)}
        onLoadToChart={handleLoadToChart}
        onSelectForInversion={handleOpenInverterWithAsset}
      />

      {/* 12. Price Alert Manager */}
      <PriceAlertManager
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
        onSelectCoinToChart={handleLoadToChart}
      />
    </main>
  );
}
