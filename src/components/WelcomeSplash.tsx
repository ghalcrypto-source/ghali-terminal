import React, { useEffect, useState } from 'react';
import { Compass, Globe, Radar, ShieldCheck, ArrowRight, Activity, Terminal } from 'lucide-react';
import { sound } from '../audio/soundEngine';

interface WelcomeSplashProps {
  onComplete: () => void;
}

export const WelcomeSplash: React.FC<WelcomeSplashProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [stepText, setStepText] = useState('INITIALIZING CORE SYSTEM...');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Play initial radar sonar ping sound
    try {
      sound.playSonarPing();
    } catch (_) {}

    const steps = [
      { pct: 20, text: 'LOADING GLOBAL MACRO ENGINE...' },
      { pct: 45, text: 'CONNECTING 8 PUBLIC TELEMETRY APIs...' },
      { pct: 70, text: 'SYNCHRONIZING WIB UTC+7 TIMESTAMPS...' },
      { pct: 90, text: 'READY FOR INSTANTIATION...' },
      { pct: 100, text: 'GHALI TERMINAL OPERATIONAL' },
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setProgress(steps[currentStep].pct);
        setStepText(steps[currentStep].text);
        currentStep++;
      } else {
        clearInterval(interval);
        setIsReady(true);
        try {
          sound.playClick(1400);
        } catch (_) {}
      }
    }, 450);

    return () => clearInterval(interval);
  }, []);

  const handleEnter = () => {
    try {
      sound.playClick(1600);
    } catch (_) {}
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 w-screen h-screen bg-[#04060a] flex flex-col items-center justify-center p-6 overflow-hidden font-mono text-slate-100 select-none">
      {/* Dynamic Background Ambient Rotational Orbits */}
      <div className="absolute inset-0 pointer-events-none opacity-25 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full border border-amber-500/30 animate-spin-slow" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] rounded-full border border-cyan-500/20 animate-spin-reverse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-amber-500/10 blur-[100px]" />
      </div>

      {/* Center Welcome Box */}
      <div className="relative z-10 max-w-lg w-full text-center space-y-8 p-8 bg-[#080c14]/90 backdrop-blur-xl border border-[#1f2e4a] rounded-2xl shadow-2xl">
        {/* Dual Rotating Radar Logo */}
        <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
          {/* Outer Ring Clockwise */}
          <svg className="absolute inset-0 w-full h-full animate-spin-slow text-amber-500/50" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="2.5" strokeDasharray="8 10" />
          </svg>
          {/* Inner Ring Counter-Clockwise */}
          <svg className="absolute inset-2 w-20 h-20 animate-spin-reverse text-cyan-400/60" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="14 8" />
          </svg>
          {/* Center Radar Icon */}
          <div className="relative z-10 p-3 bg-[#0d1524] rounded-full border border-amber-400/50 shadow-lg shadow-amber-500/20">
            <Compass className="w-9 h-9 text-amber-400 animate-pulse" />
          </div>
        </div>

        {/* Title & Subtitle */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-[#121b2d] border border-[#223352] px-3.5 py-1.5 rounded-full text-xs text-amber-300 shadow-md">
            <Terminal className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-bold tracking-wider">WELCOME TO GHALI TERMINAL</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-wider text-white bg-gradient-to-r from-amber-200 via-amber-400 to-amber-500 bg-clip-text text-transparent">
            GHALI TERMINAL
          </h1>
          <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
            Global Macro News & Real-Time Market Intelligence System
          </p>
        </div>

        {/* Loading Progress Bar */}
        <div className="space-y-2.5 max-w-sm mx-auto">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold">
            <span className="text-amber-400 truncate max-w-[240px]">{stepText}</span>
            <span className="text-white font-extrabold">{progress}%</span>
          </div>

          <div className="w-full bg-[#0e1728] h-2.5 rounded-full overflow-hidden p-0.5 border border-[#21304d]">
            <div
              className="h-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-300 rounded-full transition-all duration-300 ease-out shadow-[0_0_12px_rgba(245,158,11,0.5)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Enter Button (Revealed when ready) */}
        <div className="pt-2">
          {isReady ? (
            <button
              onClick={handleEnter}
              className="w-full flex items-center justify-center gap-2.5 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 hover:from-amber-500 hover:to-amber-300 text-black font-bold text-xs sm:text-sm py-3 px-6 rounded-xl transition-all transform hover:scale-[1.02] shadow-xl shadow-amber-500/20 cursor-pointer tracking-wider animate-pulse"
            >
              <span>MASUK KE GHALI TERMINAL LOGIN</span>
              <ArrowRight className="w-4 h-4 text-black" />
            </button>
          ) : (
            <button
              disabled
              className="w-full flex items-center justify-center gap-2 bg-[#101827] text-slate-500 font-bold text-xs py-3 px-6 rounded-xl border border-[#1d2b45] cursor-not-allowed"
            >
              <Activity className="w-4 h-4 text-amber-400 animate-spin" />
              <span>MEMUAT MODUL TERMINAL...</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
