import React, { useState } from 'react';
import { ThreeCanvas } from './components/ThreeCanvas';
import { HeaderTerminal, TerminalViewMode } from './components/HeaderTerminal';
import { BottomControlDock } from './components/BottomControlDock';
import { MultiChartGrid } from './components/MultiChartGrid';
import { ThesisInverterModal } from './components/ThesisInverterModal';
import { RadarModal } from './components/RadarModal';
import { ExchangeContrarianPanel } from './components/ExchangeContrarianPanel';
import { NewsFeedModal } from './components/NewsFeedModal';
import { TopMoversModal } from './components/TopMoversModal';
import { AuthModal } from './components/AuthModal';
import { FinishId, CameraPreset } from './types/contrarian';
import { UserSession } from './types/news';
import { PartInfo } from './three/MonolithScene';
import { sound } from './audio/soundEngine';

export default function App() {
  const [viewMode, setViewMode] = useState<TerminalViewMode>('multichart');
  const [finish, setFinish] = useState<FinishId>('obsidian-gold');
  const [exploded, setExploded] = useState(0);
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('macro');
  const [autoRotate, setAutoRotate] = useState(true);
  const [rotationSpeed, setRotationSpeed] = useState(1.0);
  const [hoveredPart, setHoveredPart] = useState<PartInfo | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // User authentication session state
  const [session, setSession] = useState<UserSession>(() => {
    try {
      const saved = localStorage.getItem('contrarian_session');
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return {
      isLoggedIn: true,
      traderName: 'Ghal_Contrarian_Desk',
      role: 'Head of Macro Derivatives',
      avatarSeed: 'ghal',
      connectedExchanges: ['BINANCE', 'BITGET'],
      riskPreference: 'CONVEX ASYMMETRIC',
    };
  });

  // Modals state
  const [isInverterOpen, setIsInverterOpen] = useState(false);
  const [isRadarOpen, setIsRadarOpen] = useState(false);
  const [isExchangeSentimentOpen, setIsExchangeSentimentOpen] = useState(false);
  const [isNewsOpen, setIsNewsOpen] = useState(false);
  const [isTopMoversOpen, setIsTopMoversOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [inverterAsset, setInverterAsset] = useState('Hyperscaler AI Infrastructure');
  const [chartTargetSymbol, setChartTargetSymbol] = useState('BTCUSDT');

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.enabled = next;
  };

  const handleLogin = (newSession: UserSession) => {
    setSession(newSession);
    try {
      localStorage.setItem('contrarian_session', JSON.stringify(newSession));
    } catch (_) {}
  };

  const handleLogout = () => {
    const guest: UserSession = {
      isLoggedIn: false,
      traderName: 'Trader_Guest',
      role: 'Macro Observer',
      avatarSeed: 'guest',
      connectedExchanges: [],
      riskPreference: 'CONVEX ASYMMETRIC',
    };
    setSession(guest);
    try {
      localStorage.removeItem('contrarian_session');
    } catch (_) {}
  };

  const handleOpenInverterWithAsset = (themeName: string) => {
    setInverterAsset(themeName);
    setIsRadarOpen(false);
    setIsExchangeSentimentOpen(false);
    setIsNewsOpen(false);
    setIsTopMoversOpen(false);
    setIsInverterOpen(true);
  };

  const handleLoadToChart = (symbol: string) => {
    sound.playSonarPing();
    setChartTargetSymbol(symbol);
    if (viewMode === 'monolith') {
      setViewMode('multichart');
    }
  };

  const handlePartSelect = (part: PartInfo) => {
    sound.playClick(1300);
    setHoveredPart(part);
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#07090e] font-sans flex flex-col">
      {/* 1. Top Header Terminal Bar with News, Movers, Auth */}
      <HeaderTerminal
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
        onOpenInverter={() => {
          setInverterAsset('Hyperscaler AI Infrastructure');
          setIsInverterOpen(true);
        }}
        onOpenRadar={() => setIsRadarOpen(true)}
        onOpenExchangeSentiment={() => setIsExchangeSentimentOpen(true)}
        onOpenNews={() => setIsNewsOpen(true)}
        onOpenTopMovers={() => setIsTopMoversOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        session={session}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
      />

      {/* 2. Main View Area based on viewMode */}
      <div className="flex-1 w-full h-full pt-14 relative overflow-hidden">
        {/* MODE A: 3D MONOLITH FULL-BLEED */}
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

        {/* MODE B: MULTICHART (BINANCE & BITGET) */}
        {viewMode === 'multichart' && (
          <div className="w-full h-full relative flex">
            <MultiChartGrid externalSymbol={chartTargetSymbol} />
          </div>
        )}

        {/* MODE C: SPLIT VIEW (3D MONOLITH + MULTICHART) */}
        {viewMode === 'split' && (
          <div className="w-full h-full grid grid-cols-1 lg:grid-cols-12 gap-1 bg-[#06080d]">
            {/* 3D Scene in Left 5 Columns */}
            <div className="lg:col-span-5 h-[320px] lg:h-full relative border-r border-[#1a253a] overflow-hidden">
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

            {/* Multichart Grid in Right 7 Columns */}
            <div className="lg:col-span-7 h-[calc(100%-320px)] lg:h-full relative">
              <MultiChartGrid externalSymbol={chartTargetSymbol} />
            </div>
          </div>
        )}
      </div>

      {/* 3. AI Contrarian Inverter Modal */}
      <ThesisInverterModal
        isOpen={isInverterOpen}
        onClose={() => setIsInverterOpen(false)}
        initialAsset={inverterAsset}
      />

      {/* 4. Macro Dislocation Radar Modal */}
      <RadarModal
        isOpen={isRadarOpen}
        onClose={() => setIsRadarOpen(false)}
        onSelectForInversion={handleOpenInverterWithAsset}
      />

      {/* 5. Binance & Bitget Contrarian Sentiment & Funding Panel */}
      <ExchangeContrarianPanel
        isOpen={isExchangeSentimentOpen}
        onClose={() => setIsExchangeSentimentOpen(false)}
        onSelectForInversion={handleOpenInverterWithAsset}
      />

      {/* 6. Multi-Source Crypto News Feed Modal */}
      <NewsFeedModal
        isOpen={isNewsOpen}
        onClose={() => setIsNewsOpen(false)}
        onSelectForInversion={handleOpenInverterWithAsset}
      />

      {/* 7. Top Gainers & Top Losers Modal */}
      <TopMoversModal
        isOpen={isTopMoversOpen}
        onClose={() => setIsTopMoversOpen(false)}
        onLoadToChart={handleLoadToChart}
        onSelectForInversion={handleOpenInverterWithAsset}
      />

      {/* 8. Menu Masuk & Menu Keluar (Auth Modal) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        session={session}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />
    </main>
  );
}
