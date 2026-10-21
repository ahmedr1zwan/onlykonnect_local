import { useState } from "react";

interface SoundSettingsProps {
  sfxVolume: number;
  onSfxVolumeChange: (volume: number) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function SoundSettings({
  sfxVolume,
  onSfxVolumeChange,
  isOpen,
  onClose,
}: SoundSettingsProps) {
  if (!isOpen) return null;

  return (
    <div
      className="ok-modal-backdrop fixed inset-0 z-[10000] flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="ok-panel p-6 max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="ok-heading-3d text-xl">Sound Settings</h2>
          <button
            onClick={onClose}
            className="ok-btn ok-btn-light ok-btn-icon h-8 w-8 text-sm"
            aria-label="Close settings"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="ok-label mb-3">
              Sound Effects (SFX): {Math.round(sfxVolume * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={sfxVolume}
              onChange={(e) => onSfxVolumeChange(parseFloat(e.target.value))}
              className="ok-range"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

