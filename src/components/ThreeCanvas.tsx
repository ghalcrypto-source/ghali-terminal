import React, { useEffect, useRef } from 'react';
import { MonolithScene, PartInfo } from '../three/MonolithScene';
import { FinishId, CameraPreset } from '../types/contrarian';

interface ThreeCanvasProps {
  finish: FinishId;
  exploded: number;
  cameraPreset: CameraPreset;
  autoRotate: boolean;
  rotationSpeed: number;
  onPartHover?: (part: PartInfo | null) => void;
  onPartSelect?: (part: PartInfo) => void;
}

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({
  finish,
  exploded,
  cameraPreset,
  autoRotate,
  rotationSpeed,
  onPartHover,
  onPartSelect,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<MonolithScene | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new MonolithScene(mountRef.current);
    sceneRef.current = scene;

    scene.onPartHover = onPartHover;
    scene.onPartSelect = onPartSelect;

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

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full overflow-hidden select-none bg-[#07090e]"
      style={{ touchAction: 'none' }}
    />
  );
};
