import React, { useEffect, useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Maximize2,
  RotateCw,
  Layers,
  Camera,
  Palette,
  Info,
} from 'lucide-react';
import { FinishId, CameraPreset } from '../types/contrarian';
import { FINISH_THEMES } from '../three/materials';
import { PartInfo } from '../three/MonolithScene';
import { sound } from '../audio/soundEngine';

interface BottomControlDockProps {
  finish: FinishId;
  onSelectFinish: (f: FinishId) => void;
  exploded: number;
  onChangeExploded: (val: number) => void;
  cameraPreset: CameraPreset;
  onSelectCamera: (p: CameraPreset) => void;
  autoRotate: boolean;
  onToggleRotate: () => void;
  rotationSpeed: number;
  onChangeSpeed: (s: number) => void;
  hoveredPart: PartInfo | null;
}

export const BottomControlDock: React.FC<BottomControlDockProps> = ({
  finish,
  onSelectFinish,
  exploded,
  onChangeExploded,
  cameraPreset,
  onSelectCamera,
  autoRotate,
  onToggleRotate,
  rotationSpeed,
  onChangeSpeed,
  hoveredPart,
}) => {
  const [collapsed, setCollapsed] = useState(false);

  // Keyboard shortcut 'H' to toggle dock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'h' || e.key === 'H') {
        sound.playClick();
        setCollapsed((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const finishList: FinishId[] = [
    'obsidian-gold',
    'stealth-titanium',
    'terminal-phosphor',
    'tungsten-crimson',
  ];

  const cameraPresets: { id: CameraPreset; label: string }[] = [
    { id: 'macro', label: 'Macro 45°' },
    { id: 'core', label: 'Core Zoom' },
    { id: 'escapement', label: 'Escapement' },
    { id: 'radar', label: 'Radar Angle' },
    { id: 'topdown', label: 'Top Azimuth' },
  ];

  return (
    <div
      className={`fixed left-1/2 -translate-x-1/2 z-20 w-[96vw] max-w-[940px] transition-transform duration-300 ease-out ${
        collapsed ? 'translate-y-[calc(100%-28px)]' : 'translate-y-0'
      }`}
      style={{ bottom: '16px' }}
    >
      {/* Top Toggle Bar */}
      <div className="flex justify-between items-center mb-1 px-2">
        {/* Active Part Inspector Toast (Left) */}
        {hoveredPart ? (
          <div className="flex items-center gap-2 bg-[#0e1422] border border-[#232f48] px-3 py-1 rounded text-xs font-mono shadow-md text-slate-200">
            <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="font-semibold text-amber-300">{hoveredPart.name}</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400 text-[11px] truncate max-w-[280px] sm:max-w-md">
              {hoveredPart.description}
            </span>
            <span className="hidden md:inline text-cyan-400 font-mono text-[10px] ml-1">
              [{hoveredPart.metric}]
            </span>
          </div>
        ) : (
          <div className="text-[11px] font-mono text-slate-400 px-2 py-0.5 rounded bg-[#0b0f19] border border-[#1b253b] hidden sm:block">
            HOVER 3D PARTS TO INSPECT MECHANICAL TELEMETRY
          </div>
        )}

        {/* Collapse / Expand Button (Right) */}
        <button
          onClick={() => {
            sound.playClick();
            setCollapsed((prev) => !prev);
          }}
          className="flex items-center gap-1.5 bg-[#0e1422] hover:bg-[#162035] border border-[#232f48] text-slate-300 hover:text-white px-2.5 py-1 rounded text-[11px] font-mono shadow-md cursor-pointer ml-auto"
        >
          {collapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5 text-amber-400" />
              <span>EXPAND CONTROLS [H]</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              <span>HIDE DOCK [H]</span>
            </>
          )}
        </button>
      </div>

      {/* Main Solid Dock Surface */}
      <div className="bg-[#0b0f19] border border-[#202b42] rounded-lg p-3 sm:p-4 shadow-2xl space-y-3">
        {/* Row 1: Exploded View Slider + Finish Swatches */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Exploded View Separation Slider (5 cols) */}
          <div className="md:col-span-5 flex items-center gap-2.5 bg-[#101626] border border-[#1d273d] px-3 py-2 rounded">
            <Layers className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="flex-1">
              <div className="flex justify-between items-center text-[11px] font-mono mb-1">
                <span className="text-slate-300 font-medium">EXPLODED DISASSEMBLY</span>
                <span className="text-amber-400 font-bold">{Math.round(exploded * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={exploded}
                onChange={(e) => {
                  sound.playDialTick();
                  onChangeExploded(parseFloat(e.target.value));
                }}
                className="w-full accent-amber-500 h-1.5 bg-[#1b253b] rounded-lg cursor-pointer"
              />
            </div>
            {exploded > 0 && (
              <button
                onClick={() => {
                  sound.playClick();
                  onChangeExploded(0);
                }}
                className="text-[10px] font-mono text-slate-400 hover:text-white px-1.5 py-0.5 border border-[#2d3a56] rounded hover:bg-[#1a233a] cursor-pointer"
              >
                RESET
              </button>
            )}
          </div>

          {/* Finish Material Swatches (7 cols) */}
          <div className="md:col-span-7 flex items-center gap-2 bg-[#101626] border border-[#1d273d] px-3 py-1.5 rounded overflow-x-auto">
            <Palette className="w-4 h-4 text-slate-400 shrink-0" />
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider shrink-0 hidden sm:inline">
              FINISH:
            </span>
            <div className="flex items-center gap-1.5 flex-1 overflow-x-auto py-0.5">
              {finishList.map((fId) => {
                const t = FINISH_THEMES[fId];
                const active = finish === fId;
                const dotColor = '#' + t.primaryMetalColor.toString(16).padStart(6, '0');
                const accentColor = '#' + t.accentGlowColor.toString(16).padStart(6, '0');

                return (
                  <button
                    key={fId}
                    onClick={() => {
                      sound.playModeChange();
                      onSelectFinish(fId);
                    }}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-mono transition-all shrink-0 cursor-pointer ${
                      active
                        ? 'bg-[#1b263d] text-white border border-amber-400/80 font-semibold shadow-sm'
                        : 'bg-[#121929] text-slate-400 border border-[#202c44] hover:text-slate-200 hover:border-[#2f3f61]'
                    }`}
                  >
                    <div
                      className="w-2.5 h-2.5 rounded-full border border-black/40"
                      style={{
                        background: `linear-gradient(135deg, ${dotColor}, ${accentColor})`,
                      }}
                    />
                    <span>{t.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Row 2: Camera Presets & Kinetic Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1 border-t border-[#1a2338]">
          {/* Camera View Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <Camera className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1" />
            <span className="text-[10px] font-mono text-slate-400 uppercase hidden sm:inline">
              CAMERA:
            </span>
            {cameraPresets.map((cam) => {
              const active = cameraPreset === cam.id;
              return (
                <button
                  key={cam.id}
                  onClick={() => {
                    sound.playClick(1000);
                    onSelectCamera(cam.id);
                  }}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                    active
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/60 font-semibold'
                      : 'bg-[#121929] text-slate-400 border border-[#1e2a42] hover:text-slate-200'
                  }`}
                >
                  {cam.label}
                </button>
              );
            })}
          </div>

          {/* Kinematics: Spin toggle & Speed selector */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sound.playClick();
                onToggleRotate();
              }}
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-mono border transition-colors cursor-pointer ${
                autoRotate
                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-600/50'
                  : 'bg-[#121929] text-slate-400 border-[#1e2a42] hover:text-slate-200'
              }`}
            >
              <RotateCw className={`w-3 h-3 ${autoRotate ? 'text-emerald-400' : 'text-slate-500'}`} />
              <span>{autoRotate ? 'KINETIC: ON' : 'KINETIC: PAUSED'}</span>
            </button>

            {autoRotate && (
              <div className="flex items-center gap-1 bg-[#121929] border border-[#1e2a42] rounded px-1 py-0.5">
                {[0.5, 1.0, 2.0].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => {
                      sound.playClick();
                      onChangeSpeed(spd);
                    }}
                    className={`px-1.5 py-0.2 rounded text-[10px] font-mono cursor-pointer ${
                      rotationSpeed === spd
                        ? 'bg-amber-500 text-black font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
