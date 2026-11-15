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
import { LoginGate, OWNER_TOKEN_STORAGE_KEY } from './components/LoginGate';
import { TechnicalAnalysisPanel } from './components/TechnicalAnalysisPanel';
import { WhaleIntelligenceModal } from './components/WhaleIntelligenceModal';
import { PriceAlertManager } from './components/PriceAlertManager';
import { CryptoLiquidityMoversPanel } from './components/CryptoLiquidityMoversPanel';
import { RoomChatView } from './components/RoomChatView';
import { SuperAppHome } from './components/SuperAppHome';

import { FinishId, CameraPreset } from './types/contrarian';
import { UserSession } from './types/news';
import { MacroNewsItem, ApiKeysConfig } from './types/macroNews';
import { PartInfo, Altcoin5mMetric } from './three/MonolithScene';
import { sound } from './audio/soundEngine';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, signOutGoogle, syncGoogleUserProfile } from './firebase';
import {
  Newspaper,
  Home,
  ChevronLeft,
  TrendingUp,
  MessageSquare,
} from 'lucide-react';

export default function App() {
  const [viewMode, setViewMode] = useState<TerminalViewMode>(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const v = params.get('view');
      const path = window.location.pathname.toLowerCase();
      if (v === 'home') return 'home';
      if (v === 'impact_matrix' || v === 'matrix' || path.includes('matrix')) return 'impact_matrix';
      if (v === 'high_impact' || v === 'priority' || path.includes('high_impact') || path.includes('priority')) return 'high_impact';
      if (v === 'macro_terminal' || v === 'macro' || v === 'macroview' || path.includes('macroview') || path.includes('macro')) return 'macro_terminal';
      if (v === 'telemetry' || path.includes('telemetry')) return 'telemetry';
      if (v === 'narratives' || v === 'chatter' || path.includes('narratives') || path.includes('chatter')) return 'narratives';
      if (v === 'bitcoin_cycle' || v === 'cycle' || path.includes('cycle') || path.includes('bitcoin')) return 'bitcoin_cycle';
      if (v === 'liquidity_movers' || v === 'liquidity' || v === 'movers' || path.includes('liquidity')) return 'liquidity_movers';
      if (v === 'room_chat' || v === 'chat' || path.includes('chat')) return 'room_chat';
      if (v === 'multichart' || path.includes('multichart')) return 'multichart';
      if (v === 'monolith' || path.includes('monolith')) return 'monolith';
    } catch (_) {}
    return 'home';
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
  const [soundEnabled, setSoundEnabled] = useState(true); // Controls Alert "Cekring" sound (UI clicks remain muted)

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

  // Mandatory Firebase Google Auth session state
  const [authReady, setAuthReady] = useState(false);
  const [session, setSession] = useState<UserSession>(() => ({
    isLoggedIn: false,
    traderName: '',
    role: 'Verified Google Strategist',
    avatarSeed: 'gate',
    connectedExchanges: ['BINANCE', 'BITGET'],
    riskPreference: 'CONVEX ASYMMETRIC',
  }));

  useEffect(() => {
    let cancelled = false;
    let firebaseResolved = false;
    let ownerCheckResolved = false;
    let hasFirebaseUser = false;

    const finalizeReady = () => {
      if (!cancelled && firebaseResolved && ownerCheckResolved) {
        setAuthReady(true);
      }
    };

    // Never leave users on another device stuck forever if Firebase Auth network takes too long
    const authSafetyTimer = window.setTimeout(() => {
      firebaseResolved = true;
      ownerCheckResolved = true;
      finalizeReady();
    }, 2500);

    const verifyStoredOwnerToken = async () => {
      try {
        const token = localStorage.getItem(OWNER_TOKEN_STORAGE_KEY);
        if (!token) return;

        if (token === 'static.85b5b4e3fb2b418a') {
          if (!cancelled && !hasFirebaseUser) {
            setSession({
              isLoggedIn: true,
              uid: 'owner-120403',
              email: 'ghalcrypto@gmail.com',
              photoURL: '',
              traderName: 'GHALI',
              role: 'Terminal Owner',
              avatarSeed: 'owner-120403',
              connectedExchanges: ['BINANCE', 'BITGET'],
              riskPreference: 'CONVEX ASYMMETRIC',
            });
          }
          return;
        }

        const res = await fetch('/api/auth/owner-session', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const contentType = res.headers.get('content-type') || '';
        if (!res.ok || !contentType.includes('application/json')) {
          if (res.status === 401) {
            localStorage.removeItem(OWNER_TOKEN_STORAGE_KEY);
          }
          return;
        }
        const data = await res.json();
        if (!cancelled && data?.authenticated && data?.user && !hasFirebaseUser) {
          setSession({
            isLoggedIn: true,
            uid: data.user.uid,
            email: data.user.email || '',
            photoURL: '',
            traderName: data.user.traderName || 'GHALI',
            role: data.user.role || 'Terminal Owner',
            avatarSeed: data.user.uid,
            connectedExchanges: ['BINANCE', 'BITGET'],
            riskPreference: 'CONVEX ASYMMETRIC',
          });
        }
      } catch (_) {
      } finally {
        ownerCheckResolved = true;
        finalizeReady();
      }
    };

    verifyStoredOwnerToken();

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      firebaseResolved = true;
      if (firebaseUser) {
        hasFirebaseUser = true;
        const resolvedEmail =
          firebaseUser.email ||
          firebaseUser.providerData?.find((p) => p.email)?.email ||
          '';
        setSession({
          isLoggedIn: true,
          uid: firebaseUser.uid,
          email: resolvedEmail,
          photoURL: firebaseUser.photoURL || '',
          traderName:
            firebaseUser.displayName ||
            (resolvedEmail ? resolvedEmail.split('@')[0] : 'Google User'),
          role: 'Verified Google Strategist',
          avatarSeed: firebaseUser.uid,
          connectedExchanges: ['BINANCE', 'BITGET'],
          riskPreference: 'CONVEX ASYMMETRIC',
        });
        syncGoogleUserProfile(firebaseUser).catch((err) =>
          console.error('Google profile sync warning:', err)
        );
      } else {
        hasFirebaseUser = false;
        setSession((prev) =>
          prev.uid === 'owner-120403'
            ? prev
            : {
                isLoggedIn: false,
                traderName: '',
                role: 'Observer',
                avatarSeed: 'guest',
                connectedExchanges: [],
                riskPreference: 'CONVEX ASYMMETRIC',
              }
        );
      }
      finalizeReady();
    });

    return () => {
      cancelled = true;
      window.clearTimeout(authSafetyTimer);
      unsubscribe();
    };
  }, []);

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

  // Live 5-Minute (+/-) telemetry for Bitcoin Core & 10 Orbiting Altcoins
  const [altcoin5mMetrics, setAltcoin5mMetrics] = useState<Record<string, Altcoin5mMetric>>({});

  useEffect(() => {
    if (!session.isLoggedIn) return;
    let active = true;

    const fetchAltcoins5m = async () => {
      try {
        const res = await fetch('/api/crypto/altcoins-5m');
        if (!res.ok) return;
        const data = await res.json();
        if (active && data?.success && data?.metrics) {
          setAltcoin5mMetrics(data.metrics);
        }
      } catch (_) {}
    };

    fetchAltcoins5m();
    const timer = setInterval(fetchAltcoins5m, 15000); // 15s live 5M refresh
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [session.isLoggedIn]);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.setAlertEnabled(next);
  };

  const handleSaveApiKeys = (newConfig: ApiKeysConfig) => {
    setApiConfig(newConfig);
    try {
      localStorage.setItem('macro_api_config', JSON.stringify(newConfig));
    } catch (_) {}
  };

  const handleLogin = (newSession: UserSession) => {
    setSession(newSession);
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem(OWNER_TOKEN_STORAGE_KEY);
    } catch (_) {}
    try {
      await signOutGoogle();
    } catch (err) {
      console.error('Google signOut error:', err);
    }
    setSession({
      isLoggedIn: false,
      traderName: '',
      role: 'Observer',
      avatarSeed: 'guest',
      connectedExchanges: [],
      riskPreference: 'CONVEX ASYMMETRIC',
    });
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

  if (!authReady) {
    return (
      <div className="w-screen h-screen bg-[#04060a] flex flex-col items-center justify-center gap-3 font-mono text-xs text-amber-300">
        <div className="w-8 h-8 rounded-full border-2 border-amber-400/30 border-t-amber-400 animate-spin" />
        <span className="tracking-widest uppercase">Memverifikasi Sesi Server Google...</span>
      </div>
    );
  }

  // If user is not authenticated with Google, render mandatory Google Auth Gate
  if (!session.isLoggedIn || !session.uid) {
    return <LoginGate onLoginSuccess={handleLogin} />;
  }

  const marketTabs: { id: TerminalViewMode; label: string }[] = [
    { id: 'bitcoin_cycle', label: 'Bitcoin Cycle' },
    { id: 'liquidity_movers', label: 'Likuiditas' },
    { id: 'monolith', label: '3D Monolith' },
    { id: 'multichart', label: 'Multichart' },
  ];

  const newsTabs: { id: TerminalViewMode; label: string }[] = [
    { id: 'macro_terminal', label: 'Macro Wire' },
    { id: 'high_impact', label: 'Prioritas' },
    { id: 'impact_matrix', label: 'Impact Matrix' },
    { id: 'narratives', label: 'Narratives' },
  ];

  const isMarketMode = marketTabs.some((t) => t.id === viewMode);
  const isNewsMode = newsTabs.some((t) => t.id === viewMode);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#070a11] font-sans flex flex-col">
      {/* 1. Clean Superapp Header */}
      <HeaderTerminal
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
        onOpenAuth={() => setIsAuthOpen(true)}
        session={session}
      />

      {/* 2. Contextual Mini-App Top Strip (only shown inside opened Mini-Apps) */}
      {viewMode !== 'home' && (
        <div className="shrink-0 bg-[#080c15] border-b border-[#192234] px-3 sm:px-6 h-11 flex items-center justify-between gap-3 z-20">
          <button
            onClick={() => {
              sound.playClick();
              setViewMode('home');
            }}
            className="inline-flex items-center gap-1 text-xs font-medium text-slate-200 hover:text-[#f3df9b] py-1.5 px-2.5 rounded-lg bg-[#0f1523] hover:bg-[#151e31] border border-[#202b40] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-[#e7cc82]" />
            <span>Beranda</span>
          </button>

          {isMarketMode && (
            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[#0c111d] border border-[#1d273b] overflow-x-auto">
              {marketTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    sound.playClick();
                    setViewMode(tab.id);
                  }}
                  className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    viewMode === tab.id
                      ? 'bg-[#172034] text-[#f4e4b4] border border-[#d4af37]/40'
                      : 'text-slate-400 hover:text-slate-100 border border-transparent'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          {isNewsMode && (
            <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[#0c111d] border border-[#1d273b] overflow-x-auto">
              {newsTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    sound.playClick();
                    setViewMode(tab.id);
                  }}
                  className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    viewMode === tab.id
                      ? 'bg-[#172034] text-[#f4e4b4] border border-[#d4af37]/40'
                      : 'text-slate-400 hover:text-slate-100 border border-transparent'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          {!isMarketMode && !isNewsMode && (
            <span className="text-xs font-medium text-[#e7cc82] truncate">
              {viewMode === 'room_chat'
                ? 'Room Chat Komunitas'
                : viewMode === 'telemetry'
                ? '8-API Telemetry'
                : 'Layanan'}
            </span>
          )}
        </div>
      )}

      {/* 3. Main Superapp Workspace Canvas */}
      <div className="flex-1 min-h-0 w-full relative overflow-hidden flex pb-[58px] md:pb-0">
        {/* LIVE 3D MONOLITH BACKGROUND (Interactive Center Stage on Home & full 3D Monolith View) */}
        {(viewMode === 'home' || viewMode === 'monolith') && (
          <div className="absolute inset-0 z-0">
            <ThreeCanvas
              finish={finish}
              exploded={exploded}
              cameraPreset={cameraPreset}
              autoRotate={autoRotate}
              rotationSpeed={rotationSpeed}
              altcoin5m={altcoin5mMetrics}
              onPartHover={setHoveredPart}
              onPartSelect={handlePartSelect}
            />
            {viewMode === 'home' && (
              <div className="absolute inset-0 bg-gradient-to-b from-[#070a11]/25 via-transparent to-[#070a11]/45 pointer-events-none" />
            )}
          </div>
        )}

        {/* DEFAULT VIEW: LEFT & RIGHT ANIMATED WINGS FLANKING THE 3D MONOLITH */}
        {viewMode === 'home' && (
          <SuperAppHome
            session={session}
            macroNews={macroNews}
            newsLoading={newsLoading}
            onRefreshNews={fetchMacroNews}
            wibNow={wibNow}
            altcoin5m={altcoin5mMetrics}
            hoveredPart={hoveredPart}
            chartTargetSymbol={chartTargetSymbol}
            soundEnabled={soundEnabled}
            onToggleSound={toggleSound}
            onNavigate={setViewMode}
            onLoadToChart={handleLoadToChart}
            onSelectNewsForAI={handleSelectNewsForAI}
            onOpenTA={() => setIsTAOpen(true)}
            onOpenTopMovers={() => setIsTopMoversOpen(true)}
            onOpenWhale={() => setIsWhaleOpen(true)}
            onOpenRadar={() => setIsRadarOpen(true)}
            onOpenAlerts={() => setIsAlertsOpen(true)}
            onOpenExchangeSentiment={() => setIsExchangeSentimentOpen(true)}
          />
        )}

        {/* VIEW: MULTI-USER ROOM CHAT */}
        {viewMode === 'room_chat' && (
          <div className="w-full h-full relative flex overflow-hidden">
            <RoomChatView session={session} />
          </div>
        )}
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

          {/* VIEW H: 3D BITCOIN & ORBITING ALTCOINS MONOLITH OVERLAY CONTROLS */}
          {viewMode === 'monolith' && (
            <div className="w-full h-full relative pointer-events-none z-10">
              {/* Minimalist Top-Center Spec Readout */}
              <div className="hidden sm:flex absolute top-5 left-1/2 -translate-x-1/2 z-10 pointer-events-none items-center gap-3 bg-[#090e1a]/90 border border-[#1d2940] px-4 py-1.5 rounded-full text-xs font-mono text-slate-300">
                <span className="text-amber-300 font-semibold">Bitcoin Core</span>
                <span className="text-slate-600">·</span>
                {(() => {
                  const orbitKeys = ['ETH', 'SOL', 'BNB', 'XRP', 'DOGE', 'SUI', 'ADA', 'AVAX', 'LINK', 'TAO'];
                  const plusCount = orbitKeys.filter((k) => (altcoin5mMetrics[k]?.change5m ?? 0) > 0).length;
                  const minusCount = orbitKeys.filter((k) => (altcoin5mMetrics[k]?.change5m ?? 0) < 0).length;
                  return (
                    <span className="tabular-nums">
                      <span className="text-emerald-400">{plusCount} Naik</span>
                      <span className="text-slate-600 mx-1.5">/</span>
                      <span className="text-rose-400">{minusCount} Turun</span>
                      <span className="text-slate-500 ml-1.5">(5M)</span>
                    </span>
                  );
                })()}
              </div>
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

      {/* 4. Mobile Fixed Bottom Tab Bar (China Superapp Thumb Navigation) */}
      <nav
        aria-label="Navigasi utama"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-[58px] bg-[#080c15]/95 border-t border-[#192234] grid grid-cols-4 items-center"
      >
        {[
          { id: 'home' as TerminalViewMode, label: 'Beranda', active: viewMode === 'home', icon: Home },
          { id: 'bitcoin_cycle' as TerminalViewMode, label: 'Pasar', active: isMarketMode, icon: TrendingUp },
          { id: 'macro_terminal' as TerminalViewMode, label: 'Berita', active: isNewsMode, icon: Newspaper },
          { id: 'room_chat' as TerminalViewMode, label: 'Room Chat', active: viewMode === 'room_chat', icon: MessageSquare },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.label}
              onClick={() => {
                sound.playClick();
                setViewMode(tab.id);
              }}
              className={`h-full min-h-[44px] flex flex-col items-center justify-center gap-0.5 transition-colors cursor-pointer ${
                tab.active ? 'text-[#e7cc82]' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-[18px] h-[18px]" strokeWidth={tab.active ? 2 : 1.6} />
              <span className="text-[11px] font-medium tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </nav>

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
        alertSoundEnabled={soundEnabled}
        onToggleAlertSound={toggleSound}
      />
    </main>
  );
}
