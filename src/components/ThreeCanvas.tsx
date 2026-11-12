import React, { useEffect, useRef } from 'react';
import { MonolithScene, PartInfo, Altcoin5mMetric } from '../three/MonolithScene';
import { FinishId, CameraPreset } from '../types/contrarian';

interface ThreeCanvasProps {
  finish: FinishId;
  exploded: number;
  cameraPreset: CameraPreset;
  autoRotate: boolean;
  rotationSpeed: number;
  altcoin5m?: Record<string, Altcoin5mMetric>;
  onPartHover?: (part: PartInfo | null) => void;
  onPartSelect?: (part: PartInfo) => void;
}

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({
  finish,
  exploded,
  cameraPreset,
  autoRotate,
  rotationSpeed,
  altcoin5m,
  onPartHover,
  onPartSelect,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<MonolithScene | null>(null);
  const latestAltcoin5mRef = useRef(altcoin5m);
  latestAltcoin5mRef.current = altcoin5m;

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new MonolithScene(mountRef.current);
    sceneRef.current = scene;

    scene.onPartHover = onPartHover;
    scene.onPartSelect = onPartSelect;

    if (latestAltcoin5mRef.current) {
      scene.updateAltcoins5m(latestAltcoin5mRef.current);
    }

    return () => {
      scene.dispose();
      sceneRef.current = null;
    };
  }, []);

  // Update callbacks
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.onPartHover = onPartHover;
      sceneRef.current.onPartSelect = onPartSelect;
    }
  }, [onPartHover, onPartSelect]);

  // Update finish theme
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.setTheme(finish);
    }
  }, [finish]);

  // Update exploded slider
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.explodedValue = exploded;
    }
  }, [exploded]);

  // Update camera preset
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.setCameraPreset(cameraPreset);
    }
  }, [cameraPreset]);

  // Update auto rotation & speed
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.autoRotate = autoRotate;
      sceneRef.current.rotationSpeed = rotationSpeed;
    }
  }, [autoRotate, rotationSpeed]);

  // Update live 5-minute +/- signs on orbiting altcoins
  useEffect(() => {
    if (sceneRef.current && altcoin5m) {
      sceneRef.current.updateAltcoins5m(altcoin5m);
    }
  }, [altcoin5m]);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full overflow-hidden select-none bg-[#07090e]"
      style={{ touchAction: 'none' }}
    />
  );
};

