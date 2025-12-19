import { useState, useEffect } from "react";
import { stopAllAudio } from "../utils/audioManager";
import { SoundSettings } from "./SoundSettings";

const MUTE_STATE_KEY = "onlyconnect_mute_state";
const SFX_VOLUME_KEY = "onlyconnect_sfx_volume";

export function GlobalSoundControls() {
  const [isMuted, setIsMuted] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(MUTE_STATE_KEY);
      return stored === "true";
    }
    return false;
  });

  const [sfxVolume, setSfxVolume] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(SFX_VOLUME_KEY);
      return stored ? parseFloat(stored) : 0.7;
    }
    return 0.7;
  });

  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(MUTE_STATE_KEY, isMuted.toString());
    }
    
    // If just muted, stop all currently playing audio immediately
    if (isMuted) {
      stopAllAudio();
    }
  }, [isMuted]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(SFX_VOLUME_KEY, sfxVolume.toString());
    }
  }, [sfxVolume]);

  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    
    // If muting, stop all audio immediately
    if (newMutedState) {
      stopAllAudio();
    }
  };

  const handleSfxVolumeChange = (volume: number) => {
    setSfxVolume(volume);
    // Dispatch custom event for same-tab updates
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event('sfxVolumeChanged'));
    }
  };

  return (
    <>
      <div className="fixed top-4 left-4 z-[10000] flex items-center gap-2">
        {/* Mute Button */}
        <button
          onClick={toggleMute}
          className="p-2 bg-blue-500/80 hover:bg-blue-600/90 rounded-lg transition-colors shadow-lg"
          aria-label={isMuted ? "Unmute sound effects" : "Mute sound effects"}
          title={isMuted ? "Unmute sound effects" : "Mute sound effects"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            {isMuted ? (
              <>
                {/* Muted: Speaker with diagonal line */}
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                />
                {/* Diagonal line across speaker */}
                <line x1="6" y1="6" x2="18" y2="18" strokeWidth={2.5} strokeLinecap="round" />
              </>
            ) : (
              <>
                {/* Unmuted: Speaker icon */}
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                />
              </>
            )}
          </svg>
        </button>

        {/* Settings Cog Button */}
        <button
          onClick={() => setShowSettings(true)}
          className="p-2 bg-blue-500/80 hover:bg-blue-600/90 rounded-lg transition-colors shadow-lg"
          aria-label="Open sound settings"
          title="Sound Settings"
        >
          <svg
            className="h-6 w-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>
      </div>

      {/* Sound Settings Modal */}
      <SoundSettings
        sfxVolume={sfxVolume}
        onSfxVolumeChange={handleSfxVolumeChange}
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </>
  );
}

